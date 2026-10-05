import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { 
  Users, 
  Database, 
  Download, 
  RefreshCw, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Mail, 
  ExternalLink,
  ShieldCheck,
  Server,
  Lock,
  KeyRound
} from 'lucide-react';

const ADMIN_MASTER_PIN = '050105';

export default function AdminDatabase() {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem('trolycv_admin_unlocked') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [dbSource, setDbSource] = useState('Đang kết nối...');

  const handleUnlock = (e) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_MASTER_PIN) {
      setIsUnlocked(true);
      sessionStorage.setItem('trolycv_admin_unlocked', 'true');
      setPinError('');
      toast({
        title: 'Xác thực thành công!',
        description: 'Chào mừng Quản trị viên truy cập cơ sở dữ liệu.',
      });
      fetchUsers();
    } else {
      setPinError('Mã PIN bảo mật không chính xác. Quyền truy cập bị từ chối!');
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem('trolycv_admin_unlocked');
    setPinInput('');
    toast({
      title: 'Đã khóa cơ sở dữ liệu',
      description: 'Dữ liệu đã được bảo mật an toàn.',
    });
  };

  const fetchUsers = async () => {
    setLoading(true);
    let allUsers = [];

    // 1. Lấy từ LocalStorage
    try {
      const localRaw = localStorage.getItem('trolycv_mock_registered_users');
      if (localRaw) {
        const localList = JSON.parse(localRaw);
        if (Array.isArray(localList)) {
          allUsers = [...localList];
        }
      }
    } catch (e) {
      console.warn('Lỗi đọc local users:', e);
    }

    // 2. Lấy từ Serverless Database API với khóa bí mật
    try {
      const res = await fetch('/api/users?list=1&secret=nam050105');
      if (res.ok) {
        const data = await res.json();
        if (data?.users && Array.isArray(data.users)) {
          data.users.forEach((remoteU) => {
            const existingIdx = allUsers.findIndex(
              (u) => u.email.toLowerCase() === remoteU.email.toLowerCase()
            );
            if (existingIdx >= 0) {
              allUsers[existingIdx] = { ...allUsers[existingIdx], ...remoteU };
            } else {
              allUsers.push(remoteU);
            }
          });
        }
      }
    } catch (apiErr) {
      console.warn('Lỗi đọc serverless API:', apiErr);
    }

    // 3. Lấy trực tiếp từ Supabase Cloud Database
    try {
      const { data: supaUsers, error: supaErr } = await supabase
        .from('registered_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (!supaErr && Array.isArray(supaUsers) && supaUsers.length > 0) {
        supaUsers.forEach((su) => {
          const existingIdx = allUsers.findIndex(
            (u) => u.email.toLowerCase() === su.email.toLowerCase()
          );
          const formatted = {
            id: su.id,
            email: su.email,
            fullName: su.full_name || su.email.split('@')[0],
            created_at: su.created_at,
          };
          if (existingIdx >= 0) {
            allUsers[existingIdx] = { ...allUsers[existingIdx], ...formatted };
          } else {
            allUsers.push(formatted);
          }
        });
        setDbSource('Supabase Cloud Database (Đang đồng bộ)');
      } else {
        setDbSource('Cloud Serverless API & Local Storage');
      }
    } catch (e) {
      console.warn('Lỗi đọc từ Supabase:', e);
      setDbSource('Local Storage (Offline)');
    }

    const hasDemo = allUsers.some((u) => u.email === 'sinhvien.demo@trolycv.vn');
    if (!hasDemo) {
      allUsers.unshift({
        id: 'demo-user-001',
        email: 'sinhvien.demo@trolycv.vn',
        fullName: 'Nguyễn Văn An (Tài khoản mẫu)',
        created_at: new Date().toISOString(),
      });
    }

    setUsers(allUsers);
    setLoading(false);
  };

  useEffect(() => {
    if (isUnlocked) {
      fetchUsers();
    }
  }, [isUnlocked]);

  const handleDeleteUser = (emailToDelete) => {
    if (emailToDelete === 'sinhvien.demo@trolycv.vn') {
      toast({
        variant: 'destructive',
        title: 'Không thể xóa',
        description: 'Tài khoản demo mặc định không thể xóa.',
      });
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản ${emailToDelete}?`)) {
      const updated = users.filter((u) => u.email !== emailToDelete);
      setUsers(updated);
      try {
        localStorage.setItem('trolycv_mock_registered_users', JSON.stringify(updated));
      } catch {}
      toast({
        title: 'Đã xóa người dùng',
        description: `Tài khoản ${emailToDelete} đã được gỡ khỏi danh sách.`,
      });
    }
  };

  const handleExportCSV = () => {
    if (users.length === 0) {
      toast({ title: 'Không có dữ liệu', description: 'Chưa có người dùng để xuất file.' });
      return;
    }

    const headers = ['STT', 'Họ và tên', 'Email', 'Thời gian đăng ký'];
    const rows = users.map((u, idx) => [
      idx + 1,
      `"${u.fullName || ''}"`,
      `"${u.email || ''}"`,
      `"${new Date(u.created_at || Date.now()).toLocaleString('vi-VN')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `danh_sach_nguoi_dung_trolycv_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Xuất file thành công!',
      description: 'Danh sách người dùng đã được tải về máy dưới dạng file CSV/Excel.',
    });
  };

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  // MÀN HÌNH KHÓA BẢO MẬT: Nếu người ngoài vào sẽ bị chặn lại
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-400">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-white mb-2">
            Khu Vực Quản Trị Viên (Admin)
          </h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Cơ sở dữ liệu người dùng được bảo mật tuyệt đối. Người dùng thông thường không có quyền xem mục này.
          </p>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="relative text-left">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input
                type="password"
                placeholder="Nhập mã PIN bảo mật của bạn..."
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  if (pinError) setPinError('');
                }}
                className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 text-sm h-11"
                autoFocus
              />
            </div>

            {pinError && (
              <p className="text-xs text-rose-400 text-left font-medium">
                {pinError}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-11 shadow-lg shadow-indigo-600/20"
            >
              Mở khóa xem Database
            </Button>

            <div className="pt-4 border-t border-slate-700/60">
              <a
                href="/"
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1"
              >
                ← Quay lại trang chủ
              </a>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // MÀN HÌNH QUẢN TRỊ VIÊN SAU KHI ĐÃ MỞ KHÓA
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                <Database className="w-6 h-6" />
              </span>
              <h1 className="text-2xl font-bold text-slate-900">
                Cơ Sở Dữ Liệu Người Dùng (Bảo Mật)
              </h1>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs">
                Chỉ Admin
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Trang quản trị nội bộ dành riêng cho bạn. Người dùng công khai trên web không nhìn thấy trang này.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUsers}
              disabled={loading}
              className="bg-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
            <Button
              size="sm"
              onClick={handleExportCSV}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Tải file Excel / CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLock}
              className="text-rose-600 border-rose-200 hover:bg-rose-50"
            >
              <Lock className="w-4 h-4 mr-1.5" />
              Khóa lại
            </Button>
          </div>
        </div>

        {/* Thẻ thống kê */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Tổng số thành viên
              </CardDescription>
              <CardTitle className="text-3xl font-extrabold text-indigo-600 flex items-center justify-between">
                <span>{users.length}</span>
                <Users className="w-6 h-6 text-indigo-300" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">Mỗi email chỉ được phép đăng ký duy nhất 1 lần</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Trạng thái lưu trữ Database
              </CardDescription>
              <CardTitle className="text-lg font-bold text-emerald-600 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Bảo mật riêng tư
                </span>
                <Server className="w-5 h-5 text-emerald-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500 truncate" title={dbSource}>
                {dbSource}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Email nhận thông báo Admin
              </CardDescription>
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center justify-between">
                <span className="truncate text-sm font-mono">nam050105@gmail.com</span>
                <Mail className="w-5 h-5 text-indigo-400 shrink-0" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">Tự động nhận thư mỗi khi có thành viên mới</p>
            </CardContent>
          </Card>
        </div>

        {/* Bảng dữ liệu người dùng */}
        <Card className="bg-white border-slate-200 shadow-sm mb-8">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold text-slate-800">
                  Danh sách tài khoản ({filteredUsers.length})
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Dữ liệu được cập nhật tự động khi người dùng đăng ký tài khoản thành công.
                </CardDescription>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Tìm theo tên hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Đang tải dữ liệu từ database...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Không tìm thấy tài khoản nào phù hợp.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500">
                    <th className="py-3 px-4 w-12 text-center">STT</th>
                    <th className="py-3 px-4">Họ và tên</th>
                    <th className="py-3 px-4">Địa chỉ Email</th>
                    <th className="py-3 px-4">Thời gian đăng ký</th>
                    <th className="py-3 px-4 text-center">Trạng thái</th>
                    <th className="py-3 px-4 text-center w-20">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user, index) => (
                    <tr key={user.id || user.email} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center text-xs text-slate-400">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {(user.fullName || user.email).charAt(0).toUpperCase()}
                          </div>
                          <span>{user.fullName || 'Người dùng'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-xs">
                        {user.email}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-xs">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleString('vi-VN')
                          : 'Vừa xong'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] font-normal">
                          <CheckCircle2 className="w-3 h-3 mr-1 inline" /> Đã kích hoạt
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {user.email !== 'sinhvien.demo@trolycv.vn' && (
                          <button
                            onClick={() => handleDeleteUser(user.email)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Xóa tài khoản này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Hướng dẫn kết nối Supabase Cloud PostgreSQL */}
        <Card className="bg-indigo-50/50 border-indigo-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <CardTitle className="text-base font-bold text-indigo-900">
                Lưu trữ trên Cơ Sở Dữ Liệu Đám Mây PostgreSQL (Supabase)
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-indigo-700">
              Nếu bạn muốn quản lý dữ liệu qua hệ quản trị cơ sở dữ liệu chuyên nghiệp có bảng biểu như phpMyAdmin:
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 space-y-2">
            <p>
              1. Truy cập <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold underline inline-flex items-center gap-1">supabase.com <ExternalLink className="w-3 h-3" /></a> và đăng ký 1 tài khoản miễn phí.
            </p>
            <p>
              2. Tạo dự án mới và lấy 2 thông số: <strong>Project URL</strong> và <strong>Anon Public Key</strong>.
            </p>
            <p>
              3. Thêm 2 biến này vào mục <strong>Settings -&gt; Environment Variables</strong> trên Vercel: <code>VITE_SUPABASE_URL</code> và <code>VITE_SUPABASE_ANON_KEY</code>.
            </p>
            <p className="text-emerald-700 font-medium">
              ✔ Dự án đã được lập trình sẵn để tự động kết nối và chuyển toàn bộ dữ liệu vào bảng <code>auth.users</code> của Supabase ngay khi bạn nhập 2 biến trên!
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
