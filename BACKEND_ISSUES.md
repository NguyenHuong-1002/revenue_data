# Backend Issues Tracking

> Cập nhật: 2026-06-19
> Tổng số lỗi: 11
> Đã fix: 5

---

## 🔴 CRITICAL (Gây lỗi build/runtime)

### 1. ✅ FIXED - StoreBranchEntity thiếu cột `address`

| Thuộc tính | Chi tiết |
|-----------|----------|
| **File** | `src/modules/branches/branch.entity.ts` |
| **Mô tả** | Entity thiếu cột `address` nhưng `IBranch` interface yêu cầu |
| **Impact** | 6 lỗi TypeScript, không build được |
| **Fix** | Đã xóa `address` khỏi interface, DTO, và service |
| **Ngày fix** | 2026-06-19 |

---

### 2. ✅ FIXED - ChatModule thiếu import `DatabaseModule`

| Thuộc tính | Chi tiết |
|-----------|----------|
| **File** | `src/modules/chat/chat.module.ts` |
| **Mô tả** | `ChatService` inject `DatabaseService` nhưng module không import `DatabaseModule` |
| **Impact** | Có thể gây runtime error |
| **Fix** | Đã thêm `DatabaseModule` vào imports của `ChatModule` |
| **Ngày fix** | 2026-06-19 |

---

## 🟠 HIGH (Lỗ hổng bảo mật/thiết kế)

### 3. ✅ FIXED - verifyPassword fallback plain-text comparison

| Thuộc tính | Chi tiết |
|-----------|----------|
| **File** | `src/modules/accounts/account.service.ts:436` |
| **Mô tả** | Khi hash format không hợp lệ, so sánh plain text → lỗ hổng bảo mật |
| **Impact** | Bảo mật kém, attacker có thể bypass password hash |
| **Fix** | Đã throw lỗi khi hash format sai, không fallback |
| **Ngày fix** | 2026-06-19 |

---

### 4. ✅ FIXED - Thiếu `@Roles('ADMIN')` trên DataImport và Chat

| Thuộc tính | Chi tiết |
|-----------|----------|
| **File** | `src/modules/data-import/data-import.controller.ts`, `src/modules/chat/chat.controller.ts` |
| **Mô tả** | Bất kỳ user authenticated đều có quyền import data/chat |
| **Impact** | Staff có thể import data không đúng quyền hạn |
| **Fix** | Đã thêm `@authGuard.Roles('ADMIN')` cho tất cả POST endpoints |
| **Ngày fix** | 2026-06-19 |

---

### 5. Landing POST/PUT/DELETE không có role restriction

| Thuộc tính | Chi tiết |
|-----------|----------|
| **File** | `src/modules/landing/features/feature.controller.ts`, `pricing.controller.ts`, `testimonial.controller.ts`, `ai-insight.controller.ts` |
| **Mô tả** | GET có `@Public()` nhưng POST/PUT/DELETE không có `@Roles` |
| **Impact** | Bất kỳ user authenticated đều có thể tạo/sửa/xóa landing content |
| **Fix** | Thêm `@authGuard.Roles('ADMIN')` cho POST/PUT/DELETE |

---

### 6. RegisterUserDto confirmPassword không validate khớp password

| Thuộc tính | Chi tiết |
|-----------|----------|
| **File** | `src/modules/accounts/dto/register-user.dto.ts` |
| **Mô tả** | `@Matches` chỉ validate format, không validate khớp với `password` |
| **Impact** | User có thể nhập confirmPassword khác password |
| **Fix** | Tạo custom validator `@Match('password')` hoặc validate trong service |

---

## 🟡 MEDIUM (Không nhất quán/duplicated code)

### 7. CreateBranchDto có `latitude`/`longitude` nhưng entity không có

| Thuộc tính | Chi tiết |
|-----------|----------|
| **File** | `src/modules/branches/dto/create-branch.dto.ts` |
| **Mô tả** | DTO khai báo `latitude?: number` và `longitude?: number` nhưng entity không có |
| **Impact** | Data sẽ bị bỏ qua, không lưu vào DB |
| **Fix** | Xóa 2 field này hoặc thêm vào entity |

---

### 8. ProductEntity dùng `string` cho created_at/updated_at

| Thuộc tính | Chi tiết |
|-----------|----------|
| **File** | `src/modules/products/entities/product.entity.ts` |
| **Mô tả** | `created_at!: string` và `updated_at!: string` thay vì `Date` |
| **Impact** | Không gây lỗi nhưng không nhất quán kiểu dữ liệu |
| **Fix** | Đổi sang `Date` type như các entity khác |

---

### 9. Unused imports

| File | Import thừa |
|------|-------------|
| `src/modules/plants/plant.service.ts` | `FindOptionsWhere` từ `typeorm` |
| `src/modules/chat/chat.service.ts` | `Not` từ `typeorm` |
| `src/modules/accounts/dto/register-user.dto.ts` | `IsIn` từ `class-validator` |

**Fix:** Xóa các import không sử dụng

---

## 🟢 LOW (Best practices)

### 10. GET endpoints yêu cầu auth không cần thiết

| Thuộc tính | Chi tiết |
|-----------|----------|
| **File** | `src/modules/products/product.controller.ts` |
| **Mô tả** | GET all products yêu cầu auth nhưng là public data |
| **Impact** | User phải login mới xem được products |
| **Fix** | Thêm `@authGuard.Public()` cho GET endpoints |

---

### 11. AI API calls không có timeout/rate limiting

| Thuộc tính | Chi tiết |
|-----------|----------|
| **File** | `src/modules/chat/chat.service.ts` |
| **Mô tả** | Fetch AI API không có timeout config |
| **Impact** | Có thể bị treo nếu API chậm |
| **Fix** | Thêm timeout và abort controller |

---

## Đánh Giá Tổng Quan

| Tiêu chí | Điểm | Ghi chú |
|----------|------|---------|
| **Code Structure** | 8/10 | Modular hóa tốt, tách rõ controller/service/module/DTO |
| **Type Safety** | 5/10 | 6 lỗi TypeScript build, entity/interface mismatch |
| **Security** | 6/10 | Auth guard tốt nhưng thiếu roles ở một số endpoint |
| **Validation** | 7/10 | DTO validation tốt nhưng thiếu ở confirmPassword |
| **Error Handling** | 8/10 | Exception filter toàn cục, lỗi được throw đúng loại |
| **Tổng** | **6.6/10** | Cần fix critical issues và cải thiện security |

---

## Fix Priority

1. **CRITICAL** - Fix ngay: ~~#1 (branch entity)~~ ✅, ~~#2 (chat module)~~ ✅
2. **HIGH** - Fix sớm: ~~#3 (password)~~ ✅, ~~#4 (roles)~~ ✅, #5 (landing roles), #6 (validation)
3. **MEDIUM** - Fix khi có thời gian: #7-#9
4. **LOW** - Cải thiện dần: #10-#11
