// Mock data generator for demo/offline mode.
import type { ModuleId, ParkingTicket, RowData, User } from './types';
import { genId, genMaVe } from './format';

export const ALL_MODULES: ModuleId[] = [
  '1_Dashboard', '2_ViecCanXuLy',
  '3_DanhMuc', '4_NhanSu',
  '5_SuKien', '6_KhachMoi', '7_ThuMoi', '8_CongViec', '9_TiepNhan',
  '10_VatTu', '11_XuatDungVatTu', '12_MuonTraDungCu', '13_LanTraDungCu',
  '14_TaiSan', '15_BaoHanhTaiSan', '16_BaoDuongTaiSan',
  '17_PhuongTien', '18_ChuyenDi', '19_LuotGiuXe',
  '20_Quy', '21_GiaoDichTaiChinh',
  '22_TaiLieuUpload', '23_QuanLyEmailNhacViec', '24_LichSuEmail', '25_NhatKyThaoTac',
  '26_NguoiDung',
];

export const DEMO_USERS: User[] = [
  {
    id: 'u-admin', TaiKhoan: 'admin', MatKhau: 'admin123', HoTen: 'Quản trị hệ thống',
    VaiTro: 'Admin', QuyenModule: ALL_MODULES, KichHoat: true,
    Email: 'admin@erp.local', DienThoai: '0900000001', NgayTao: '2025-01-01',
  },
  {
    id: 'u-baove', TaiKhoan: 'baove01', MatKhau: '123456', HoTen: 'Anh Tú - Bảo vệ',
    VaiTro: 'BaoVe', QuyenModule: ['1_Dashboard', '19_LuotGiuXe'], KichHoat: true,
    Email: 'baove01@erp.local', DienThoai: '0900000002', NgayTao: '2025-02-01',
  },
];

const BIEN_SO = ['59A1-123.45', '59P1-678.90', '60C-999.99', '74H-2025', '59A-888.88', '50F-555.55'];
const LOAI = ['Xe máy', 'Ô tô', 'Xe đạp điện'] as const;

export function genParkingTickets(n = 12): ParkingTicket[] {
  const now = Date.now();
  const tickets: ParkingTicket[] = [];
  const guards = ['Anh Tú', 'Anh Nam', 'Chị Lan'];
  for (let i = 0; i < n; i++) {
    const inTime = new Date(now - (i + 1) * 47 * 60000).toISOString();
    const isOut = i % 4 === 0;
    tickets.push({
      id: genId('pk_'),
      BienSo: BIEN_SO[i % BIEN_SO.length],
      LoaiXe: LOAI[i % LOAI.length],
      MaVe: genMaVe(),
      ThoiGianVao: inTime,
      ThoiGianRa: isOut ? new Date(new Date(inTime).getTime() + 90 * 60000).toISOString() : undefined,
      TrangThai: isOut ? 'Đã lấy xe' : 'Đang gửi',
      NguoiTrucVao: guards[i % guards.length],
      NguoiTrucRa: isOut ? 'Anh Nam' : undefined,
      GhiChu: '',
    });
  }
  return tickets;
}

// Field schemas per module — drives generic CRUD UI.
export interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'datetime' | 'select' | 'textarea' | 'tel' | 'email' | 'boolean';
  options?: string[];
  required?: boolean;
  money?: boolean;
}

