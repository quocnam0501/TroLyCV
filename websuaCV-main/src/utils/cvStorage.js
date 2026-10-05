const BASE_STORAGE_KEY = 'cvapp_data_v2';

export const SAMPLE_PROFILE = {
  personal: {
    fullName: 'Nguyễn Văn An',
    email: 'nguyenvanan.it@gmail.com',
    phone: '0912 345 678',
    location: 'Hà Nội, Việt Nam',
    linkedin: 'https://linkedin.com/in/nguyenvanan-tech',
    portfolio: 'https://github.com/nguyenvanan',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  },
  education: [
    {
      university: 'Đại học Bách Khoa Hà Nội',
      major: 'Công nghệ Thông tin / Khoa học Máy tính',
      degree: 'Cử nhân',
      expectedGraduation: '2026',
      gpa: '3.6 / 4.0',
    },
  ],
  experience: [
    {
      company: 'FPT Software',
      role: 'Thực tập sinh Frontend Developer',
      startDate: '06/2025',
      endDate: '09/2025',
      description: 'Tham gia phát triển giao diện Web Portal nội bộ bằng ReactJS và TailwindCSS. Tối ưu hiệu năng tải trang giảm 25% thời gian render, phối hợp làm việc nhóm theo mô hình Agile/Scrum.',
    },
  ],
  projects: [
    {
      name: 'Hệ thống Quản lý Tuyển dụng & Matching CV',
      description: 'Xây dựng web app hỗ trợ ứng viên phân tích JD và gợi ý kỹ năng còn thiếu. Tích hợp thuật toán matching từ khóa và xuất PDF tự động.',
      technologies: 'React, Node.js, TailwindCSS, REST API',
      link: 'https://github.com/nguyenvanan/cv-matching-system',
    },
    {
      name: 'E-Commerce Mini Platform',
      description: 'Dự án môn học: Xây dựng website bán hàng trực tuyến với giỏ hàng, xác thực người dùng và dashboard phân tích đơn hàng.',
      technologies: 'React, TypeScript, Redux Toolkit',
      link: 'https://github.com/nguyenvanan/ecommerce-mini',
    },
  ],
  skills: {
    technical: ['JavaScript', 'TypeScript', 'ReactJS', 'HTML5/CSS3', 'TailwindCSS', 'Git', 'RESTful API', 'SQL', 'Python'],
    soft: ['Làm việc nhóm', 'Giao tiếp', 'Tư duy giải quyết vấn đề', 'Quản lý thời gian', 'Tự học và nghiên cứu công nghệ mới'],
  },
  activities: [
    {
      organization: 'CLB Tin học Sinh viên Bách Khoa',
      role: 'Thành viên Ban Kỹ thuật',
      description: 'Hỗ trợ tổ chức workshop lập trình web cho hơn 200 tân sinh viên, tham gia ban tổ chức Hackathon thường niên.',
    },
  ],
  certifications: [
    {
      certificate: 'Meta Front-End Developer Professional Certificate',
      issuer: 'Coursera / Meta',
      date: '2025',
      link: 'https://coursera.org/verify/meta-frontend',
    },
  ],
  achievements: [
    {
      title: 'Học bổng Khuyến khích Học tập loại Xuất sắc kỳ 1 & 2',
      description: 'Đạt thành tích học tập trong top 5% toàn khoa Công nghệ Thông tin.',
    },
  ],
};

