export function formatViewCount(views: number | string | null | undefined): string {
    if (views == null) return "0";
    const num = Number(views);
    if (isNaN(num)) return "0";

    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    }
    return num.toLocaleString();
}
