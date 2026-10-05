# 📘 HƯỚNG DẪN DÀNH CHO NGƯỜI MỚI (DỄ HIỂU NHẤT CHO SINH VIÊN KINH TẾ / NON-IT)

> Tài liệu này được biên soạn đặc biệt cho các bạn sinh viên, giảng viên khối ngành Kinh tế, Quản trị, Marketing... chưa từng học lập trình hoặc gõ lệnh terminal. Chỉ cần làm theo các bước dưới đây bằng chuột là bạn sẽ chạy và trải nghiệm được 100% tính năng của web!

---

## ⚡ PHẦN 1: CÁCH MỞ VÀ CHẠY DỰ ÁN TRÊN MÁY TÍNH (CHỈ 3 BƯỚC)

### 📌 Bước 0: Kiểm tra máy tính đã có Node.js chưa (Chỉ cần làm 1 lần duy nhất)
Web chạy trên nền tảng Node.js (phần mềm miễn phí, an toàn):
- Tải bản cài đặt chính thức tại: **[https://nodejs.org/](https://nodejs.org/)** (Chọn bản **LTS** - hình nút màu xanh lớn bên trái).
- Mở file vừa tải về, bấm **Next ➜ Next ➜ Next ➜ Install ➜ Finish**.
- *(Nếu máy bạn đã cài rồi thì bỏ qua bước này).*

---

### 📂 Bước 1: Giải nén thư mục dự án (Cực kỳ quan trọng)
- Khi nhận được file nén `.zip`, hãy **nhấp chuột phải vào file zip** ➜ Chọn **"Extract All..." (hoặc "Giải nén tất cả...")**.
- Chọn thư mục giải nén ra (ví dụ thư mục `Downloads` hoặc `Desktop`).
- ⚠️ *Lưu ý: Không được bấm chạy trực tiếp khi đang xem trong cửa sổ WinRAR/Zip vì Windows sẽ không nạp được thư viện.*

---

### 🚀 Bước 2: Bấm chạy bằng 1 cú nhấp chuột
- Mở thư mục đã giải nén ra.
- **Nhấp đúp chuột vào file:** **`CHAY_NGAY.bat`** (hoặc file `RUN.bat`).
- Cửa sổ màu đen sẽ tự động kiểm tra hệ thống và bật máy chủ lên (chỉ mất vài giây).

---

### 🌐 Bước 3: Mở trang web
- Trình duyệt web (Chrome / Cốc Cốc / Edge) sẽ **tự động mở trang web** tại địa chỉ:
  👉 **`http://localhost:5180/`**
- Nếu trình duyệt không tự mở, bạn chỉ cần mở Chrome và gõ vào thanh địa chỉ: `http://localhost:5180/` là xong!

---

## 🎯 PHẦN 2: HƯỚNG DẪN SỬ DỤNG CÁC TÍNH NĂNG CHÍNH

### 1️⃣ Đăng nhập & Đăng ký tài khoản
* **Cách nhanh nhất để thuyết trình / trải nghiệm:**
  - Ở màn hình Đăng nhập, bấm nút: **"✨ Đăng nhập nhanh tài khoản Demo (1-Click)"**. Hệ thống sẽ tự động đăng nhập vào tài khoản sinh viên mẫu với đầy đủ dữ liệu.
* **Cách tạo tài khoản mang tên chính bạn:**
  - Bấm **"Đăng ký ngay"** ở góc dưới.
  - Nhập **Họ và tên của bạn**, **Email** và **Mật khẩu**.
  - Bấm **"Đăng ký tài khoản"**.
  - Màn hình xác thực hiện ra ➜ Bấm nút **"Điền nhanh mã"** (hoặc gõ mã `123456`) ➜ Tài khoản của bạn được kích hoạt ngay!

---

### 2️⃣ Hồ sơ sinh viên (Nơi chuẩn bị thông tin CV)
* Bấm vào mục **"Hồ sơ"** trên thanh menu trên cùng.
* Tại đây bạn có thể:
  - Tự gõ thông tin của bạn: Thông tin cá nhân, Học vấn, Dự án, Kỹ năng.
  - **Mẹo thao tác nhanh:** Bấm nút **"✨ Nạp dữ liệu mẫu"** ở góc trên bên phải để hệ thống tự động điền sẵn một bộ hồ sơ sinh viên CNTT chuẩn Bách Khoa để bạn test ngay mà không phải gõ từng chữ.
  - Sau khi chỉnh sửa, bấm **"Lưu hồ sơ"** ở góc dưới cùng.

---

### 3️⃣ TÍNH NĂNG TRỌNG TÂM: SO SÁNH CV VỚI JD & NHẬN GỢI Ý SỬA CV (AI)
> Đây là chức năng quan trọng nhất của đồ án: Cho phép so sánh trực tiếp một bản CV bất kỳ với một bản mô tả công việc (JD) của nhà tuyển dụng.

* **Bước 1:** Bấm vào mục **"Đối chiếu CV"** trên thanh menu (hoặc truy cập `http://localhost:5180/match-analysis`).
* **Bước 2: Cung cấp CV của bạn (Cột bên trái):**
  - **Cách 1 (Khuyên dùng):** Bấm tab **"Tải file lên"** ➜ Chọn file CV dạng **PDF** hoặc **TXT** từ máy của bạn. Hệ thống sẽ tự động đọc toàn bộ chữ trong file PDF ra!
  - **Cách 2:** Bấm tab **"Dán văn bản"** ➜ Sao chép nội dung CV dạng chữ và dán vào ô.
  - **Cách 3:** Bấm tab **"Dùng Hồ sơ"** ➜ Tự động lấy dữ liệu từ Hồ sơ bạn đã lưu.
* **Bước 3: Cung cấp JD tuyển dụng (Cột bên phải):**
  - **Cách 1:** Bấm tab **"Dán JD tuyển dụng"** ➜ Dán thông tin tuyển dụng bạn tìm được trên TopCV / LinkedIn / VietnamWorks vào ô.
  - **Cách 2:** Bấm tab **"Tải file JD"** ➜ Tải file JD dạng PDF lên.
  - **Cách 3:** Bấm tab **"Việc làm mẫu"** ➜ Chọn 1 trong 8 công việc thực tế có sẵn (FPT Software, VNG Corporation, Viettel...).
* **Bước 4: Phân tích & Xem gợi ý sửa:**
  - Bấm nút to màu tím: **"🎯 So sánh CV với JD & Nhận gợi ý sửa CV ngay"**.
  - Hệ thống sẽ trả về:
    1. **Điểm số phù hợp ATS (0 - 100%):** Đánh giá mức độ khớp tổng thể.
    2. **Kỹ năng & Từ khóa khớp (Màu xanh):** Những từ khóa JD yêu cầu mà CV bạn đã có.
    3. **Kỹ năng & Từ khóa còn thiếu (Màu đỏ):** Những kỹ năng nhà tuyển dụng cần nhưng CV bạn chưa nhắc tới.
    4. **Cần thêm bằng chứng (Lỗ hổng bằng chứng):** Nhắc bạn những chỗ có nhắc tên công nghệ nhưng thiếu số liệu đo lường thực tế.
    5. **Ánh xạ kinh nghiệm sinh viên:** Cách biến đồ án môn học thành kinh nghiệm tương đương 3-6 tháng thực tế.
    6. **Danh sách gợi ý sửa CV chi tiết:** Gợi ý cách viết lại câu mở đầu, bổ sung từ khóa và mô tả dự án theo công thức STAR.
* **Bước 5: Tạo bản CV tối ưu theo JD & Tải về:**
  - Kéo xuống dưới, bấm nút **"✨ Tạo bản CV tối ưu theo JD ngay"**.
  - Hệ thống sẽ tự động tạo ra một bản CV hoàn chỉnh mới, đã lồng ghép các từ khóa phù hợp nhất với JD.
  - Bạn có thể bấm **"Chỉnh sửa nội dung"** để sửa trực tiếp hoặc bấm **"Tải về máy (PDF)"** để xuất file PDF nộp cho nhà tuyển dụng!

---

## 💌 PHẦN 3: GIẢI THÍCH VỀ TÍNH NĂNG GỬI EMAIL THẬT QUA SMTP

### 💡 Dự án đang hoạt động như thế nào khi chuyển sang máy khác?
Dự án đã bỏ hoàn toàn Supabase và chuyển sang cơ chế **SMTP trực tiếp** với 2 chế độ:

1. **Chế độ Mặc định (Khuyên dùng khi gửi cho người khác / nộp bài):**
   - Khi gửi file zip cho bạn bè, thầy cô hoặc sinh viên trường khác, họ **hoàn toàn KHÔNG CẦN cấu hình bất kỳ thứ gì**.
   - Khi họ nhập email và bấm Đăng ký, hệ thống sẽ tự động hiện nút **`[Điền nhanh mã]`** (hoặc nhập mã `123456`).
   - Tài khoản được kích hoạt ngay lập tức với Họ tên và Email riêng của họ!

2. **Chế độ Gửi Email THẬT về Gmail qua SMTP:**
   - Nếu bạn muốn khi bấm Đăng ký, hệ thống gửi 1 bức email thật chứa mã OTP 6 số về Gmail:
   - Bạn chỉ cần dùng tài khoản Gmail của chính mình:
     1. Vào [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) (cần bật bảo mật 2 lớp cho Gmail trước).
     2. Đặt tên là `TroLyCV` rồi bấm **Tạo** ➜ Google sẽ cấp 1 mật khẩu gồm **16 chữ cái**.
     3. Mở file [`.env`](file:///c:/Users/truon/Downloads/websuaCV-main/websuaCV-main/.env) và điền:
        ```env
        SMTP_HOST=smtp.gmail.com
        SMTP_PORT=465
        SMTP_USER=email_cua_ban@gmail.com
        SMTP_PASS=mat_khau_16_chu_cai
        ```
     4. Lưu file và khởi động lại `CHAY_NGAY.bat`.
   - Khi bạn nén file zip gửi cho người khác, bạn có thể để sẵn cấu hình này trong file `.env`. Máy người khác mở lên là sẽ tự động gửi được email thật về Gmail của bất kỳ ai đăng ký!

---

## ❓ CÁC CÂU HỎI THƯỜNG GẶP (FAQ)

* **Q: Bấm vào file `CHAY_NGAY.bat` màn hình nhấp nháy rồi tắt luôn?**
  * *A:* Do máy tính chưa cài đặt Node.js. Hãy vào https://nodejs.org/ tải bản LTS về cài đặt là xong.
* **Q: Có cần kết nối internet khi chạy không?**
  * *A:* Lần đầu tiên chạy cần mạng để hệ thống kiểm tra thư viện. Các lần tiếp theo có thể chạy hoàn toàn offline trên máy tính cá nhân.
* **Q: Tôi muốn tắt web thì làm thế nào?**
  * *A:* Chỉ cần đóng cửa sổ màu đen (Command Prompt) là hệ thống sẽ tự động dừng.
