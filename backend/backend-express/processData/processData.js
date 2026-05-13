const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const BATCH_SIZE = 5000;

function getExcelFiles(directoryPath) {
  return fs
    .readdirSync(directoryPath)
    .filter((fileName) => fileName.endsWith(".xlsx") || fileName.endsWith(".xls"))
    .sort()
    .map((fileName) => path.join(directoryPath, fileName));
}

async function insertRowsInBatches(connection, sql, rows) {
  for (let index = 0; index < rows.length; index += BATCH_SIZE) {
    await connection.query(sql, [rows.slice(index, index + BATCH_SIZE)]);
  }
}

function toCleanString(value, fallback = "") {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value).trim();
}

function toNumber(value, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

async function processDataProduct(filePath, connection) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);

  const processedRows = data
    .filter((row) => row.product_id || row["Mã hàng"])
    .map((row) => {
      return [
        toCleanString(row.product_id || row["Mã hàng"]),
        toCleanString(row.color || row["Màu sắc"], "N/A"),
        toCleanString(row.product_group || row["Nhóm hàng"], "Khác"),
        toCleanString(row.size || row["Kích cỡ"], "N/A"),
        toCleanString(row.brand_name || row["Thương hiệu"], "No Brand"),
        toCleanString(row.age_group || row["Nhóm tuổi"], "Người lớn"),
        toCleanString(row.gender || row["Đối tượng"], "Unisex"),
      ];
    });

  const uniqueRows = Array.from(
    new Map(processedRows.map((item) => [item[0], item])).values(),
  );

  if (uniqueRows.length === 0) {
    console.log("--- Không có dữ liệu products hợp lệ để nạp ---");
    return { insertedRows: 0 };
  }

  const sql = `INSERT IGNORE INTO products 
        (product_id, color, product_group, size, brand_name, age_group, gender) 
        VALUES ?`;

  await insertRowsInBatches(connection, sql, uniqueRows);
  console.log(
    `--- Đã nạp thành công ${uniqueRows.length} dòng dữ liệu products sạch! ---`,
  );

  return { insertedRows: uniqueRows.length };
}

async function processDataSales(directoryPath, connection, validProductIds) {
  const sql = `INSERT INTO sales
        (month, product_id, sold_quantity, net_price, cost_price, site_id, distribution_channel)
        VALUES ?`;
  let totalRows = 0;
  let skippedRows = 0;

  for (const filePath of getExcelFiles(directoryPath)) {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    const rows = [];

    for (const row of data) {
      const productId = toCleanString(row.product_id);
      if (!productId) continue;
      if (validProductIds && !validProductIds.has(productId)) {
        skippedRows += 1;
        continue;
      }

      rows.push([
        toCleanString(row.month),
        productId,
        toNumber(row.sold_quantity),
        toNumber(row.net_price),
        toNumber(row.cost_price),
        toCleanString(row.site),
        toCleanString(row.distribution_channel || row.channel_id, "Unknown"),
      ]);
    }

    if (rows.length === 0) continue;

    await insertRowsInBatches(connection, sql, rows);
    totalRows += rows.length;
    console.log(`--- Đã nạp ${rows.length} dòng sales từ ${path.basename(filePath)} ---`);
  }

  console.log(
    `--- Đã nạp tổng cộng ${totalRows} dòng dữ liệu sales sạch, bỏ qua ${skippedRows} dòng không khớp product_id! ---`,
  );
  return { insertedRows: totalRows, skippedRows };
}

async function processDataInventory(directoryPath, connection, validProductIds) {
  const sql = `INSERT INTO inventory
        (check_date, product_id, quantity, plant_id)
        VALUES ?`;
  let totalRows = 0;
  let skippedRows = 0;

  for (const filePath of getExcelFiles(directoryPath)) {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);

    const rows = [];

    for (const row of data) {
      const productId = toCleanString(row.product_id);
      if (!productId) continue;
      if (validProductIds && !validProductIds.has(productId)) {
        skippedRows += 1;
        continue;
      }

      rows.push([
        toCleanString(row.calendar_yeer_week || row.calendar_year_week),
        productId,
        toNumber(row.quantity),
        toCleanString(row.plant),
      ]);
    }

    if (rows.length === 0) continue;

    await insertRowsInBatches(connection, sql, rows);
    totalRows += rows.length;
    console.log(
      `--- Đã nạp ${rows.length} dòng inventory từ ${path.basename(filePath)} ---`,
    );
  }

  console.log(
    `--- Đã nạp tổng cộng ${totalRows} dòng dữ liệu inventory sạch, bỏ qua ${skippedRows} dòng không khớp product_id! ---`,
  );
  return { insertedRows: totalRows, skippedRows };
}

module.exports = {
  processDataProduct,
  processDataSales,
  processDataInventory,
};
