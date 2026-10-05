const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, FileText, Target, Lightbulb, CheckCircle2, GraduationCap, TrendingUp,
} from 'lucide-react';
import Navbar from '@/components/Navbar';

const STEPS = [
  { step: '01', title: 'Hồ sơ', desc: 'Tạo hồ sơ sinh viên — dự án, môn học, hoạt động, kỹ năng.' },
  { step: '02', title: 'CV chính', desc: 'Tạo CV chính từ hồ sơ, hoặc tải lên CV có sẵn.' },
  { step: '03', title: 'Đối chiếu', desc: 'Chọn việc làm hoặc dán mô tả. Nhận điểm phù hợp.' },
  { step: '04', title: 'Cải thiện', desc: 'Xem từ khóa khớp & thiếu, gợi ý thiết thực.' },
  { step: '05', title: 'Điều chỉnh', desc: 'Tạo phiên bản CV theo từng vị trí. CV chính giữ nguyên.' },
];

const FEATURES = [
  { icon: CheckCircle2, title: 'Gợi ý dựa trên bằng chứng', desc: 'Mọi gợi ý đều truy ngược được từ thông tin bạn đã cung cấp. Không bao giờ bịa kỹ năng hay kinh nghiệm.' },
  { icon: Target, title: 'Khớp theo từng vị trí', desc: 'Đối chiếu CV với mô tả công việc cụ thể. Biết chính xác từ khóa và kỹ năng nào còn thiếu.' },
  { icon: GraduationCap, title: 'Chuyển đổi kinh nghiệm sinh viên', desc: 'Dự án, môn học, câu lạc bộ — được ghi nhận là bằng chứng phù hợp, không bị bỏ qua.' },
  { icon: FileText, title: 'Nhiều phiên bản CV', desc: 'Điều chỉnh CV cho từng vị trí. CV chính giữ nguyên. Một phiên bản cho mỗi vị trí.' },
  { icon: Lightbulb, title: 'Phân tích khoảng trống trung thực', desc: 'Chúng tôi cho bạn biết điều gì còn thiếu — không bao giờ khuyên bạn giả tạo.' },
  { icon: TrendingUp, title: 'Chỉ số phù hợp', desc: 'Điểm khớp CV - việc làm, không phải dự đoán trúng tuyển. Biết bạn đang ở đâu.' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 mb-5">
                <GraduationCap className="w-4 h-4" />
                Trợ lý CV AI cho sinh viên
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-[1.1]">
                Từ kinh nghiệm sinh viên
                <br />
                đến CV sẵn sàng ứng tuyển
              </h1>
              <p className="mt-5 text-lg text-slate-600 leading-relaxed max-w-xl">
                Tạo CV chuyên nghiệp, đối chiếu với vị trí cụ thể, tìm ra điểm còn thiếu và tạo phiên bản điều chỉnh cho từng công việc.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Link to="/profile" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors">
                  Tạo CV của tôi <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/jobs" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-slate-700 font-semibold border border-slate-300 hover:border-slate-400 transition-colors">
                  Xem việc làm
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900">Cách hoạt động</h2>
            <p className="mt-2 text-slate-600">Từ hồ sơ đến CV điều chỉnh trong 5 bước</p>
          </div>
          <div className="grid md:grid-cols-5 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
            {STEPS.map((item) => (
              <div key={item.step} className="bg-white p-6">
                <div className="text-sm font-bold text-indigo-600 mb-2">{item.step}</div>
                <h3 className="font-semibold text-slate-900 mb-1.5">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900">Vì sao sinh viên chọn chúng tôi</h2>
            <p className="mt-2 text-slate-600">Dành cho sinh viên ít kinh nghiệm, không phải chuyên gia dày dạn</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white p-6">
                <f.icon className="w-5 h-5 text-indigo-600 mb-3" />
                <h3 className="font-semibold text-slate-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Biến kinh nghiệm thành CV sẵn sàng ứng tuyển</h2>
          <p className="text-slate-600 mb-8 max-w-xl mx-auto">Miễn phí cho sinh viên. Bắt đầu với hồ sơ, đối chiếu trong vài phút.</p>
          <Link to="/profile" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors">
            Bắt đầu <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="py-10 border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="TrolyCV Logo" className="h-8 w-auto object-contain" />
          </div>
          <p className="text-sm text-slate-500 text-center sm:text-right">
            © 2026 TrolyCV — Nền tảng phân tích & tối ưu CV thông minh cho sinh viên.
          </p>
        </div>
      </footer>
    </div>
  );
}