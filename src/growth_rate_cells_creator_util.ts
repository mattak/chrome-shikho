import {isDigit} from "./string_util";
import {parseNumber} from "./parser_util";
import {invertXY} from "./matrix_util";

export function createGrowthRateCells(marketCapital: number, cells: string[][]): any[][] {
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
