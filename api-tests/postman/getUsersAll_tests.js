/**
 * ============================================================================
 * POSTMAN TEST CASES & SCRIPTS - GET /accounts (getUsersAll)
 * ============================================================================
 * Đường dẫn API mẫu: {{baseUrl}}/accounts?page=1&limit=10
 * Tab: Tests
 * ============================================================================
 */

// 1. Kiểm tra mã trạng thái phản hồi (Status Code is 200)
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});

// 2. Kiểm tra định dạng dữ liệu trả về là JSON (Content-Type is JSON)
pm.test("Content-Type is application/json", function () {
    pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json");
});

// 3. Kiểm tra thời gian phản hồi (Response time is less than 500ms)
pm.test("Response time is less than 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});

// 4. Kiểm tra cấu trúc phân trang tổng quát (Response structure check)
pm.test("Response has required 'data' and 'meta' properties", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an("object");
    pm.expect(jsonData).to.have.property("data");
    pm.expect(jsonData).to.have.property("meta");
    pm.expect(jsonData.data).to.be.an("array");
    pm.expect(jsonData.meta).to.be.an("object");
});

// 5. Kiểm tra tính toàn vẹn của siêu dữ liệu phân trang (Meta properties validation)
pm.test("Metadata has valid pagination properties", function () {
    const jsonData = pm.response.json();
    const meta = jsonData.meta;
    
    pm.expect(meta).to.have.property("page");
    pm.expect(meta).to.have.property("limit");
    pm.expect(meta).to.have.property("total");
    pm.expect(meta).to.have.property("totalPages");
    
    pm.expect(meta.page).to.be.a("number");
    pm.expect(meta.limit).to.be.a("number");
    pm.expect(meta.total).to.be.a("number");
    pm.expect(meta.totalPages).to.be.a("number");
});

// 6. Kiểm tra cấu trúc và tính hợp lệ của từng tài khoản trong danh sách (Data items check)
pm.test("User items in list have valid structures and types", function () {
    const jsonData = pm.response.json();
    
    // Nếu danh sách rỗng, bỏ qua kiểm tra chi tiết
    if (jsonData.data.length === 0) {
        pm.expect(true).to.be.true; // Thừa nhận pass
        return;
    }
    
    jsonData.data.forEach(function (user, index) {
        // Kiểm tra tồn tại các thuộc tính bắt buộc
        pm.expect(user).to.have.property("account_id");
        pm.expect(user).to.have.property("role");
        pm.expect(user).to.have.property("fullname");
        pm.expect(user).to.have.property("username");
        pm.expect(user).to.have.property("mail");
        pm.expect(user).to.have.property("created_at");
        pm.expect(user).to.have.property("updated_at");
        
        // Kiểm tra kiểu dữ liệu
        pm.expect(user.account_id).to.be.a("string");
        pm.expect(user.fullname).to.be.a("string");
        pm.expect(user.username).to.be.a("string");
        pm.expect(user.mail).to.be.a("string");
        
        // Kiểm tra giá trị của vai trò (Role enum check)
        pm.expect(user.role).to.be.oneOf(["ADMIN", "STAFF"]);
        
        // Kiểm tra định dạng Email hợp lệ
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        pm.expect(emailRegex.test(user.mail)).to.be.true;
    });
});

// 7. KIỂM TRA BẢO MẬT: Đảm bảo KHÔNG TRẢ VỀ mật khẩu băm (Security: No password hash leaked)
pm.test("SECURITY CHECK: Response must not leak password_hash or password", function () {
    const jsonData = pm.response.json();
    
    jsonData.data.forEach(function (user, index) {
        pm.expect(user).to.not.have.property("password");
        pm.expect(user).to.not.have.property("passwordHash");
        pm.expect(user).to.not.have.property("password_hash");
    });
});

// 8. Lưu tài khoản đầu tiên vào biến môi trường để sử dụng cho các API GetDetail/Update/Delete kế tiếp
pm.test("Save first user ID to environment variables", function () {
    const jsonData = pm.response.json();
    if (jsonData.data.length > 0) {
        const firstUserId = jsonData.data[0].account_id;
        pm.environment.set("current_test_user_id", firstUserId);
        console.log("Saved current_test_user_id: " + firstUserId);
    }
});
