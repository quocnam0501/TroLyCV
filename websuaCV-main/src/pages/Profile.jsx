import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Wrench,
  Users,
  Award,
  Trophy,
  Save,
  Check,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import SectionCard from '@/components/profile/SectionCard';
import ArrayEditor from '@/components/profile/ArrayEditor';
import SkillsInput from '@/components/profile/SkillsInput';
import PhotoUpload from '@/components/profile/PhotoUpload';
import { useAuth } from '@/lib/AuthContext';
import {
  getProfile as getLocalProfile,
  saveProfile as saveLocalProfile,
  loadSampleProfileForCurrentUser,
  getProfileCompleteness,
} from '@/utils/cvStorage';
import { toast } from '@/components/ui/use-toast';

const EMPTY = {
  personal: { fullName: '', email: '', phone: '', location: '', linkedin: '', portfolio: '', photoUrl: '' },
  education: [],
  experience: [],
  projects: [],
  skills: { technical: [], soft: [] },
  activities: [],
  certifications: [],
  achievements: [],
};

function isValidEmail(email) {
  return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPhone(phone) {
  if (!phone) return true;
  const cleaned = phone.replace(/[\s.-]/g, '');
  return /^(0[3|5|7|8|9])[0-9]{8}$/.test(cleaned);
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const localProfile = getLocalProfile();
      if (localProfile) {
        setProfile(localProfile);
      } else {
        const initial = { ...EMPTY };
        if (isAuthenticated && user?.email) {
          initial.personal = {
            ...initial.personal,
            email: user.email,
            fullName: user.user_metadata?.full_name || '',
          };
        }
        setProfile(initial);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile({ ...EMPTY });
    } finally {
      setLoading(false);
    }
  };

  const updatePersonal = (key, value) => {
    setProfile((prev) => {
      const base = prev || EMPTY;
      const updated = {
        ...base,
        personal: {
          ...base.personal,
          [key]: value,
        },
      };
      // Tự động lưu ngay khi cập nhật ảnh đại diện để đồng bộ tức thì sang Tạo CV
      if (key === 'photoUrl') {
        saveLocalProfile(updated);
        try {
          window.dispatchEvent(new Event('profileUpdated'));
        } catch {}
      }
      return updated;
    });
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const updateSkills = (key, value) => {
    setProfile((prev) => {
      const base = prev || EMPTY;
      return {
        ...base,
        skills: {
          ...base.skills,
          [key]: value,
        },
      };
    });
  };

  const validatePersonal = () => {
    const errs = {};
    const personal = profile?.personal || {};

    if (!personal.fullName || !personal.fullName.trim()) {
      errs.fullName = 'Họ và tên không được để trống.';
    }

    if (personal.email && !isValidEmail(personal.email)) {
      errs.email = 'Định dạng email không hợp lệ (vd: name@example.com).';
    }

    if (personal.phone && !isValidPhone(personal.phone)) {
      errs.phone = 'Số điện thoại Việt Nam chưa hợp lệ (gồm 10 số, bắt đầu bằng 03, 05, 07, 08, 09).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!profile) return;

    if (!validatePersonal()) {
      toast({
        title: 'Thông tin chưa hợp lệ',
        description: 'Vui lòng kiểm tra lại các trường được đánh dấu đỏ trước khi lưu.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      saveLocalProfile(profile);
      setSaved(true);
      toast({
        title: 'Lưu hồ sơ thành công!',
        description: 'Dữ liệu CV của bạn đã được cập nhật.',
      });
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu hồ sơ.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = () => {
    const updated = loadSampleProfileForCurrentUser();
    setProfile(updated);
    setErrors({});
    toast({
      title: 'Đã nạp dữ liệu mẫu!',
      description: 'Hồ sơ sinh viên IT mẫu chuẩn đã được tải vào hồ sơ của bạn.',
    });
  };

  const completeness = profile ? getProfileCompleteness(profile) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Hồ sơ sinh viên</h1>
            <p className="text-slate-500 text-sm mt-1">
              Điền tay đầy đủ thông tin để AI sinh CV chuẩn và đối chiếu sát với JD tuyển dụng.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors shadow-sm"
              title="Nạp nhanh dữ liệu sinh viên mẫu Bách Khoa để test web"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Dữ liệu mẫu
            </button>

            <div className="text-right pl-3 border-l border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Hoàn thiện</div>
              <div className="text-2xl font-bold text-indigo-600">{completeness}%</div>
            </div>
          </div>
        </div>

        {loading && <div className="text-center py-8 text-slate-500">Đang tải hồ sơ...</div>}

        {!loading && (
          <>
            <div className="space-y-4">
              <SectionCard title="Thông tin cá nhân" icon={User}>
                <div className="mb-4">
                  <PhotoUpload
                    photoUrl={profile?.personal?.photoUrl || ''}
                    onChange={(url) => updatePersonal('photoUrl', url)}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <TextField
                    label="Họ và tên"
                    required
                    value={profile?.personal?.fullName || ''}
                    onChange={(v) => updatePersonal('fullName', v)}
                    placeholder="Nguyễn Văn An"
                    error={errors.fullName}
                  />
                  <TextField
                    label="Email"
                    required
                    value={profile?.personal?.email || ''}
                    onChange={(v) => updatePersonal('email', v)}
                    placeholder="email@example.com"
                    error={errors.email}
                  />
                  <TextField
                    label="Số điện thoại"
                    value={profile?.personal?.phone || ''}
                    onChange={(v) => updatePersonal('phone', v)}
                    placeholder="0912 345 678"
                    error={errors.phone}
                  />
                  <TextField
                    label="Địa điểm / Khu vực"
                    value={profile?.personal?.location || ''}
                    onChange={(v) => updatePersonal('location', v)}
                    placeholder="Hà Nội, Việt Nam"
                  />
                  <TextField
                    label="LinkedIn"
                    value={profile?.personal?.linkedin || ''}
                    onChange={(v) => updatePersonal('linkedin', v)}
                    placeholder="linkedin.com/in/..."
                  />
                  <TextField
                    label="Portfolio / GitHub"
                    value={profile?.personal?.portfolio || ''}
                    onChange={(v) => updatePersonal('portfolio', v)}
                    placeholder="github.com/..."
                  />
                </div>
              </SectionCard>

              <SectionCard title="Học vấn" icon={GraduationCap}>
                <ArrayEditor
                  items={profile?.education || []}
                  onChange={(education) => setProfile((prev) => ({ ...(prev || EMPTY), education }))}
                  newItem={{ university: '', major: '', degree: '', expectedGraduation: '', gpa: '' }}
                  addLabel="Thêm học vấn"
                  renderItem={(item, update) => (
                    <div className="space-y-3 pr-8">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <TextField
                          label="Trường Đại học / Cao đẳng"
                          value={item.university}
                          onChange={(v) => update({ university: v })}
                          placeholder="Đại học Bách Khoa..."
                        />
                        <TextField
                          label="Chuyên ngành"
                          value={item.major}
                          onChange={(v) => update({ major: v })}
                          placeholder="Công nghệ Thông tin..."
                        />
                      </div>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <TextField
                          label="Bậc học"
                          value={item.degree}
                          onChange={(v) => update({ degree: v })}
                          placeholder="Cử nhân / Kỹ sư"
                        />
                        <TextField
                          label="Năm tốt nghiệp (dự kiến)"
                          value={item.expectedGraduation}
                          onChange={(v) => update({ expectedGraduation: v })}
                          placeholder="2026"
                        />
                        <TextField
                          label="GPA"
                          value={item.gpa}
                          onChange={(v) => update({ gpa: v })}
                          placeholder="3.6 / 4.0"
                        />
                      </div>
                    </div>
                  )}
                />
              </SectionCard>

              <SectionCard title="Kinh nghiệm làm việc" icon={Briefcase}>
                <ArrayEditor
                  items={profile?.experience || []}
                  onChange={(experience) => setProfile((prev) => ({ ...(prev || EMPTY), experience }))}
                  newItem={{ company: '', role: '', startDate: '', endDate: '', description: '' }}
                  addLabel="Thêm kinh nghiệm"
                  renderItem={(item, update) => (
                    <div className="space-y-3 pr-8">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <TextField
                          label="Công ty / Doanh nghiệp"
                          value={item.company}
                          onChange={(v) => update({ company: v })}
                          placeholder="FPT Software..."
                        />
                        <TextField
                          label="Vị trí / Chức danh"
                          value={item.role}
                          onChange={(v) => update({ role: v })}
                          placeholder="Thực tập sinh Frontend..."
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <TextField
                          label="Bắt đầu"
                          value={item.startDate}
                          onChange={(v) => update({ startDate: v })}
                          placeholder="06/2025"
                        />
                        <TextField
                          label="Kết thúc"
                          value={item.endDate}
                          onChange={(v) => update({ endDate: v })}
                          placeholder="09/2025 hoặc Hiện tại"
                        />
                      </div>
                      <TextAreaField
                        label="Mô tả công việc & Thành tựu"
                        value={item.description}
                        onChange={(v) => update({ description: v })}
                        placeholder="Nêu rõ công việc đã làm, công nghệ sử dụng và kết quả đạt được..."
                      />
                    </div>
                  )}
                />
              </SectionCard>

              <SectionCard title="Dự án tiêu biểu" icon={FolderGit2}>
                <ArrayEditor
                  items={profile?.projects || []}
                  onChange={(projects) => setProfile((prev) => ({ ...(prev || EMPTY), projects }))}
                  newItem={{ name: '', description: '', technologies: '', link: '' }}
                  addLabel="Thêm dự án"
                  renderItem={(item, update) => (
                    <div className="space-y-3 pr-8">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <TextField
                          label="Tên dự án"
                          value={item.name}
                          onChange={(v) => update({ name: v })}
                          placeholder="Web Quản lý tuyển dụng..."
                        />
                        <TextField
                          label="Công nghệ sử dụng"
                          value={item.technologies}
                          onChange={(v) => update({ technologies: v })}
                          placeholder="React, Node.js, TailwindCSS..."
                        />
                      </div>
                      <TextAreaField
                        label="Mô tả dự án & Đóng góp của bạn"
                        value={item.description}
                        onChange={(v) => update({ description: v })}
                        placeholder="Mục đích dự án, bài toán giải quyết, tính năng chính..."
                      />
                      <TextField
                        label="Link Demo / GitHub"
                        value={item.link}
                        onChange={(v) => update({ link: v })}
                        placeholder="github.com/..."
                      />
                    </div>
                  )}
                />
              </SectionCard>

              <SectionCard title="Kỹ năng chuyên môn & Kỹ năng mềm" icon={Wrench}>
                <div className="space-y-4">
                  <SkillsInput
                    label="Kỹ năng chuyên môn (Hard skills)"
                    skills={profile?.skills?.technical || []}
                    onChange={(skills) => updateSkills('technical', skills)}
                    placeholder="Gõ kỹ năng (vd: React, JavaScript, SQL) rồi nhấn Enter..."
                  />
                  <SkillsInput
                    label="Kỹ năng mềm (Soft skills)"
                    skills={profile?.skills?.soft || []}
                    onChange={(skills) => updateSkills('soft', skills)}
                    placeholder="Gõ kỹ năng mềm (vd: Làm việc nhóm, Giao tiếp) rồi nhấn Enter..."
                  />
                </div>
              </SectionCard>

              <SectionCard title="Hoạt động ngoại khóa & Câu lạc bộ" icon={Users}>
                <ArrayEditor
                  items={profile?.activities || []}
                  onChange={(activities) => setProfile((prev) => ({ ...(prev || EMPTY), activities }))}
                  newItem={{ organization: '', role: '', description: '' }}
                  addLabel="Thêm hoạt động"
                  renderItem={(item, update) => (
                    <div className="space-y-3 pr-8">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <TextField
                          label="Tổ chức / Câu lạc bộ"
                          value={item.organization}
                          onChange={(v) => update({ organization: v })}
                          placeholder="CLB Tin học Sinh viên..."
                        />
                        <TextField
                          label="Vai trò"
                          value={item.role}
                          onChange={(v) => update({ role: v })}
                          placeholder="Thành viên Ban Kỹ thuật..."
                        />
                      </div>
                      <TextAreaField
                        label="Mô tả đóng góp"
                        value={item.description}
                        onChange={(v) => update({ description: v })}
                        placeholder="Mô tả trách nhiệm hoặc sự kiện đã tham gia..."
                      />
                    </div>
                  )}
                />
              </SectionCard>

              <SectionCard title="Chứng chỉ" icon={Award}>
                <ArrayEditor
                  items={profile?.certifications || []}
                  onChange={(certifications) => setProfile((prev) => ({ ...(prev || EMPTY), certifications }))}
                  newItem={{ certificate: '', issuer: '', date: '', link: '' }}
                  addLabel="Thêm chứng chỉ"
                  renderItem={(item, update) => (
                    <div className="space-y-3 pr-8">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <TextField
                          label="Tên chứng chỉ"
                          value={item.certificate}
                          onChange={(v) => update({ certificate: v })}
                          placeholder="IELTS 7.5, AWS Cloud Practitioner..."
                        />
                        <TextField
                          label="Tổ chức cấp"
                          value={item.issuer}
                          onChange={(v) => update({ issuer: v })}
                          placeholder="Coursera, Meta, Google..."
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <TextField
                          label="Năm cấp"
                          value={item.date}
                          onChange={(v) => update({ date: v })}
                          placeholder="2025"
                        />
                        <TextField
                          label="Link xác thực"
                          value={item.link}
                          onChange={(v) => update({ link: v })}
                          placeholder="coursera.org/verify/..."
                        />
                      </div>
                    </div>
                  )}
                />
              </SectionCard>

              <SectionCard title="Giải thưởng & Thành tích" icon={Trophy}>
                <ArrayEditor
                  items={profile?.achievements || []}
                  onChange={(achievements) => setProfile((prev) => ({ ...(prev || EMPTY), achievements }))}
                  newItem={{ title: '', description: '' }}
                  addLabel="Thêm thành tích"
                  renderItem={(item, update) => (
                    <div className="space-y-3 pr-8">
                      <TextField
                        label="Tên giải thưởng / Học bổng"
                        value={item.title}
                        onChange={(v) => update({ title: v })}
                        placeholder="Học bổng Xuất sắc kỳ 1..."
                      />
                      <TextAreaField
                        label="Mô tả thành tích"
                        value={item.description}
                        onChange={(v) => update({ description: v })}
                        placeholder="Top 5% sinh viên có điểm số cao nhất..."
                      />
                    </div>
                  )}
                />
              </SectionCard>
            </div>

            <div className="sticky bottom-4 mt-6 flex justify-end">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                disabled={loading}
              >
                {saved ? (
                  <>
                    <Check className="w-5 h-5" /> Đã lưu thành công!
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" /> Lưu hồ sơ
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder, required, error }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-700 mb-1 block">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all ${
          error
            ? 'border-destructive bg-destructive/5 focus:ring-2 focus:ring-destructive/20'
            : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
        }`}
      />
      {error && <p className="text-xs text-destructive mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {error}</p>}
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-700 mb-1 block">{label}</label>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
      />
    </div>
  );
}