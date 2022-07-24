export function createTable(headers: string[], cells: any[][]): HTMLTableElement {
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

