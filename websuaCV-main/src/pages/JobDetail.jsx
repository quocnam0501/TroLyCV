import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Building2, Wifi, Briefcase, ArrowLeft, Target, Sparkles, Users, Home, GraduationCap, Clock } from 'lucide-react';

import Navbar from '@/components/Navbar';
import { SEED_JOBS, WORK_ARRANGEMENT_LABELS, EXPERIENCE_LEVEL_LABELS, formatPostedDate } from '@/utils/seedJobs';
import { publicApiGet } from '@/lib/api';
import { getProfile, getMasterCV } from '@/utils/cvStorage';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJob() {
      try {
        const apiJob = await publicApiGet(`jobs/${id}`);
        if (apiJob) {
          setJob(apiJob);
        } else {
          const seedJob = SEED_JOBS.find(j => j.source_job_id === id || j.id === id) ||
            (id?.startsWith('seed_') ? SEED_JOBS[parseInt(id.replace('seed_', ''), 10)] : null) ||
            SEED_JOBS[0];
          setJob(seedJob ? { ...seedJob, id: seedJob.source_job_id || id } : null);
        }
      } catch {
        const seedJob = SEED_JOBS.find(j => j.source_job_id === id || j.id === id) ||
          (id?.startsWith('seed_') ? SEED_JOBS[parseInt(id.replace('seed_', ''), 10)] : null) ||
          SEED_JOBS[0];
        setJob(seedJob ? { ...seedJob, id: seedJob.source_job_id || id } : null);
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [id]);

  const handleAnalyze = () => navigate(`/match-analysis?jobId=${id}`);

  // Helper to ensure we have a string to process
  const getDescriptionString = (value) => {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value.join('\n');
    return String(value);
  };

  // Format the description with light Markdown-like processing
  const formatDescription = (rawDesc) => {
    const desc = getDescriptionString(rawDesc);
    if (!desc.trim()) return [];

    const lines = desc.split('\n');
    const result = [];
    let currentBulletItems = [];

    const flushBulletList = () => {
      if (currentBulletItems.length > 0) {
        result.push(
          <ul className="space-y-1 pl-4 mb-4" key={`bullet-list-${result.length}`}>
            {currentBulletItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-indigo-400 mt-0.5">•</span> {item}
              </li>
            ))}
          </ul>
        );
        currentBulletItems = [];
      }
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === '') {
        flushBulletList();
        continue;
      }

      // Check for heading: **text** or **text:**
      const headingMatch = trimmed.match(/^\*\*(.+?)\*\*:?$/);
      if (headingMatch) {
        flushBulletList();
        result.push(
          <h4
            key={`heading-${result.length}`}
            className="font-bold text-slate-900 mb-2 mt-4"
          >
            {headingMatch[1].trim()}
          </h4>
        );
        continue;
      }

      // Check for bullet point: starts with •, -, or *
      const bulletMatch = trimmed.match(/^[•\-*]\s+(.*)/);
      if (bulletMatch) {
        currentBulletItems.push(bulletMatch[1]);
        continue;
      }

      // Otherwise, it's a paragraph line
      flushBulletList();
      result.push(
        <p
          key={`paragraph-${result.length}`}
          className="text-slate-700 leading-relaxed mb-4"
        >
          {trimmed}
        </p>
      );
    }

    // Flush any remaining bullet list
    flushBulletList();

    return result;
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="text-center py-20">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );

  if (!job)
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="text-center py-20 text-slate-400">Không tìm thấy việc làm.</div>
      </div>
    );

  const arrangement = job.work_arrangement || (job.remote ? 'remote' : 'onsite');
  const hasCV = getProfile() && (getMasterCV() || getProfile());

  const normalizeToArray = (value) => {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        // ignore
      }
      return [value]; // treat string as single item array
    }
    return []; // null, undefined, etc.
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 mb-4">
          <ArrowLeft className="w-4 h-4" /> Quay lại việc làm
        </Link>

        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
              <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                <Building2 className="w-4 h-4" /> {job.company}
              </div>
            </div>
            <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-semibold whitespace-nowrap">
              {job.job_type}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-slate-500 mb-4">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="font-medium text-slate-600">Địa điểm:</span> <span className="ml-1">{job.location}</span>
            </div>
            <div className="flex items-center gap-1">
              {arrangement === 'remote' ? <Wifi className="w-4 h-4 text-emerald-600" /> : arrangement === 'hybrid' ? <Users className="w-4 h-4 text-amber-600" /> : <Home className="w-4 h-4" />}
              <span className="font-medium text-slate-600">Hình thức làm việc:</span> <span className="ml-1">{WORK_ARRANGEMENT_LABELS[arrangement]}</span>
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              <span className="font-medium text-slate-600">Lĩnh vực:</span> <span className="ml-1">{job.field}</span>
            </div>
            {job.experience_level && (
              <div className="flex items-center gap-1">
                <GraduationCap className="w-4 h-4" />
                <span className="font-medium text-slate-600">Trình độ:</span> <span className="ml-1">{EXPERIENCE_LEVEL_LABELS[job.experience_level] || job.experience_level}</span>
              </div>
            )}
            {job.posted_at && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span className="font-medium text-slate-600">Đăng:</span> <span className="ml-1">{formatPostedDate(job.posted_at)}</span>
              </div>
            )}
          </div>

          {formatDescription(job.description).length > 0 ? (
            <>
              <h3 className="font-bold text-slate-900 mb-4">Mô tả công việc</h3>
              {formatDescription(job.description)}
            </>
          ) : null}

          {(() => {
            const reqArray = normalizeToArray(job.requirements);
            if (reqArray.length === 0) return null;
            return (
              <div className="mb-5">
                <h3 className="font-bold text-slate-900 mb-2">Yêu cầu</h3>
                <ul className="space-y-1.5">
                  {reqArray.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-indigo-400 mt-0.5">•</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}

          {(() => {
            const skillsArray = normalizeToArray(job.preferred_skills);
            if (skillsArray.length === 0) return null;
            return (
              <div className="mb-5">
                <h3 className="font-bold text-slate-900 mb-2">Kỹ năng ưu tiên</h3>
                <div className="flex flex-wrap gap-2">
                  {skillsArray.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-sm">{s}</span>
                  ))}
                </div>
              </div>
            );
          })()}

        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <button
            onClick={handleAnalyze}
            disabled={!hasCV}
            className="flex items-center justify-center gap-2 px-5 py-4 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-sm"
          >
            <Target className="w-5 h-5" /> Phân tích CV
          </button>
          <button
            onClick={handleAnalyze}
            disabled={!hasCV}
            className="flex items-center justify-center gap-2 px-5 py-4 rounded-xl bg-white border border-indigo-200 text-indigo-700 font-semibold hover:bg-indigo-50 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5" /> Điều chỉnh CV
          </button>
        </div>
        {!hasCV && (
          <p className="text-center text-sm text-slate-500 mt-3">
            Bạn cần hồ sơ và CV trước. <Link to="/profile" className="text-indigo-600 font-medium">Tạo hồ sơ →</Link>
          </p>
        )}
      </div>
    </div>
  );
}