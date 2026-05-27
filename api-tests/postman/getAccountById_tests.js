/**
 * ============================================================================
 * POSTMAN TEST CASES & SCRIPTS - GET /accounts/:id (getAccountById)
 * ============================================================================
 * Đường dẫn API mẫu: {{baseUrl}}/accounts/{{current_test_user_id}}
 * Tab: Tests
 * ============================================================================
 */

// 1. Kiểm tra mã trạng thái phản hồi (Status Code is 200 OK)
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});

// 2. Kiểm tra định dạng dữ liệu trả về là JSON (Content-Type is JSON)
pm.test("Content-Type is application/json", function () {
    pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json");
});

// 3. Kiểm tra tốc độ phản hồi (Response time is under 300ms - Truy vấn theo ID phải cực nhanh)
pm.test("Response time is less than 300ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(300);
});

// 4. Kiểm tra cấu trúc phản hồi chi tiết tài khoản (Response structure check)
pm.test("Response has required IAccount properties", function () {
    const jsonData = pm.response.json();
    
    // Kết quả trả về phải là một Object duy nhất (không phải mảng)
    pm.expect(jsonData).to.be.an("object");
    
    // Kiểm tra sự tồn tại của các trường thông tin cơ bản
    pm.expect(jsonData).to.have.property("account_id");
    pm.expect(jsonData).to.have.property("role");
    pm.expect(jsonData).to.have.property("fullname");
    pm.expect(jsonData).to.have.property("username");
    pm.expect(jsonData).to.have.property("mail");
    pm.expect(jsonData).to.have.property("avatarURL");
    pm.expect(jsonData).to.have.property("created_at");
    pm.expect(jsonData).to.have.property("updated_at");
});

// 5. Kiểm tra tính hợp lệ và kiểu dữ liệu của các trường (Data validation)
pm.test("Account properties have valid data types and values", function () {
    const jsonData = pm.response.json();
    
    // ID phải là định dạng chuỗi UUID
    pm.expect(jsonData.account_id).to.be.a("string");
    pm.expect(jsonData.account_id).to.have.lengthOf(36); // UUID v4 luôn có độ dài 36 ký tự
    
    // Kiểm tra tham số ID yêu cầu khớp với ID trả về trong Response
    const requestedId = pm.environment.get("current_test_user_id") || pm.variables.get("id");
    if (requestedId) {
        pm.expect(jsonData.account_id).to.equal(requestedId);
    }
    
    // Kiểm tra trường Vai trò (role) phải nằm trong danh sách cho phép
    pm.expect(jsonData.role).to.be.a("string");
    pm.expect(["ADMIN", "STAFF"]).to.include(jsonData.role);
    
    // Kiểm tra định dạng Email hợp lệ bằng biểu thức chính quy (Regex)
    pm.expect(jsonData.mail).to.be.a("string");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    pm.expect(emailRegex.test(jsonData.mail)).to.be.true;
    
    // Kiểm tra định dạng thời gian
    pm.expect(jsonData.created_at).to.be.a("string");
    pm.expect(Date.parse(jsonData.created_at)).to.not.be.NaN;
});

// 6. KIỂM TRA BẢO MẬT: Đảm bảo tuyệt đối KHÔNG lộ trường mật khẩu (Security validation)
pm.test("SECURITY CHECK: Response must not leak password_hash or password", function () {
    const jsonData = pm.response.json();
    
    pm.expect(jsonData).to.not.have.property("password");
    pm.expect(jsonData).to.not.have.property("passwordHash");
    pm.expect(jsonData).to.not.have.property("password_hash");
});

// 7. Lưu trữ thông tin username và role của tài khoản đang truy vấn để phục vụ ghi log hoặc test case phân quyền kế tiếp
pm.test("Save account metadata for subsequent tests", function () {
    const jsonData = pm.response.json();
    pm.environment.set("last_queried_username", jsonData.username);
    pm.environment.set("last_queried_role", jsonData.role);
    console.log("Logged verification for: " + jsonData.username + " (" + jsonData.role + ")");
});
