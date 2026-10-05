/**
 * Dịch vụ gửi email xác thực tài khoản qua SMTP (Gmail, Outlook, v.v.)
 * Tích hợp trực tiếp với máy chủ Vite tại /api/send-email và /api/smtp-status.
 * Hỗ trợ cấu hình qua file .env hoặc .evn.
 */

// Bộ nhớ đệm kiểm tra trạng thái SMTP
let cachedSmtpStatus = null;

/**
 * Kiểm tra trạng thái cấu hình email từ máy chủ Vite (đọc từ file .env / .evn)
 */
export async function checkSmtpStatus(forceRefresh = false) {
  if (cachedSmtpStatus && !forceRefresh) {
    return cachedSmtpStatus;
  }
  try {
    const res = await fetch('/api/smtp-status');
    if (res.ok) {
      const data = await res.json();
      cachedSmtpStatus = data;
      return data;
    }
  } catch (err) {
    console.warn('[emailService] Không thể kết nối tới /api/smtp-status:', err);
  }
  return { configured: false, host: 'smtp.gmail.com', port: 465 };
}

// Tạo mã OTP ngẫu nhiên 6 chữ số
export function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Lưu mã OTP vào sessionStorage để đối chiếu xác thực
export function savePendingOtp(email, code) {
  try {
    const key = `trolycv_otp_${email.toLowerCase().trim()}`;
    const data = {
      code,
      createdAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 phút
    };
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('Cannot save OTP to session:', err);
  }
}

// Lấy mã OTP đã lưu
export function getPendingOtp(email) {
  try {
    const key = `trolycv_otp_${email.toLowerCase().trim()}`;
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() > data.expiresAt) {
      sessionStorage.removeItem(key);
      return null;
    }
    return data.code;
  } catch {
    return null;
  }
}

/**
 * Gửi email xác thực thật tới địa chỉ email người dùng qua cổng SMTP
 * @param {Object} params
 * @param {string} params.toEmail - Địa chỉ email người nhận (ví dụ: ban@gmail.com)
 * @param {string} params.fullName - Họ và tên người dùng
 * @param {string} params.otpCode - Mã xác thực 6 chữ số
 */
export async function sendVerificationEmail({ toEmail, fullName, otpCode }) {
  savePendingOtp(toEmail, otpCode);

  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'verification',
        to: toEmail.trim(),
        fullName: fullName ? fullName.trim() : '',
        otpCode: otpCode,
      }),
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('API send-email error, using local fallback:', err);
    return {
      success: true,
      method: 'simulation',
      code: otpCode,
      message: 'Không kết nối được API send-email, chuyển về chế độ mô phỏng',
    };
  }
}

/**
 * Gửi email chào mừng khi người dùng xác thực thành công
 * @param {Object} params
 * @param {string} params.toEmail - Địa chỉ email người nhận
 * @param {string} params.fullName - Họ và tên người dùng
 */
export async function sendWelcomeEmail({ toEmail, fullName }) {
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'welcome',
        to: toEmail.trim(),
        fullName: fullName ? fullName.trim() : '',
      }),
    });
    return await res.json();
  } catch (err) {
    console.warn('API sendWelcomeEmail error:', err);
    return { success: false, error: err.message };
  }
}

