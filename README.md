# 📊 Hệ Thống Quản Lý Doanh Thu & Tài Khoản (Revenue Management System)
Thành Viên : Nguyễn Thị Hường
Chào mừng bạn đến với tài liệu hướng dẫn và vận hành tổng thể của **Hệ Thống Quản Lý Doanh Thu & Tài Khoản**. Dự án được xây dựng và nâng cấp toàn diện theo mô hình chuẩn **Clean Architecture**, tích hợp đồng bộ từ Cơ sở dữ liệu, Backend (NestJS), Frontend (Next.js) cho tới bộ kiểm thử API tự động chuyên nghiệp (Postman & Bruno).

---

## 🚀 Các Thành Phần Đã Được Thêm & Bổ Sung Mới

### 1. 🧪 Phân Hệ Kiểm Thử API Tự Động (`api-tests/`)
Để quản lý tập trung và tránh làm nhiễu mã nguồn, toàn bộ kịch bản kiểm thử API đã được tách biệt thành một thư mục riêng biệt tại gốc dự án có tên là `api-tests/`:

*   **📂 Phân hệ Bruno (`api-tests/bruno/`)**:
    *   **`bruno.json`**: Cấu hình bộ sưu tập (Collection) chuẩn của Bruno.
    *   **`environments/Local.bru`**: Thiết lập môi trường chạy cục bộ với biến `baseUrl: http://localhost:3000`.
    *   **`getUsersAll.bru`**: Request lấy toàn bộ tài khoản phân trang kèm kịch bản kiểm thử xác thực cấu trúc phân trang, lọc bảo mật (chặn rò rỉ password) và **chuỗi liên kết kiểm thử** (tự động lưu `account_id` đầu tiên làm biến môi trường `current_test_user_id`).
    *   **`getAccountById.bru`**: Request lấy chi tiết tài khoản theo ID yêu cầu gửi kèm Token Authorization Bearer, xác thực khớp ID chính xác và kiểu cấu trúc dữ liệu `IAccount`.
*   **📂 Phân hệ Postman (`api-tests/postman/`)**:
    *   **`getUsersAll_tests.js`**: File chứa mã script kiểm thử của Postman cho API phân trang, kiểm tra định dạng JSON và bảo mật.
    *   **`getAccountById_tests.js`**: File script Postman kiểm thử chi tiết tài khoản theo ID và loại bỏ nguy cơ lộ mật khẩu.

---

### 2. 🛡️ Nâng Cấp Hệ Thống Backend (`backend/`)
Phần Backend NestJS đã được tái cấu trúc mạnh mẽ nhằm đạt hiệu năng tối ưu, tính mô-đun hóa độc lập và chuẩn mực Clean Code:

