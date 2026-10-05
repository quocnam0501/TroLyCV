import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, FileText, Target, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import JobCard from '@/components/jobs/JobCard';

import { getProfile, getMasterCV, getCVVersions, getProfileCompleteness } from '@/utils/cvStorage';
import { SEED_JOBS } from '@/utils/seedJobs';
import { publicApiGet } from '@/lib/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [masterCV, setMasterCV] = useState(null);
  const [versions, setVersions] = useState([]);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const p = getProfile();
    if (!p) { navigate('/profile'); return; }
    setProfile(p);
    setMasterCV(getMasterCV());
    setVersions(getCVVersions());
    async function loadJobs() {
      try {
        const apiJobs = await publicApiGet('jobs');
        if (apiJobs && apiJobs.length > 0) {
          setJobs(apiJobs);
        } else {
          setJobs(SEED_JOBS.map((job, idx) => ({
            ...job,
            id: job.source_job_id || `seed_${idx}`,
          })));
        }
      } catch {
        setJobs(SEED_JOBS.map((job, idx) => ({
          ...job,
          id: job.source_job_id || `seed_${idx}`,
        })));
      }
    }
    loadJobs();
  }, [navigate]);

  if (!profile) return null;

  const completeness = getProfileCompleteness(profile);
  const recentVersions = versions.slice(-3).reverse();
  const recommendedJobs = jobs.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Bảng điều khiển</h1>
        <p className="text-slate-500 text-sm mb-6">Chào mừng trở lại{profile.personal?.fullName ? `, ${profile.personal.fullName}` : ''}.</p>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-slate-900">Hồ sơ của tôi</h3>
            </div>
            <div className="text-3xl font-bold text-indigo-600 mb-1">{completeness}%</div>
            <div className="text-sm text-slate-500 mb-3">Mức hoàn thiện hồ sơ</div>
            <div className="w-full h-2 rounded-full bg-slate-100 mb-4">
              <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${completeness}%` }} />
            </div>
            <Link to="/profile" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              Chỉnh sửa hồ sơ <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-slate-900">CV chính</h3>
            </div>
            {masterCV ? (
              <>
                <p className="text-sm text-slate-600 mb-3">{masterCV.type === 'uploaded' ? 'CV tải lên sẵn sàng' : 'Tạo từ hồ sơ'}</p>
                <Link to="/cv-builder" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  Chỉnh sửa CV <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-500 mb-3">Chưa tạo.</p>
                <Link to="/cv-start" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">
                  Tạo CV
                </Link>
              </>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-slate-900">Hoạt động</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Phiên bản CV</span>
                <span className="font-bold text-slate-900">{versions.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Việc làm</span>
                <span className="font-bold text-slate-900">{jobs.length}</span>
              </div>
            </div>
            <Link to="/cv-versions" className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              Xem phiên bản <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-900">Phiên bản CV gần đây</h2>
            <Link to="/cv-versions" className="text-sm text-indigo-600 font-medium">Xem tất cả →</Link>
          </div>
          {recentVersions.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-4">Chưa có phiên bản CV điều chỉnh.</p>
              <Link to="/jobs" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">
                <Target className="w-4 h-4" /> Tìm việc làm để phân tích
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentVersions.map((v) => (
                <div key={v.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{v.targetJob}</div>
                    <div className="text-sm text-slate-500">{v.targetCompany}</div>
                  </div>
                  {v.matchScore != null && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-indigo-600">{v.matchScore}%</div>
                      <div className="text-xs text-slate-400">khớp</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-900">Việc làm gợi ý</h2>
            <Link to="/jobs" className="text-sm text-indigo-600 font-medium">Xem tất cả →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedJobs.map((job, i) => (
              <JobCard key={job.id || i} job={job} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