export const MODULE_FIELDS: Record<string, FieldDef[]> = {
  '3_DanhMuc': [
    { key: 'TenDanhMuc', label: 'Tên danh mục', type: 'text', required: true },
    { key: 'LoaiDanhMuc', label: 'Loại', type: 'select', options: ['Kho', 'Chức vụ', 'Trạng thái', 'Nhóm vật tư'], required: true },
    { key: 'MoTa', label: 'Mô tả', type: 'textarea' },
  ],
  '4_NhanSu': [
    { key: 'HoTen', label: 'Họ và tên', type: 'text', required: true },
    { key: 'ChucVu', label: 'Chức vụ', type: 'text' },
    { key: 'DienThoai', label: 'Điện thoại', type: 'tel' },
    { key: 'Email', label: 'Email', type: 'email' },
    { key: 'NgayBatDau', label: 'Ngày bắt đầu', type: 'date' },
    { key: 'HanHopDong', label: 'Hạn hợp đồng', type: 'date' },
    { key: 'TrangThai', label: 'Trạng thái', type: 'select', options: ['Đang làm', 'Nghỉ việc', 'Thử việc'] },
  ],
  '5_SuKien': [
    { key: 'TenSuKien', label: 'Tên sự kiện', type: 'text', required: true },
    { key: 'NgayToChuc', label: 'Ngày tổ chức', type: 'datetime', required: true },
    { key: 'DiaDiem', label: 'Địa điểm', type: 'text' },
    { key: 'SoNguoiDuKien', label: 'Số người dự kiến', type: 'number' },
    { key: 'TrangThai', label: 'Trạng thái', type: 'select', options: ['Lên kế hoạch', 'Đã xác nhận', 'Đã diễn ra', 'Đã hủy'] },
    { key: 'GhiChu', label: 'Ghi chú', type: 'textarea' },
  ],
  '6_KhachMoi': [
    { key: 'HoTen', label: 'Họ và tên', type: 'text', required: true },
    { key: 'DienThoai', label: 'Điện thoại', type: 'tel' },
    { key: 'Email', label: 'Email', type: 'email' },
    { key: 'PhanLoai', label: 'Phân loại', type: 'select', options: ['VIP', 'Thường'] },
    { key: 'DonVi', label: 'Đơn vị', type: 'text' },
    { key: 'MaQR', label: 'Mã QR', type: 'text' },
    { key: 'DaCheckIn', label: 'Đã check-in', type: 'boolean' },
  ],
  '7_ThuMoi': [
    { key: 'TieuDe', label: 'Tiêu đề', type: 'text', required: true },
    { key: 'NoiDung', label: 'Nội dung', type: 'textarea', required: true },
    { key: 'NgayGui', label: 'Ngày gửi dự kiến', type: 'datetime' },
    { key: 'SoNguoi', label: 'Số người nhận', type: 'number' },
    { key: 'TrangThai', label: 'Trạng thái', type: 'select', options: ['Nháp', 'Đã lên lịch', 'Đã gửi'] },
  ],
  '8_CongViec': [
    { key: 'TieuDe', label: 'Tiêu đề việc', type: 'text', required: true },
    { key: 'NguoiGiao', label: 'Người giao', type: 'text' },
    { key: 'NguoiNhan', label: 'Người nhận', type: 'text' },
    { key: 'HanHoanThanh', label: 'Hạn hoàn thành', type: 'date' },
    { key: 'TienDo', label: 'Tiến độ', type: 'select', options: ['Chưa bắt đầu', 'Đang làm', 'Hoàn thành', 'Hủy'] },
    { key: 'GhiChu', label: 'Ghi chú', type: 'textarea' },
  ],
  '9_TiepNhan': [
    { key: 'TieuDe', label: 'Tiêu đề yêu cầu', type: 'text', required: true },
    { key: 'NguoiGui', label: 'Người gửi', type: 'text' },
    { key: 'LoaiYeuCau', label: 'Loại yêu cầu', type: 'select', options: ['Phản hồi', 'Khiếu nại', 'Đề xuất', 'Khác'] },
    { key: 'MaTraCuu', label: 'Mã tra cứu', type: 'text' },
    { key: 'NgayTiepNhan', label: 'Ngày tiếp nhận', type: 'datetime' },
    { key: 'TrangThai', label: 'Trạng thái', type: 'select', options: ['Mới', 'Đang xử lý', 'Đã giải quyết', 'Đã đóng'] },
  ],
  '10_VatTu': [
    { key: 'TenVatTu', label: 'Tên vật tư', type: 'text', required: true },
    { key: 'MaVatTu', label: 'Mã vật tư', type: 'text' },
    { key: 'DonViTinh', label: 'Đơn vị tính', type: 'text' },
    { key: 'SoLuongTon', label: 'Số lượng tồn', type: 'number', required: true },
    { key: 'DinhMucToiThieu', label: 'Định mức tối thiểu', type: 'number', required: true },
    { key: 'GiaNhap', label: 'Giá nhập', type: 'number', money: true },
    { key: 'Nhom', label: 'Nhóm', type: 'text' },
  ],
  '11_XuatDungVatTu': [
    { key: 'MaPhieu', label: 'Mã phiếu', type: 'text', required: true },
    { key: 'NgayXuat', label: 'Ngày xuất', type: 'datetime' },
    { key: 'NguoiNhan', label: 'Người nhận', type: 'text' },
    { key: 'VatTu', label: 'Vật tư', type: 'text' },
    { key: 'SoLuong', label: 'Số lượng', type: 'number' },
    { key: 'LyDo', label: 'Lý do', type: 'textarea' },
  ],
  '12_MuonTraDungCu': [
    { key: 'MaPhieu', label: 'Mã phiếu', type: 'text', required: true },
    { key: 'NguoiMuon', label: 'Người mượn', type: 'text' },
    { key: 'DungCu', label: 'Dụng cụ', type: 'text' },
    { key: 'SoLuong', label: 'Số lượng', type: 'number' },
    { key: 'NgayMuon', label: 'Ngày mượn', type: 'date' },
    { key: 'HanTra', label: 'Hạn trả', type: 'date' },
    { key: 'TrangThai', label: 'Trạng thái', type: 'select', options: ['Đang mượn', 'Đã trả', 'Quá hạn'] },
  ],
  '13_LanTraDungCu': [
    { key: 'MaPhieuMuon', label: 'Mã phiếu mượn', type: 'text' },
    { key: 'NgayTra', label: 'Ngày trả', type: 'datetime' },
    { key: 'NguoiTra', label: 'Người trả', type: 'text' },
    { key: 'SoLuong', label: 'Số lượng', type: 'number' },
    { key: 'TinhTrang', label: 'Tình trạng', type: 'select', options: ['Tốt', 'Hư hỏng nhẹ', 'Hỏng'] },
    { key: 'GhiChu', label: 'Ghi chú', type: 'textarea' },
  ],
  '14_TaiSan': [
    { key: 'TenTaiSan', label: 'Tên tài sản', type: 'text', required: true },
    { key: 'MaTaiSan', label: 'Mã tài sản', type: 'text' },
    { key: 'NgayMua', label: 'Ngày mua', type: 'date' },
    { key: 'NguyenGia', label: 'Nguyên giá', type: 'number', money: true },
    { key: 'KhauHaoThang', label: 'Khấu hao/tháng', type: 'number', money: true },
    { key: 'NguoiChiuTrachNhiem', label: 'Người chịu trách nhiệm', type: 'text' },
    { key: 'TrangThai', label: 'Trạng thái', type: 'select', options: ['Đang dùng', 'Đang bảo hành', 'Hư hỏng', 'Thanh lý'] },
  ],
  '15_BaoHanhTaiSan': [
    { key: 'TaiSan', label: 'Tài sản', type: 'text', required: true },
    { key: 'NhaCungCap', label: 'Nhà cung cấp', type: 'text' },
    { key: 'NgayBatDau', label: 'Ngày bắt đầu', type: 'date' },
    { key: 'NgayHetHan', label: 'Ngày hết hạn', type: 'date' },
    { key: 'NoiDungBaoHanh', label: 'Nội dung', type: 'textarea' },
  ],
  '16_BaoDuongTaiSan': [
    { key: 'TaiSan', label: 'Tài sản', type: 'text', required: true },
    { key: 'NgayBaoDuong', label: 'Ngày bảo dưỡng', type: 'datetime' },
    { key: 'ChiPhi', label: 'Chi phí', type: 'number', money: true },
    { key: 'NoiThucHien', label: 'Nơi thực hiện', type: 'text' },
    { key: 'NoiDung', label: 'Nội dung', type: 'textarea' },
    { key: 'LanTiepTheo', label: 'Lần tiếp theo', type: 'date' },
  ],
  '17_PhuongTien': [
    { key: 'TenXe', label: 'Tên xe', type: 'text', required: true },
    { key: 'BienSo', label: 'Biển số', type: 'text' },
    { key: 'LoaiXe', label: 'Loại xe', type: 'select', options: ['Ô tô', 'Xe máy', 'Xe tải'] },
    { key: 'HanDangKiem', label: 'Hạn đăng kiểm', type: 'date' },
    { key: 'HanBaoHiem', label: 'Hạn bảo hiểm', type: 'date' },
    { key: 'NguoiPhuTrach', label: 'Người phụ trách', type: 'text' },
  ],
  '18_ChuyenDi': [
    { key: 'TenChuyen', label: 'Tên chuyến', type: 'text', required: true },
    { key: 'NgayDi', label: 'Ngày đi', type: 'datetime' },
    { key: 'DiemDen', label: 'Điểm đến', type: 'text' },
    { key: 'Xe', label: 'Phương tiện', type: 'text' },
    { key: 'TaiXe', label: 'Tài xế', type: 'text' },
    { key: 'TrangThai', label: 'Trạng thái', type: 'select', options: ['Chưa đi', 'Đang đi', 'Đã về', 'Hủy'] },
  ],
  '20_Quy': [
    { key: 'TenQuy', label: 'Tên quỹ', type: 'text', required: true },
    { key: 'LoaiQuy', label: 'Loại quỹ', type: 'select', options: ['Tiền mặt', 'Ngân hàng'] },
    { key: 'SoDu', label: 'Số dư', type: 'number', money: true },
    { key: 'MoTa', label: 'Mô tả', type: 'textarea' },
  ],
  '21_GiaoDichTaiChinh': [
    { key: 'MaPhieu', label: 'Mã phiếu', type: 'text', required: true },
    { key: 'LoaiGiaoDich', label: 'Loại', type: 'select', options: ['Thu', 'Chi', 'Chuyển nội bộ'] },
    { key: 'SoTien', label: 'Số tiền', type: 'number', money: true, required: true },
    { key: 'Ngay', label: 'Ngày', type: 'datetime' },
    { key: 'NguoiTao', label: 'Người tạo', type: 'text' },
    { key: 'TrangThai', label: 'Trạng thái', type: 'select', options: ['Chờ duyệt', 'Đã duyệt', 'Từ chối'] },
    { key: 'NoiDung', label: 'Nội dung', type: 'textarea' },
  ],
  '22_TaiLieuUpload': [
    { key: 'TenFile', label: 'Tên file', type: 'text', required: true },
    { key: 'LoaiFile', label: 'Loại file', type: 'select', options: ['Biểu mẫu', 'Chứng từ', 'Báo cáo', 'Khác'] },
    { key: 'NgayUpload', label: 'Ngày upload', type: 'datetime' },
    { key: 'NguoiUpload', label: 'Người upload', type: 'text' },
    { key: 'BaoMat', label: 'Bảo mật', type: 'boolean' },
  ],
  '23_QuanLyEmailNhacViec': [
    { key: 'TenChienDich', label: 'Tên chiến dịch', type: 'text', required: true },
    { key: 'MoTa', label: 'Mô tả', type: 'textarea' },
    { key: 'LichGui', label: 'Lịch gửi', type: 'text' },
    { key: 'KichHoat', label: 'Kích hoạt', type: 'boolean' },
  ],
  '24_LichSuEmail': [
    { key: 'TieuDe', label: 'Tiêu đề', type: 'text' },
    { key: 'NguoiNhan', label: 'Người nhận', type: 'text' },
    { key: 'NgayGui', label: 'Ngày gửi', type: 'datetime' },
    { key: 'TrangThai', label: 'Trạng thái', type: 'select', options: ['Thành công', 'Thất bại'] },
  ],
  '25_NhatKyThaoTac': [
    { key: 'NguoiThucHien', label: 'Người thực hiện', type: 'text' },
    { key: 'HanhDong', label: 'Hành động', type: 'select', options: ['Đăng nhập', 'Thêm', 'Sửa', 'Xóa'] },
    { key: 'DoiTuong', label: 'Đối tượng', type: 'text' },
    { key: 'ThoiGian', label: 'Thời gian', type: 'datetime' },
  ],
  '26_NguoiDung': [
    { key: 'TaiKhoan', label: 'Tài khoản', type: 'text', required: true },
    { key: 'MatKhau', label: 'Mật khẩu', type: 'text', required: true },
    { key: 'HoTen', label: 'Họ và tên', type: 'text', required: true },
    { key: 'VaiTro', label: 'Vai trò', type: 'select', options: ['Admin', 'NhanVien', 'BaoVe', 'KeToan'] },
    { key: 'Email', label: 'Email', type: 'email' },
    { key: 'DienThoai', label: 'Điện thoại', type: 'tel' },
    { key: 'KichHoat', label: 'Kích hoạt', type: 'boolean' },
  ],
};

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

