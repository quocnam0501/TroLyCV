import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Đọc động các file .env hoặc .evn từ cả thư mục con lẫn thư mục gốc
function getDynamicEnv() {
  const possiblePaths = [
    resolve(__dirname, '.env'),
    resolve(__dirname, '.evn'),
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), '.evn'),
    resolve(__dirname, '../.env'),
    resolve(__dirname, '../.evn'),
  ];

  const merged = {};
  let sourceFile = null;

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split(/\r?\n/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim();
            let val = trimmed.slice(eqIdx + 1).trim();
            if (
              (val.startsWith('"') && val.endsWith('"')) ||
              (val.startsWith("'") && val.endsWith("'"))
            ) {
              val = val.slice(1, -1);
            }
            if (val) {
              merged[key] = val;
            }
          }
        }
        if (!sourceFile) sourceFile = filePath;
      } catch (err) {
        console.warn(`[Env] Không thể đọc file ${filePath}:`, err.message);
      }
    }
  }

  const smtpHost = merged.SMTP_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(merged.SMTP_PORT || process.env.SMTP_PORT || '465', 10);
  const smtpUser = (merged.SMTP_USER || process.env.SMTP_USER || '').trim();
  let smtpPass = (merged.SMTP_PASS || process.env.SMTP_PASS || '').trim();
  const smtpFrom =
    merged.SMTP_FROM ||
    process.env.SMTP_FROM ||
    (smtpUser ? `"TroLyCV" <${smtpUser}>` : '"TroLyCV" <no-reply@trolycv.vn>');
  const adminEmail = (merged.ADMIN_EMAIL || process.env.ADMIN_EMAIL || smtpUser || '').trim();

  // Nếu mật khẩu ứng dụng Gmail 16 ký tự có khoảng cách, loại bỏ khoảng cách
  if (smtpHost.includes('gmail') && smtpPass.replace(/\s+/g, '').length === 16) {
    smtpPass = smtpPass.replace(/\s+/g, '');
  }

  const isConfigured = Boolean(
    smtpUser &&
    smtpPass &&
    !smtpUser.includes('your_email') &&
    !smtpPass.includes('your_16')
  );

  return {
    smtpHost,
    smtpPort,
    smtpUser,
    smtpPass,
    smtpFrom,
    adminEmail,
    isConfigured,
    sourceFile,
    merged,
  };
}

