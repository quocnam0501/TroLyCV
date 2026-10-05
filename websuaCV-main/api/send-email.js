import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { type = 'verification', to, fullName, otpCode } = body;

    if (!to) {
      res.status(400).json({ success: false, message: 'Thiếu email người nhận' });
      return;
    }

    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
    const smtpUser = (process.env.SMTP_USER || 'nam050105@gmail.com').trim();
    let smtpPass = (process.env.SMTP_PASS || 'ocvypsenoiazsbbp').trim();
    const adminEmail = (process.env.ADMIN_EMAIL || smtpUser).trim();
    const smtpFrom =
      process.env.SMTP_FROM ||
      (smtpUser ? `"TroLyCV" <${smtpUser}>` : '"TroLyCV" <no-reply@trolycv.vn>');

    if (smtpHost.includes('gmail')) {
      smtpPass = smtpPass.replace(/\s+/g, '');
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });

    if (type === 'verification') {
      await transporter.sendMail({
        from: smtpFrom,
        to: to,
        subject: `[TroLyCV] Mã xác thực tài khoản của bạn: ${otpCode}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; background: #e0e7ff; color: #4338ca; padding: 8px 16px; border-radius: 9999px; font-size: 13px; font-weight: bold; margin-bottom: 12px;">
                TroLyCV.vn
              </div>
              <h2 style="color: #312e81; margin: 0; font-size: 22px;">Xác thực tài khoản TroLyCV</h2>
              <p style="color: #64748b; font-size: 13px; margin-top: 6px;">Trợ Lý Tạo & Tối Ưu CV Sinh Viên Chuẩn ATS</p>
            </div>
            <p style="font-size: 15px; color: #334155; line-height: 1.6;">
              Xin chào <strong>${fullName || 'bạn'}</strong>,
            </p>
            <p style="font-size: 14px; color: #334155; line-height: 1.6;">
              Cảm ơn bạn đã đăng ký tài khoản tại hệ thống <strong>TroLyCV</strong>. Để hoàn tất kích hoạt tài khoản của bạn, vui lòng nhập mã xác thực (OTP) dưới đây:
            </p>
            <div style="text-align: center; margin: 28px 0;">
              <div style="display: inline-block; font-size: 34px; font-weight: bold; letter-spacing: 8px; color: #4338ca; background: #eef2ff; padding: 16px 36px; border-radius: 12px; border: 2px dashed #818cf8;">
                ${otpCode}
              </div>
            </div>
            <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
              ⏰ Mã này có hiệu lực trong vòng <strong>10 phút</strong>. Vì lý do an toàn, vui lòng không chia sẻ mã này cho bất kỳ ai.
            </p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
              Email này được gửi tự động từ hệ thống TroLyCV. Nếu bạn không thực hiện đăng ký, vui lòng bỏ qua thư này.
            </p>
          </div>
        `,
      });

      // Gửi thông báo cho Admin nếu email đăng ký khác email admin
      if (adminEmail && adminEmail.toLowerCase() !== to.toLowerCase()) {
        try {
          await transporter.sendMail({
            from: smtpFrom,
            to: adminEmail,
            subject: `[TroLyCV] Có thành viên mới vừa đăng ký: ${fullName || to}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                <h3 style="color: #4338ca; margin-top: 0;">Thông báo thành viên mới đăng ký</h3>
                <p style="font-size: 14px; color: #334155;">Chào bạn, hệ thống TroLyCV vừa ghi nhận một lượt đăng ký mới:</p>
                <div style="background: #f8fafc; border-left: 4px solid #4338ca; padding: 12px 16px; margin: 16px 0; font-size: 14px; color: #334155;">
                  <p style="margin: 4px 0;"><strong>Họ và tên:</strong> ${fullName || 'Chưa cung cấp'}</p>
                  <p style="margin: 4px 0;"><strong>Email đăng ký:</strong> ${to}</p>
                  <p style="margin: 4px 0;"><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</p>
                  <p style="margin: 4px 0;"><strong>Mã OTP kích hoạt:</strong> ${otpCode}</p>
                </div>
                <p style="font-size: 12px; color: #94a3b8;">Thư thông báo tự động từ hệ thống TroLyCV.</p>
              </div>
            `,
          });
        } catch (e) {
          console.warn('Admin notification error:', e.message);
        }
      }

      res.status(200).json({
        success: true,
        method: 'smtp',
        message: `Đã gửi mã xác thực thành công tới ${to}`,
      });
      return;
    }

    if (type === 'reset_password' || type === 'reset') {
      const resetLink = body.resetLink || '';
      await transporter.sendMail({
        from: smtpFrom,
        to: to,
        subject: `[TroLyCV] Mã xác nhận đặt lại mật khẩu: ${otpCode}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; background: #fee2e2; color: #dc2626; padding: 8px 16px; border-radius: 9999px; font-size: 13px; font-weight: bold; margin-bottom: 12px;">
                Bảo mật tài khoản TroLyCV
              </div>
              <h2 style="color: #1e293b; margin: 0; font-size: 22px;">Yêu cầu Đặt lại Mật khẩu</h2>
              <p style="color: #64748b; font-size: 13px; margin-top: 6px;">Trợ Lý Tạo & Tối Ưu CV Sinh Viên Chuẩn ATS</p>
            </div>
            <p style="font-size: 15px; color: #334155; line-height: 1.6;">
              Xin chào <strong>${fullName || to}</strong>,
            </p>
            <p style="font-size: 14px; color: #334155; line-height: 1.6;">
              Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>${to}</strong>. Dưới đây là mã xác thực 6 chữ số của bạn:
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <div style="display: inline-block; font-size: 34px; font-weight: bold; letter-spacing: 8px; color: #4338ca; background: #eef2ff; padding: 14px 32px; border-radius: 12px; border: 2px dashed #818cf8;">
                ${otpCode}
              </div>
            </div>
            ${resetLink ? `
            <div style="text-align: center; margin: 20px 0;">
              <a href="${resetLink}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: bold; text-decoration: none; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
                Đặt lại mật khẩu trực tiếp →
              </a>
            </div>
            ` : ''}
            <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
              ⏰ Mã xác nhận và liên kết này có hiệu lực trong vòng <strong>10 phút</strong>. Nếu bạn không yêu cầu đặt lại mật khẩu, bạn có thể an tâm bỏ qua email này.
            </p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
              TroLyCV — Hệ thống hỗ trợ ứng tuyển và tối ưu CV thông minh cho sinh viên.
            </p>
          </div>
        `,
      });

      res.status(200).json({
        success: true,
        method: 'smtp',
        message: `Đã gửi mã đặt lại mật khẩu thành công tới ${to}`,
      });
      return;
    }

    if (type === 'welcome') {
      await transporter.sendMail({
        from: smtpFrom,
        to: to,
        subject: `[TroLyCV] Chào mừng bạn gia nhập TroLyCV! 🎉`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #4338ca; margin: 0; font-size: 22px;">Chào mừng bạn đến với TroLyCV! 🎉</h2>
              <p style="color: #64748b; font-size: 13px; margin-top: 6px;">Kích hoạt tài khoản thành công</p>
            </div>
            <p style="font-size: 15px; color: #334155; line-height: 1.6;">
              Xin chào <strong>${fullName || 'bạn'}</strong>,
            </p>
            <p style="font-size: 14px; color: #334155; line-height: 1.6;">
              Tài khoản TroLyCV của bạn với email <strong>${to}</strong> đã được kích hoạt thành công.
            </p>
            <p style="font-size: 14px; color: #334155; line-height: 1.6;">
              Bạn có thể bắt đầu sử dụng các tính năng hàng đầu dành cho sinh viên:
            </p>
            <ul style="font-size: 14px; color: #475569; line-height: 1.8; padding-left: 20px;">
              <li>✨ So khớp & phân tích CV chuẩn theo yêu cầu công việc (JD).</li>
              <li>🎯 Tối ưu hoá từng gạch đầu dòng kinh nghiệm chuẩn ATS.</li>
              <li>📋 Quản lý hồ sơ ứng tuyển chuyên nghiệp và xuất bản CV đẹp mắt.</li>
            </ul>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
              Chúc bạn có những trải nghiệm tuyệt vời và sớm nhận được công việc mơ ước!
            </p>
          </div>
        `,
      });

      res.status(200).json({
        success: true,
        method: 'smtp',
        message: `Đã gửi email chào mừng tới ${to}`,
      });
      return;
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('SMTP Error:', err);
    res.status(200).json({
      success: false,
      method: 'smtp_error',
      error: err.message,
      message: `Lỗi kết nối gửi email qua SMTP: ${err.message}`,
    });
  }
}
