import React from 'react';

export default function ModernTemplate({ profile, masterCV, photoUrl }) {
  const p = profile.personal || {};
  const summary = masterCV?.summary || '';
  const subtitle = [profile.education?.[0]?.major, profile.experience?.[0]?.role].filter(Boolean).join(' · ');

  const SideSection = ({ title, children }) => (
    <div className="mb-6">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-300 mb-3">{title}</h3>
      {children}
    </div>
  );

  const MainSection = ({ title, children }) => (
    <div className="mb-5">
      <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="w-1 h-4 rounded-full bg-indigo-600" />
        {title}
      </h3>
      {children}
    </div>
  );

  return (
    <div className="bg-white flex" style={{ width: '794px', minHeight: '1123px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Sidebar */}
      <div className="w-[270px] bg-gradient-to-b from-indigo-700 to-indigo-900 text-white p-7">
        {photoUrl && (
          <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-6 ring-4 ring-white/20 shadow-lg">
            <img src={photoUrl} alt={p.fullName} className="w-full h-full object-cover" />
          </div>
        )}

        <SideSection title="Liên hệ">
          <div className="space-y-2 text-[12px] text-indigo-100">
            {p.email && <div className="break-all">{p.email}</div>}
            {p.phone && <div>{p.phone}</div>}
            {p.location && <div>{p.location}</div>}
            {p.linkedin && <div className="break-all">{p.linkedin}</div>}
            {p.portfolio && <div className="break-all">{p.portfolio}</div>}
          </div>
        </SideSection>

        {(profile.skills?.technical?.length > 0 || profile.skills?.soft?.length > 0) && (
          <SideSection title="Kỹ năng">
            {profile.skills?.technical?.length > 0 && (
              <div className="mb-3">
                <div className="text-[10px] text-indigo-300 mb-1.5 font-medium">Kỹ thuật</div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.technical.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white/15 text-[11px] font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {profile.skills?.soft?.length > 0 && (
              <div>
                <div className="text-[10px] text-indigo-300 mb-1.5 font-medium">Mềm</div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.soft.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white/15 text-[11px] font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </SideSection>
        )}

        {(profile.activities || []).length > 0 && (
          <SideSection title="Hoạt động">
            <div className="space-y-3">
              {profile.activities.map((a, i) => (
                <div key={i}>
                  <div className="text-[12px] font-semibold text-white">{a.role}</div>
                  <div className="text-[11px] text-indigo-200">{a.organization}</div>
                  {a.description && <div className="text-[11px] text-indigo-100 mt-0.5 leading-relaxed">{a.description}</div>}
                </div>
              ))}
            </div>
          </SideSection>
        )}

        {(profile.certifications || []).length > 0 && (
          <SideSection title="Chứng chỉ">
            <div className="space-y-2">
              {profile.certifications.map((c, i) => (
                <div key={i}>
                  <div className="text-[12px] font-semibold text-white">{c.certificate}</div>
                  <div className="text-[11px] text-indigo-200">{c.issuer}{c.date && ` · ${c.date}`}</div>
                </div>
              ))}
            </div>
          </SideSection>
        )}
      </div>

      {/* Main */}
      <div className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-[32px] font-bold text-slate-900 leading-tight">{p.fullName || 'Tên của bạn'}</h1>
          {subtitle && <div className="text-[14px] text-indigo-600 font-medium mt-1">{subtitle}</div>}
        </div>

        {summary && (
          <MainSection title="Tóm tắt">
            <p className="text-[13px] text-slate-700 leading-relaxed">{summary}</p>
          </MainSection>
        )}

        {(profile.experience || []).length > 0 && (
          <MainSection title="Kinh nghiệm">
            <div className="space-y-4">
              {profile.experience.map((e, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline">
                    <div className="font-semibold text-slate-900 text-[14px]">{e.role}</div>
                    <div className="text-[11px] text-slate-500 whitespace-nowrap ml-2">{e.startDate} — {e.endDate || 'Hiện tại'}</div>
                  </div>
                  <div className="text-[12px] text-indigo-600 font-medium mb-1">{e.company}</div>
                  {e.description && <p className="text-[12px] text-slate-600 leading-relaxed">{e.description}</p>}
                </div>
              ))}
            </div>
          </MainSection>
        )}

        {(profile.education || []).length > 0 && (
          <MainSection title="Học vấn">
            <div className="space-y-3">
              {profile.education.map((e, i) => (
                <div key={i}>
                  <div className="font-semibold text-slate-900 text-[14px]">{e.university}</div>
                  <div className="text-[12px] text-slate-600">{[e.degree, e.major].filter(Boolean).join(' · ')}</div>
                  {e.expectedGraduation && <div className="text-[11px] text-slate-500">{e.expectedGraduation}{e.gpa && ` · GPA: ${e.gpa}`}</div>}
                </div>
              ))}
            </div>
          </MainSection>
        )}

        {(profile.projects || []).length > 0 && (
          <MainSection title="Dự án">
            <div className="space-y-3">
              {profile.projects.map((pr, i) => (
                <div key={i}>
                  <div className="font-semibold text-slate-900 text-[14px]">{pr.name}</div>
                  {pr.description && <p className="text-[12px] text-slate-600 leading-relaxed">{pr.description}</p>}
                  {pr.technologies && <div className="text-[11px] text-slate-500 mt-0.5">Công nghệ: {pr.technologies}</div>}
                  {pr.link && <div className="text-[11px] text-indigo-600 mt-0.5 break-all">{pr.link}</div>}
                </div>
              ))}
            </div>
          </MainSection>
        )}

        {(profile.achievements || []).length > 0 && (
          <MainSection title="Thành tích">
            <div className="space-y-2">
              {profile.achievements.map((a, i) => (
                <div key={i}>
                  <div className="font-semibold text-slate-900 text-[14px]">{a.title}</div>
                  {a.description && <p className="text-[12px] text-slate-600 leading-relaxed">{a.description}</p>}
                </div>
              ))}
            </div>
          </MainSection>
        )}
      </div>
    </div>
  );
}