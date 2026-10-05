import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

import {
  Target,
  Loader2,
  AlertCircle,
  Sparkles,
  Save,
  Check,
  Briefcase,
  ClipboardPaste,
  Eye,
  Edit3,
  FileText,
  UploadCloud,
  User,
  RefreshCw,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import MatchResult from '@/components/cv/MatchResult';
import DocumentPreview from '@/components/cv/DocumentPreview';
import TailoredCVDocument from '@/components/cv/TailoredCVDocument';
import { getCVText, getMasterCV, addJobMatch, addCVVersion } from '@/utils/cvStorage';
import { matchCVToJob, tailorCV } from '@/utils/matchEngine';
import { extractTextFromFile } from '@/utils/fileExtract';
import { publicApiGet } from '@/lib/api';
import { SEED_JOBS } from '@/utils/seedJobs';
import { toast } from '@/components/ui/use-toast';

const STEPS = [
  { num: 1, label: 'Nạp CV & JD' },
  { num: 2, label: 'Phân tích ATS' },
  { num: 3, label: 'Xem gợi ý AI' },
  { num: 4, label: 'Lưu CV tối ưu' },
];

export default function MatchAnalysis() {
  const [searchParams] = useSearchParams();
  const presetJobId = searchParams.get('jobId');

  // Job state
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(presetJobId || '');
  const [jdMode, setJdMode] = useState('custom'); // 'custom', 'upload', 'seeded'
  const [customJD, setCustomJD] = useState('');
  const [customJobTitle, setCustomJobTitle] = useState('');
  const [customCompany, setCustomCompany] = useState('');
  const [jdFileName, setJdFileName] = useState('');

  // CV state
  const [cvMode, setCvMode] = useState('upload'); // 'upload', 'profile', 'paste'
  const [cvText, setCvText] = useState('');
  const [cvFileName, setCvFileName] = useState('');
  const [cvFileUrl, setCvFileUrl] = useState('');
  const [showCVPreview, setShowCVPreview] = useState(true);
  const [cvWordCount, setCvWordCount] = useState(0);

  // Analysis state
  const [loading, setLoading] = useState(false);
  const [extractingCV, setExtractingCV] = useState(false);
  const [extractingJD, setExtractingJD] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [tailoring, setTailoring] = useState(false);
  const [tailoredCV, setTailoredCV] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [savedVersion, setSavedVersion] = useState(false);
  const [error, setError] = useState('');
  const [selectedSuggestions, setSelectedSuggestions] = useState(new Set());

  const cvFileInputRef = useRef(null);
  const jdFileInputRef = useRef(null);

  // Load jobs and initial profile CV
  useEffect(() => {
    async function loadJobs() {
      try {
        const apiJobs = await publicApiGet('jobs');
        if (apiJobs && apiJobs.length > 0) {
          setJobs(apiJobs);
          if (!selectedJobId) setSelectedJobId(apiJobs[0].id || apiJobs[0].source_job_id);
        } else {
          const fallback = SEED_JOBS.map((job, idx) => ({
            ...job,
            id: job.source_job_id || `seed_${idx}`,
          }));
          setJobs(fallback);
          if (!selectedJobId && fallback.length > 0) setSelectedJobId(fallback[0].id);
        }
      } catch {
        const fallback = SEED_JOBS.map((job, idx) => ({
          ...job,
          id: job.source_job_id || `seed_${idx}`,
        }));
        setJobs(fallback);
        if (!selectedJobId && fallback.length > 0) setSelectedJobId(fallback[0].id);
      }
    }
    loadJobs();

    // Nạp dữ liệu CV: Ưu tiên MasterCV đã tải lên, hoặc từ Hồ sơ cá nhân
    const masterCV = getMasterCV();
    if (masterCV?.type === 'uploaded' && masterCV?.content && masterCV.content.trim().length > 20) {
      setCvText(masterCV.content);
      setCvFileName(masterCV.fileName || 'CV_da_tai_len.pdf');
      if (masterCV.fileDataUrl) setCvFileUrl(masterCV.fileDataUrl);
      setCvWordCount(masterCV.content.trim().split(/\s+/).length);
    } else {
      const profileText = getCVText();
      if (profileText && profileText.trim().length > 30) {
        setCvText(profileText);
        setCvWordCount(profileText.trim().split(/\s+/).length);
      }
    }
  }, []);

  // Sync preset jobId from URL if present
  useEffect(() => {
    if (presetJobId) {
      setSelectedJobId(presetJobId);
      setJdMode('seeded');
    }
  }, [presetJobId]);

  // Handle CV file upload - Giữ nguyên 100% định dạng file gốc
  const handleCVFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtractingCV(true);
    setError('');
    try {
      // 1. Tạo object URL xem trực tiếp định dạng gốc (PDF)
      const objectUrl = URL.createObjectURL(file);
      setCvFileUrl(objectUrl);
      setCvFileName(file.name);
      setShowCVPreview(true);

      // 2. Trích xuất text trong nền cho AI Matching (không hiển thị thô ra ngoài)
      const text = await extractTextFromFile(file);
      if (!text || text.trim().length < 20) {
        throw new Error('Nội dung file quá ngắn hoặc không đọc được văn bản.');
      }
      setCvText(text);
      setCvWordCount(text.trim().split(/\s+/).length);

      toast({
        title: 'Tải file CV thành công!',
        description: `Đã nạp file "${file.name}" (giữ nguyên định dạng gốc).`,
      });
    } catch (err) {
      console.error('CV upload error:', err);
      setError(err.message || 'Không thể đọc file CV. Hãy kiểm tra lại file hoặc dán văn bản.');
    } finally {
      setExtractingCV(false);
      if (cvFileInputRef.current) cvFileInputRef.current.value = '';
    }
  };

  // Handle JD file upload
  const handleJDFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtractingJD(true);
    setError('');
    try {
      const text = await extractTextFromFile(file);
      if (!text || text.trim().length < 20) {
        throw new Error('Nội dung file JD quá ngắn hoặc không đọc được văn bản.');
      }
      setCustomJD(text);
      setJdFileName(file.name);
      // Auto extract first line as title if possible
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length > 0 && !customJobTitle) {
        setCustomJobTitle(lines[0].slice(0, 50));
      }
      toast({
        title: 'Trích xuất JD thành công!',
        description: `Đã đọc ${text.trim().split(/\s+/).length} từ từ file ${file.name}.`,
      });
    } catch (err) {
      console.error('JD upload error:', err);
      setError(err.message || 'Không thể đọc file JD. Hãy dán nội dung vào ô văn bản.');
    } finally {
      setExtractingJD(false);
      if (jdFileInputRef.current) jdFileInputRef.current.value = '';
    }
  };

  // Switch CV Mode (profile hoặc paste)
  const handleSelectCVMode = (mode) => {
    setCvMode(mode);
    if (mode === 'profile') {
      const text = getCVText();
      setCvText(text || '');
      setCvWordCount(text ? text.trim().split(/\s+/).length : 0);
    }
  };

  // Determine active job for analysis
  const selectedJob =
    jdMode === 'seeded'
      ? jobs.find((j) => j.id === selectedJobId || j.source_job_id === selectedJobId) || jobs[0]
      : null;

  const jobForAnalysis =
    jdMode === 'seeded'
      ? selectedJob
      : {
          title: customJobTitle.trim() || 'Vị trí Tuyển dụng',
          company: customCompany.trim() || 'Doanh nghiệp',
          description: customJD,
          requirements: [],
          preferred_skills: [],
          location: '',
          job_type: 'Thực tập / Fulltime',
          field: 'Công nghệ thông tin',
        };

  const currentStep = !analysis ? 1 : !tailoredCV ? 3 : 4;

  // Validate and run analysis
  const handleAnalyze = async () => {
    setError('');

    // 1. Validate CV text
    const cleanCV = (cvText || '').trim();
    if (!cleanCV || cleanCV.length < 30) {
      setError('Vui lòng tải lên file CV, dán nội dung hoặc chọn CV từ hồ sơ (tối thiểu 30 ký tự).');
      return;
    }

    // 2. Validate JD
    if (jdMode === 'seeded') {
      if (!selectedJob) {
        setError('Vui lòng chọn một công việc có sẵn trong danh sách.');
        return;
      }
    } else {
      const cleanJD = (customJD || '').trim();
      if (!cleanJD || cleanJD.length < 30) {
        setError('Vui lòng dán hoặc tải lên mô tả công việc (JD) của nhà tuyển dụng (tối thiểu 30 ký tự).');
        return;
      }
    }

    setLoading(true);
    setAnalysis(null);
    setTailoredCV(null);

    try {
      const result = await matchCVToJob(cleanCV, jobForAnalysis);
      setAnalysis(result);
      setSelectedSuggestions(new Set((result.suggestions || []).map((_, i) => i)));

      addJobMatch({
        jobTitle: jobForAnalysis.title,
        company: jobForAnalysis.company,
        jobId: selectedJob?.id || null,
        cvName: cvFileName || (cvMode === 'profile' ? 'Hồ sơ cá nhân' : 'CV dán trực tiếp'),
        ...result,
      });

      toast({
        title: 'Phân tích thành công!',
        description: `Độ phù hợp ước tính: ${result.match_score}%`,
      });
    } catch (err) {
      console.error('Analysis failed:', err);
      setError('Quá trình đối chiếu gặp lỗi. Vui lòng kiểm tra lại nội dung và thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSuggestion = (action) => {
    if (action === 'all') {
      setSelectedSuggestions(new Set((analysis?.suggestions || []).map((_, i) => i)));
    } else if (action === 'none') {
      setSelectedSuggestions(new Set());
    } else {
      setSelectedSuggestions((prev) => {
        const next = new Set(prev);
        if (next.has(action)) next.delete(action);
        else next.add(action);
        return next;
      });
    }
  };

  const handleTailor = async () => {
    if (!analysis) return;
    setTailoring(true);
    setError('');
    try {
      const filteredAnalysis = {
        ...analysis,
        suggestions: (analysis.suggestions || []).filter((_, i) => selectedSuggestions.has(i)),
      };
      const tailored = await tailorCV(cvText, jobForAnalysis, filteredAnalysis);
      setTailoredCV(tailored);
      setEditedContent(tailored);
      setEditMode(false);
      toast({
        title: 'Đã tạo bản CV tối ưu!',
        description: 'Bạn có thể xem trước, chỉnh sửa và lưu phiên bản bên dưới.',
      });
    } catch {
      setError('Tạo bản tối ưu hóa thất bại. Vui lòng thử lại.');
    } finally {
      setTailoring(false);
    }
  };

  const handleSaveVersion = () => {
    if (!editedContent) return;
    addCVVersion({
      targetJob: jobForAnalysis.title,
      targetCompany: jobForAnalysis.company,
      jobId: selectedJob?.id || null,
      content: editedContent,
      matchScore: analysis?.match_score || 0,
      suggestions: (analysis?.suggestions || []).filter((_, i) => selectedSuggestions.has(i)),
    });
    setSavedVersion(true);
    toast({
      title: 'Đã lưu phiên bản!',
      description: 'Bản CV tối ưu này đã được lưu vào mục "Phiên bản CV".',
    });
    setTimeout(() => setSavedVersion(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Công cụ Đối chiếu & Sửa CV bằng AI
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            So sánh CV với JD & Nhận gợi ý sửa CV
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Tải lên CV của bạn và JD nhà tuyển dụng. AI sẽ phân tích từ khóa, chấm điểm ATS và hướng dẫn cách sửa chi tiết.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
          {STEPS.map((step, i) => (
            <React.Fragment key={step.num}>
              <div
                className={`flex items-center gap-2 shrink-0 ${
                  currentStep >= step.num ? 'text-indigo-600' : 'text-slate-400'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep > step.num
                      ? 'bg-indigo-600 text-white'
                      : currentStep === step.num
                      ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-600'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {currentStep > step.num ? <Check className="w-4 h-4" /> : step.num}
                </div>
                <span className="text-sm font-semibold hidden sm:inline">{step.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-6 sm:w-12 shrink-0 ${
                    currentStep > step.num ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Input Section - 2 Columns (CV & JD) */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* CỘT 1: CV CỦA BẠN */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-base">1. CV của bạn</h2>
                    <p className="text-xs text-slate-400">Chọn nguồn CV để đối chiếu</p>
                  </div>
                </div>
                {cvWordCount > 0 && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                    {cvWordCount} từ
                  </span>
                )}
              </div>

              {/* Tabs chọn nguồn CV */}
              <div className="flex p-1 bg-slate-100 rounded-xl mb-4 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => handleSelectCVMode('upload')}
                  className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    cvMode === 'upload' ? 'bg-white text-indigo-600 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" /> Tải file lên
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectCVMode('profile')}
                  className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    cvMode === 'profile' ? 'bg-white text-indigo-600 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5" /> Dùng Hồ sơ
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectCVMode('paste')}
                  className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    cvMode === 'paste' ? 'bg-white text-indigo-600 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ClipboardPaste className="w-3.5 h-3.5" /> Dán văn bản
                </button>
              </div>

              {/* Tab 1: Tải file CV lên - Giữ nguyên 100% định dạng file gốc */}
              {cvMode === 'upload' && (
                <div>
                  <input
                    type="file"
                    ref={cvFileInputRef}
                    onChange={handleCVFileUpload}
                    accept=".pdf,.txt,.md"
                    className="hidden"
                  />
                  <div
                    onClick={() => cvFileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-5 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-indigo-50/20 group"
                  >
                    {extractingCV ? (
                      <div className="py-3">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-700">Đang nạp file CV...</p>
                      </div>
                    ) : cvFileName ? (
                      <div className="py-2">
                        <FileText className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-900">{cvFileName}</p>
                        <p className="text-xs text-emerald-600 font-semibold mt-0.5">✓ Giữ nguyên 100% định dạng file gốc</p>
                        <p className="text-[11px] text-slate-400 mt-1">Nhấp để thay đổi file khác</p>
                      </div>
                    ) : (
                      <div className="py-3">
                        <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-indigo-600 mx-auto mb-2 transition-colors" />
                        <p className="text-sm font-semibold text-slate-800">
                          Nhấp để tải file CV lên (PDF)
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Hệ thống giữ nguyên toàn bộ định dạng và thiết kế gốc</p>
                      </div>
                    )}
                  </div>

                  {cvFileName && (
                    <div className="mt-3 bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 min-w-0">
                          <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span className="truncate max-w-[180px]">{cvFileName}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            Định dạng gốc
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {cvFileUrl && (
                            <>
                              <button
                                type="button"
                                onClick={() => setShowCVPreview(!showCVPreview)}
                                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" /> {showCVPreview ? 'Thu nhỏ' : 'Xem file gốc'}
                              </button>
                              <a
                                href={cvFileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-slate-600 hover:text-slate-800 font-medium px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                              >
                                Mở toàn màn hình ↗
                              </a>
                            </>
                          )}
                        </div>
                      </div>

                      {showCVPreview && cvFileUrl && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-slate-200">
                          <iframe
                            src={cvFileUrl}
                            title="Xem trước CV gốc"
                            className="w-full h-80 border-0 bg-white"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Dùng Hồ sơ (Điền tay) */}
              {cvMode === 'profile' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold text-slate-800">Dữ liệu từ Hồ sơ sinh viên (Điền tay)</span>
                      </div>
                      <Link
                        to="/profile"
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
                      >
                        Chỉnh sửa hồ sơ ↗
                      </Link>
                    </div>

                    {cvText ? (
                      <div className="max-h-56 overflow-y-auto p-3.5 bg-white rounded-lg text-xs font-mono text-slate-700 border border-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner">
                        {cvText}
                      </div>
                    ) : (
                      <div className="p-6 text-center bg-white rounded-lg border border-dashed border-slate-200">
                        <p className="text-xs text-slate-500 mb-2">Hồ sơ cá nhân chưa có dữ liệu.</p>
                        <Link
                          to="/profile"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
                        >
                          Điền hồ sơ ngay →
                        </Link>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Hệ thống tự động sử dụng thông tin học vấn, kỹ năng, kinh nghiệm bạn đã điền trong trang Hồ sơ để đối chiếu với JD.
                  </p>
                </div>
              )}

              {/* Tab 2: Dán văn bản CV */}
              {cvMode === 'paste' && (
                <div>
                  <textarea
                    value={cvText}
                    onChange={(e) => {
                      setCvText(e.target.value);
                      setCvWordCount(e.target.value.trim() ? e.target.value.trim().split(/\s+/).length : 0);
                    }}
                    placeholder="Dán toàn bộ nội dung CV của bạn vào đây (Kinh nghiệm, Kỹ năng, Học vấn, Dự án)..."
                    rows={9}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none resize-none leading-relaxed"
                  />
                </div>
              )}
            </div>
          </div>

          {/* CỘT 2: JD TUYỂN DỤNG */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 text-base">2. Mô tả công việc (JD)</h2>
                    <p className="text-xs text-slate-400">Yêu cầu tuyển dụng cần so khớp</p>
                  </div>
                </div>
              </div>

              {/* Tabs chọn nguồn JD */}
              <div className="flex p-1 bg-slate-100 rounded-xl mb-4 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setJdMode('custom')}
                  className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    jdMode === 'custom' ? 'bg-white text-indigo-600 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ClipboardPaste className="w-3.5 h-3.5" /> Dán JD tuyển dụng
                </button>
                <button
                  type="button"
                  onClick={() => setJdMode('upload')}
                  className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    jdMode === 'upload' ? 'bg-white text-indigo-600 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" /> Tải file JD
                </button>
                <button
                  type="button"
                  onClick={() => setJdMode('seeded')}
                  className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    jdMode === 'seeded' ? 'bg-white text-indigo-600 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" /> Việc làm mẫu
                </button>
              </div>

              {/* Dán JD */}
              {jdMode === 'custom' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Vị trí (vd: Thực tập Frontend React)"
                      value={customJobTitle}
                      onChange={(e) => setCustomJobTitle(e.target.value)}
                      className="px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Công ty (vd: FPT, VNG, Viettel)"
                      value={customCompany}
                      onChange={(e) => setCustomCompany(e.target.value)}
                      className="px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                    />
                  </div>
                  <textarea
                    value={customJD}
                    onChange={(e) => setCustomJD(e.target.value)}
                    placeholder="Dán toàn bộ nội dung JD tuyển dụng (Mô tả, Yêu cầu kỹ năng, Quyền lợi)..."
                    rows={7}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none resize-none leading-relaxed"
                  />
                </div>
              )}

              {/* Upload file JD */}
              {jdMode === 'upload' && (
                <div>
                  <input
                    type="file"
                    ref={jdFileInputRef}
                    onChange={handleJDFileUpload}
                    accept=".pdf,.txt,.md"
                    className="hidden"
                  />
                  <div
                    onClick={() => jdFileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-indigo-50/20 group"
                  >
                    {extractingJD ? (
                      <div className="py-4">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-700">Đang đọc dữ liệu từ file JD...</p>
                      </div>
                    ) : jdFileName ? (
                      <div className="py-2">
                        <FileCheck className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-900">{jdFileName}</p>
                        <p className="text-xs text-slate-500 mt-1">Đã đọc nội dung JD. Nhấp để đổi file khác.</p>
                      </div>
                    ) : (
                      <div className="py-2">
                        <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-indigo-600 mx-auto mb-2 transition-colors" />
                        <p className="text-sm font-semibold text-slate-800">Tải file JD lên (PDF hoặc TXT)</p>
                        <p className="text-xs text-slate-400 mt-1">Tự động đọc các yêu cầu từ file tuyển dụng</p>
                      </div>
                    )}
                  </div>
                  {customJD && (
                    <div className="mt-3">
                      <span className="text-xs font-semibold text-slate-500 block mb-1">Nội dung JD trích xuất:</span>
                      <div className="max-h-32 overflow-y-auto p-2.5 bg-slate-50 rounded-lg text-xs font-mono text-slate-700 border border-slate-200 whitespace-pre-wrap">
                        {customJD.slice(0, 400)}...
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Chọn việc có sẵn */}
              {jdMode === 'seeded' && (
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-600 block">Chọn việc làm thực tế:</label>
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white"
                  >
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title} — {j.company} ({j.location || 'Hà Nội/HCM'})
                      </option>
                    ))}
                  </select>
                  {selectedJob && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                      <p className="font-semibold text-slate-800">{selectedJob.title} - {selectedJob.company}</p>
                      <p className="line-clamp-3">{selectedJob.description}</p>
                      {selectedJob.requirements?.length > 0 && (
                        <p className="text-indigo-600 font-medium">
                          Yêu cầu chính: {selectedJob.requirements.slice(0, 3).join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nút bấm Phân tích */}
        <div className="mb-8">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold hover:from-indigo-700 hover:to-violet-700 transition-all shadow-md active:scale-[0.99] disabled:opacity-50 text-base"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Đang quét từ khóa và phân tích đối chiếu ATS...
              </>
            ) : (
              <>
                <Target className="w-5 h-5" /> So sánh CV với JD & Nhận gợi ý sửa CV ngay
              </>
            )}
          </button>
          {error && (
            <div className="mt-3 p-3 rounded-xl bg-destructive/10 text-destructive text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Loading card */}
        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
            <h3 className="font-bold text-slate-900 text-lg">Đang tiến hành đối chiếu thông minh...</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
              Hệ thống đang quét các kỹ năng công nghệ, so khớp từ khóa ATS, phát hiện lỗ hổng bằng chứng và xây dựng lộ trình sửa CV tối ưu.
            </p>
          </div>
        )}

        {/* Results section */}
        {analysis && !loading && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Báo cáo phân tích & Gợi ý cải thiện CV</h2>
                <p className="text-slate-500 text-sm">
                  Đối chiếu giữa CV và vị trí: <strong>{jobForAnalysis.title}</strong> ({jobForAnalysis.company})
                </p>
              </div>
              <button
                onClick={handleAnalyze}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Phân tích lại
              </button>
            </div>

            <MatchResult
              analysis={analysis}
              selectedSuggestions={selectedSuggestions}
              onToggleSuggestion={toggleSuggestion}
            />

            {/* Tailor CTA */}
            {!tailoredCV && (
              <div className="mt-6 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl border border-indigo-200 p-6 sm:p-8 text-center shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  Tự động tối ưu hóa CV theo các gợi ý trên?
                </h3>
                <p className="text-sm text-slate-600 max-w-xl mx-auto mb-5 leading-relaxed">
                  Hệ thống sẽ áp dụng <strong>{selectedSuggestions.size} gợi ý đã chọn</strong> để tạo ra một bản CV điều chỉnh riêng biệt, bổ sung các từ khóa ATS chuẩn và cá nhân hóa cho vị trí <strong>{jobForAnalysis.title}</strong>.
                </p>
                <button
                  onClick={handleTailor}
                  disabled={tailoring}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-md active:scale-95"
                >
                  {tailoring ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Đang điều chỉnh cấu trúc & từ khóa...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" /> Tạo bản CV tối ưu theo JD ngay
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Tailored CV Preview & Export */}
        {tailoredCV && (
          <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">CV điều chỉnh tối ưu — {jobForAnalysis.title}</h3>
                  <p className="text-xs text-slate-400">Phiên bản đã lồng ghép từ khóa và cấu trúc theo JD</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    editMode
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {editMode ? (
                    <>
                      <Eye className="w-3.5 h-3.5" /> Xem trước định dạng
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-3.5 h-3.5" /> Chỉnh sửa nội dung
                    </>
                  )}
                </button>
              </div>
            </div>

            {editMode ? (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={18}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none resize-y leading-relaxed"
                placeholder="Nội dung CV Markdown..."
              />
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-inner">
                <DocumentPreview>
                  <TailoredCVDocument content={editedContent} />
                </DocumentPreview>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={handleSaveVersion}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
              >
                {savedVersion ? (
                  <>
                    <Check className="w-4 h-4" /> Đã lưu vào danh sách!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Lưu bản CV này
                  </>
                )}
              </button>
              <Link
                to="/cv-versions"
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-indigo-600 ml-auto"
              >
                <FileText className="w-4 h-4" /> Xem tất cả các bản CV đã lưu →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}