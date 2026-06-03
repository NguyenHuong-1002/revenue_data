CREATE DATABASE IF NOT EXISTS revenue
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE revenue;

-- ============================================================
-- 1. storeBranch (Tạo trước vì các bảng khác tham chiếu đến)
-- ============================================================
CREATE TABLE IF NOT EXISTS storeBranch (
  store_id   VARCHAR(50)  NOT NULL PRIMARY KEY,
  name       VARCHAR(50)  NOT NULL,
  city       VARCHAR(50)  NOT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. Plant
-- ============================================================
CREATE TABLE IF NOT EXISTS Plant (
  plant_id     VARCHAR(50)  NOT NULL PRIMARY KEY,
  name_plant   VARCHAR(50)  NOT NULL,
  address      VARCHAR(50)  NOT NULL,
  manager_name VARCHAR(50)  NOT NULL,
  phone        VARCHAR(50)  NOT NULL,
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 4. product
-- ============================================================
CREATE TABLE IF NOT EXISTS product (
  product_id           VARCHAR(50)  NOT NULL PRIMARY KEY,
  color                VARCHAR(50)  NOT NULL,
  listing_price        DECIMAL(15, 0) NOT NULL DEFAULT 0,
  price_cost           DECIMAL(15, 0) NOT NULL DEFAULT 0,
  gender               ENUM('MEN','WOM','BOY','GIR') NOT NULL,
  detail_product_group ENUM('SANTD','DEPTD','GTTPC','GTTCD','SANTR','GIATR','PKIEN','TBLTH','TBLTR') NOT NULL,
  size                 INT          NOT NULL DEFAULT 0, 
  age_group            ENUM('16 đến <24 tuổi', '24 đến <40 tuổi', '40 đến <60 tuổi', '0 đến <3 tuổi', 'Trên 60 tuổi', '6 đến <10 tuổi', '3 đến <6 tuổi', '10 đến <16 tuổi', 'Khác') NOT NULL,
  activity_group       ENUM('Thường nhật/Trường học', 'Thể thao', 'Văn phòng', 'Chuyên biệt', 'Khác') NOT NULL,
  lifestyle_group      ENUM('Sport', 'Casual', 'Fashion', 'Formal', 'Khác') NOT NULL,
  created_at           DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. account
-- ============================================================
CREATE TABLE IF NOT EXISTS account (
  account_id   VARCHAR(50)  NOT NULL PRIMARY KEY,
  role_account ENUM('ADMIN', 'STAFF') NOT NULL DEFAULT 'STAFF',
  fullname     VARCHAR(255)  NOT NULL,
  username     VARCHAR(255)  NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  mail         VARCHAR(255)  NOT NULL,
  avatarURL    VARCHAR(255) NULL,
  status_account ENUM('ACTIVE','INACTIVE','LOCKED') DEFAULT 'ACTIVE',
  last_login_at DATETIME NULL DEFAULT NULL,
  deleted_at   DATETIME     DEFAULT NULL,
  created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. InventoryReport
-- ============================================================
CREATE TABLE IF NOT EXISTS InventoryReport (
  inventory_id        VARCHAR(50) NOT NULL PRIMARY KEY,
  product_id          VARCHAR(50) NOT NULL,
  plant_id            VARCHAR(50) NOT NULL,
  calendar_year_week  DATETIME    DEFAULT NULL,
  quantity            INT         NOT NULL DEFAULT 0,
  created_at          DATETIME    DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ir_product (product_id),
  INDEX idx_ir_plant (plant_id),
  CONSTRAINT fk_ir_product FOREIGN KEY (product_id) REFERENCES product(product_id),
  CONSTRAINT fk_ir_plant   FOREIGN KEY (plant_id)   REFERENCES Plant(plant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. saleReport
-- ============================================================
CREATE TABLE IF NOT EXISTS saleReport (
  sale_id             VARCHAR(50)  NOT NULL PRIMARY KEY,
  product_id          VARCHAR(50)  NOT NULL,
  sold_quantity       INT          NOT NULL DEFAULT 0,
  distribution_channel ENUM('Online', 'Bán lẻ', 'Phát sinh', 'Bán sỉ', 'Siêu thị', 'Hợp đồng', 'Chi nhánh') NOT NULL,
  branch_id           VARCHAR(50)  NOT NULL,
  time_report         DATETIME     NOT NULL,
  created_at          DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sr_product  (product_id),
  INDEX idx_sr_branch   (branch_id),
  INDEX idx_sr_time     (product_id, time_report),
  CONSTRAINT fk_sr_product  FOREIGN KEY (product_id)  REFERENCES product(product_id),
  CONSTRAINT fk_sr_branch   FOREIGN KEY (branch_id)   REFERENCES storeBranch(store_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. notification (Đã chỉnh sửa: Chỉ lưu nội dung thông báo)
-- ============================================================
CREATE TABLE IF NOT EXISTS notification (
  notification_id VARCHAR(50)  NOT NULL PRIMARY KEY,
  title           VARCHAR(255) NOT NULL,
  content         TEXT         NOT NULL,
  type            ENUM('SYSTEM', 'INVENTORY_ALERT', 'NEW_SALE', 'CUSTOMER_NEW', 'OTHER') NOT NULL DEFAULT 'SYSTEM',
  created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. account_notification (Bảng mới: Lưu trạng thái của từng cá nhân)
-- ============================================================
CREATE TABLE IF NOT EXISTS account_notification (
  account_id      VARCHAR(50) NOT NULL,
  notification_id VARCHAR(50) NOT NULL,
  is_read         TINYINT(1)  NOT NULL DEFAULT 0, -- 0: Chưa đọc, 1: Đã đọc
  read_at         DATETIME    DEFAULT NULL,
  is_deleted      TINYINT(1)  NOT NULL DEFAULT 0, -- 0: Chưa xóa, 1: Đã xóa (Ẩn với user này)
  deleted_at      DATETIME    DEFAULT NULL,
  PRIMARY KEY (account_id, notification_id),
  
  INDEX idx_acc_noti_read (is_read),
  INDEX idx_acc_noti_deleted (is_deleted),
  
  CONSTRAINT fk_an_account      FOREIGN KEY (account_id)      REFERENCES account(account_id) ON DELETE CASCADE,
  CONSTRAINT fk_an_notification FOREIGN KEY (notification_id) REFERENCES notification(notification_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. landing_feature
-- ============================================================
CREATE TABLE IF NOT EXISTS landing_feature (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  icon        VARCHAR(100) NOT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT         NOT NULL,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed features
INSERT INTO landing_feature (icon, title, description) VALUES
('DatabaseIcon', 'Nhập dữ liệu đa dạng', 'Import dữ liệu sản phẩm, tồn kho và doanh số từ file Excel. Hệ thống tự động xử lý và chuẩn hóa dữ liệu.'),
('Building2Icon', 'Quản lý chi nhánh', 'Theo dõi và quản lý đa chi nhánh, phân tích hiệu suất kinh doanh theo từng đơn vị một cách chi tiết.'),
('FactoryIcon', 'Quản lý nhà máy', 'Giám sát hoạt động sản xuất và tồn kho theo từng nhà máy, tối ưu chuỗi cung ứng toàn diện.'),
('PackageIcon', 'Quản lý sản phẩm', 'Quản lý danh mục sản phẩm tập trung, dễ dàng tra cứu, cập nhật và phân tích hiệu suất từng mặt hàng.'),
('CandlestickChartIcon', 'Dự báo thông minh', 'Dự đoán xu hướng doanh thu và tồn kho với thuật toán phân tích chuỗi thời gian, hỗ trợ lập kế hoạch kinh doanh.'),
('BrainCircuitIcon', 'AI phân tích chỉ số', 'Trợ lý AI thông minh phân tích sâu các chỉ số kinh doanh, phát hiện bất thường và đưa ra gợi ý chiến lược.'),
('DownloadIcon', 'Xuất báo cáo PDF/Excel', 'Xuất báo cáo tăng trưởng và doanh thu dưới dạng PDF hoặc Excel chỉ trong một cú nhấp chuột.'),
('BellIcon', 'Thông báo thông minh', 'Nhận thông báo tức thì khi có biến động quan trọng về doanh thu, tồn kho và các chỉ số kinh doanh.'),
('NetworkIcon', 'Phân quyền & Bảo mật', 'Hệ thống tài khoản và phân quyền chi tiết theo vai trò, bảo vệ dữ liệu với JWT authentication nhiều lớp.');

-- ============================================================
-- 11. landing_ai_insight
-- ============================================================
CREATE TABLE IF NOT EXISTS landing_ai_insight (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  icon        VARCHAR(100) NOT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT         NOT NULL,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed AI insights
INSERT INTO landing_ai_insight (icon, title, description) VALUES
('BrainCircuitIcon', 'Phân tích tăng trưởng', 'AI tự động so sánh doanh thu theo tháng, theo năm, phân tích tốc độ tăng trưởng và xác định xu hướng dài hạn.'),
('TrendingUpIcon', 'Dự báo thông minh', 'Dự đoán doanh thu và tồn kho tương lai dựa trên dữ liệu lịch sử, hỗ trợ lập kế hoạch kinh doanh chính xác.'),
('SparklesIcon', 'Gợi ý chiến lược', 'AI đưa đề xuất hành động dựa trên phân tích dữ liệu, giúp bạn đưa ra quyết định kinh doanh sáng suốt.');

-- ============================================================
-- 12. landing_testimonial
-- ============================================================
CREATE TABLE IF NOT EXISTS landing_testimonial (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  role        VARCHAR(255) NOT NULL,
  content     TEXT         NOT NULL,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed testimonials
INSERT INTO landing_testimonial (name, role, content) VALUES
('Anh Minh Nguyễn', 'Giám đốc Tài chính, TechVina', 'Từ khi sử dụng hệ thống này, đội ngũ của tôi tiết kiệm được hơn 20 giờ mỗi tuần cho việc tổng hợp báo cáo doanh thu.'),
('Chị Lan Trần', 'Trưởng phòng Kinh doanh, GreenMart', 'Giao diện trực quan giúp tôi nắm bắt tình hình kinh doanh chỉ trong 5 phút mỗi sáng. Đây là công cụ không thể thiếu.'),
('Anh Hoàng Lê', 'CEO, StartUpPlus', 'Chúng tôi đã tăng trưởng 40% sau 3 tháng nhờ vào các phân tích chi tiết mà dashboard này cung cấp.');

-- ============================================================
-- 13. landing_pricing
-- ============================================================
CREATE TABLE IF NOT EXISTS landing_pricing (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  price       VARCHAR(100) NOT NULL,
  period      VARCHAR(50)  NOT NULL,
  description VARCHAR(255) NOT NULL,
  features    TEXT         NOT NULL, -- JSON string
  popular     TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed pricing
INSERT INTO landing_pricing (name, price, period, description, features, popular) VALUES
('Cơ bản', '499.000', '/tháng', 'Dành cho doanh nghiệp nhỏ', '["Nhập dữ liệu Excel (sản phẩm, doanh số, tồn kho)", "Dashboard theo dõi doanh thu", "Quản lý sản phẩm & chi nhánh", "Xuất báo cáo PDF/Excel", "Tối đa 3 người dùng"]', 0),
('Chuyên nghiệp', '1.499.000', '/tháng', 'Dành cho đội ngũ đang mở rộng', '["Tất cả tính năng Cơ bản", "Dự báo doanh thu & tồn kho", "AI phân tích chỉ số kinh doanh", "Quản lý nhà máy & đa chi nhánh", "Thông báo thông minh", "Tối đa 15 người dùng", "Hỗ trợ ưu tiên 24/7"]', 1),
('Doanh nghiệp', 'Liên hệ', '', 'Dành cho tổ chức lớn', '["Tất cả tính năng Chuyên nghiệp", "Không giới hạn người dùng", "Tùy chỉnh dashboard theo yêu cầu", "Tích hợp API tùy chỉnh", "Đào tạo đội ngũ", "Quản lý tài khoản riêng"]', 0);

-- ============================================================
-- 14. chat_session (Lịch sử chat AI)
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_session (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  title            VARCHAR(255) NOT NULL DEFAULT 'Cuộc hội thoại mới',
  description      TEXT         NULL DEFAULT NULL,
  is_pinned        TINYINT(1)   NOT NULL DEFAULT 0,
  last_accessed_at DATETIME     NULL DEFAULT NULL,
  created_at       DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 15. chat_message (Tin nhắn trong từng phiên chat)
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_message (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  session_id  INT          NOT NULL,
  role        ENUM('user', 'assistant', 'system') NOT NULL,
  content     TEXT         NOT NULL,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES chat_session(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 16. system_settings (Cài đặt hệ thống)
-- ============================================================
CREATE TABLE IF NOT EXISTS system_settings (
  `key`       VARCHAR(100) NOT NULL PRIMARY KEY,
  `value`     TEXT         NOT NULL,
  description VARCHAR(255) NOT NULL DEFAULT '',
  `type`      VARCHAR(20)  NOT NULL DEFAULT 'string',
  `group`     VARCHAR(50)  NOT NULL DEFAULT 'general',
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default settings
INSERT IGNORE INTO system_settings (`key`, `value`, `description`, `type`, `group`) VALUES
('SYSTEM_NAME', 'Hệ thống Quản lý Doanh thu', 'Tên hệ thống', 'string', 'general'),
('SYSTEM_LOGO', '', 'URL logo hệ thống', 'string', 'general'),
('SYSTEM_DESCRIPTION', 'Hệ thống quản lý doanh thu, dự báo và phân tích bán hàng', 'Mô tả ngắn hệ thống', 'string', 'general'),
('NOTIFICATION_RETENTION_DAYS', '90', 'Số ngày lưu trữ thông báo', 'number', 'notification'),
('MAX_LOGIN_ATTEMPTS', '5', 'Số lần đăng nhập sai tối đa trước khi khóa', 'number', 'security'),
('SESSION_TIMEOUT_MINUTES', '60', 'Thời gian hết hạn session (phút)', 'number', 'security');