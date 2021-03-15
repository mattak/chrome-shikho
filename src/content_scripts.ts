function parseTableHeader(table: HTMLElement): string[] {
    return Array.from(table.querySelectorAll('thead th')).map(it => it.textContent || '');
}

function parseTableBody(table: HTMLElement): string[][] {
    const trs = Array.from(table.querySelectorAll('tbody tr'));
    const cells = trs.map(tr =>
        Array.from(tr.querySelectorAll('td'))
            .map(td => td.textContent || '')
            .map(it => it.replace(/記/, ''))
    );
    return cells;
}

function isDigit(text: string): boolean {
    if (text === null || text === "" || text === "-") return false;
    const re = /[^\d,\.\-〜]/g;
    return !re.test(text);
}

function parseNumber(text: string): number {
    const raw = text
        .replace(/,/g, '')
        .replace(/〜.+$/, '');
    return parseFloat(raw);
}

function parseCurrencyText(text: string): number {
    const raw = text.replace('億円', '');
    return parseNumber(raw);
}

// unit: 百万円
function parseMarketCapital(root: HTMLElement): number {
    const dt = Array.from(root.querySelectorAll('div#main div.sub div.stock dl dt')).find(it => it.textContent === "時価総額");
    const priceRawText = dt?.parentElement?.querySelector('dd')?.textContent;

    if (priceRawText == null) return -1;
    return parseCurrencyText(priceRawText) * 100.0;
}

