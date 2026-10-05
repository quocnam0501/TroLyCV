import React from 'react';
import { Info } from 'lucide-react';

export default function MatchScoreCard({ score, method }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#059669' : score >= 40 ? '#d97706' : '#dc2626';

  const label = score >= 70
    ? 'CV khớp nhiều kỹ năng và kinh nghiệm yêu cầu, dù một số từ khóa có thể còn thiếu.'
    : score >= 40
    ? 'CV khớp một phần yêu cầu. Một số kỹ năng và kinh nghiệm phù hợp cần nhấn mạnh hơn.'
    : 'CV ít trùng hợp với yêu cầu. Hãy cân nhắc điều chỉnh CV cho vị trí này.';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24 shrink-0">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="7" />
            <circle
              cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold" style={{ color }}>{score}%</span>
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-900">Mức khớp CV — Việc làm</h2>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Chỉ số phù hợp</p>
          <p className="text-sm text-slate-600 mt-1.5">{label}</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Đây là chỉ số phù hợp, không phải đảm bảo trúng tuyển.</span>
          </div>
        </div>
      </div>
      {method === 'fallback' && (
        <p className="mt-3 text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
          ⚡ Đang dùng khớp từ khóa cơ bản. Phân tích AI cung cấp chi tiết sâu hơn.
        </p>
      )}
    </div>
  );
}