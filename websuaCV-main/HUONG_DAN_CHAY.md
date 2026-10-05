# 🚀 HƯỚNG DẪN CHẠY DỰ ÁN TROLYCV TRÊN MÁY TÍNH KHÁC

Dự án này đã được tối ưu hóa toàn diện để **chạy độc lập, không phụ thuộc môi trường máy cũ**, dữ liệu tự động đồng bộ (roaming) và có sẵn chế độ chạy thử 1-click.

---

## 📦 1. KHI NÉN FILE GỬI CHO NGƯỜI KHÁC (RẤT QUAN TRỌNG)

Để file zip gửi đi nhẹ (chỉ khoảng **10 - 20 MB** thay vì 300 MB):
- **BỎ QUA (hoặc xóa) thư mục:** `node_modules` và `backend/venv` (khi gửi không cần gửi 2 thư mục này vì máy người nhận sẽ tự sinh ra).
- Người nhận chỉ cần giải nén thư mục `websuaCV-main`.

---

## ⚡ 2. CÁCH CHẠY NHANH NHẤT (1-CLICK KHÔNG CẦN GÕ LỆNH)

Trên máy người nhận (Windows):
1. Mở thư mục `websuaCV-main`.
2. **Nhấp đúp chuột vào file:** `CHAY_NGAY.bat` (hoặc `RUN.bat`).
3. File này sẽ:
   - Tự động kiểm tra Node.js.
   - Tự động chạy `npm install` (nếu máy chưa có `node_modules`).
   - Tự động bật máy chủ và tự động mở trình duyệt tại: **http://localhost:5180/**

---

## 💻 3. CÁCH CHẠY THỦ CÔNG QUA TERMINAL (CMD / POWERSHELL / VS CODE)

Nếu muốn chạy bằng tay qua terminal như đồ án Quản Lý Sách:

```powershell
# Bước 1: Mở Terminal tại thư mục dự án
cd websuaCV-main

# Bước 2: Cài thư viện (chỉ cần chạy lần đầu tiên)
npm install

# Bước 3: Khởi chạy website
npm run dev
# hoặc
npm start
```

Sau đó mở trình duyệt và truy cập: **`http://localhost:5180/`**

---

## 🔑 4. CÁC TÍNH NĂNG VÀ DỮ LIỆU ĐÃ ĐƯỢC TỐI ƯU SẴN

1. **Đăng nhập / Đăng ký không cần chờ Email**:
   - Khi vào trang Đăng nhập, có sẵn nút **"✨ Đăng nhập nhanh tài khoản Demo (1-Click)"**.
   - Nếu đăng ký tài khoản mới: Mã xác thực OTP demo mặc định là **`123456`**.
   - Nếu bấm Quên mật khẩu: Có sẵn liên kết vào đặt lại mật khẩu ngay mà không bị lỗi.

2. **Dữ liệu Roaming xuyên suốt**:
   - Tự động nạp sẵn hồ sơ sinh viên mẫu chuẩn: Nguyễn Văn An (Bách Khoa, thực tập FPT, kỹ năng Frontend/Fullstack, dự án thực tế).
   - Dữ liệu đồng bộ trực tiếp qua:
     - **Bảng điều khiển** (Độ hoàn thiện 95%, thống kê, việc làm gợi ý).
     - **Hồ sơ** (Chỉnh sửa và lưu tức thì vào máy).
     - **Tạo CV** (Xem trước theo 3 mẫu Hiện đại / Tối giản / Chuyên nghiệp và tải PDF).
     - **Việc làm** (8 công việc thực tập thực tế kèm lọc theo kỹ năng/địa điểm).
     - **Đối chiếu CV** (Thuật toán ATS chấm điểm match, phân tích từ khóa và 1-click tối ưu CV).
     - **Phiên bản CV** (Lưu và quản lý nhiều bản CV theo từng công ty).

---

## 🌐 5. HƯỚNG DẪN CẤU HÌNH GỬI EMAIL THẬT QUA SUPABASE

