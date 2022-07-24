import {createTable} from "./table_creator_util";
import {parseMarketCapital, parseTableBody, parseTableHeader} from "./parser_util";
import {createGrowthRateCells} from "./growth_rate_cells_creator_util";
import {createFormattedCells} from "./formatted_cells_creator_util";

function dropCells(cells: any[][]): any[][] {
    let results: any[][] = [];
    let previousOrder = 0;
    for (let i = 0; i < cells.length; i++) {
        const yearAndMonth = cells[i][0].replace(/[^\d.]/g, '');
        console.log("yearAndMonth:", i, yearAndMonth);
        const [year, month] = yearAndMonth.split('.').map(Number);
        const order = year * 100 + month;
        if (order <= previousOrder) break
        previousOrder = order;
        results.push(cells[i]);
    }
    return results;
}

function renderAppendTable(selector: string) {
    const tableParent = document.querySelector(selector);
    const table = tableParent?.querySelector('table');
    console.log("table:", table);

    if (tableParent == null) return;
    if (table == null) return;
    if (!(table instanceof HTMLTableElement)) return;

    const headers = parseTableHeader(table);
    let cells = parseTableBody(table);
    const marketCapital = parseMarketCapital(document.body, "div.stock-index span.cap");

    cells = dropCells(cells);

    console.log("header", headers);
    console.log("cells", cells);

    const growthCells = createGrowthRateCells(marketCapital, cells);
    const growthHeaders = [...headers, "営利率", "売成+営率", "PSR"];
    const formattedGrowthCells = createFormattedCells(growthCells);
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
