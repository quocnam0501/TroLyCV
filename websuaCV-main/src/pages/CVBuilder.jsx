const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { FileText, Upload, Save, Loader2, Check, Eye, Download, LayoutTemplate } from 'lucide-react';
import Navbar from '@/components/Navbar';
import CVPreview from '@/components/cv/CVPreview';
import { getProfile, getMasterCV, saveMasterCV } from '@/utils/cvStorage';
import { exportCVToPDF } from '@/utils/cvExport';
import { extractTextFromFile } from '@/utils/fileExtract';
import { toast } from '@/components/ui/use-toast';

const TEMPLATES = [
  { id: 'modern', label: 'Hiện đại' },
  { id: 'minimal', label: 'Tối giản' },
  { id: 'professional', label: 'Chuyên nghiệp' },
];

export default function CVBuilder() {
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [masterCV, setMasterCV] = useState(null);
  const [summary, setSummary] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mode, setMode] = useState(() => searchParams.get('mode') === 'upload' ? 'uploaded' : 'profile');
  const [uploadedContent, setUploadedContent] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [template, setTemplate] = useState('modern');
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    const p = getProfile();
    setProfile(p);
    const cv = getMasterCV();
    setMasterCV(cv);
    if (searchParams.get('mode') === 'upload') setMode('uploaded');
    if (cv?.type === 'uploaded') {
      setMode('uploaded');
      setUploadedContent(cv.content || '');
      setUploadedFileName(cv.fileName || 'CV_da_tai_len.pdf');
      if (cv.fileDataUrl) {
        setUploadedFileUrl(cv.fileDataUrl);
      }
    } else {
      setSummary(cv?.summary || '');
      setTemplate(cv?.template || 'modern');
    }
  }, [searchParams]);

  const handleSaveSummary = () => {
    saveMasterCV({ type: 'profile', summary, template });
    setMasterCV(getMasterCV());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTemplateChange = (newTemplate) => {
    setTemplate(newTemplate);
    const cv = getMasterCV();
    if (cv?.type !== 'uploaded') {
      saveMasterCV({ type: 'profile', summary, template: newTemplate });
      setMasterCV(getMasterCV());
    }
  };

  const handleDownload = async () => {
    const element = document.querySelector('[data-cv-template]');
    if (!element) return;
    setDownloading(true);
    setDownloadError('');
    try {
      await exportCVToPDF(element, `${profile.personal?.fullName || 'CV'}.pdf`);
    } catch (err) {
      setDownloadError('Tải xuống thất bại. Vui lòng thử lại.');
    } finally {
      setDownloading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);
    try {
      // 1. Giữ nguyên định dạng file gốc và tạo URL xem trực tiếp (PDF Preview)
      const objectUrl = URL.createObjectURL(file);
      setUploadedFileUrl(objectUrl);
      setUploadedFileName(file.name);

      // Đọc DataURL để lưu trữ nếu kích thước vừa phải (dưới 3MB)
      let fileDataUrl = '';
      if (file.size <= 3 * 1024 * 1024) {
        try {
          fileDataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => resolve('');
            reader.readAsDataURL(file);
          });
        } catch {
          // ignore
        }
      }

      let extracted = '';
      if (globalThis.__B44_DB__?.integrations?.Core?.UploadPrivateFile) {
        const { file_uri } = await globalThis.__B44_DB__.integrations.Core.UploadPrivateFile({ file });
        const { signed_url } = await globalThis.__B44_DB__.integrations.Core.CreateFileSignedUrl({ file_uri });
        extracted = await globalThis.__B44_DB__.integrations.Core.InvokeLLM({
          prompt: 'Extract all text content from this CV/Resume. Return the full text exactly as it appears, preserving structure. Do not add or modify anything.',
          file_urls: [signed_url],
        });
      } else {
        extracted = await extractTextFromFile(file);
      }

      if (!extracted || extracted.trim().length < 20) {
        throw new Error('Nội dung file không đọc được hoặc quá ngắn.');
      }

      setUploadedContent(extracted);

      // Lưu file và định dạng gốc vào MasterCV
      try {
        saveMasterCV({
          type: 'uploaded',
          content: extracted,
          fileName: file.name,
          fileDataUrl: fileDataUrl || undefined,
          fileSize: file.size,
          fileType: file.type || 'application/pdf',
        });
      } catch {
        saveMasterCV({
          type: 'uploaded',
          content: extracted,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || 'application/pdf',
        });
      }

      // Chỉ lưu file và nội dung vào MasterCV để dùng đối chiếu CV (giữ nguyên Hồ sơ cá nhân của người dùng)
      setMasterCV(getMasterCV());
      setMode('uploaded');
      toast({
        title: 'Tải lên CV thành công!',
        description: `Đã nạp file "${file.name}" vào hệ thống để dùng đối chiếu với việc làm.`,
      });
    } catch (err) {
      console.error('CV upload error:', err);
      setUploadError(err.message || 'Không thể tải lên CV. Vui lòng kiểm tra tệp và thử lại.');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  if (!profile && mode === 'profile') {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Tạo hồ sơ trước</h2>
          <p className="text-slate-500 mb-6">Bạn cần hồ sơ sinh viên để tạo CV.</p>
          <Link to="/profile" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700">
            Đến trang Hồ sơ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Tạo CV</h1>
          <p className="text-slate-500 text-sm mt-1">Tạo CV chính từ hồ sơ, hoặc tải lên CV có sẵn.</p>
        </div>

        <div className="flex gap-2 mb-6 bg-white border border-slate-200 p-1 rounded-xl w-fit">
          <button
            onClick={() => setMode('profile')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'profile' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Từ hồ sơ
          </button>
          <button
            onClick={() => setMode('uploaded')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'uploaded' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            Tải lên CV
          </button>
        </div>

        {mode === 'profile' ? (
          <>
            {/* Template selector */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-700">
                <LayoutTemplate className="w-4 h-4" /> Chọn mẫu CV
              </div>
              <div className="flex gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateChange(t.id)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      template === t.id
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Tóm tắt chuyên môn</label>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Một đoạn ngắn về bản thân, điểm mạnh và định hướng bạn đang tìm kiếm..."
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
                  />
                  <button
                    onClick={handleSaveSummary}
                    className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all"
                  >
                    {saved ? <><Check className="w-4 h-4" /> Đã lưu!</> : <><Save className="w-4 h-4" /> Lưu CV chính</>}
                  </button>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                  <p className="text-sm text-slate-700">
                    CV chính được tạo từ hồ sơ. Chỉnh sửa hồ sơ để cập nhật nội dung CV.
                  </p>
                  <Link to="/profile" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                    Chỉnh sửa hồ sơ →
                  </Link>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Eye className="w-4 h-4" /> Xem trước
                  </div>
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-semibold hover:bg-slate-900 transition-all disabled:opacity-50"
                  >
                    {downloading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang xuất...</> : <><Download className="w-4 h-4" /> Tải CV PDF</>}
                  </button>
                </div>
                {downloadError && <p className="text-sm text-red-500 mb-2">{downloadError}</p>}
                <div className="bg-white rounded-xl border border-slate-200 p-4 overflow-hidden">
                  <CVPreview
                    profile={profile}
                    masterCV={{ ...masterCV, summary }}
                    photoUrl={profile.personal?.photoUrl}
                    template={template}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Tải lên & Giữ nguyên định dạng file gốc</h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Hệ thống lưu giữ nguyên vẹn thiết kế, bố cục trang, phông chữ và hình ảnh từ file CV gốc của bạn.
                  </p>
                </div>
                {(uploadedFileUrl || uploadedFileName) && (
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold cursor-pointer transition-colors shrink-0">
                    <Upload className="w-3.5 h-3.5" /> Tải lên file khác
                    <input type="file" accept=".pdf,.docx,.doc" onChange={handleUpload} disabled={uploading} className="hidden" />
                  </label>
                )}
              </div>

              {!uploadedFileUrl && !uploadedFileName && (
                <label className={`flex flex-col items-center justify-center gap-3 p-10 rounded-xl border-2 border-dashed cursor-pointer transition-all ${uploading ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 bg-slate-50/50'}`}>
                  {uploading ? <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" /> : <Upload className="w-10 h-10 text-indigo-500" />}
                  <div className="text-center">
                    <p className="text-sm font-semibold text-indigo-600">{uploading ? 'Đang nạp file...' : 'Nhấp để chọn tệp CV của bạn'}</p>
                    <p className="text-xs text-slate-400 mt-1">Hỗ trợ PDF (giữ 100% định dạng file gốc), DOCX, DOC</p>
                  </div>
                  <input type="file" accept=".pdf,.docx,.doc" onChange={handleUpload} disabled={uploading} className="hidden" />
                </label>
              )}
              {uploadError && <p role="alert" className="mt-3 text-sm text-red-600">{uploadError}</p>}
            </div>

            {(uploadedFileUrl || uploadedFileName) && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                        {uploadedFileName || masterCV?.fileName || 'CV_ca_nhan.pdf'}
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          ✓ File gốc nguyên bản
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Giữ trọn vẹn định dạng trực quan, bố cục thiết kế và phông chữ của file tải lên
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {uploadedFileUrl && (
                      <a
                        href={uploadedFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Mở toàn màn hình ↗
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setMode('profile')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      Xem mẫu trực tuyến
                    </button>
                    <Link
                      to="/match"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                    >
                      Sửa CV theo JD →
                    </Link>
                  </div>
                </div>

                {/* PDF Viewer - Giữ nguyên định dạng file gốc */}
                {uploadedFileUrl ? (
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
                    <iframe
                      src={uploadedFileUrl}
                      title="Xem trước CV gốc"
                      className="w-full h-[750px] border-0 bg-white"
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                    <FileText className="w-12 h-12 text-indigo-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-800">{uploadedFileName || masterCV?.fileName}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      File CV đã lưu giữ trong hệ thống. Bạn có thể mở mục "Sửa CV theo JD" để bắt đầu đối chiếu.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
