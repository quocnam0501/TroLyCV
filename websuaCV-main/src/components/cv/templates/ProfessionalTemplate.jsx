import React from 'react';

export default function ProfessionalTemplate({ profile, masterCV, photoUrl }) {
  const p = profile.personal || {};
  const summary = masterCV?.summary || '';

  const Section = ({ title, children }) => (
    <div className="mb-5">
      <h3 className="text-[14px] font-bold text-slate-800 uppercase tracking-wider mb-3 pb-1.5 border-b-2 border-slate-700">
        {title}
      </h3>
      {children}
    </div>
  );

  const contactItems = [p.email, p.phone, p.location, p.linkedin, p.portfolio].filter(Boolean);

  return (
    <div className="bg-white" style={{ width: '794px', minHeight: '1123px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div className="bg-slate-800 px-10 py-8 flex items-center justify-between">
        <div>
          <h1 className="text-[30px] font-bold text-white leading-tight">{p.fullName || 'Tên của bạn'}</h1>
          {contactItems.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[12px] text-slate-300">
              {contactItems.map((item, i) => (
                <span key={i} className="break-all">{item}</span>
              ))}
            </div>
          )}
        </div>
        {photoUrl && (
          <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 ml-6 border-2 border-slate-600 shadow-lg">
            <img src={photoUrl} alt={p.fullName} className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div className="px-10 py-8">
        {summary && (
          <Section title="Tóm tắt chuyên môn">
            <p className="text-[13px] text-slate-700 leading-relaxed">{summary}</p>
          </Section>
        )}

        {(profile.experience || []).length > 0 && (
          <Section title="Kinh nghiệm làm việc">
            <div className="space-y-4">
              {profile.experience.map((e, i) => (
                <div key={i} className="pl-4 border-l-2 border-slate-300">
                  <div className="flex justify-between items-baseline">
                    <div className="font-bold text-slate-900 text-[14px]">{e.role}</div>
                    <div className="text-[11px] text-slate-500 whitespace-nowrap ml-2">{e.startDate} — {e.endDate || 'Hiện tại'}</div>
                  </div>
                  <div className="text-[12px] text-slate-600 font-medium mb-1">{e.company}</div>
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
                <div key={i} className="pl-4 border-l-2 border-slate-300">
                  <div className="font-bold text-slate-900 text-[14px]">{e.university}</div>
                  <div className="text-[12px] text-slate-600">{[e.degree, e.major].filter(Boolean).join(' · ')}</div>
                  {e.expectedGraduation && <div className="text-[11px] text-slate-500">{e.expectedGraduation}{e.gpa && ` · GPA: ${e.gpa}`}</div>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {(profile.projects || []).length > 0 && (
          <Section title="Dự án">
            <div className="space-y-3">
              {profile.projects.map((pr, i) => (
                <div key={i} className="pl-4 border-l-2 border-slate-300">
                  <div className="font-bold text-slate-900 text-[14px]">{pr.name}</div>
                  {pr.description && <p className="text-[12px] text-slate-600 leading-relaxed">{pr.description}</p>}
                  {pr.technologies && <div className="text-[11px] text-slate-500 mt-0.5">Công nghệ: {pr.technologies}</div>}
                  {pr.link && <div className="text-[11px] text-indigo-600 mt-0.5 break-all">{pr.link}</div>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {(profile.skills?.technical?.length > 0 || profile.skills?.soft?.length > 0) && (
          <Section title="Kỹ năng">
            {profile.skills?.technical?.length > 0 && (
              <div className="mb-2">
                <div className="text-[12px] font-semibold text-slate-700 mb-1.5">Kỹ thuật</div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.technical.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-[12px] font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {profile.skills?.soft?.length > 0 && (
              <div>
                <div className="text-[12px] font-semibold text-slate-700 mb-1.5">Kỹ năng mềm</div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.soft.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-[12px] font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </Section>
        )}

        {(profile.activities || []).length > 0 && (
          <Section title="Hoạt động">
            <div className="space-y-2">
              {profile.activities.map((a, i) => (
                <div key={i} className="pl-4 border-l-2 border-slate-300">
                  <div className="font-bold text-slate-900 text-[14px]">{a.role} <span className="text-slate-500 font-normal">— {a.organization}</span></div>
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
                  <span className="font-bold text-slate-900">{c.certificate}</span>
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
                <div key={i} className="pl-4 border-l-2 border-slate-300">
                  <div className="font-bold text-slate-900 text-[14px]">{a.title}</div>
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