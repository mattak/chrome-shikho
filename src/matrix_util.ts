export function invertXY(cells: string[][]): string[][] {
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
