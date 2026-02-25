export function clamp(
    number: number,
    min: number,
    max: number,
    callback?: (clamped: number, number: number) => any
) {
    const result = Math.min(Math.max(number, min), max);
    if (result !== number && callback) callback(result, number);
    return result;
}

export function remToPx(rem: number) {
    return (
        rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
    );
}

function pad(n: number) {
    return String(n).padStart(2, "0");
}

export function getLocalTimestamp(): string {
    const d = new Date(); // lokales Datum/Zeit
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1); // 0-basiert
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}
