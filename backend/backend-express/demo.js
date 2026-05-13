// File: demo.js
const mysql = require("mysql2/promise");
const { getUniqueString } = require("./backend-express/utils"); // Import hàm từ file trên

async function runDemo() {
  // 1. Tạo kết nối
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "", // Mật khẩu Laragon của bạn
    database: "revenue_db", // Tên database đã tạo
  });

  try {
    console.log("--- Đang truy vấn dữ liệu ---");

    // 2. Gọi hàm đã tách riêng
    const siteIdString = await getUniqueString(connection, "sales", "site_id");

    // 3. In kết quả
    if (siteIdString) {
      console.log("Chuỗi Site ID kết quả:");
      console.log(siteIdString);
    } else {
      console.log("Không tìm thấy dữ liệu hoặc bảng trống.");
    }
  } catch (error) {
    console.error("Lỗi khi chạy demo:", error.message);
  } finally {
    // 4. Đóng kết nối
    await connection.end();
    console.log("--- Đã đóng kết nối ---");
  }
}

// Chạy demo
runDemo();
