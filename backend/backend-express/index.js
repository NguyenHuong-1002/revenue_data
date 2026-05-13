const express = require("express");
const initDatabase = require("./config/initDb"); // Đường dẫn tới file vừa tạo

const app = express();

// Luồng khởi chạy
const startServer = async () => {
  try {
    // Tự động khởi tạo DB và Bảng
    await initDatabase();

    // Sau khi DB sẵn sàng mới bắt đầu lắng nghe cổng 3000
    app.listen(3000, () => {
      console.log("Backend Express đang chạy tại http://localhost:3000");
    });
  } catch (error) {
    console.error("Không thể khởi động hệ thống:", error);
  }
};

startServer();