Khi chạy mặc định (chưa có Supabase), web đang chạy **Chế độ Thử Nghiệm Thông Minh (Mock Mode)**:
- Người dùng có thể đăng ký tài khoản bất kỳ với Họ và tên riêng của mình.
- Mã OTP kích hoạt tài khoản thử nghiệm mặc định là: **`123456`**.
- Dữ liệu hồ sơ của mỗi tài khoản được lưu tách biệt, không bị trùng với tài khoản mẫu "Nguyễn Văn An".

### 👉 Để gửi Email xác thực thật qua Supabase Cloud về hòm thư người dùng:
1. **Tạo tài khoản & dự án Supabase:**
   - Truy cập [https://supabase.com](https://supabase.com) và đăng ký tài khoản miễn phí.
   - Bấm **"New Project"**, nhập tên dự án (ví dụ: `trolycv`) và mật khẩu Database.
2. **Lấy API Keys:**
   - Vào mục **Project Settings** (biểu tượng bánh răng góc dưới bên trái) -> Chọn **API**.
   - Copy **Project URL** và **Project API Keys (anon / public)**.
3. **Điền vào file `.env` của dự án:**
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_API_BASE_URL=http://localhost:8000
   ```
4. **Cấu hình Redirect URL trong Supabase (RẤT QUAN TRỌNG):**
   - Vào Supabase Dashboard -> **Authentication** -> **URL Configuration**.
   - Mục **Site URL**: Điền `http://localhost:5180`.
   - Mục **Redirect URLs**: Bấm **Add URL** và thêm `http://localhost:5180/**` và `http://localhost:5180/login`.
5. **(Tùy chọn) Bật mã OTP 6 số hoặc Liên kết xác thực:**
   - Vào **Authentication** -> **Providers** -> **Email**.
   - Mục **Confirm email** đang bật (mặc định): Supabase sẽ tự động gửi email chứa liên kết kích hoạt hoặc mã xác thực mỗi khi người dùng bấm Đăng ký.
6. **Lưu file `.env` và khởi động lại website:**
   ```powershell
   npm run dev
   ```

---

## 🎯 6. CHỨC NĂNG ĐỐI CHIẾU CV VỚI JD (SO SÁNH & GỢI Ý CHỈNH SỬA)

Hệ thống hỗ trợ quy trình hoàn chỉnh tại menu **"Đối chiếu CV"** (`/match-analysis`):
1. **Nguồn CV:**
   - **Tải file CV lên (PDF / TXT):** Tự động đọc và bóc tách toàn bộ kỹ năng, kinh nghiệm từ file PDF của bạn.
   - **Dán nội dung CV:** Tự do dán văn bản CV để chỉnh sửa nhanh.
   - **Dùng CV từ Hồ sơ:** Tự động nạp hồ sơ của tài khoản đang đăng nhập.
2. **Nguồn JD tuyển dụng:**
   - **Dán JD tuyển dụng:** Nhập vị trí, tên công ty và toàn bộ mô tả công việc.
   - **Tải file JD (PDF / TXT):** Tự động đọc yêu cầu từ file tuyển dụng.
   - **Chọn việc làm có sẵn:** 8 việc làm IT thực tế (FPT, VNG, Viettel, Momo, v.v.).
3. **Kết quả phân tích chuẩn ATS (100% Tiếng Việt):**
   - **Điểm số phù hợp ATS (0 - 100%)**.
   - **Kỹ năng & Từ khóa khớp** vs **Từ khóa còn thiếu**.
   - **Lỗ hổng bằng chứng (Evidence Gaps):** Cảnh báo các kỹ năng thiếu số liệu đo lường hoặc thiếu dự án chứng minh.
   - **Ánh xạ kinh nghiệm sinh viên:** Hướng dẫn biến đồ án môn học, CLB thành kinh nghiệm thực tế.
   - **Gợi ý chỉnh sửa cụ thể:** Cho Mục tiêu nghề nghiệp, Nhóm kỹ năng, Mô tả STAR trong dự án.
   - **1-Click tạo bản CV tối ưu theo JD:** Cho phép xem trước, chỉnh sửa và xuất file PDF ngay lập tức.

