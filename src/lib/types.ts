// Core domain types for the ERP & Parking Management system.

export type ModuleId =
  | '1_Dashboard' | '2_ViecCanXuLy'
  | '3_DanhMuc' | '4_NhanSu'
  | '5_SuKien' | '6_KhachMoi' | '7_ThuMoi' | '8_CongViec' | '9_TiepNhan'
  | '10_VatTu' | '11_XuatDungVatTu' | '12_MuonTraDungCu' | '13_LanTraDungCu'
  | '14_TaiSan' | '15_BaoHanhTaiSan' | '16_BaoDuongTaiSan'
  | '17_PhuongTien' | '18_ChuyenDi' | '19_LuotGiuXe'
  | '20_Quy' | '21_GiaoDichTaiChinh'
  | '22_TaiLieuUpload' | '23_QuanLyEmailNhacViec' | '24_LichSuEmail' | '25_NhatKyThaoTac'
  | '26_NguoiDung';

export interface User {
  id: string;
  TaiKhoan: string;
  MatKhau: string;
  HoTen: string;
  VaiTro: 'Admin' | 'NhanVien' | 'BaoVe' | 'KeToan';
  QuyenModule: ModuleId[];
  KichHoat: boolean;
  Email?: string;
  DienThoai?: string;
  NgayTao: string;
}

export interface ParkingTicket {
  id: string;
  BienSo: string;
  LoaiXe: 'Xe máy' | 'Ô tô' | 'Xe đạp điện';
  MaVe: string;
  ThoiGianVao: string;
  ThoiGianRa?: string;
  TrangThai: 'Đang gửi' | 'Đã lấy xe';
  NguoiTrucVao: string;
  NguoiTrucRa?: string;
  AnhBase64?: string;
  GhiChu?: string;
}

export type RowData = Record<string, string | number | boolean | null | undefined>;

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export type ActionType =
  | 'AUTH_LOGIN' | 'AUTH_LOGOUT'
  | 'PARKING_CHECKIN' | 'PARKING_CHECKOUT' | 'PARKING_LIST_ACTIVE'
  | 'LIST' | 'CREATE' | 'UPDATE' | 'DELETE'
  | 'APPROVE' | 'COMPLETE'
  | 'DASHBOARD_STATS';

export interface ApiRequest {
  action: ActionType;
  module?: ModuleId;
  payload?: Record<string, unknown>;
  token?: string;
}