function getCurrentSessionUser() {
  try {
    const raw = localStorage.getItem('trolycv_demo_session');
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function getUserStorageKey() {
  const session = getCurrentSessionUser();
  if (session?.email) {
    const clean = session.email.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `${BASE_STORAGE_KEY}_${clean}`;
  }
  return `${BASE_STORAGE_KEY}_guest`;
}

function createDefaultDataForUser(user) {
  const isDemo = !user || user.email === 'sinhvien.demo@trolycv.vn';

  if (isDemo) {
    return {
      profile: { ...SAMPLE_PROFILE },
      masterCV: {
        type: 'profile',
        summary: 'Sinh viên năm cuối ngành Công nghệ Thông tin tại ĐH Bách Khoa Hà Nội với định hướng phát triển Frontend / Fullstack Web. Đã có kinh nghiệm thực tập thực tế, làm chủ React, TypeScript và các công cụ phát triển hiện đại.',
        template: 'modern',
        updated_date: new Date().toISOString(),
      },
      cvVersions: [
        {
          id: 'cvv_sample_1',
          targetJob: 'Thực tập sinh Frontend (ReactJS)',
          targetCompany: 'VNG Corporation',
          matchScore: 82,
          created_date: new Date(Date.now() - 86400000 * 2).toISOString(),
          content: '# CV - Nguyễn Văn An\n\nỨng tuyển: Thực tập sinh Frontend (ReactJS) - VNG Corporation\n\n- Kỹ năng phù hợp: ReactJS, JavaScript, TailwindCSS, Git\n- Kinh nghiệm: Thực tập sinh Frontend tại FPT Software\n- Dự án: Hệ thống Quản lý Tuyển dụng & Matching CV',
        },
      ],
      jobMatches: [],
    };
  }

  // Tài khoản người dùng đăng ký thật: Khởi tạo hồ sơ sạch với đúng họ tên và email của họ
  const fullName = user.user_metadata?.full_name || user.email.split('@')[0];
  return {
    profile: {
      personal: {
        fullName: fullName,
        email: user.email,
        phone: '',
        location: '',
        linkedin: '',
        portfolio: '',
        photoUrl: '',
      },
      education: [],
      experience: [],
      projects: [],
      skills: { technical: [], soft: [] },
      activities: [],
      certifications: [],
      achievements: [],
    },
    masterCV: {
      type: 'profile',
      summary: `Hồ sơ ứng viên của ${fullName}. Sẵn sàng học hỏi và phát triển chuyên môn trong môi trường doanh nghiệp năng động.`,
      template: 'modern',
      updated_date: new Date().toISOString(),
    },
    cvVersions: [],
    jobMatches: [],
  };
}

function getAppData() {
  const key = getUserStorageKey();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      const user = getCurrentSessionUser();
      const def = createDefaultDataForUser(user);
      localStorage.setItem(key, JSON.stringify(def));
      return def;
    }
    return JSON.parse(raw);
  } catch {
    const user = getCurrentSessionUser();
    return createDefaultDataForUser(user);
  }
}

function saveAppData(data) {
  const key = getUserStorageKey();
  localStorage.setItem(key, JSON.stringify(data));
}

// ===== Profile =====
export function getProfile() {
  return getAppData().profile;
}

export function saveProfile(profile) {
  const data = getAppData();
  data.profile = { ...profile, updated_date: new Date().toISOString() };
  saveAppData(data);
}

export function loadSampleProfileForCurrentUser() {
  const data = getAppData();
  const currentPersonal = data.profile?.personal || {};
  // Giữ lại Họ tên và Email của người dùng hiện tại, nạp các dữ liệu mẫu khác
  data.profile = {
    ...SAMPLE_PROFILE,
    personal: {
      ...SAMPLE_PROFILE.personal,
      fullName: currentPersonal.fullName || SAMPLE_PROFILE.personal.fullName,
      email: currentPersonal.email || SAMPLE_PROFILE.personal.email,
    },
  };
  saveAppData(data);
  return data.profile;
}

