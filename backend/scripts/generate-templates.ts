import 'dotenv/config';
import * as ExcelJS from 'exceljs';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createConnection } from 'mysql2/promise';

async function main() {
  const outputDir = path.resolve(__dirname, '../../templates');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. Kết nối DB để lấy một số thông tin hiện tại (nếu có)
  const host = process.env.MYSQL_HOST ?? 'localhost';
  const port = Number(process.env.MYSQL_PORT ?? 3306);
  const user = process.env.MYSQL_USER ?? 'root';
  const password = process.env.MYSQL_PASSWORD ?? '';
  const database = process.env.MYSQL_DATABASE ?? 'revenue';

  let existingProductIds: string[] = [];
  try {
    const conn = await createConnection({ host, port, user, password, database });
    const [rows]: any = await conn.query('SELECT product_id FROM product LIMIT 5;');
    existingProductIds = rows.map((r: any) => r.product_id);
    await conn.end();
  } catch (err) {
    console.log('Không kết nối được DB hoặc DB chưa có bảng product, sử dụng product_id mặc định.');
  }

  // Nếu DB trống hoặc không kết nối được, ta tự sinh danh sách sản phẩm mẫu mới hoàn toàn
  const sampleProducts = [
    {
      product_id: 'CLONE-P001',
      color: 'Đen',
      listing_price: 350000,
      cost_price: 150000,
      gender: 'Nam',
      detail_product_group: 'Áo thun',
      size: 39,
      age_group: 'Người lớn',
      activity_group: 'Chạy bộ',
      lifestyle_group: 'Năng động'
    },
    {
      product_id: 'CLONE-P002',
      color: 'Trắng',
      listing_price: 290000,
      cost_price: 120000,
      gender: 'Nữ',
      detail_product_group: 'Quần jean',
      size: 30,
      age_group: 'Người lớn',
      activity_group: 'Mặc hàng ngày',
      lifestyle_group: 'Tối giản'
    },
    {
      product_id: 'CLONE-P003',
      color: 'Xanh dương',
      listing_price: 450000,
      cost_price: 200000,
      gender: 'Unisex',
      detail_product_group: 'Giày thể thao',
      size: 41,
      age_group: 'Trẻ em',
      activity_group: 'Thể thao',
      lifestyle_group: 'Thể thao'
    },
    {
      product_id: 'CLONE-P004',
      color: 'Đỏ',
      listing_price: 500000,
      cost_price: 220000,
      gender: 'Nam',
      detail_product_group: 'Áo khoác',
      size: 42,
      age_group: 'Người lớn',
      activity_group: 'Du lịch',
      lifestyle_group: 'Đường phố'
    },
    {
      product_id: 'CLONE-P005',
      color: 'Xám',
      listing_price: 380000,
      cost_price: 170000,
      gender: 'Nữ',
      detail_product_group: 'Balo',
      size: 28,
      age_group: 'Trẻ em',
      activity_group: 'Đi học',
      lifestyle_group: 'Học đường'
    }
  ];

  const productIdsToUse = existingProductIds.length > 0 
    ? [...existingProductIds, ...sampleProducts.map(p => p.product_id)] 
    : sampleProducts.map(p => p.product_id);

  // ── FILE 1: DANH SÁCH SẢN PHẨM ──
  const wbProd = new ExcelJS.Workbook();
  const wsProd = wbProd.addWorksheet('Products');
  wsProd.columns = [
    { header: 'product_id', key: 'product_id', width: 15 },
    { header: 'color', key: 'color', width: 12 },
    { header: 'listing_price', key: 'listing_price', width: 15 },
    { header: 'cost_price', key: 'cost_price', width: 15 },
    { header: 'gender', key: 'gender', width: 10 },
    { header: 'detail_product_group', key: 'detail_product_group', width: 20 },
    { header: 'size', key: 'size', width: 10 },
    { header: 'age_group', key: 'age_group', width: 15 },
    { header: 'activity_group', key: 'activity_group', width: 18 },
    { header: 'lifestyle_group', key: 'lifestyle_group', width: 18 }
  ];
  sampleProducts.forEach(p => wsProd.addRow(p));
  const fileProd = path.join(outputDir, 'products_template.xlsx');
  await wbProd.xlsx.writeFile(fileProd);
  console.log(`Đã tạo: ${fileProd}`);

  // ── FILE 2: BÁO CÁO DOANH SỐ (SALES) ──
  const wbSales = new ExcelJS.Workbook();
  const wsSales = wbSales.addWorksheet('Sales');
  wsSales.columns = [
    { header: 'product_id', key: 'product_id', width: 15 },
    { header: 'sold_quantity', key: 'sold_quantity', width: 15 },
    { header: 'distribution_channel', key: 'distribution_channel', width: 20 },
    { header: 'branch_id', key: 'branch_id', width: 15 },
    { header: 'month', key: 'month', width: 15 }
  ];

  // Tạo một số dòng dữ liệu mẫu sử dụng các ID sản phẩm
  const sampleSales = [
    { product_id: productIdsToUse[0], sold_quantity: 45, distribution_channel: 'Online', branch_id: 'BR-01', month: '2026-06' },
    { product_id: productIdsToUse[1], sold_quantity: 20, distribution_channel: 'Bán lẻ', branch_id: 'BR-01', month: '2026-06' },
    { product_id: productIdsToUse[2], sold_quantity: 15, distribution_channel: 'Online', branch_id: 'BR-02', month: '2026-06' },
    { product_id: productIdsToUse[3], sold_quantity: 30, distribution_channel: 'Bán sỉ', branch_id: 'BR-03', month: '2026-06' },
    { product_id: productIdsToUse[4], sold_quantity: 25, distribution_channel: 'Siêu thị', branch_id: 'BR-02', month: '2026-06' },
  ];
  sampleSales.forEach(s => wsSales.addRow(s));
  const fileSales = path.join(outputDir, 'sales_template.xlsx');
  await wbSales.xlsx.writeFile(fileSales);
  console.log(`Đã tạo: ${fileSales}`);

  // ── FILE 3: BÁO CÁO TỒN KHO ──
  const wbInv = new ExcelJS.Workbook();
  const wsInv = wbInv.addWorksheet('Inventory');
  wsInv.columns = [
    { header: 'calendar_year_week', key: 'calendar_year_week', width: 20 },
    { header: 'product_id', key: 'product_id', width: 15 },
    { header: 'plant', key: 'plant', width: 15 },
    { header: 'quantity', key: 'quantity', width: 15 }
  ];

  const sampleInventory = [
    { calendar_year_week: '2026-06-07', product_id: productIdsToUse[0], plant: 'PLANT-A', quantity: 150 },
    { calendar_year_week: '2026-06-07', product_id: productIdsToUse[1], plant: 'PLANT-A', quantity: 80 },
    { calendar_year_week: '2026-06-07', product_id: productIdsToUse[2], plant: 'PLANT-B', quantity: 120 },
    { calendar_year_week: '2026-06-07', product_id: productIdsToUse[3], plant: 'PLANT-B', quantity: 95 },
    { calendar_year_week: '2026-06-07', product_id: productIdsToUse[4], plant: 'PLANT-A', quantity: 200 },
  ];
  sampleInventory.forEach(i => wsInv.addRow(i));
  const fileInv = path.join(outputDir, 'inventory_template.xlsx');
  await wbInv.xlsx.writeFile(fileInv);
  console.log(`Đã tạo: ${fileInv}`);
}

main().catch(console.error);
