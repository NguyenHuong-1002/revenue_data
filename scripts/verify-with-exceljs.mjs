/**
 * verify-with-exceljs.mjs
 *
 * Đọc lại 3 file template bằng exceljs (giống backend excel-reader.util)
 * để chắc chắn chúng tương thích với pipeline import thật.
 */

import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const Excel = require(path.resolve(__dirname, '..', 'backend', 'node_modules', 'exceljs'));

async function readExcel(input) {
  const wb = new Excel.Workbook();
  await wb.xlsx.readFile(input);
  const ws = wb.worksheets[0];
  const rows = [];
  const headerRow = ws.getRow(1).values;
  const headers = [];
  for (let i = 1; i < headerRow.length; i++) {
    const val = headerRow[i];
    if (val !== null && val !== undefined && String(val).trim() !== '') {
      headers.push({ name: String(val).trim(), colIdx: i });
    }
  }
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const obj = {};
    headers.forEach(({ name, colIdx }) => {
      const val = row.getCell(colIdx).value;
      obj[name] = val !== null && val !== undefined ? val : null;
    });
    if (Object.keys(obj).length > 0) rows.push(obj);
  });
  return rows;
}

const files = [
  { name: 'products-template.xlsx', entity: 'product' },
  { name: 'sale-report-template.xlsx', entity: 'sale-report' },
  { name: 'inventory-report-template.xlsx', entity: 'inventory-report' },
];

for (const { name, entity } of files) {
  const p = path.resolve(__dirname, '..', 'templates', name);
  const rows = await readExcel(p);
  console.log(`\n=== ${name} (${entity}) ===`);
  console.log(`Tổng dòng đọc được: ${rows.length}`);
  console.log(`Mẫu row đầu: ${JSON.stringify(rows[0], null, 2).slice(0, 400)}...`);
  // Show _note column từ mỗi row để xác nhận
  console.log('\n_phân loại dòng:');
  rows.forEach((r, i) => {
    console.log(`  Row ${i + 2}: ${r._note ?? '(no _note)'}`);
  });
}
