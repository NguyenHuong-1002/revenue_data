const mysql = require("mysql2/promise");
const path = require("path");
const { processDataProduct } = require("../utils");

const initDatabase = async () => {
  // Kết nối tạm thời không chọn database để tạo database trước
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "", // Laragon mặc định trống
  });

  console.log("--- Bắt đầu khởi tạo hệ thống ---");

  // 1. Tạo Database
  await connection.query(`CREATE DATABASE IF NOT EXISTS revenue_db`);
  await connection.query(`USE revenue_db`);
  console.log("✓ Đã khởi tạo Database: revenue_db");

  // 2. Tạo bảng Sản phẩm
  await connection.query(`
    CREATE TABLE IF NOT EXISTS products (
        product_id VARCHAR(100) PRIMARY KEY, -- Cột 'Mã hàng'
        color VARCHAR(50),                   -- Cột 'Màu sắc'
        product_group VARCHAR(100),          -- Cột 'Nhóm hàng'
        size VARCHAR(20),                    -- Cột 'Kích cỡ'
        brand_name VARCHAR(100),             -- Cột 'Thương hiệu'
        age_group VARCHAR(50),               -- Cột 'Nhóm tuổi' (nếu có)
        gender VARCHAR(50)                   -- Cột 'Đối tượng'
    )
`);
  console.log("✓ Đã khởi tạo bảng: products");

  const productFilePath = path.join(
    __dirname,
    "..",
    "..",
    "shared_data",
    "product",
    "Productmaster.xlsx",
  );
  await processDataProduct(productFilePath, connection);

  // 3. Tạo bảng Doanh thu
  await connection.query(`
        CREATE TABLE IF NOT EXISTS sales (
            id INT AUTO_INCREMENT PRIMARY KEY,
            month VARCHAR(20),
            product_id VARCHAR(100),
            sold_quantity INT,
            net_price DECIMAL(15, 2),
            cost_price DECIMAL(15, 2),
            site_id VARCHAR(50),
            FOREIGN KEY (product_id) REFERENCES products(product_id)
        )
    `);
  console.log("✓ Đã khởi tạo bảng: sales");

  // 4. Tạo bảng Tồn kho
  await connection.query(`
        CREATE TABLE IF NOT EXISTS inventory (
            id INT AUTO_INCREMENT PRIMARY KEY,
            check_date VARCHAR(20),
            product_id VARCHAR(100),
            quantity INT,
            plant_id VARCHAR(50),
            FOREIGN KEY (product_id) REFERENCES products(product_id)
        )
    `);
  console.log("✓ Đã khởi tạo bảng: inventory");

  await connection.end();
  console.log("--- Khởi tạo hoàn tất! ---");
};

if (require.main === module) {
  initDatabase().catch((error) => {
    console.error("Không thể khởi tạo hệ thống:", error);
    process.exit(1);
  });
}

// --- CÁCH SỬ DỤNG ---

module.exports = initDatabase;
