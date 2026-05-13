// File: functions.js

/**
 * Hàm lấy danh sách giá trị duy nhất và gộp thành chuỗi
 */
async function getUniqueString(connection, tableName, columnName) {
  const [rows] = await connection.query(
    `SELECT DISTINCT ${columnName} FROM ${tableName} WHERE ${columnName} IS NOT NULL`,
  );

  return rows.map((row) => row[columnName]).join(", ");
}

// Xuất hàm ra ngoài
module.exports = { getUniqueString };
