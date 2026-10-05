import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Trash2, Sparkles, Target, Calendar, Download, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import DocumentPreview from '@/components/cv/DocumentPreview';
import TailoredCVDocument from '@/components/cv/TailoredCVDocument';
import { getMasterCV, getCVVersions, deleteCVVersion, getProfile } from '@/utils/cvStorage';
import { exportCVToPDF } from '@/utils/cvExport';

export default function CVVersions() {
  const [versions, setVersions] = useState([]);
  const [masterCV, setMasterCV] = useState(null);
  const [profile, setProfile] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setVersions(getCVVersions());
    setMasterCV(getMasterCV());
    setProfile(getProfile());
  }, []);

  const handleDelete = (id) => {
    deleteCVVersion(id);
    setVersions(getCVVersions());
    if (viewing?.id === id) setViewing(null);
  };

  const handleDownload = async () => {
    const element = document.querySelector('[data-cv-template]');
    if (!element) return;
    setDownloading(true);
    try {
      await exportCVToPDF(element, `${viewing.targetJob} - CV.pdf`);
    } catch (err) {
      // ignore
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Phiên bản CV của tôi</h1>
          <p className="text-slate-500 text-sm mt-1">CV chính và các phiên bản điều chỉnh theo vị trí.</p>
        </div>

        {/* Master CV */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="font-bold text-slate-900">CV chính</div>
                <div className="text-sm text-slate-500">
                  {masterCV?.type === 'uploaded' ? 'CV tải lên' : profile ? 'Từ hồ sơ' : 'Chưa tạo'}
                </div>
              </div>
            </div>
            <Link to="/cv-builder" className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200">
              Chỉnh sửa
            </Link>
          </div>
        </div>

        {/* Versions */}
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Phiên bản theo vị trí ({versions.length})</h2>
        {versions.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">Chưa có phiên bản CV điều chỉnh.</p>
            <Link to="/jobs" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">
              <Target className="w-4 h-4" /> Phân tích việc làm
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {versions.slice().reverse().map((v) => (
              <div key={v.id} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900">{v.targetJob}</div>
                    <div className="text-sm text-slate-500">{v.targetCompany}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(v.created_date).toLocaleDateString('vi-VN')}</span>
                      {v.matchScore != null && <span className="text-indigo-600 font-medium">{v.matchScore}% khớp</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setViewing(v)} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-sm font-medium hover:bg-slate-200">
                      Xem
                    </button>
                    <button onClick={() => handleDelete(v.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View modal */}
        {viewing && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setViewing(null)}>
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-slate-900">{viewing.targetJob}</h3>
                  <p className="text-sm text-slate-500">{viewing.targetCompany}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 text-white text-sm font-semibold hover:bg-slate-900 disabled:opacity-50"
                  >
                    {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    <span className="hidden sm:inline">Tải PDF</span>
                  </button>
                  <button onClick={() => setViewing(null)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                    ✕
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto flex-1 p-4 bg-slate-50">
                <DocumentPreview>
                  <TailoredCVDocument content={viewing.content} />
                </DocumentPreview>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}