export function seedRows(module: ModuleId, n = 8): RowData[] {
  const fields = MODULE_FIELDS[module] || [];
  const rows: RowData[] = [];
  for (let i = 0; i < n; i++) {
    const row: RowData = { id: genId('r_') };
    for (const f of fields) {
      row[f.key] = seedValue(f, i);
    }
    rows.push(row);
  }
  return rows;
}

function seedValue(f: FieldDef, i: number): string | number | boolean {
  if (f.type === 'select' && f.options) return f.options[i % f.options.length];
  if (f.type === 'boolean') return i % 3 === 0;
  if (f.type === 'number') return f.money ? (500000 + i * 250000) : (Math.floor(Math.random() * 50) + i);
  if (f.type === 'date') return new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
  if (f.type === 'datetime') return new Date(Date.now() - i * 3600000).toISOString();
  if (f.type === 'email') return `user${i}@erp.local`;
  if (f.type === 'tel') return `09${1000000 + i * 7}`;
  if (f.key === 'MaPhieu' || f.key === 'MaTraCuu') return `P${Date.now().toString().slice(-6)}${i}`;
  if (f.key === 'MaQR') return `QR-${i}-${Math.random().toString(36).slice(2, 6)}`;
  return `Mẫu ${f.label} ${i + 1}`;
}
