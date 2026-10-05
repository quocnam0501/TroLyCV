// Script chuyển toàn bộ dữ liệu người đăng ký sang Supabase
// Chạy bằng: node scripts/migrate_to_supabase.js

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://unngiptnvqslmqygadxp.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_nHBoqMbYIlwLYYpq7hjEuQ_-bGuT3UT';

const cleanUrl = SUPABASE_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

const usersToMigrate = [
  {
    email: 'sinhvien.demo@trolycv.vn',
    full_name: 'Nguyễn Văn An (Demo Account)',
    created_at: new Date('2026-01-01T00:00:00.000Z').toISOString(),
  },
  {
    email: 'nam050105@gmail.com',
    full_name: 'Quốc Nam (Admin)',
    created_at: new Date().toISOString(),
  }
];

async function migrate() {
  console.log('🚀 Bắt đầu chuyển dữ liệu sang Supabase...');
  console.log('📍 Supabase URL:', cleanUrl);

  const endpoint = `${cleanUrl}/rest/v1/registered_users`;

  for (const user of usersToMigrate) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify(user),
      });

      if (res.ok) {
        console.log(`✅ Đã chuyển thành công: ${user.email} (${user.full_name})`);
      } else {
        const text = await res.text();
        if (text.includes('Could not find the table') || text.includes('PGRST205')) {
          console.error('\n⚠️ CHƯA TẠO BẢNG: Bạn cần chạy lệnh SQL trên Supabase trước để tạo bảng "registered_users"!');
          console.log('\nHãy vào Supabase -> SQL Editor và chạy đoạn mã sau:\n');
          console.log(`
CREATE TABLE IF NOT EXISTS public.registered_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.registered_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cho phep them nguoi dang ky" ON public.registered_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Cho phep doc danh sach" ON public.registered_users FOR SELECT USING (true);
CREATE POLICY "Cho phep cap nhat" ON public.registered_users FOR UPDATE USING (true);
          `);
          return;
        } else {
          console.error(`❌ Lỗi khi chuyển ${user.email}:`, text);
        }
      }
    } catch (err) {
      console.error(`❌ Ngoại lệ khi chuyển ${user.email}:`, err.message);
    }
  }

  console.log('\n🎉 Hoàn tất quá trình đồng bộ!');
}

migrate();
