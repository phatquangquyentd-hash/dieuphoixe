// Module registry: 26 modules grouped into 8 sidebar groups with lucide icons.
import type { ModuleId } from './types';
import {
  LayoutDashboard, ListTodo,
  BookMarked, Users,
  CalendarDays, UserCheck, Mail, Briefcase, Inbox,
  Package, FileOutput, HandCoins, Undo2, Building2, ShieldCheck, Wrench,
  Car, Route, SquareParking,
  Wallet, ArrowLeftRight,
  FileUp, MailWarning, History, ScrollText,
  Settings,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ModuleDef {
  id: ModuleId;
  name: string;
  short: string;
  icon: LucideIcon;
  kind: 'special' | 'crud';
  automation?: string;
}

export interface ModuleGroup {
  id: string;
  label: string;
  modules: ModuleDef[];
}

export const MODULES: Record<ModuleId, ModuleDef> = {
  '1_Dashboard': { id: '1_Dashboard', name: 'Tổng quan', short: 'Dashboard', icon: LayoutDashboard, kind: 'special' },
  '2_ViecCanXuLy': { id: '2_ViecCanXuLy', name: 'Việc cần xử lý', short: 'Việc xử lý', icon: ListTodo, kind: 'special' },

  '3_DanhMuc': { id: '3_DanhMuc', name: 'Danh mục', short: 'Danh mục', icon: BookMarked, kind: 'crud' },
  '4_NhanSu': { id: '4_NhanSu', name: 'Nhân sự', short: 'Nhân sự', icon: Users, kind: 'crud', automation: 'Email sinh nhật' },

  '5_SuKien': { id: '5_SuKien', name: 'Sự kiện', short: 'Sự kiện', icon: CalendarDays, kind: 'crud', automation: 'Đồng bộ Google Calendar' },
  '6_KhachMoi': { id: '6_KhachMoi', name: 'Khách mời', short: 'Khách mời', icon: UserCheck, kind: 'crud', automation: 'Tạo mã QR check-in' },
  '7_ThuMoi': { id: '7_ThuMoi', name: 'Thư mời', short: 'Thư mời', icon: Mail, kind: 'crud', automation: 'Gửi bulk email' },
  '8_CongViec': { id: '8_CongViec', name: 'Công việc', short: 'Công việc', icon: Briefcase, kind: 'crud', automation: 'Nhắc việc qua email' },
  '9_TiepNhan': { id: '9_TiepNhan', name: 'Tiếp nhận', short: 'Tiếp nhận', icon: Inbox, kind: 'crud', automation: 'Cấp mã tra cứu' },

  '10_VatTu': { id: '10_VatTu', name: 'Vật tư', short: 'Vật tư', icon: Package, kind: 'crud' },
  '11_XuatDungVatTu': { id: '11_XuatDungVatTu', name: 'Xuất vật tư', short: 'Xuất vật tư', icon: FileOutput, kind: 'crud', automation: 'Tự động trừ tồn kho' },
  '12_MuonTraDungCu': { id: '12_MuonTraDungCu', name: 'Mượn trả dụng cụ', short: 'Mượn trả', icon: HandCoins, kind: 'crud', automation: 'Hẹn ngày trả lên Calendar' },
  '13_LanTraDungCu': { id: '13_LanTraDungCu', name: 'Lần trả dụng cụ', short: 'Trả dụng cụ', icon: Undo2, kind: 'crud', automation: 'Cộng lại vào kho' },
  '14_TaiSan': { id: '14_TaiSan', name: 'Tài sản', short: 'Tài sản', icon: Building2, kind: 'crud', automation: 'Khấu hao tự động' },
  '15_BaoHanhTaiSan': { id: '15_BaoHanhTaiSan', name: 'Bảo hành tài sản', short: 'Bảo hành', icon: ShieldCheck, kind: 'crud', automation: 'Cảnh báo trước 30 ngày' },
  '16_BaoDuongTaiSan': { id: '16_BaoDuongTaiSan', name: 'Bảo dưỡng tài sản', short: 'Bảo dưỡng', icon: Wrench, kind: 'crud' },

  '17_PhuongTien': { id: '17_PhuongTien', name: 'Phương tiện', short: 'Phương tiện', icon: Car, kind: 'crud', automation: 'Nhắc đăng kiểm/bảo hiểm' },
  '18_ChuyenDi': { id: '18_ChuyenDi', name: 'Chuyến đi', short: 'Chuyến đi', icon: Route, kind: 'crud', automation: 'Phân công tài xế' },
  '19_LuotGiuXe': { id: '19_LuotGiuXe', name: 'Lượt giữ xe', short: 'Giữ xe', icon: SquareParking, kind: 'special' },

  '20_Quy': { id: '20_Quy', name: 'Quỹ', short: 'Quỹ', icon: Wallet, kind: 'crud', automation: 'Tự động nhảy số dư' },
  '21_GiaoDichTaiChinh': { id: '21_GiaoDichTaiChinh', name: 'Giao dịch tài chính', short: 'Giao dịch', icon: ArrowLeftRight, kind: 'crud', automation: 'Phê duyệt theo thẩm quyền' },

  '22_TaiLieuUpload': { id: '22_TaiLieuUpload', name: 'Tài liệu upload', short: 'Tài liệu', icon: FileUp, kind: 'crud' },
  '23_QuanLyEmailNhacViec': { id: '23_QuanLyEmailNhacViec', name: 'Email nhắc việc', short: 'Email nhắc', icon: MailWarning, kind: 'crud' },
  '24_LichSuEmail': { id: '24_LichSuEmail', name: 'Lịch sử email', short: 'Lịch sử email', icon: History, kind: 'crud' },
  '25_NhatKyThaoTac': { id: '25_NhatKyThaoTac', name: 'Nhật ký thao tác', short: 'Nhật ký', icon: ScrollText, kind: 'crud' },

  '26_NguoiDung': { id: '26_NguoiDung', name: 'Người dùng', short: 'Người dùng', icon: Settings, kind: 'crud' },
};

export const GROUPS: ModuleGroup[] = [
  { id: 'g1', label: 'Tổng quan', modules: [MODULES['1_Dashboard'], MODULES['2_ViecCanXuLy']] },
  { id: 'g2', label: 'Dữ liệu nền', modules: [MODULES['3_DanhMuc'], MODULES['4_NhanSu']] },
  { id: 'g3', label: 'Sự kiện & Điều hành', modules: [MODULES['5_SuKien'], MODULES['6_KhachMoi'], MODULES['7_ThuMoi'], MODULES['8_CongViec'], MODULES['9_TiepNhan']] },
  { id: 'g4', label: 'Vật tư & Tài sản', modules: [MODULES['10_VatTu'], MODULES['11_XuatDungVatTu'], MODULES['12_MuonTraDungCu'], MODULES['13_LanTraDungCu'], MODULES['14_TaiSan'], MODULES['15_BaoHanhTaiSan'], MODULES['16_BaoDuongTaiSan']] },
  { id: 'g5', label: 'Phương tiện & Giữ xe', modules: [MODULES['17_PhuongTien'], MODULES['18_ChuyenDi'], MODULES['19_LuotGiuXe']] },
  { id: 'g6', label: 'Tài chính & Báo cáo', modules: [MODULES['20_Quy'], MODULES['21_GiaoDichTaiChinh']] },
  { id: 'g7', label: 'Tài liệu & Tác vụ', modules: [MODULES['22_TaiLieuUpload'], MODULES['23_QuanLyEmailNhacViec'], MODULES['24_LichSuEmail'], MODULES['25_NhatKyThaoTac']] },
  { id: 'g8', label: 'Hệ thống', modules: [MODULES['26_NguoiDung']] },
];