function smtpEmailPlugin() {
  return {
    name: 'smtp-email-server',
    configureServer(server) {
      // 1. Endpoint kiểm tra trạng thái cấu hình email
      server.middlewares.use('/api/smtp-status', (req, res) => {
        const env = getDynamicEnv();
        res.setHeader('Content-Type', 'application/json');
        return res.end(
          JSON.stringify({
            configured: env.isConfigured,
            host: env.smtpHost,
            port: env.smtpPort,
            userMasked: env.smtpUser
              ? env.smtpUser.replace(/(.{2})(.*)(@.*)/, '$1***$3')
              : null,
            adminEmailMasked: env.adminEmail
              ? env.adminEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3')
              : null,
            sourceFile: env.sourceFile,
          })
        );
      });

      // 2. Endpoint gửi email
      server.middlewares.use('/api/send-email', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          res.setHeader('Content-Type', 'application/json');
          const env = getDynamicEnv();

          try {
            const data = JSON.parse(body || '{}');
            const { type = 'verification', to, fullName, otpCode } = data;

            if (!to) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ success: false, message: 'Thiếu email người nhận (to)' }));
            }

            if (!env.isConfigured) {
              console.log(
                `\n\x1b[33mℹ [SMTP Simulation] Chưa cấu hình SMTP_USER và SMTP_PASS trong file .env hoặc .evn.\x1b[0m` +
                `\n\x1b[33m👉 Mã xác thực cho ${to} là: \x1b[1m${otpCode || '123456'}\x1b[0m\n`
              );
              return res.end(
                JSON.stringify({
                  success: true,
                  method: 'simulation',
                  code: otpCode || '123456',
                  message: 'Chế độ mô phỏng thông minh (chưa điền SMTP_USER / SMTP_PASS trong file .env hoặc .evn)',
                })
              );
            }

            const transporter = nodemailer.createTransport({
              host: env.smtpHost,
              port: env.smtpPort,
              secure: env.smtpPort === 465,
              auth: {
                user: env.smtpUser,
                pass: env.smtpPass,
              },
              tls: {
                rejectUnauthorized: false,
              },
              connectionTimeout: 10000,
              greetingTimeout: 10000,
            });

            // Trường hợp 1: Gửi mã xác thực tài khoản (OTP)
            if (type === 'verification') {
              await transporter.sendMail({
                from: env.smtpFrom,
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

              console.log(`\n\x1b[32m✔ [SMTP Server] Đã gửi mã xác thực tới: ${to} (Mã: ${otpCode})\x1b[0m`);

              // Gửi thêm thông báo cho Quản trị viên / Chủ sở hữu nếu email đăng ký khác email admin
              if (env.adminEmail && env.adminEmail.toLowerCase() !== to.toLowerCase()) {
                try {
                  await transporter.sendMail({
                    from: env.smtpFrom,
                    to: env.adminEmail,
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
                  console.log(`\x1b[32m✔ [SMTP Server] Đã gửi thông báo thành viên mới tới hòm thư của bạn: ${env.adminEmail}\x1b[0m\n`);
                } catch (adminErr) {
                  console.warn('[SMTP Warning] Không thể gửi thông báo tới admin:', adminErr.message);
                }
              }

              return res.end(
                JSON.stringify({
                  success: true,
                  method: 'smtp',
                  message: `Đã gửi mã xác thực thành công tới ${to}`,
                })
              );
            }

            // Trường hợp 2: Gửi email chào mừng kích hoạt thành công
            if (type === 'welcome') {
              await transporter.sendMail({
                from: env.smtpFrom,
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

              console.log(`\n\x1b[32m✔ [SMTP Server] Đã gửi email chào mừng tới: ${to}\x1b[0m\n`);
              return res.end(
                JSON.stringify({
                  success: true,
                  method: 'smtp',
                  message: `Đã gửi email chào mừng tới ${to}`,
                })
              );
            }

            // Trường hợp 3: Gửi email đặt lại mật khẩu
            if (type === 'reset_password' || type === 'reset') {
              const resetLink = body.resetLink || '';
              await transporter.sendMail({
                from: env.smtpFrom,
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
                      <a href="${resetLink}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: bold; text-decoration: none;">
                        Đặt lại mật khẩu trực tiếp →
                      </a>
                    </div>
                    ` : ''}
                    <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
                      ⏰ Mã này có hiệu lực trong vòng <strong>10 phút</strong>. Nếu bạn không yêu cầu, vui lòng bỏ qua thư này.
                    </p>
                  </div>
                `,
              });

              console.log(`\n\x1b[32m✔ [SMTP Server] Đã gửi mã đặt lại mật khẩu tới: ${to}\x1b[0m\n`);
              return res.end(
                JSON.stringify({
                  success: true,
                  method: 'smtp',
                  message: `Đã gửi mã đặt lại mật khẩu thành công tới ${to}`,
                })
              );
            }

            // Mặc định phản hồi thành công
            return res.end(JSON.stringify({ success: true }));
          } catch (err) {
            console.error('\x1b[31m✖ [SMTP Error]:\x1b[0m', err.message);
            return res.end(
              JSON.stringify({
                success: false,
                method: 'smtp_error',
                error: err.message,
                message: `Lỗi kết nối gửi email qua SMTP: ${err.message}. Vui lòng kiểm tra lại SMTP_USER và Mật khẩu ứng dụng trong file .env hoặc .evn`,
              })
            );
          }
        });
      });

      // 3. Endpoint quản lý người dùng & đặt lại mật khẩu trong môi trường local dev
      let localDevUsers = [
        {
          id: 'demo-user-001',
          email: 'sinhvien.demo@trolycv.vn',
          fullName: 'Nguyễn Văn An',
          created_at: '2026-01-01T00:00:00.000Z',
        },
      ];

      server.middlewares.use('/api/users', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const checkEmail = (url.searchParams.get('check') || '').trim().toLowerCase();
        const queryEmail = (url.searchParams.get('email') || '').trim().toLowerCase();
        const isList = url.searchParams.get('list') === '1';

        if (req.method === 'GET' && checkEmail) {
          const found = localDevUsers.some((u) => u.email.toLowerCase() === checkEmail);
          return res.end(JSON.stringify({ exists: found }));
        }

        if (req.method === 'GET' && queryEmail) {
          const found = localDevUsers.find((u) => u.email.toLowerCase() === queryEmail);
          if (!found) {
            res.statusCode = 404;
            return res.end(JSON.stringify({ error: 'Không tìm thấy tài khoản' }));
          }
          return res.end(JSON.stringify(found));
        }

        if (req.method === 'GET' && isList) {
          return res.end(JSON.stringify({ total: localDevUsers.length, users: localDevUsers }));
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', () => {
          try {
            const data = JSON.parse(body || '{}');
            if (req.method === 'POST') {
              if (data.action === 'verify') {
                const clean = (data.email || '').trim().toLowerCase();
                const u = localDevUsers.find((x) => x.email.toLowerCase() === clean);
                if (u && u.password === data.password) {
                  return res.end(
                    JSON.stringify({
                      valid: true,
                      user: {
                        id: u.id,
                        email: u.email,
                        fullName: u.fullName,
                        created_at: u.created_at,
                      },
                    })
                  );
                }
                return res.end(JSON.stringify({ valid: false }));
              }

              const { email, password, fullName } = data;
              if (!email) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: 'Thiếu email' }));
              }
              const clean = email.trim().toLowerCase();
              const existing = localDevUsers.find((u) => u.email.toLowerCase() === clean);
              if (existing) {
                res.statusCode = 409;
                return res.end(JSON.stringify({ error: 'Email đã tồn tại' }));
              }
              const newUser = {
                id: `user_${Date.now()}`,
                email: clean,
                fullName: fullName || clean.split('@')[0],
                password: password || '123456',
                created_at: new Date().toISOString(),
              };
              localDevUsers.push(newUser);
              res.statusCode = 201;
              return res.end(JSON.stringify({ success: true, user: newUser }));
            }

            if (req.method === 'PATCH' || req.method === 'PUT') {
              const { email, password } = data;
              const clean = (email || '').trim().toLowerCase();
              const u = localDevUsers.find((u) => u.email.toLowerCase() === clean);
              if (u) {
                u.password = password;
              }
              return res.end(JSON.stringify({ success: true, message: 'Cập nhật mật khẩu thành công' }));
            }

            return res.end(JSON.stringify({ status: 'ok' }));
          } catch (e) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: e.message }));
          }
        });
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
        env.VITE_API_BASE_URL || process.env.VITE_API_BASE_URL || ''
      ),
    },
    plugins: [react(), smtpEmailPlugin()],
    resolve: {
      alias: {
        '@': resolve(process.cwd(), './src'),
      },
    },
    server: {
      port: 5180,
      host: true,
    },
  };
});

