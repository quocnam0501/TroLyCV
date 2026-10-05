import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { getProfile } from '@/utils/cvStorage';
import { useAuth } from '@/lib/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const profile = getProfile();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2.5 py-1 group">
              <img
                src="/logo.png"
                alt="TrolyCV Logo"
                className="h-9 sm:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </Link>

            <div className="hidden md:flex md:items-center md:space-x-1">
              <Link to="/dashboard" className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                Bảng điều khiển
              </Link>
              <Link to="/profile" className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                Hồ sơ
              </Link>
              <Link to="/cv-builder" className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                Tạo CV
              </Link>
              <Link to="/jobs" className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                Việc làm
              </Link>
              <Link to="/match-analysis" className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                Đối chiếu CV
              </Link>
              <Link to="/cv-versions" className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                Phiên bản CV
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link to="/profile" className="flex items-center space-x-2 text-sm text-slate-700 hover:text-indigo-600 font-medium px-2 py-1 rounded-lg hover:bg-slate-50">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {profile?.personal?.fullName ? profile.personal.fullName.charAt(0) : 'U'}
                  </div>
                  <span className="hidden sm:inline">{profile?.personal?.fullName || 'Tài khoản'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
                  Đăng nhập
                </Link>
                <Link to="/register" className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}