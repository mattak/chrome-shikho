export function isDigit(text: string): boolean {
    if (text === null || text === "" || text === "-") return false;
    const re = /[^\d,\.\-〜]/g;
    return !re.test(text);
}
