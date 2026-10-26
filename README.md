# ERP & Quản lý Giữ Xe Thông minh

Web app ERP + quản lý bãi giữ xe, viết bằng React + TypeScript + Tailwind CSS + Lucide React. Kết nối backend Google Apps Script (GAS) qua `VITE_GAS_API_URL`, có chế độ Demo/Offline khi chưa cấu hình URL.

## Bắt đầu

```bash
npm install
npm run dev      # chạy local
npm run build    # build production -> dist/
npm run typecheck
```

## Biến môi trường

Tạo file `.env` (hoặc đặt trên Vercel) theo `.env.example`:

```
VITE_GAS_API_URL=your_google_apps_script_web_app_url_here
```

URL cũng có thể nhập trực tiếp trong trang **Cài đặt** (lưu trong `localStorage`).

## Tài khoản mẫu (chế độ Demo)

| Vai trò | Tài khoản | Mật khẩu | Quyền |
|---|---|---|---|
| Admin | `admin` | `admin123` | Đủ 26 module |
| Bảo vệ | `baove01` | `123456` | Tổng quan + Trạm giữ xe |

## Cấu trúc

```
src/
  App.tsx              # routing + guard phân quyền
  index.css            # Tailwind + design system
  components/          # Login, Layout, Dashboard, ParkingStation, CrudModule, ...
  contexts/            # AuthContext (custom auth, không cần Gmail)
  hooks/               # useModuleData (CRUD demo/live)
  lib/                 # types, gasClient, imageCompress, modules, mockData, format
```

## Bảo mật

- Không hardcode key/token/URL vào source.
- Mọi fetch tới GAS dùng `POST` + `Content-Type: text/plain;charset=utf-8` để tránh CORS preflight.
- URL GAS chỉ lưu trong `localStorage`.

## 26 Module (8 nhóm sidebar)

Tổng quan · Dữ liệu nền · Sự kiện & Điều hành · Vật tư & Tài sản · Phương tiện & Giữ xe · Tài chính & Báo cáo · Tài liệu & Tác vụ · Hệ thống.
