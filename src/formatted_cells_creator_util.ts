import {isDigit} from "./string_util";

export function createFormattedCells(cells: any[][]): any[][] {
    for (let x = 0; x < cells[0].length; x++) {
        for (let y = 0; y < cells.length; y++) {
            const cell = cells[y][x];
            if (x === 7) {
                // 営利率
                if (isDigit(cell)) {
                    cells[y][x] = cell >= 0.2 ? `<b>${cell.toFixed(3)}</b>` : `${cell.toFixed(3)}`;
                }
            } else if (x === 8) {
                // 売上成長+営利率
                if (isDigit(cell)) {
                    cells[y][x] = cell >= 1.4 ? `<b>${cell.toFixed(3)}</b>` : `${cell.toFixed(3)}`;
                }
            } else if (x === 9) {
                // PSR
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
