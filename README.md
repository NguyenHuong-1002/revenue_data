# 📊 Hệ Thống Quản Lý Doanh Thu & Tài Khoản (Revenue Management System)

**Thành Viên:** Nguyễn Thị Hường

Chào mừng bạn đến với tài liệu hướng dẫn và vận hành tổng thể của **Hệ Thống Quản Lý Doanh Thu & Tài Khoản**. Dự án được xây dựng và nâng cấp toàn diện theo mô hình chuẩn **Clean Architecture**, tích hợp đồng bộ từ Cơ sở dữ liệu, Backend (NestJS), Frontend (Next.js) cho tới bộ kiểm thử API tự động chuyên nghiệp (Postman & Bruno), đồng thời hỗ trợ triển khai container hóa toàn bộ bằng Docker.

---

## 🚀 Các Thành Phần & Nâng Cấp Hệ Thống

### 1. 🐳 Cấu Hình Triển Khai Docker Mới
Chúng tôi đã tích hợp cấu hình Docker hoàn chỉnh hỗ trợ chạy toàn bộ hệ thống bằng một dòng lệnh duy nhất:
*   [docker-compose.yml](file:///C:/Users/tnanh/Desktop/demo/revenue/docker-compose.yml): Cấu hình đồng thời 3 dịch vụ: `database` (MySQL 8.0), `backend` (NestJS), và `frontend` (Next.js).
*   [backend/Dockerfile](file:///C:/Users/tnanh/Desktop/demo/revenue/backend/Dockerfile): Thiết lập multi-stage build giúp giảm thiểu dung lượng image backend, chỉ cài đặt production dependencies.
*   [frontend/Dockerfile](file:///C:/Users/tnanh/Desktop/demo/revenue/frontend/Dockerfile): Dockerfile tối ưu cho ứng dụng Next.js chạy trên cổng 5000.
*   **Volume Mounts:** Mount trực tiếp tệp khởi tạo DB và thư mục dữ liệu Excel mẫu vào các container để đảm bảo hệ thống tự đồng bộ dữ liệu.

### 2. 🎨 Giao Diện Frontend (`frontend/`)
*   **Tô sáng Menu đang chọn & Tối ưu hóa Sidebar:** Tái cấu trúc hoàn toàn [app-sidebar.tsx](file:///C:/Users/tnanh/Desktop/demo/revenue/frontend/src/components/app-sidebar.tsx) để loại bỏ các khối lặp menu trùng lặp. Tích hợp hook `usePathname` từ `next/navigation` để tự động xác định và tô sáng (highlight) menu đang hoạt động.
*   **Component Dropdown Thông Báo Glassmorphic:** Xây dựng component [notification-dropdown.tsx](file:///C:/Users/tnanh/Desktop/demo/revenue/frontend/src/components/notification-dropdown.tsx) ứng dụng hiệu ứng kính mờ (Glassmorphism), có biểu tượng thông báo nhấp nháy động (`animate-pulse`) khi có bản tin chưa đọc.
*   **Dọn dẹp mã nguồn:** Loại bỏ component không còn sử dụng (`plants-header.tsx`) và các tệp cấu hình AI nháp (`AGENTS.md`, `CLAUDE.md`).

### 3. 🛡️ Nâng Cấp Hệ Thống Backend (`backend/`)
*   **Dọn dẹp mã nguồn dư thừa:** Xóa hoàn toàn các thư mục/file rác như `src/mockupFunction/` (mock code không dùng), `src/constrants/` (thư mục hằng số trống) cùng hàng loạt các script nháp trong `scripts/` và `scratch/` (như `db_migrate.js`, `test-api.ts`,...).
*   **Bổ sung Swagger API:** Bổ sung đầy đủ decorator tài liệu OpenAPI cho tất cả các endpoint (như `/products/stats` tại [product.controller.ts](file:///C:/Users/tnanh/Desktop/demo/revenue/backend/src/modules/products/product.controller.ts)).
*   **Tự Động Khởi Tạo Database & Seeding:** Tích hợp logic khởi tạo trong [database-bootstrap.ts](file:///C:/Users/tnanh/Desktop/demo/revenue/backend/src/models/database-bootstrap.ts), tự động chạy tệp cấu trúc [init.sql](file:///C:/Users/tnanh/Desktop/demo/revenue/database/init.sql) và nạp 10 người dùng mẫu nếu cơ sở dữ liệu trống.
*   **Thông Báo Hệ Thống:** Tự động gửi thông báo khi Admin thao tác dữ liệu (sản phẩm, tài khoản).
*   **Logs Hệ thống & API:** Ghi logs lỗi và logs truy cập lần lượt tại `logs/system.log` và `logs/api.log`.

### 4. 🧪 Phân Hệ Kiểm Thử API Tự Động (`api-tests/`)
Các kịch bản kiểm thử API được đặt riêng biệt tại `api-tests/`:
*   **Bruno (`api-tests/bruno/`)**: Bao gồm collection và environments hoàn chỉnh để kiểm thử luồng lấy danh sách người dùng, bảo mật password, và tự động gán biến môi trường từ kết quả test.
*   **Postman (`api-tests/postman/`)**: Chứa kịch bản JavaScript chạy kiểm thử các endpoints tương ứng.

---

## 🛠️ Hướng Dẫn Vận Hành Hệ Thống

### Cách 1: Triển khai nhanh bằng Docker (Khuyên dùng)
**1. Khởi chạy hệ thống:**
Chạy lệnh sau tại thư mục gốc của dự án để build và chạy ngầm các container:
```bash
docker-compose up -d --build
```
**2. Nạp dữ liệu mẫu từ Excel vào database:**
Chạy lệnh sau để tự động cấu hình các bảng dữ liệu mẫu:
```bash
docker exec -it revenue-backend npm run db:setup
```

### Cách 2: Khởi chạy thủ công dưới Local
**1. Khởi chạy Backend:**
```bash
cd backend
npm install
npm run dev
```
*Tài liệu Swagger UI sẽ sẵn sàng tại: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)*

**2. Khởi chạy Frontend:**
```bash
cd frontend
npm install
npm run dev
```
*Giao diện người dùng sẽ chạy tại: [http://localhost:5000](http://localhost:5000)*

**3. Chạy Kiểm Thử API bằng Bruno:**
1. Mở ứng dụng **Bruno**.
2. Nhập collection từ thư mục [api-tests/bruno/](file:///C:/Users/tnanh/Desktop/demo/revenue/api-tests/bruno).
3. Chọn môi trường **Local** và tiến hành chạy kiểm thử các request.