function createTable(headers: string[], cells: any[][]): HTMLTableElement {
    const table = document.createElement("table") as HTMLTableElement;
    const thead = document.createElement("thead") as HTMLElement;
    const tbody = document.createElement("tbody") as HTMLElement;

    table.style.width = "100%"
    table.appendChild(thead);
    table.appendChild(tbody);

    {
        const tr = document.createElement("tr") as HTMLElement;

        for (let x = 0; x < headers.length; x++) {
            const th = document.createElement("th") as HTMLElement;
            th.textContent = headers[x];
            th.style.border = "dashed 1px orange";
            tr.appendChild(th);
        }
        thead.appendChild(tr);
    }

    for (let y = 0; y < cells.length; y++) {
        const elements = cells[y];
        const tr = document.createElement("tr") as HTMLElement;

        for (let x = 0; x < elements.length; x++) {
            const td = document.createElement("td") as HTMLElement;
            td.innerHTML = elements[x];
            td.style.border = "dashed 1px orange";
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }

    return table;
}

function invertXY(cells: string[][]): string[][] {
    if (cells.length < 1) return [];
    const ySize = cells.length;
    const xSize = cells[0].length;
    let results = [];

    for (let x = 0; x < xSize; x++) {
        let line = [];
        for (let y = 0; y < ySize; y++) {
            line.push(cells[y][x]);
        }
        results.push(line);
    }
    return results;
}

function calculateGrowthRate(marketCapital: number, cells: string[][]): any[][] {
    if (cells.length < 2) return [];
    const ySize = cells.length;
    const xSize = cells[0].length;
    let lines: any[][] = [];

    // ratio
    for (let x = 0; x < xSize; x++) {
        const line: any[] = [];
        if (!isDigit(cells[1][x])) {
            for (let y = 0; y < ySize; y++) {
                line.push(cells[y][x]);
            }
        } else {
            for (let y = 0; y < ySize; y++) {
                if (y > 0 && isDigit(cells[y - 1][x]) && isDigit(cells[y][x])) {
                    const c1 = parseNumber(cells[y - 1][x]);
                    const c2 = parseNumber(cells[y][x]);
                    const result = c1 != 0 ? c2 / c1 : 0;
                    line.push(result);
                } else {
                    line.push(NaN);
                }
            }
        }
        lines.push(line);
    }

    // operating/sales ratio
    {
        const salesColumnIndex = 1;
        const operatingIncomeColumnIndex = 2;
        const line: any[] = [];
        for (let y = 0; y < ySize; y++) {
            if (y > 0 && isDigit(cells[y - 1][salesColumnIndex]) && isDigit(cells[y][operatingIncomeColumnIndex])) {
                const c1 = parseNumber(cells[y][salesColumnIndex]);
                const c2 = parseNumber(cells[y][operatingIncomeColumnIndex]);
                const result = c1 != 0 ? c2 / c1 : 0;
                line.push(result);
            } else {
                line.push(NaN);
            }
        }
        lines.push(line);
    }

    // operating/sales ratio + sales growth
    {
        const operatingSalesRatioIndex = lines.length - 1;
        const salesGrowthIndex = 1;
        const line: any[] = [];
        for (let y = 0; y < ySize; y++) {
            const c1 = lines[salesGrowthIndex][y];
            const c2 = lines[operatingSalesRatioIndex][y];

            if (isDigit(c1) && isDigit(c2)) {
                const n1 = parseFloat(lines[salesGrowthIndex][y]);
                const n2 = parseFloat(lines[operatingSalesRatioIndex][y]);
                const result = n1 + n2;
                line.push(result);
            } else {
                line.push(NaN);
            }
        }
        lines.push(line);
    }

    // psr
    {
        const salesIndex = 1;
        const line: any[] = [];
        for (let y = 0; y < ySize; y++) {
            const c1 = cells[y][salesIndex];

            if (isDigit(c1)) {
                const n1 = parseNumber(c1);
                const result = marketCapital / n1;
                line.push(result);
            } else {
                line.push(NaN);
            }
        }
        lines.push(line);
    }

    return invertXY(lines);
}

function formatCells(cells: any[][]): any[][] {
    // 売上
    for (let x = 0; x < cells[0].length; x++) {
        for (let y = 0; y < cells.length; y++) {
            const cell = cells[y][x];
            if (x === 7) {
                if (isDigit(cell)) {
                    cells[y][x] = cell >= 0.2 ? `<b>${cell.toFixed(3)}</b>` : `${cell.toFixed(3)}`;
                }
            } else if (x === 8) {
                if (isDigit(cell)) {
                    cells[y][x] = cell >= 1.4 ? `<b>${cell.toFixed(3)}</b>` : `${cell.toFixed(3)}`;
                }
            } else if (x === 9) {
                if (isDigit(cell)) {
                    cells[y][x] = cell <= 5 ? `<b>${cell.toFixed(3)}</b>` : `${cell.toFixed(3)}`;
                }
            } else {
                if (isDigit(cell)) {
                    cells[y][x] = cell >= 1.2 ? `<b>${cell.toFixed(3)}</b>` : `${cell.toFixed(3)}`;
                }
            }
        }
    }
    return cells;
}

function renderAppendTable(selector: string) {
    const tableParent = document.querySelector(selector);
    const table = tableParent?.querySelector('table');

    if (tableParent == null) return;
    if (table == null) return;
    if (!(table instanceof HTMLTableElement)) return;

    const headers = parseTableHeader(table);
    const cells = parseTableBody(table);
    const marketCapital = parseMarketCapital(document.body);

    console.log(headers);
    console.log(cells);

    const growthCells = calculateGrowthRate(marketCapital, cells);
    const growthHeaders = [...headers, "営利率", "売成+営率", "PSR"];
    const formattedGrowthCells = formatCells(growthCells);
    const newTable = createTable(growthHeaders, formattedGrowthCells);
    tableParent.appendChild(newTable);
}

const run = async () => {
    renderAppendTable('#main div.performance div.matrix');
    renderAppendTable('#main div.update div.matrix');
}

function check(e: any) {
    const checkInterval = setInterval(jsLoaded, 1000);

    function jsLoaded() {
        if (document.querySelector('#main div.performance div.matrix') ||
            document.querySelector('#main div.update div.matrix')) {
            clearInterval(checkInterval);
            run();
        }
    }
}

window.addEventListener("load", check, false);
