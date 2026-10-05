// Serverless API lưu trữ & quản lý người dùng đăng ký cho TroLyCV
// BẢO MẬT: Chỉ Quản trị viên (nam050105@gmail.com) có mã bí mật mới có thể xem danh sách

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'nam050105';

let globalUsers = [
  {
    id: 'demo-user-001',
    email: 'sinhvien.demo@trolycv.vn',
    fullName: 'Nguyễn Văn An',
    created_at: '2026-01-01T00:00:00.000Z',
  },
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-Admin-Secret'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { searchParams } = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const checkEmail = (searchParams.get('check') || '').trim().toLowerCase();
  const queryEmail = (searchParams.get('email') || '').trim().toLowerCase();
  const isList = searchParams.get('list') === '1';
  const providedSecret = searchParams.get('secret') || req.headers['x-admin-secret'] || '';

  // 1. Endpoint kiểm tra email đã đăng ký chưa (chỉ trả về true/false, không lộ thông tin)
  if (req.method === 'GET' && checkEmail) {
    const found = globalUsers.some((u) => u.email.toLowerCase() === checkEmail);
    return res.status(200).json({ exists: found });
  }

  // 2. Endpoint lấy thông tin tài khoản đăng nhập
  if (req.method === 'GET' && queryEmail) {
    const found = globalUsers.find((u) => u.email.toLowerCase() === queryEmail);
    if (!found) {
      return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
    }
    // Trả về không chứa password thật
    return res.status(200).json({
      id: found.id,
      email: found.email,
      fullName: found.fullName,
      created_at: found.created_at,
    });
  }

  // 3. Endpoint xem danh sách người đăng ký: BẢO MẬT TUYỆT ĐỐI - CHỈ QUẢN TRỊ VIÊN MỚI ĐƯỢC XEM
  if (req.method === 'GET' && isList) {
    if (providedSecret !== ADMIN_SECRET_KEY) {
      return res.status(403).json({
        error: 'Quyền truy cập bị từ chối. Bạn không phải là Quản trị viên.',
      });
    }

    const safeUsers = globalUsers.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      created_at: u.created_at,
    }));
    return res.status(200).json({
      total: safeUsers.length,
      users: safeUsers,
    });
  }

  // 4. Endpoint lưu người dùng mới: POST /api/users
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { email, password, fullName } = body;

      if (!email) {
        return res.status(400).json({ error: 'Email là bắt buộc' });
      }

      const cleanEmail = email.trim().toLowerCase();

      // Kiểm tra trùng lặp email (Mỗi email chỉ đăng ký được 1 lần)
      const exists = globalUsers.some((u) => u.email.toLowerCase() === cleanEmail);
      if (exists) {
        return res.status(409).json({
          error: 'Email này đã được đăng ký trên hệ thống. Vui lòng đăng nhập!',
          code: 'EMAIL_ALREADY_EXISTS',
        });
      }

      const newUser = {
        id: body.id || `user_${Date.now()}`,
        email: cleanEmail,
        password: password || '123456',
        fullName: fullName ? fullName.trim() : cleanEmail.split('@')[0],
        created_at: body.created_at || new Date().toISOString(),
      };

      globalUsers.push(newUser);

      return res.status(201).json({
        success: true,
        message: 'Lưu tài khoản thành công',
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
          created_at: newUser.created_at,
        },
      });
    } catch (err) {
      console.error('[Database Error]:', err);
      return res.status(500).json({ error: 'Lỗi xử lý cơ sở dữ liệu' });
    }
  }

  return res.status(200).json({ status: 'ok' });
}
