export function exportToCSV<T extends object>(
    rows: T[],
    filename: string
) {
    if (rows.length === 0) return;

    const headers = Object.keys(rows[0]).join(",");
    const data = rows
    .map((row) =>
    Object.values(row)
    .map((v) => `"${v}"`)
    .join(",")
)
.join ("\n");

const csv = `${headers}\n${data}`;
const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
const url = URL.createObjectURL(blob);

const link = document.createElement("a");
link.href = url;
link.download = filename;
link.click();

URL.revokeObjectURL(url);
}