import * as XLSX from 'xlsx';
import type { IAccount } from '@/lib/types/account';

/**
 * Xuất dữ liệu tài khoản ra file Excel với định dạng chuyên nghiệp
 * @param accounts Danh sách tài khoản
 * @param currentUserName Tên người thực hiện xuất báo cáo
 */
export function exportAccountsToExcel(accounts: IAccount[], currentUserName: string) {
  const headers = [
    'STT',
    'Mã tài khoản',
    'Họ và tên',
    'Tên đăng nhập',
    'Địa chỉ Email',
    'Vai trò',
    'Trạng thái',
    'Ngày tạo',
  ];

  const rows = accounts.map((acc, index) => [
    index + 1,
    acc.account_id,
    acc.fullname,
    acc.username,
    acc.mail,
    acc.role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên',
    acc.status_account === 'ACTIVE'
      ? 'Hoạt động'
      : acc.status_account === 'INACTIVE'
        ? 'Tạm ngưng'
        : 'Bị khóa',
    new Date(acc.created_at).toLocaleDateString('vi-VN'),
  ]);

  const title = 'DANH SÁCH TÀI KHOẢN HỆ THỐNG';
  const subtitle = `Thời gian xuất: ${new Date().toLocaleString('vi-VN')} | Người thực hiện: ${currentUserName}`;

  const wsData = [
    [title],
    [subtitle],
    [], // Dòng trống ngăn cách
    headers,
    ...rows,
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Trộn ô cho Tiêu đề & Phụ đề
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, // Trộn ô A1:H1 cho Tiêu đề
    { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }, // Trộn ô A2:H2 cho Thông tin bổ sung
  ];

  // Tự động căn chỉnh chiều rộng cột
  const maxLens = headers.map((header, colIndex) => {
    let maxLen = header.length;
    // Bắt đầu quét từ dòng tiêu đề bảng (dòng index 3) xuống dưới
    for (let r = 3; r < wsData.length; r++) {
      const val = String(wsData[r][colIndex] ?? '');
      if (val.length > maxLen) {
        maxLen = val.length;
      }
    }
    return { wch: maxLen + 3 }; // Thêm khoảng đệm cho đẹp
  });
  ws['!cols'] = maxLens;

  // Bật tính năng AutoFilter cho dòng tiêu đề bảng (dòng A4 đến H4)
  ws['!autofilter'] = { ref: `A4:H${wsData.length}` };

  XLSX.utils.book_append_sheet(wb, ws, 'Danh sách tài khoản');

  // Tải file về thiết bị
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `danh_sach_tai_khoan_${dateStr}.xlsx`);
}
