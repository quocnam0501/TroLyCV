import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Lightbulb, TrendingUp, Check } from 'lucide-react';
import MatchScoreCard from './MatchScoreCard';

const categoryColors = {
  'Mục tiêu nghề nghiệp': 'bg-blue-50 text-blue-700 border border-blue-200',
  'Từ khóa ATS': 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  'Mô tả dự án & Kinh nghiệm': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Cấu trúc & Thứ tự': 'bg-purple-50 text-purple-700 border border-purple-200',
  'Kỹ năng nâng cao': 'bg-amber-50 text-amber-700 border border-amber-200',
  Content: 'bg-blue-50 text-blue-700',
  Relevance: 'bg-violet-50 text-violet-700',
  Keywords: 'bg-indigo-50 text-indigo-700',
  Evidence: 'bg-amber-50 text-amber-700',
  Structure: 'bg-slate-100 text-slate-700',
};

const categoryLabels = {
  Content: 'Nội dung',
  Relevance: 'Phù hợp',
  Keywords: 'Từ khóa',
  Evidence: 'Bằng chứng',
  Structure: 'Cấu trúc',
};

export default function MatchResult({ analysis, selectedSuggestions, onToggleSuggestion }) {
  const matched = analysis.matched_skills || [];
  const missing = analysis.missing_skills || [];
  const evidenceGaps = analysis.evidence_gaps || [];
  const translations = analysis.student_experience_translation || [];
  const suggestions = analysis.suggestions || [];

  return (
    <div className="space-y-5">
      {/* Score */}
      <MatchScoreCard score={analysis.match_score || 0} method={analysis.method} />

      {/* Matched / Missing */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-slate-900">Từ khóa & kỹ năng khớp</h3>
            <span className="text-sm text-slate-400">({matched.length})</span>
          </div>
          {matched.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {matched.map((s, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium">✓ {s}</span>
              ))}
            </div>
          ) : <p className="text-sm text-slate-400">Không tìm thấy từ khóa khớp.</p>}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-red-400" />
            <h3 className="font-bold text-slate-900">Từ khóa còn thiếu</h3>
            <span className="text-sm text-slate-400">({missing.length})</span>
          </div>
          {missing.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-2 mb-3">
                {missing.map((s, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm font-medium">{s}</span>
                ))}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nếu bạn có kinh nghiệm với các từ khóa này, hãy thêm vào phần kỹ năng hoặc mô tả dự án liên quan. Không thêm kỹ năng bạn chưa có.
              </p>
            </>
          ) : <p className="text-sm text-slate-400">Không phát hiện từ khóa thiếu.</p>}
        </div>
      </div>

      {/* Evidence Gaps */}
      {evidenceGaps.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-900">Cần thêm bằng chứng</h3>
          </div>
          <div className="space-y-2.5">
            {evidenceGaps.map((g, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/50">
                <span className="text-amber-500 mt-0.5 shrink-0">⚠</span>
                <div>
                  <span className="font-medium text-slate-900 text-sm">{g.skill}</span>
                  <p className="text-sm text-slate-600">{g.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Relevant Experience */}
      {translations.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-violet-500" />
            <h3 className="font-bold text-slate-900">Kinh nghiệm phù hợp</h3>
          </div>
          <div className="space-y-3">
            {translations.map((t, i) => (
              <div key={i} className="p-3 rounded-xl bg-violet-50/50 border border-violet-100">
                <div className="font-medium text-slate-900 text-sm">{t.experience}</div>
                <div className="text-sm text-violet-700 mt-0.5 font-medium">{t.relevance}</div>
                {t.explanation && <p className="text-sm text-slate-600 mt-1">{t.explanation}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900">Gợi ý cải thiện</h3>
            </div>
            {onToggleSuggestion && (
              <div className="flex items-center gap-3 text-xs">
                <button onClick={() => onToggleSuggestion('all')} className="text-indigo-600 font-medium hover:text-indigo-700">
                  Chọn tất cả
                </button>
                <span className="text-slate-300">|</span>
                <button onClick={() => onToggleSuggestion('none')} className="text-slate-500 font-medium hover:text-slate-700">
                  Bỏ tất cả
                </button>
              </div>
            )}
          </div>
          <div className="space-y-2.5">
            {suggestions.map((s, i) => {
              const isSelected = selectedSuggestions ? selectedSuggestions.has(i) : true;
              return (
                <label
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected ? 'bg-indigo-50/50 border border-indigo-100' : 'bg-slate-50 border border-transparent'
                  }`}
                >
                  {onToggleSuggestion && (
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); onToggleSuggestion(i); }}
                      className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                        isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 hover:border-indigo-400'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${categoryColors[s.category] || 'bg-slate-100 text-slate-700'}`}>
                        {categoryLabels[s.category] || s.category}
                      </span>
                    </div>
                    <p className="text-sm text-slate-900 font-medium">{s.text}</p>
                    {s.explanation && <p className="text-sm text-slate-500 mt-1">{s.explanation}</p>}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}