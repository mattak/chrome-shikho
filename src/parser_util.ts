export function parseNumber(text: string): number {
    const raw = text
        .replace(/,/g, '')
        .replace(/〜.+$/, '');
    return parseFloat(raw);
}

export function parseCurrencyText(text: string): number {
    const raw = text
        .replace('億円', '')
        .replace(/ /g, '');
    return parseNumber(raw);
}

export function parseTableHeader(table: HTMLElement): string[] {
    return Array.from(table.querySelectorAll('thead th')).map(it => it.textContent || '');
}

export function parseTableBody(table: HTMLElement): string[][] {
    const trs = Array.from(table.querySelectorAll('tbody tr'));
    const cells = trs.map(tr =>
        Array.from(tr.querySelectorAll('td'))
            .map(td => td.textContent || '')
            .map(it => it.replace(/(記|特)/, ''))
            .map(it => it.replace(/[\n ]/g, ''))
    );
    return cells;
}

// unit: 百万円
export function parseMarketCapital(root: HTMLElement, querySelector: string): number {
    const priceRawText = root.querySelector(querySelector)?.textContent;
    if (priceRawText == null) return -1;
    return parseCurrencyText(priceRawText) * 100.0;
}
