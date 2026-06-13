# CMS Roadmap — Hệ thống Revenue + CMS

> Chuyển đổi từ Dashboard Revenue sang CMS tổng thể
> Giữ nguyên toàn bộ tính năng Revenue hiện tại

---

## Mục lục

- [Tổng quan](#tổng-quan)
- [Phase 0 — Nền tảng](#phase-0--nền-tảng)
- [Phase 1 — Media Library](#phase-1--media-library)
- [Phase 2 — Danh mục & Thẻ](#phase-2--danh-mục--thẻ)
- [Phase 3 — Bài viết (Article)](#phase-3--bài-viết-article)
- [Phase 4 — Menu Builder](#phase-4--menu-builder)
- [Phase 5 — Trang tĩnh & Render](#phase-5--trang-tĩnh--render)
- [Phase 6 — SEO & Audit](#phase-6--seo--audit)
- [Sơ đồ dependency](#sơ-đồ-dependency)
- [Thời gian ước tính](#thời-gian-ước-tính)

---

## Tổng quan

Kiến trúc CMS tuân theo pattern hiện tại của dự án:
- **Backend**: NestJS + TypeORM entities + class-validator DTOs + Swagger
- **Frontend**: Next.js App Router + shadcn/ui + react-hook-form + Zod

Mỗi CMS module sẽ gồm:
```
backend/src/modules/cms/{module}/
├── {module}.controller.ts
├── {module}.service.ts
├── {module}.module.ts
├── {module}.swagger.ts
├── DTO/
│   ├── create-{module}.dto.ts
│   ├── update-{module}.dto.ts
│   └── query-{module}.dto.ts
└── interfaces/
    └── {module}.interface.ts
```

```
frontend/src/app/dashboard/cms/{module}/
├── page.tsx
└── components/
    └── ...
```

---

## Phase 0 — Nền tảng

**Thời gian:** 1-2 ngày
**Mục tiêu:** Chuẩn bị hạ tầng cho toàn bộ CMS

### Backend

| Task | File | Chi tiết |
|------|------|----------|
| Cài đặt packages | `backend/package.json` | Thêm `slugify`, `@nestjs/serve-static` |
| Mở rộng role system | `middlewares/auth.guard.ts` | Thêm `CMS_EDITOR`, `CMS_AUTHOR`, `PUBLISHER` vào JwtPayload |
| Module-based permission | `middlewares/permission.guard.ts` | Guard kiểm tra quyền theo module (`can:create_article`, `can:manage_media`) |
| Upload helper chung | `common/upload.helper.ts` | Multer config dùng chung: disk storage, file filter, size limit, tạo thư mục `public/uploads/media/` |
| CMS root module | `modules/cms/cms.module.ts` | Module tổng import các sub-module (giống pattern `landing/`) |

### Frontend

| Task | File | Chi tiết |
|------|------|----------|
| Cài đặt packages | `frontend/package.json` | `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link` |
| Cập nhật sidebar | `components/app-sidebar.tsx` | Thêm group "CMS" với: Media, Bài viết, Danh mục, Menu, Trang |
| Cập nhật breadcrumb | `components/dynamic-breadcrumb.tsx` | Thêm path map cho CMS routes |

---

## Phase 1 — Media Library

**Thời gian:** 2-3 ngày
**Mục tiêu:** Upload, quản lý, và chọn ảnh — module khác đều cần

### Entity: `media`

| Column | Type | Ghi chú |
|--------|------|---------|
| `id` | UUID | Primary key |
| `filename` | VARCHAR(255) | Tên file đã lưu (unique) |
| `original_name` | VARCHAR(255) | Tên gốc khi upload |
| `mime_type` | VARCHAR(50) | `image/jpeg`, `image/png`, etc. |
| `size` | INT | Kích thước bytes |
| `width` | INT | Chiều rộng (ảnh) |
| `height` | INT | Chiều cao (ảnh) |
| `alt` | VARCHAR(255) | Alt text |
| `folder_id` | UUID (nullable) | Self-ref → folder tree |
| `url` | VARCHAR(500) | Đường dẫn truy cập |
| `created_at` | DATETIME | |
| `updated_at` | DATETIME | |

### Backend

| Endpoint | Method | Chức năng |
|----------|--------|-----------|
| `/cms/media` | GET | Danh sách + phân trang + filter (type, folder, search) |
| `/cms/media/upload` | POST | Upload file (multipart) → Sharp resize + gen thumbnail |
| `/cms/media/:id` | PATCH | Cập nhật alt, folder |
| `/cms/media/:id` | DELETE | Xoá file + DB record |

Service logic:
- Sharp tạo 2 version: **original** (giữ nguyên) + **thumbnail** (150x150, WebP quality 70)
- Lưu vào `public/uploads/media/{YYYY/MM}/`

### Frontend

| Page/Component | Route | Chức năng |
|----------------|-------|-----------|
| MediaPage | `/dashboard/cms/media` | Grid gallery, upload button, drag-drop zone, search, filter |
| MediaPicker | Component (Dialog) | Popup chọn ảnh — dùng trong Article, Page form |
| FolderTree | Component | Cây thư mục bên trái, kéo thả ảnh vào folder |

---

## Phase 2 — Danh mục & Thẻ

**Thời gian:** 1-2 ngày
**Mục tiêu:** Phân loại nội dung (dùng cho Article)

### Entities

#### `category`

| Column | Type | Ghi chú |
|--------|------|---------|
| `id` | UUID | Primary key |
| `name` | VARCHAR(100) | Tên danh mục |
| `slug` | VARCHAR(150) | Unique, auto từ name |
| `description` | TEXT | Nullable |
| `parent_id` | UUID (nullable) | Self-ref → cây phân cấp |
| `sort_order` | INT | Thứ tự sắp xếp |
| `created_at` | DATETIME | |
| `updated_at` | DATETIME | |

#### `tag`

| Column | Type | Ghi chú |
|--------|------|---------|
| `id` | UUID | Primary key |
| `name` | VARCHAR(100) | |
| `slug` | VARCHAR(150) | Unique |
| `created_at` | DATETIME | |

### Backend

| Endpoint | Chức năng |
|----------|-----------|
| `GET /cms/categories` | Danh sách (dạng tree) |
| `POST /cms/categories` | Tạo (name → auto slug) |
| `PATCH /cms/categories/:id` | Sửa |
| `DELETE /cms/categories/:id` | Xoá (kiểm tra con) |
| `GET /cms/tags` | Danh sách |
| `POST /cms/tags` | Tạo |
| `DELETE /cms/tags/:id` | Xoá |

### Frontend

| Page/Component | Route | Chức năng |
|----------------|-------|-----------|
| CategoryPage | `/dashboard/cms/categories` | Tree view, kéo thả sắp xếp, inline edit |
| TagPage | `/dashboard/cms/tags` | Simple list, bulk delete |
| CategorySelect | Component | Nested dropdown dùng trong Article form |
| TagInput | Component | Multi-tag input dùng trong Article form |

---

## Phase 3 — Bài viết (Article)

**Thời gian:** 3-4 ngày
**Mục tiêu:** CMS core — rich text editor, publish workflow

### Entity: `article`

| Column | Type | Ghi chú |
|--------|------|---------|
| `id` | UUID | Primary key |
| `title` | VARCHAR(255) | |
| `slug` | VARCHAR(255) | Unique, auto từ title (dùng slugify) |
| `content` | LONGTEXT | HTML từ TipTap editor |
| `excerpt` | TEXT | Tóm tắt ngắn |
| `featured_image_id` | UUID (nullable) | FK → media |
| `category_id` | UUID (nullable) | FK → category |
| `author_id` | VARCHAR(50) | FK → account |
| `status` | ENUM('draft','published','archived') | |
| `published_at` | DATETIME (nullable) | |
| `seo_title` | VARCHAR(255) (nullable) | |
| `seo_description` | TEXT (nullable) | |
| `created_at` | DATETIME | |
| `updated_at` | DATETIME | |

### Entity: `article_tag` (junction table)

| Column | Type |
|--------|------|
| `article_id` | UUID (FK → article, CASCADE) |
| `tag_id` | UUID (FK → tag, CASCADE) |
| Primary key | (article_id, tag_id) |

### Backend

| Endpoint | Method | Chức năng |
|----------|--------|-----------|
| `/cms/articles` | GET | Danh sách + filter (status, category, tag, q, author) |
| `/cms/articles` | POST | Tạo bài viết (auto slug) |
| `/cms/articles/:id` | GET | Chi tiết |
| `/cms/articles/:id` | PATCH | Sửa |
| `/cms/articles/:id` | DELETE | Xoá |
| `/cms/articles/:id/publish` | PATCH | Chuyển status → published + set published_at |
| `/cms/articles/:id/archive` | PATCH | Chuyển status → archived |

### Frontend

| Page/Component | Route | Chức năng |
|----------------|-------|-----------|
| ArticleListPage | `/dashboard/cms/articles` | Table: title, status badge, author, category, published_at — filter + search + sort |
| ArticleFormPage | `/dashboard/cms/articles/new` | Form đầy đủ |
| ArticleFormPage | `/dashboard/cms/articles/:id/edit` | Form edit (load data từ API) |

**ArticleFormPage bao gồm:**
- Tiêu đề input → auto sinh slug (có thể sửa tay)
- Featured image picker (dùng MediaPicker)
- Category select (dùng CategorySelect)
- Tag input (dùng TagInput)
- **Rich text editor (TipTap):** bold, italic, heading H2/H3, bullet list, ordered list, link, image từ MediaPicker
- Excerpt textarea (hiển thị trong danh sách hoặc meta)
- SEO Panel: meta title, meta description (có preview Google-style)
- Status selector: Draft / Publish
- Nút Preview → mở tab mới render bài viết

---

## Phase 4 — Menu Builder

**Thời gian:** 2-3 ngày
**Mục tiêu:** Quản lý navigation menus (header, footer)

### Entities

#### `menu`

| Column | Type | Ghi chú |
|--------|------|---------|
| `id` | UUID | Primary key |
| `name` | VARCHAR(100) | Tên menu (VD: "Header chính") |
| `location` | VARCHAR(50) | `header`, `footer`, `sidebar` |
| `created_at` | DATETIME | |

#### `menu_item`

| Column | Type | Ghi chú |
|--------|------|---------|
| `id` | UUID | Primary key |
| `menu_id` | UUID | FK → menu (CASCADE) |
| `label` | VARCHAR(100) | Text hiển thị |
| `url` | VARCHAR(500) | Custom URL (nếu là link ngoài) |
| `article_id` | UUID (nullable) | FK → article (nếu link đến bài viết) |
| `page_id` | UUID (nullable) | FK → page (nếu link đến trang) |
| `parent_id` | UUID (nullable) | Self-ref → menu đa cấp |
| `sort_order` | INT | |
| `created_at` | DATETIME | |

### Backend

| Endpoint | Chức năng |
|----------|-----------|
| `GET /cms/menus` | Danh sách menu |
| `POST /cms/menus` | Tạo menu mới |
| `PATCH /cms/menus/:id` | Sửa menu |
| `DELETE /cms/menus/:id` | Xoá menu (cascade items) |
| `GET /cms/menus/:id/items` | Danh sách item (dạng tree) |
| `POST /cms/menus/:id/items` | Thêm item |
| `PATCH /cms/menu-items/:id` | Sửa item |
| `DELETE /cms/menu-items/:id` | Xoá item |
| `PATCH /cms/menus/:id/reorder` | Cập nhật sort_order hàng loạt |
| `GET /cms/menus/public/:location` | Public endpoint — trả về menu đã render sẵn |

### Frontend

| Page/Component | Route | Chức năng |
|----------------|-------|-----------|
| MenuPage | `/dashboard/cms/menus` | Chọn menu → hiển thị tree drag-drop |
| AddMenuItemDialog | Component | Type: custom URL / article / page + nhập label |
| MenuTree | Component | Drag-drop sắp xếp, nesting, inline edit label |

---

## Phase 5 — Trang tĩnh & Render

**Thời gian:** 2-3 ngày
**Mục tiêu:** Tạo trang tĩnh + render ra public site

### Entity: `page`

| Column | Type | Ghi chú |
|--------|------|---------|
| `id` | UUID | Primary key |
| `title` | VARCHAR(255) | |
| `slug` | VARCHAR(255) | Unique |
| `content` | LONGTEXT | HTML |
| `status` | ENUM('draft','published') | |
| `meta_title` | VARCHAR(255) (nullable) | |
| `meta_description` | TEXT (nullable) | |
| `created_at` | DATETIME | |
| `updated_at` | DATETIME | |

### Backend

| Endpoint | Method | Chức năng |
|----------|--------|-----------|
| `/cms/pages` | GET | Danh sách |
| `/cms/pages` | POST | Tạo trang |
| `/cms/pages/:id` | GET | Chi tiết |
| `/cms/pages/:id` | PATCH | Sửa |
| `/cms/pages/:id` | DELETE | Xoá |
| `/cms/pages/:slug/public` | GET | **Public** — không cần auth, trả nội dung trang |

### Frontend

| Page/Component | Route | Chức năng |
|----------------|-------|-----------|
| PageListPage | `/dashboard/cms/pages` | Table listing |
| PageFormPage | `/dashboard/cms/pages/new` | Form (tương tự Article nhưng không category/tag) |
| PageFormPage | `/dashboard/cms/pages/:id/edit` | Form edit |
| CMSRender | `/[slug]` (public) | Server component: gọi API `/cms/pages/:slug/public` → render HTML |
| PagePicker | Component | Chọn page khi tạo menu item |

---

## Phase 6 — SEO & Audit

**Thời gian:** 1-2 ngày
**Mục tiêu:** SEO + theo dõi thay đổi

### Backend

| Task | Chi tiết |
|------|----------|
| **Sitemap** | `GET /sitemap.xml` — tự động collect articles (published) + pages (published) |
| **Entity `audit_log`** | `id` (uuid), `user_id`, `action` (CREATE/UPDATE/DELETE), `entity_type` (article/page/...), `entity_id`, `old_data` (JSON), `new_data` (JSON), `ip`, `created_at` |
| **Audit interceptor** | Global interceptor hoặc decorator — tự động ghi log khi tạo/sửa/xoá CMS entities |

### Frontend

| Page/Component | Chức năng |
|----------------|-----------|
| **SEO Preview** | Panel trong Article/Page form — hiển thị Google preview (title + URL + description) |
| **AuditLogPage** | Tra cứu lịch sử thay đổi theo entity type, user, thời gian |

---

## Sơ đồ dependency

```
Phase 0 (Foundation)
    │
    ├──→ Phase 1 (Media Library) ←─── cần cho Article featured_image
    │         │
    │         └──→ Phase 3 (Article) ←─── cần Category (Phase 2)
    │                      │
    │                      ├──→ Phase 4 (Menu) ─── có thể link Article
    │                      │
    │                      └──→ Phase 5 (Page)
    │                                  │
    │                                  └──→ Phase 6 (SEO & Audit)
    │
    └──→ Phase 2 (Category & Tag)
```

- Phase 0 → Phase 1 + Phase 2 **(có thể làm song song)**
- Phase 3 ← cần Phase 1 + Phase 2
- Phase 4 ← có thể làm sau Phase 3
- Phase 5 ← có thể làm sau Phase 3
- Phase 6 ← cần Phase 3 + Phase 5

---

## Thời gian ước tính

| Phase | Thời gian | Files mới (ước lượng) |
|-------|:---------:|:---------------------:|
| 0 — Foundation | 1-2 ngày | ~8 files |
| 1 — Media Library | 2-3 ngày | ~12 files |
| 2 — Category & Tag | 1-2 ngày | ~10 files |
| 3 — Article | 3-4 ngày | ~16 files |
| 4 — Menu Builder | 2-3 ngày | ~10 files |
| 5 — Page + Render | 2-3 ngày | ~10 files |
| 6 — SEO & Audit | 1-2 ngày | ~8 files |
| **Tổng** | **~12-18 ngày** | **~74 files** |

---

## Ghi chú

- Tất cả entity dùng **UUID** làm primary key (nhất quán với codebase hiện tại)
- Pattern module theo `landing/` — sub-module trong `cms/` root module
- Rich text editor: **TipTap** (React + ProseMirror, headless, dễ custom, tương thích shadcn/ui)
- Slug tự động từ title dùng `slugify` package
- Media upload tận dụng `sharp` đã có sẵn
- Permission có thể triển khai đơn giản (role-based) hoặc nâng cao (module-based) tuỳ nhu cầu

---

*Cập nhật lần cuối: 12/06/2026*
