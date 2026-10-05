const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Briefcase, SlidersHorizontal, X } from 'lucide-react';

import Navbar from '@/components/Navbar';
import JobCard from '@/components/jobs/JobCard';
import { SEED_JOBS, WORK_ARRANGEMENT_LABELS, EXPERIENCE_LEVEL_LABELS } from '@/utils/seedJobs';
import { publicApiGet } from '@/lib/api';

const JOB_TYPES = ['Internship', 'Full-time', 'Part-time'];
const WORK_ARRANGEMENTS = ['onsite', 'hybrid', 'remote'];
const EXPERIENCE_LEVELS = ['Intern', 'Entry', 'Junior', 'Mid', 'Senior'];

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fieldFilter, setFieldFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [arrangementFilter, setArrangementFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');

  useEffect(() => {
    async function loadJobs() {
      try {
        const apiJobs = await publicApiGet('jobs');
        if (apiJobs && apiJobs.length > 0) {
          setJobs(apiJobs);
        } else {
          // Fallback to seed data with stable IDs
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
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  const fields = useMemo(() => [...new Set(jobs.map((j) => j.field).filter(Boolean))].sort(), [jobs]);
  const locations = useMemo(() => [...new Set(jobs.map((j) => j.location).filter(Boolean))].sort(), [jobs]);

  const filtered = useMemo(() => jobs.filter((j) => {
    const matchSearch =
      !search ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.description.toLowerCase().includes(search.toLowerCase());
    const matchField = !fieldFilter || j.field === fieldFilter;
    const matchLocation = !locationFilter || j.location === locationFilter;
    const arrangement = j.work_arrangement || (j.remote ? 'remote' : 'onsite');
    const matchArrangement = !arrangementFilter || arrangement === arrangementFilter;
    const matchJobType = !jobTypeFilter || j.job_type === jobTypeFilter;
    const matchExperience = !experienceFilter || j.experience_level === experienceFilter;
    return matchSearch && matchField && matchLocation && matchArrangement && matchJobType && matchExperience;
  }), [jobs, search, fieldFilter, locationFilter, arrangementFilter, jobTypeFilter, experienceFilter]);

  const activeFilterCount = [fieldFilter, locationFilter, arrangementFilter, jobTypeFilter, experienceFilter].filter(Boolean).length;

  const clearAllFilters = () => {
    setFieldFilter('');
    setLocationFilter('');
    setArrangementFilter('');
    setJobTypeFilter('');
    setExperienceFilter('');
    setSearch('');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Khám phá việc làm</h1>
          <p className="text-slate-500 text-sm mt-1">Duyệt cơ hội thực tập và việc làm, hoặc dán mô tả công việc của bạn.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm việc, công ty, kỹ năng..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>
          <Link
            to="/match-analysis"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-all"
          >
            <Briefcase className="w-4 h-4" /> Dán mô tả công việc
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-700">
            <SlidersHorizontal className="w-4 h-4" /> Bộ lọc
            {activeFilterCount > 0 && (
              <button onClick={clearAllFilters} className="ml-auto flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-red-500">
                <X className="w-3.5 h-3.5" /> Xóa bộ lọc ({activeFilterCount})
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <select value={fieldFilter} onChange={(e) => setFieldFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:border-indigo-500 outline-none">
              <option value="">Tất cả lĩnh vực</option>
              {fields.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:border-indigo-500 outline-none">
              <option value="">Tất cả địa điểm</option>
              {locations.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <select value={arrangementFilter} onChange={(e) => setArrangementFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:border-indigo-500 outline-none">
              <option value="">Tất cả hình thức</option>
              {WORK_ARRANGEMENTS.map((a) => <option key={a} value={a}>{WORK_ARRANGEMENT_LABELS[a]}</option>)}
            </select>
            <select value={jobTypeFilter} onChange={(e) => setJobTypeFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:border-indigo-500 outline-none">
              <option value="">Tất cả loại hình</option>
              {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={experienceFilter} onChange={(e) => setExperienceFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:border-indigo-500 outline-none">
              <option value="">Tất cả cấp bậc</option>
              {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{EXPERIENCE_LEVEL_LABELS[l]}</option>)}
            </select>
          </div>
        </div>

        <div className="mb-4 text-sm text-slate-500">
          {loading ? 'Đang tải...' : `${filtered.length} việc làm`}
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
            Đang tải việc làm...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>Không có việc làm phù hợp bộ lọc.</p>
            {activeFilterCount > 0 && (
              <button onClick={clearAllFilters} className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                Xóa bộ lọc và xem tất cả
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((job, i) => <JobCard key={job.id || i} job={job} />)}
          </div>
        )}
      </div>
    </div>
  );
}
