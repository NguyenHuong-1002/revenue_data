import * as ExcelJS from 'exceljs';

export async function mockupFunction(
  filePath: string,
  columnName: string,
): Promise<unknown[]> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.worksheets[0];

    const headerRow = worksheet.getRow(1);
    const headerValues = headerRow.values as (string | undefined)[];

    let colIndex = -1;
    for (let i = 1; i < headerValues.length; i++) {
      if (headerValues[i] === columnName) {
        colIndex = i;
        break;
      }
    }

    if (colIndex === -1) {
      console.warn(`Không tìm thấy cột "${columnName}" trong file Excel`);
      return [];
    }

    const uniqueValues = new Set<unknown>();
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const cellValue = row.getCell(colIndex).value;
      uniqueValues.add(cellValue);
    });

    return Array.from(uniqueValues);
  } catch (error) {
    console.error(`Lỗi khi đọc file Excel: ${(error as Error).message}`);
    return [];
  }
}
