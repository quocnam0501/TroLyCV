import React from 'react';

export default function MinimalTemplate({ profile, masterCV, photoUrl }) {
  const p = profile?.personal || {};
  const effectivePhotoUrl = photoUrl || p.photoUrl || '';
  const summary = masterCV?.summary || '';

  const Section = ({ title, children }) => (
    <div className="mb-6">
      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 pb-1.5 border-b border-slate-200">
        {title}
      </h3>
      {children}
    </div>
  );

  const contactItems = [p.email, p.phone, p.location, p.linkedin, p.portfolio].filter(Boolean);

  return (
    <div className="bg-white" style={{ width: '794px', minHeight: '1123px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div className="px-14 py-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-[36px] font-light text-slate-900 leading-tight tracking-tight">{p.fullName || 'Tên của bạn'}</h1>
            {contactItems.length > 0 && (
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-[12px] text-slate-500">
                {contactItems.map((item, i) => (
                  <span key={i} className="break-all">
                    {i > 0 && <span className="text-slate-300 mr-3">·</span>}
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
          {effectivePhotoUrl && (
            <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 ml-6 ring-2 ring-slate-200 shadow-md">
              <img src={effectivePhotoUrl} alt={p.fullName || 'Ảnh đại diện'} className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {summary && (
          <Section title="Tóm tắt">
            <p className="text-[13px] text-slate-700 leading-relaxed">{summary}</p>
          </Section>
        )}

        {(profile.experience || []).length > 0 && (
          <Section title="Kinh nghiệm">
            <div className="space-y-4">
              {profile.experience.map((e, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline">
                    <div className="font-medium text-slate-900 text-[14px]">{e.role}</div>
                    <div className="text-[11px] text-slate-400 whitespace-nowrap ml-2">{e.startDate} — {e.endDate || 'Hiện tại'}</div>
                  </div>
                  <div className="text-[12px] text-slate-500 mb-1">{e.company}</div>
                  {e.description && <p className="text-[12px] text-slate-600 leading-relaxed">{e.description}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {(profile.education || []).length > 0 && (
          <Section title="Học vấn">
            <div className="space-y-3">
              {profile.education.map((e, i) => (
                <div key={i}>
                  <div className="font-medium text-slate-900 text-[14px]">{e.university}</div>
                  <div className="text-[12px] text-slate-500">{[e.degree, e.major].filter(Boolean).join(' · ')}</div>
                  {e.expectedGraduation && <div className="text-[11px] text-slate-400">{e.expectedGraduation}{e.gpa && ` · GPA: ${e.gpa}`}</div>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {(profile.projects || []).length > 0 && (
          <Section title="Dự án">
            <div className="space-y-3">
              {profile.projects.map((pr, i) => (
                <div key={i}>
                  <div className="font-medium text-slate-900 text-[14px]">{pr.name}</div>
                  {pr.description && <p className="text-[12px] text-slate-600 leading-relaxed">{pr.description}</p>}
                  {pr.technologies && <div className="text-[11px] text-slate-400 mt-0.5">Công nghệ: {pr.technologies}</div>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {(profile.skills?.technical?.length > 0 || profile.skills?.soft?.length > 0) && (
          <Section title="Kỹ năng">
            {profile.skills?.technical?.length > 0 && (
              <div className="mb-2 text-[13px]">
                <span className="font-medium text-slate-900">Kỹ thuật: </span>
                <span className="text-slate-600">{profile.skills.technical.join(', ')}</span>
              </div>
            )}
            {profile.skills?.soft?.length > 0 && (
              <div className="text-[13px]">
                <span className="font-medium text-slate-900">Mềm: </span>
                <span className="text-slate-600">{profile.skills.soft.join(', ')}</span>
              </div>
            )}
          </Section>
        )}

        {(profile.activities || []).length > 0 && (
          <Section title="Hoạt động">
            <div className="space-y-2">
              {profile.activities.map((a, i) => (
                <div key={i}>
                  <div className="font-medium text-slate-900 text-[14px]">{a.role} <span className="text-slate-400 font-normal">— {a.organization}</span></div>
                  {a.description && <p className="text-[12px] text-slate-600">{a.description}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {(profile.certifications || []).length > 0 && (
          <Section title="Chứng chỉ">
            <div className="space-y-1.5">
              {profile.certifications.map((c, i) => (
                <div key={i} className="text-[13px]">
                  <span className="font-medium text-slate-900">{c.certificate}</span>
                  <span className="text-slate-500"> — {c.issuer}{c.date && ` · ${c.date}`}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {(profile.achievements || []).length > 0 && (
          <Section title="Thành tích">
            <div className="space-y-2">
              {profile.achievements.map((a, i) => (
                <div key={i}>
                  <div className="font-medium text-slate-900 text-[14px]">{a.title}</div>
                  {a.description && <p className="text-[12px] text-slate-600">{a.description}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}