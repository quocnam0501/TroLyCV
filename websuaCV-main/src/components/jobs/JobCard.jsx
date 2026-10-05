import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Building2, Briefcase, ArrowRight, Clock, Wifi, Home, Users } from 'lucide-react';
import { WORK_ARRANGEMENT_LABELS, EXPERIENCE_LEVEL_LABELS, formatPostedDate } from '@/utils/seedJobs';

const WORK_ARRANGEMENT_ICONS = {
  onsite: Home,
  hybrid: Users,
  remote: Wifi,
};

const WORK_ARRANGEMENT_COLORS = {
  onsite: 'text-slate-600 bg-slate-50',
  hybrid: 'text-amber-700 bg-amber-50',
  remote: 'text-emerald-700 bg-emerald-50',
};

export default function JobCard({ job }) {
  const navigate = useNavigate();
  const arrangement = job.work_arrangement || (job.remote ? 'remote' : 'onsite');
  const ArrangementIcon = WORK_ARRANGEMENT_ICONS[arrangement] || Home;

  const handleCardClick = () => navigate(`/jobs/${job.id}`);

  return (
    <div
      onClick={handleCardClick}
      className="block bg-white rounded-xl border border-slate-200 p-5 hover:border-indigo-200 hover:shadow-lg transition-all group cursor-pointer flex flex-col min-w-0 overflow-hidden"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{job.title}</h3>
          <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{job.company}</span>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold whitespace-nowrap shrink-0">
          {job.job_type}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-3">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" /> {job.location}
        </span>
        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${WORK_ARRANGEMENT_COLORS[arrangement]}`}>
          <ArrangementIcon className="w-3 h-3" /> {WORK_ARRANGEMENT_LABELS[arrangement]}
        </span>
        {job.experience_level && (
          <span className="flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5" /> {EXPERIENCE_LEVEL_LABELS[job.experience_level] || job.experience_level}
          </span>
        )}
        {job.posted_at && (
          <span className="flex items-center gap-1 ml-auto">
            <Clock className="w-3.5 h-3.5" /> {formatPostedDate(job.posted_at)}
          </span>
        )}
      </div>

      <p className="text-sm text-slate-600 line-clamp-2 mb-3 flex-1">{job.description}</p>

      {(() => {
        // Normalize preferred_skills to an array
        let preferredSkills = [];
        if (job.preferred_skills) {
          if (Array.isArray(job.preferred_skills)) {
            preferredSkills = job.preferred_skills;
          } else if (typeof job.preferred_skills === 'string') {
            try {
              // Try to parse as JSON first (how we stored it in the database)
              const parsed = JSON.parse(job.preferred_skills);
              if (Array.isArray(parsed)) {
                preferredSkills = parsed;
              }
            } catch (e) {
              // If JSON parsing fails, treat as comma-separated string
              preferredSkills = job.preferred_skills
                .split(',')
                .map(skill => skill.trim())
                .filter(Boolean);
            }
          }
        }

        if (preferredSkills.length === 0) {
          return null;
        }

        return (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {preferredSkills.slice(0, 4).map((s, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs">{s}</span>
            ))}
            {preferredSkills.length > 4 && (
              <span className="px-2 py-0.5 text-xs text-slate-400">+{preferredSkills.length - 4}</span>
            )}
          </div>
        );
      })()}

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-sm font-medium text-indigo-600 group-hover:gap-2 transition-all flex items-center gap-1">
          Xem & Phân tích <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </div>
  );
}