*   **⚡ Tự Động Khởi Tạo Database & Seeding (Startup Bootstrap)**:
    *   Tách biệt hoàn toàn nghiệp vụ khởi động khỏi `DatabaseService` sang tệp bổ trợ chuyên biệt [database-bootstrap.ts](file:///C:/Users/tnanh/Desktop/demo/revenue/backend/src/models/database-bootstrap.ts).
    *   Khi chạy **`npm run dev`**, hệ thống tự động kết nối thử nghiệm MySQL, kiểm tra và chạy tệp cấu trúc [init.sql](file:///C:/Users/tnanh/Desktop/demo/revenue/database/init.sql) nếu DB trống.
    *   Tự động nạp dữ liệu mẫu từ [account.init.json](file:///C:/Users/tnanh/Desktop/demo/revenue/backend/src/data/account.init.json) chứa **10 người dùng mẫu** đa dạng vai trò (ADMIN & STAFF) với mật khẩu được mã hóa chuẩn **`scrypt`** bảo mật cao.
    *   Tích hợp cơ chế **Phân giải đường dẫn động (Dynamic Path Resolution)** thông minh giúp hệ thống chạy bền bỉ dưới mọi runtime (ts-node, Webpack HMR, production build).
*   **🧩 Tách Biệt Tài Liệu Swagger Khỏi Controller (Clean Decorators)**:
    *   Tách biệt 100% các dòng mã decorator mô tả Swagger rối rắm ra các file cấu hình riêng biệt: [account.swagger.ts](file:///C:/Users/tnanh/Desktop/demo/revenue/backend/src/modules/accounts/account.swagger.ts) và [product.swagger.ts](file:///C:/Users/tnanh/Desktop/demo/revenue/backend/src/modules/products/product.swagger.ts).
    *   Sử dụng cơ chế `applyDecorators` để đóng gói giúp các tệp Controller gọn nhẹ hơn **60%**, dễ bảo trì và tập trung hoàn chỉnh vào logic điều phối.
*   **📥 Phân Tách Hàm Xử Lý Dữ Liệu Đầu Vào (Modular Data Processing)**:
    *   Nâng cấp [data-processing.service.ts](file:///C:/Users/tnanh/Desktop/demo/revenue/backend/src/modules/data-processing/data-processing.service.ts) bằng cách tách biệt logic bóc tách dữ liệu thô từ Excel thành **3 hàm biến đổi dữ liệu độc lập** dựa theo các thực thể: `transformProductData()`, `transformSaleReportData()`, và `transformInventoryReportData()`.
*   **🔔 Tích Hợp Hệ Thống Thông Báo Sự Kiện (Notification System)**:
    *   Xây dựng bảng cơ sở dữ liệu `notification` chuyên biệt và Module `NotificationModule` hoàn chỉnh.
    *   Tự động tạo các bản tin thông báo hệ thống khi Admin thực hiện các thao tác CRUD trên sản phẩm (`ProductService`) và tài khoản (`AccountService`).
*   **📊 Hệ Thống Giám Sát Logs & CORS**:
    *   **Logs Hệ thống (`logs/system.log`)**: Ghi chép tự động các sự kiện lỗi nghiêm trọng dạng chuẩn NestJS.
    *   **Logs API (`logs/api.log`)**: Ghi nhận toàn bộ thông tin chi tiết các lượt truy cập API (URL, Method, Status, Duration, IP).
    *   **CORS**: Kích hoạt CORS hỗ trợ credentials đầy đủ giúp liên kết mượt mà với frontend Next.js mà không bị lỗi trình duyệt chặn.
*   **🧼 Dọn Dẹp Mã Nguồn (Cleanup)**:
    *   Loại bỏ hoàn toàn các thư viện, kịch bản lệnh và cấu hình kiểm thử đơn vị (Unit/E2E test) không cần thiết để tối ưu hóa dự án siêu nhẹ.

---

### 3. 🎨 Nâng Cấp Giao Diện Frontend (`frontend/`)
Ứng dụng Next.js đã được tích hợp giao diện thông báo thời gian thực cao cấp:

*   **🔔 Component Dropdown Thông Báo Glassmorphic**:
    *   Xây dựng component [notification-dropdown.tsx](file:///C:/Users/tnanh/Desktop/demo/revenue/frontend/src/components/notification-dropdown.tsx) ứng dụng hiệu ứng kính mờ (Glassmorphism) vô cùng sang trọng, hiệu ứng hover và micro-animations mượt mà.
    *   Tự động phân loại icon và màu sắc cho từng nhóm thông báo: `SYSTEM` (Thông tin), `INVENTORY_ALERT` (Cảnh báo tồn kho), `NEW_SALE` (Đơn hàng mới), `CUSTOMER_NEW` (Khách hàng mới).
    *   Hiệu ứng nhấp nháy động (`animate-pulse`) ở chuông thông báo khi có bản tin chưa đọc.
*   **🔌 Chế Độ Fallback Thông Minh (Rich Demo Mode)**:
    *   Nếu Backend offline, frontend sẽ tự động chuyển sang chế độ Demo ngoại tuyến với dữ liệu giả lập sống động, cho phép trải nghiệm đầy đủ chức năng thông báo mà không làm gián đoạn hay crash ứng dụng.
*   **site-header.tsx**: Đưa dropdown thông báo tích hợp nhất quán vào Header chính của hệ thống.

---

## 🛠️ Hướng Dẫn Khởi Động Nhanh (Getting Started),

### Bước 1: Khởi chạy Backend NestJS
```bash
cd backend
npm run dev
```
*   Hệ thống sẽ tự động kiểm tra, khởi tạo database `revenue` và nạp 10 người dùng mẫu nếu chưa có dữ liệu.
*   Tài liệu Swagger UI sẽ sẵn sàng tại: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

### Bước 2: Khởi chạy Frontend Next.js
```bash
cd frontend
npm run dev
```
*   Ứng dụng Next.js sẽ được mở tại: [http://localhost:3001](http://localhost:3001) hoặc cổng tương ứng hiển thị trên terminal.

### Bước 3: Chạy Kiểm Thử API bằng Bruno
1. Mở ứng dụng **Bruno**.
2. Chọn **Open Collection** và chỉ tới thư mục [api-tests/bruno](file:///C:/Users/tnanh/Desktop/demo/revenue/api-tests/bruno).
3. Chọn môi trường **Local** ở góc trên bên phải của Bruno và bắt đầu kiểm thử các API!