export function getProfileCompleteness(profile) {
  if (!profile) return 0;
  const checks = [
    profile.personal?.fullName,
    profile.personal?.email,
    profile.personal?.phone,
    profile.personal?.location,
    profile.education?.length > 0,
    profile.experience?.length > 0 || profile.projects?.length > 0,
    profile.projects?.length > 0,
    profile.skills?.technical?.length > 0,
    profile.skills?.soft?.length > 0,
    profile.activities?.length > 0,
    profile.certifications?.length > 0 || profile.achievements?.length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

// ===== Master CV =====
export function getMasterCV() {
  return getAppData().masterCV;
}

export function saveMasterCV(cv) {
  const data = getAppData();
  data.masterCV = { ...cv, updated_date: new Date().toISOString() };
  saveAppData(data);
}

// ===== CV Versions =====
export function getCVVersions() {
  return getAppData().cvVersions || [];
}

export function addCVVersion(version) {
  const data = getAppData();
  const newVersion = {
    ...version,
    id: `cvv_${Date.now()}`,
    created_date: new Date().toISOString(),
  };
  if (!data.cvVersions) data.cvVersions = [];
  data.cvVersions.push(newVersion);
  saveAppData(data);
  return newVersion;
}

export function deleteCVVersion(id) {
  const data = getAppData();
  data.cvVersions = (data.cvVersions || []).filter((v) => v.id !== id);
  saveAppData(data);
}

// ===== Job Matches =====
export function getJobMatches() {
  return getAppData().jobMatches || [];
}

export function addJobMatch(match) {
  const data = getAppData();
  const newMatch = {
    ...match,
    id: `jm_${Date.now()}`,
    created_date: new Date().toISOString(),
  };
  if (!data.jobMatches) data.jobMatches = [];
  data.jobMatches.push(newMatch);
  saveAppData(data);
  return newMatch;
}

// ===== Helper chuyển đổi Profile sang Text cho AI / Engine =====
export function profileToText(p) {
  if (!p) return '';
  const lines = [];
  const pers = p.personal || {};

  lines.push(`# ${pers.fullName || 'ỨNG VIÊN'}`);
  const contact = [pers.email, pers.phone, pers.location, pers.linkedin, pers.portfolio].filter(Boolean);
  if (contact.length > 0) lines.push(contact.join(' | '));
  lines.push('');

  const masterCV = getMasterCV();
  if (masterCV?.summary) {
    lines.push('## MỤC TIÊU NGHỀ NGHIỆP');
    lines.push(masterCV.summary);
    lines.push('');
  }

  if (p.education?.length > 0) {
    lines.push('## HỌC VẤN');
    p.education.forEach((e) => {
      lines.push(`- **${e.university || ''}** | ${e.major || ''} (${e.degree || ''})`);
      const details = [];
      if (e.expectedGraduation) details.push(`Tốt nghiệp: ${e.expectedGraduation}`);
      if (e.gpa) details.push(`GPA: ${e.gpa}`);
      if (details.length > 0) lines.push(`  ${details.join(' | ')}`);
    });
    lines.push('');
  }

  if (p.skills?.technical?.length > 0 || p.skills?.soft?.length > 0) {
    lines.push('## KỸ NĂNG');
    if (p.skills.technical?.length > 0) {
      lines.push(`- Kỹ năng chuyên môn: ${p.skills.technical.join(', ')}`);
    }
    if (p.skills.soft?.length > 0) {
      lines.push(`- Kỹ năng mềm: ${p.skills.soft.join(', ')}`);
    }
    lines.push('');
  }

  if (p.experience?.length > 0) {
    lines.push('## KINH NGHIỆM LÀM VIỆC');
    p.experience.forEach((exp) => {
      lines.push(`### ${exp.role || ''} - ${exp.company || ''}`);
      if (exp.startDate || exp.endDate) {
        lines.push(`*Thời gian: ${exp.startDate || ''} - ${exp.endDate || 'Hiện tại'}*`);
      }
      if (exp.description) lines.push(exp.description);
      lines.push('');
    });
  }

  if (p.projects?.length > 0) {
    lines.push('## DỰ ÁN TIÊU BIỂU');
    p.projects.forEach((proj) => {
      lines.push(`### ${proj.name || ''}`);
      if (proj.technologies) lines.push(`*Công nghệ: ${proj.technologies}*`);
      if (proj.description) lines.push(proj.description);
      if (proj.link) lines.push(`*Link: ${proj.link}*`);
      lines.push('');
    });
  }

  if (p.activities?.length > 0) {
    lines.push('## HOẠT ĐỘNG NGOẠI KHÓA');
    p.activities.forEach((act) => {
      lines.push(`- **${act.organization || ''}** (${act.role || ''}): ${act.description || ''}`);
    });
    lines.push('');
  }

  if (p.certifications?.length > 0) {
    lines.push('## CHỨNG CHỈ');
    p.certifications.forEach((c) => {
      lines.push(`- ${c.certificate || ''} - ${c.issuer || ''} (${c.date || ''})`);
    });
    lines.push('');
  }

  if (p.achievements?.length > 0) {
    lines.push('## GIẢI THƯỞNG & THÀNH TÍCH');
    p.achievements.forEach((a) => {
      lines.push(`- ${a.title || ''}: ${a.description || ''}`);
    });
    lines.push('');
  }

  return lines.join('\n');
}

export function getCVText() {
  const masterCV = getMasterCV();
  if (masterCV?.type === 'uploaded' && masterCV?.content && masterCV.content.trim().length > 20) {
    return masterCV.content;
  }
  const p = getProfile();
  return profileToText(p);
}