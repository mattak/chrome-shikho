import {isDigit} from "./string_util";
import {invertXY} from "./matrix_util";
import {createTable} from "./table_creator_util";
import {parseMarketCapital, parseNumber, parseTableBody, parseTableHeader} from "./parser_util";

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
    console.log("table:", table);

    if (tableParent == null) return;
    if (table == null) return;
    if (!(table instanceof HTMLTableElement)) return;

    const headers = parseTableHeader(table);
    const cells = parseTableBody(table);
    const marketCapital = parseMarketCapital(document.body, "div.stock-index span.cap");

    console.log("header", headers);
    console.log("cells", cells);

    const growthCells = calculateGrowthRate(marketCapital, cells);
    const growthHeaders = [...headers, "営利率", "売成+営率", "PSR"];
    const formattedGrowthCells = formatCells(growthCells);
    const newTable = createTable(growthHeaders, formattedGrowthCells);
    tableParent.appendChild(newTable);
}


const SELECTOR_PERFORMANCE_TABLE = 'div.performance-table:nth-of-type(1)';

const run = async () => {
    renderAppendTable(SELECTOR_PERFORMANCE_TABLE);
}

function runByCheckingInterval() {
    const checkInterval = setInterval(jsLoaded, 1000);

    function jsLoaded() {
        if (document.querySelector(SELECTOR_PERFORMANCE_TABLE)) {
            clearInterval(checkInterval);
            run();
        }
    }
}

runByCheckingInterval();

console.log("chrome-shikiho: content_scripts loaded");
