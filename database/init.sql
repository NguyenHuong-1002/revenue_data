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
-- 3. customer
-- ============================================================
CREATE TABLE IF NOT EXISTS customer (
  customer_id VARCHAR(50) NOT NULL PRIMARY KEY,
  phone       VARCHAR(50) NOT NULL,
  created_at  DATETIME    DEFAULT CURRENT_TIMESTAMP
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
  size                 VARCHAR(20)  NOT NULL, 
  age_group            ENUM('24 đến <40 tuổi', '40 đến <60 tuổi', '0 đến <3 tuổi', 'Trên 60 tuổi', '6 đến <10 tuổi', '3 đến <6 tuổi', '10 đến <16 tuổi', 'Khác') NOT NULL,
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
  role         ENUM('ADMIN', 'STAFF') NOT NULL DEFAULT 'STAFF',
  fullname     VARCHAR(255)  NOT NULL,
  username     VARCHAR(255)  NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  mail         VARCHAR(255)  NOT NULL,
  avatarURL    VARCHAR(255) NULL,
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
  customer_id         VARCHAR(50)  NOT NULL,
  sold_quantity       INT          NOT NULL DEFAULT 0,
  distribution_channel ENUM('Online', 'Bán lẻ', 'Phát sinh', 'Bán sỉ', 'Siêu thị', 'Hợp đồng') NOT NULL,
  branch_id           VARCHAR(50)  NOT NULL,
  time_report         DATETIME     NOT NULL,
  created_at          DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sr_product  (product_id),
  INDEX idx_sr_customer (customer_id),
  INDEX idx_sr_branch   (branch_id),
  INDEX idx_sr_time     (product_id, time_report),
  CONSTRAINT fk_sr_product  FOREIGN KEY (product_id)  REFERENCES product(product_id),
  CONSTRAINT fk_sr_customer FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
  CONSTRAINT fk_sr_branch   FOREIGN KEY (branch_id)   REFERENCES storeBranch(store_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. notification
-- ============================================================
CREATE TABLE IF NOT EXISTS notification (
  notification_id VARCHAR(50)  NOT NULL PRIMARY KEY,
  account_id      VARCHAR(50)  NULL, -- NULL nghĩa là thông báo chung toàn hệ thống
  title           VARCHAR(255) NOT NULL,
  content         TEXT         NOT NULL,
  type            ENUM('SYSTEM', 'INVENTORY_ALERT', 'NEW_SALE', 'CUSTOMER_NEW', 'OTHER') NOT NULL DEFAULT 'SYSTEM',
  read_at         DATETIME     NULL DEFAULT NULL, -- NULL là chưa đọc
  created_at      DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_noti_account (account_id),
  INDEX idx_noti_read (read_at),
  CONSTRAINT fk_noti_account FOREIGN KEY (account_id) REFERENCES account(account_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
