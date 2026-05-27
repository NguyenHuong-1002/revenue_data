import * as ExcelJS from 'exceljs';

const FILE_DEFAULT = '../data/sales/TT T01-2022_split_1.xlsx';
const COLUMNS_DEFAULT = ['distribution_channel'];

function getColumnIndex(
  headerValues: (string | undefined)[],
  columnName: string,
): number {
  for (let i = 1; i < headerValues.length; i++) {
    if (headerValues[i] === columnName) return i;
  }
  return -1;
}

async function main() {
  const args = process.argv.slice(2);

  const filePath = args[0] && !args[0].startsWith('[') ? args[0] : FILE_DEFAULT;
  const columns = args.length > 1 ? args.slice(1) : COLUMNS_DEFAULT;

  console.log(`File: ${filePath}`);
  console.log('Columns:', columns.join(', '));

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];
  const headerRow = worksheet.getRow(1);
  const headerValues = headerRow.values as (string | undefined)[];

  const colIndices = columns.map((col) => ({
    name: col,
    index: getColumnIndex(headerValues, col),
    values: new Set<unknown>(),
  }));

  const missing = colIndices.filter((c) => c.index === -1);
  if (missing.length > 0) {
    console.log('Available headers:', headerValues.slice(1));
  }

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    for (const col of colIndices) {
      if (col.index !== -1) {
        col.values.add(row.getCell(col.index).value);
      }
    }
  });

  for (const col of colIndices) {
    console.log(`\n--- CỘT: ${col.name} ---`);
    if (col.index === -1) {
      console.warn(`Không tìm thấy cột`);
      continue;
    }
    const arr = Array.from(col.values);
    console.log('Số lượng unique:', arr.length);
    console.log('Giá trị:', arr);
  }
}

main().catch(console.error);
