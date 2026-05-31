import * as Excel from 'exceljs';
import * as fs from 'node:fs';

/**
 * Đọc dữ liệu từ file Excel thô và chuyển thành mảng các bản ghi Object dynamic
 * @param filePath Đường dẫn tuyệt đối tới tệp Excel
 */
export async function readExcel(input: string | Buffer): Promise<Record<string, any>[]> {
  const wb = new Excel.Workbook();
  if (Buffer.isBuffer(input)) {
    await wb.xlsx.load(input as any);
  } else {
    await wb.xlsx.readFile(input);
  }
  const ws = wb.worksheets[0];
  const rows: Record<string, unknown>[] = [];
  const headerRow = ws.getRow(1).values as (string | number | null)[];

  // Trích xuất headers có giá trị kèm theo chỉ số cột tương ứng
  const headers: { name: string; colIdx: number }[] = [];
  for (let i = 1; i < headerRow.length; i++) {
    const val = headerRow[i];
    if (val !== null && val !== undefined && String(val).trim() !== '') {
      headers.push({
        name: String(val).trim(),
        colIdx: i,
      });
    }
  }

  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const obj: Record<string, unknown> = {};
    headers.forEach(({ name, colIdx }) => {
      const val = row.getCell(colIdx).value;
      obj[name] = val !== null && val !== undefined ? val : null;
    });
    if (Object.keys(obj).length > 0) rows.push(obj);
  });

  return rows;
}

/**
 * Liệt kê danh sách các tệp Excel (.xlsx) trong một thư mục chỉ định
 * @param dir Thư mục cần liệt kê
 */
export function listExcelFiles(dir: string): string[] {
  return fs.readdirSync(dir).filter((f) => f.endsWith('.xlsx'));
}
