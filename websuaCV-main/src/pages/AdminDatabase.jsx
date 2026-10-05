import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
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
  Server
} from 'lucide-react';

export default function AdminDatabase() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [dbSource, setDbSource] = useState('Đang kết nối...');

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

    // 2. Lấy từ Serverless Database API (/api/users?list=1)
    try {
      const res = await fetch('/api/users?list=1');
      if (res.ok) {
        const data = await res.json();
        if (data?.users && Array.isArray(data.users)) {
          // Gộp danh sách, loại bỏ trùng lặp email
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
        setDbSource('Cloud Serverless API & Local Storage');
      } else {
        setDbSource('Local Storage (Chưa kết nối Serverless)');
      }
    } catch {
      setDbSource('Local Storage (Offline)');
    }

    // Đảm bảo tài khoản demo luôn có
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
    fetchUsers();
  }, []);

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
                Cơ Sở Dữ Liệu Người Dùng
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Xem và quản lý tất cả các tài khoản sinh viên đã đăng ký trên hệ thống TroLyCV.
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
                  Đang hoạt động
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
              <p className="text-xs text-slate-500">Nhận thông báo tự động mỗi khi có người đăng ký mới</p>
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
