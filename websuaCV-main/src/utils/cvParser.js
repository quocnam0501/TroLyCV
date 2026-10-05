/**
 * Bộ phân tích và trích xuất thông tin có cấu trúc từ văn bản CV (PDF / TXT / DOCX)
 * Hỗ trợ bóc tách chi tiết:
 * 1. Thông tin cá nhân (Họ tên, Email, Số điện thoại, Địa chỉ, LinkedIn, GitHub/Portfolio)
 * 2. Học vấn (Trường Đại học, Chuyên ngành thực tế, Bậc học, Niên khóa/Năm tốt nghiệp, GPA)
 * 3. Kỹ năng chuyên môn & kỹ năng mềm
 * 4. Kinh nghiệm làm việc & Dự án
 * 5. Mục tiêu nghề nghiệp
 */

// Danh sách từ khóa kỹ năng phổ biến để tự động nhận diện
const COMMON_TECH_SKILLS = [
  'JavaScript', 'TypeScript', 'ReactJS', 'React', 'Vue', 'VueJS', 'Angular', 'Next.js', 'Node.js',
  'HTML5', 'CSS3', 'HTML', 'CSS', 'TailwindCSS', 'Bootstrap', 'Sass', 'SCSS',
  'Python', 'Django', 'Flask', 'FastAPI', 'Java', 'Spring Boot', 'Spring', 'C#', '.NET', 'ASP.NET',
  'C++', 'C', 'PHP', 'Laravel', 'Go', 'Golang', 'Rust', 'Ruby', 'Ruby on Rails',
  'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'SQLite',
  'Git', 'GitHub', 'GitLab', 'Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Azure', 'GCP',
  'RESTful API', 'REST API', 'GraphQL', 'Linux', 'Figma', 'Postman', 'Jira',
  'Excel', 'PowerPoint', 'Word', 'Power BI', 'Tableau', 'SPSS', 'Google Analytics',
  'SEO', 'Content Writing', 'Copywriting', 'Canva', 'Photoshop', 'Illustrator',
  'Kế toán', 'MISA', 'FAST', 'Tài chính', 'Thuế', 'Logistics', 'Xuất nhập khẩu'
];

const COMMON_SOFT_SKILLS = [
  'Làm việc nhóm', 'Giao tiếp', 'Thuyết trình', 'Giải quyết vấn đề', 'Tư duy phản biện',
  'Quản lý thời gian', 'Lãnh đạo', 'Tự học', 'Thích ứng nhanh', 'Chịu áp lực',
  'Đàm phán', 'Tư duy logic', 'Sáng tạo', 'Tổ chức sự kiện', 'Chăm sóc khách hàng',
  'Teamwork', 'Communication', 'Problem Solving', 'Time Management', 'Critical Thinking',
  'Leadership', 'Negotiation', 'Adaptability'
];

/**
 * Trích xuất danh sách Học vấn (Education) từ văn bản CV
 */
function extractEducation(text) {
  const results = [];

  // Tìm khối Học vấn
  const eduHeaderRegex = /(?:^|\n)\s*(?:[#*_\-\s]*)(?:HỌC VẤN|TRÌNH ĐỘ HỌC VẤN|QUÁ TRÌNH HỌC TẬP|QUÁ TRÌNH ĐÀO TẠO|ĐÀO TẠO|THÔNG TIN HỌC VẤN|HỌC TẬP|EDUCATION|ACADEMIC BACKGROUND|ACADEMIC QUALIFICATIONS|QUALIFICATIONS)(?:[:\s*\-_]*)(?:\n|$)/i;
  const nextSectionRegex = /(?:^|\n)\s*(?:[#*_\-\s]*)(?:KINH NGHIỆM|KINH NGHIỆM LÀM VIỆC|WORK EXPERIENCE|EXPERIENCE|KỸ NĂNG|SKILLS|DỰ ÁN|PROJECTS|CHỨNG CHỈ|CERTIFICATIONS|HOẠT ĐỘNG|ACTIVITIES|GIẢI THƯỞNG|AWARDS|SỞ THÍCH|HOBBIES|NGƯỜI THAM CHIẾU|REFERENCES)(?:[:\s*\-_]*)(?:\n|$)/i;

  let eduBlock = '';
  const headerMatch = text.match(eduHeaderRegex);
  if (headerMatch) {
    const startIndex = headerMatch.index + headerMatch[0].length;
    const remainingText = text.slice(startIndex);
    const nextMatch = remainingText.match(nextSectionRegex);
    if (nextMatch) {
      eduBlock = remainingText.slice(0, nextMatch.index).trim();
    } else {
      eduBlock = remainingText.slice(0, 1000).trim();
    }
  } else {
    eduBlock = text;
  }

  const lines = eduBlock
    .split('\n')
    .map((l) => l.replace(/^[#*_\-\s•+]+/, '').replace(/[*_#]+$/, '').trim())
    .filter(Boolean);

  const uniRegex = /(?:Đại học|ĐH|Học viện|Cao đẳng|Trung cấp|Trường|University|College|Academy|Institute|Polytechnic|VNU|NEU|FTU|HUST|UEH|RMIT|FPT|UET|USSH|HCMUT|HCMUS|UIT|TDTU|BUH|HUB|DAV|AJC|ULIS|UFL|VNUA|UTC|NUCE|TMU|AOF|HVTC|HVNH|BKHN|ĐHKTQD|ĐHNT)[^\n,;|]*/i;
  const majorPrefixRegex = /(?:Chuyên ngành|Ngành học|Ngành|Khoa|Major|Field of study|Program|Specialization)[\s:]+([^\n,;|]+)/i;
  const dateRegex = /(?:(?:19|20)\d{2}\s*[-–—/to\s]+\s*(?:(?:19|20)\d{2}|nay|hiện tại|present|current))|(?:(?:0?[1-9]|1[0-2])\/(?:19|20)\d{2}\s*[-–—/to\s]+\s*(?:(?:0?[1-9]|1[0-2])\/(?:19|20)\d{2}|nay|hiện tại|present|current))|(?:Tốt nghiệp(?:\s*năm)?[\s:]*(?:19|20)\d{2})|(?:Niên khóa[\s:]*[0-9\s-–—]+)|(?:(?:19|20)\d{2})/i;
  const gpaRegex = /(?:GPA|CPA|Điểm(?:\s*trung bình|\s*TB)?|Điểm tích lũy)[\s:]*([0-9]+(?:[.,][0-9]+)?(?:\s*\/\s*[0-9]+(?:[.,][0-9]+)?)?)/i;
  const degreeRegex = /(?:Cử nhân|Kỹ sư|Thạc sĩ|Tiến sĩ|Cao đẳng|Trung cấp|Bachelor(?:'s)?|Master(?:'s)?|PhD|Doctorate|BSc|B\.Sc|B\.S\.|BA|B\.A\.|BBA|Associate)/i;

  // Thuật toán: duyệt qua các dòng để gom các mục học vấn
  let currentItem = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Bỏ qua các dòng tiêu đề chung
    if (/^(học vấn|trình độ|education|đào tạo)$/i.test(line)) continue;

    const uniMatch = line.match(uniRegex);

    if (uniMatch) {
      if (currentItem && currentItem.university) {
        results.push(currentItem);
      }

      // Trích xuất ngày, GPA, bằng cấp từ dòng trường trước khi làm sạch
      const dMatch = line.match(dateRegex);
      const degMatch = line.match(degreeRegex);
      const gMatch = line.match(gpaRegex);

      // Làm sạch tên trường: bỏ ngày tháng trong ngoặc, dấu gạch nối, GPA
      let cleanUni = line;
      if (dMatch) cleanUni = cleanUni.replace(dMatch[0], '');
      if (gMatch) cleanUni = cleanUni.replace(gMatch[0], '');
      if (degMatch) cleanUni = cleanUni.replace(degMatch[0], '');
      cleanUni = cleanUni
        .replace(/[()|–—]/g, ' ')
        .replace(/^[#*_\-\s•+]+/, '')
        .replace(/\s+/g, ' ')
        .trim();

      currentItem = {
        university: cleanUni || uniMatch[0].trim(),
        major: '',
        degree: degMatch ? degMatch[0].trim() : 'Cử nhân',
        expectedGraduation: dMatch ? dMatch[0].replace(/^(?:niên khóa|tốt nghiệp năm|năm|khóa)[\s:]+/i, '').trim() : '',
        gpa: gMatch ? gMatch[1].trim() : '',
      };

      // Kiểm tra nếu có phân cách bởi dấu gạch | hoặc -
      const parts = line.split(/[|–—]/).map((p) => p.trim());
      if (parts.length > 1) {
        for (const p of parts) {
          const pLower = p.toLowerCase();
          const uniLower = uniMatch[0].trim().toLowerCase();
          if (!pLower.includes(uniLower) && !cleanUni.toLowerCase().includes(pLower)) {
            if (!currentItem.major && !dateRegex.test(p) && !gpaRegex.test(p)) {
              const cleanedMajor = p.replace(majorPrefixRegex, '$1').replace(degreeRegex, '').trim();
              if (cleanedMajor.length > 2) {
                currentItem.major = cleanedMajor;
              }
            }
          }
        }
      }
    } else if (currentItem) {
      // Dòng phụ thuộc mục học vấn hiện tại
      const mMatch = line.match(majorPrefixRegex);
      if (mMatch && !currentItem.major) {
        currentItem.major = mMatch[1].trim();
      }

      const dMatch = line.match(dateRegex);
      if (dMatch && !currentItem.expectedGraduation) {
        currentItem.expectedGraduation = dMatch[0].replace(/^(?:niên khóa|tốt nghiệp năm|năm|khóa)[\s:]+/i, '').trim();
      }

      const gMatch = line.match(gpaRegex);
      if (gMatch && !currentItem.gpa) {
        currentItem.gpa = gMatch[1].trim();
      }

      const degMatch = line.match(degreeRegex);
      if (degMatch) {
        if (!currentItem.degree) {
          currentItem.degree = degMatch[0].trim();
        }
        // Nếu dòng có dạng 'Bachelor of International Business' hoặc 'Cử nhân Kinh tế Quốc tế'
        const majorFromDegree = line.replace(/^(?:Bachelor(?:\s+of)?|Cử nhân|Kỹ sư|Master(?:\s+of)?|Thạc sĩ)[\s:]+/i, '').trim();
        if (majorFromDegree && majorFromDegree.length > 2 && !currentItem.major && !dMatch && !gMatch) {
          currentItem.major = majorFromDegree;
        }
      }

      // Nếu chưa có ngành học và dòng này không phải ngày tháng, GPA: có thể là tên ngành học
      if (!currentItem.major && !dMatch && !gMatch && line.length < 70) {
        const clean = line.replace(/^(?:chuyên ngành|ngành học|ngành|khoa)[\s:]+/i, '').trim();
        if (clean.length > 2) {
          currentItem.major = clean;
        }
      }
    }
  }

  if (currentItem && currentItem.university) {
    results.push(currentItem);
  }

  // Đảm bảo các trường không để undefined
  return results.map((item) => ({
    university: item.university || '',
    major: item.major || '',
    degree: item.degree || 'Cử nhân',
    expectedGraduation: item.expectedGraduation || '',
    gpa: item.gpa || '',
  }));
}

/**
 * Trích xuất Kinh nghiệm làm việc (Experience) từ văn bản CV
 */
function extractExperience(text) {
  const results = [];
  const expHeaderRegex = /(?:^|\n)\s*(?:[#*_\-\s]*)(?:KINH NGHIỆM|KINH NGHIỆM LÀM VIỆC|QUÁ TRÌNH LÀM VIỆC|WORK EXPERIENCE|EXPERIENCE)(?:[:\s*\-_]*)(?:\n|$)/i;
  const nextSectionRegex = /(?:^|\n)\s*(?:[#*_\-\s]*)(?:HỌC VẤN|KỸ NĂNG|DỰ ÁN|CHỨNG CHỈ|HOẠT ĐỘNG|GIẢI THƯỞNG|EDUCATION|SKILLS|PROJECTS)(?:[:\s*\-_]*)(?:\n|$)/i;

  const headerMatch = text.match(expHeaderRegex);
  if (!headerMatch) return results;

  const startIndex = headerMatch.index + headerMatch[0].length;
  const remainingText = text.slice(startIndex);
  const nextMatch = remainingText.match(nextSectionRegex);
  const expBlock = nextMatch ? remainingText.slice(0, nextMatch.index).trim() : remainingText.slice(0, 1500).trim();

  const lines = expBlock
    .split('\n')
    .map((l) => l.replace(/^[#*_\-\s•+]+/, '').replace(/[*_#]+$/, '').trim())
    .filter(Boolean);

  const dateRegex = /(?:(?:19|20)\d{2}\s*[-–—/to\s]+\s*(?:(?:19|20)\d{2}|nay|hiện tại|present|current))|(?:(?:0?[1-9]|1[0-2])\/(?:19|20)\d{2}\s*[-–—/to\s]+\s*(?:(?:0?[1-9]|1[0-2])\/(?:19|20)\d{2}|nay|hiện tại|present|current))/i;

  let currentExp = null;
  for (const line of lines) {
    if (line.length < 3) continue;
    const dMatch = line.match(dateRegex);
    const hasCompanyKeyword = /(?:công ty|tập đoàn|doanh nghiệp|ngân hàng|company|corporation|bank|fpt|vng|viettel|vnpt|shopee|tiki|momo|shopee)/i.test(line);

    if (hasCompanyKeyword || (dMatch && line.length < 80)) {
      if (currentExp && currentExp.company) {
        results.push(currentExp);
      }
      currentExp = {
        company: line.replace(dateRegex, '').replace(/[|–—()]/g, ' ').trim() || 'Doanh nghiệp',
        role: 'Nhân viên / Thực tập sinh',
        startDate: '',
        endDate: '',
        description: '',
      };
      if (dMatch) {
        const parts = dMatch[0].split(/[-–—/to]/).map((p) => p.trim());
        currentExp.startDate = parts[0] || '';
        currentExp.endDate = parts[1] || 'Hiện tại';
      }
    } else if (currentExp) {
      if (currentExp.description) {
        currentExp.description += '\n' + line;
      } else {
        // Dòng đầu tiên dưới công ty thường là Chức danh (Role)
        if (line.length < 50 && !line.startsWith('-') && !line.startsWith('•')) {
          currentExp.role = line;
        } else {
          currentExp.description = line;
        }
      }
    }
  }

  if (currentExp && currentExp.company) {
    results.push(currentExp);
  }

  return results.slice(0, 5);
}

/**
 * Trích xuất Dự án (Projects) từ văn bản CV
 */
function extractProjects(text) {
  const results = [];
  const projHeaderRegex = /(?:^|\n)\s*(?:[#*_\-\s]*)(?:DỰ ÁN|DỰ ÁN TIÊU BIỂU|PROJECTS|PERSONAL PROJECTS)(?:[:\s*\-_]*)(?:\n|$)/i;
  const nextSectionRegex = /(?:^|\n)\s*(?:[#*_\-\s]*)(?:HỌC VẤN|KINH NGHIỆM|KỸ NĂNG|CHỨNG CHỈ|HOẠT ĐỘNG|EDUCATION|EXPERIENCE|SKILLS)(?:[:\s*\-_]*)(?:\n|$)/i;

  const headerMatch = text.match(projHeaderRegex);
  if (!headerMatch) return results;

  const startIndex = headerMatch.index + headerMatch[0].length;
  const remainingText = text.slice(startIndex);
  const nextMatch = remainingText.match(nextSectionRegex);
  const projBlock = nextMatch ? remainingText.slice(0, nextMatch.index).trim() : remainingText.slice(0, 1500).trim();

  const lines = projBlock
    .split('\n')
    .map((l) => l.replace(/^[#*_\-\s•+]+/, '').replace(/[*_#]+$/, '').trim())
    .filter(Boolean);

  let currentProj = null;
  for (const line of lines) {
    if (line.length < 3) continue;
    // Dòng bắt đầu dự án mới (dòng ngắn, hoặc có từ 'Dự án', 'Project', 'Hệ thống', 'Website', 'App')
    const isNewProject = /^(?:dự án|project|hệ thống|website|ứng dụng|app|nền tảng)[\s:]+/i.test(line) ||
      (line.length < 50 && !line.includes(':') && !line.startsWith('•'));

    if (isNewProject && line.length < 70) {
      if (currentProj && currentProj.name) {
        results.push(currentProj);
      }
      currentProj = {
        name: line.replace(/^(?:dự án|project)[\s:]+/i, '').trim(),
        description: '',
        technologies: '',
        link: '',
      };
    } else if (currentProj) {
      if (/^(?:công nghệ|tech(?:nologies)?|tech stack)[\s:]+/i.test(line)) {
        currentProj.technologies = line.replace(/^(?:công nghệ|tech(?:nologies)?|tech stack)[\s:]+/i, '').trim();
      } else if (/(?:https?:\/\/)?github\.com\/[^\s]+/i.test(line)) {
        const linkMatch = line.match(/(?:https?:\/\/)?github\.com\/[^\s]+/i);
        if (linkMatch) currentProj.link = linkMatch[0];
      } else {
        currentProj.description = currentProj.description ? currentProj.description + '\n' + line : line;
      }
    }
  }

  if (currentProj && currentProj.name) {
    results.push(currentProj);
  }

  return results.slice(0, 5);
}

export function parseCVTextToProfile(rawText, fileName = '') {
  if (!rawText || typeof rawText !== 'string') {
    return null;
  }

  const text = rawText.trim();
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // 1. Họ và tên
  let fullName = '';
  const ignorePatterns = /^(curriculum vitae|resume|cv|hồ sơ|thông tin cá nhân|bản tóm tắt|ung tuyen|ứng tuyển)/i;
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i].replace(/^[#*_\-\s]+/, '').replace(/[*_#]+$/, '').trim();
    if (
      line.length >= 2 &&
      line.length <= 40 &&
      !ignorePatterns.test(line) &&
      !line.includes('@') &&
      !line.includes('http') &&
      !/[0-9]{4,}/.test(line) &&
      !line.toLowerCase().includes('phone') &&
      !line.toLowerCase().includes('email')
    ) {
      fullName = line;
      break;
    }
  }

  if (!fullName && fileName) {
    fullName = fileName
      .replace(/\.[^/.]+$/, '')
      .replace(/^(cv|resume|hồ sơ)[_\-\s]*/i, '')
      .replace(/[_\-]+/g, ' ')
      .trim();
  }

  // 2. Email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0].trim() : '';

  // 3. Số điện thoại
  const phoneMatch = text.match(/(?:\+?84|0)(?:3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}/) ||
                     text.match(/(?:\+?84|0)[\s.-]?[0-9]{3}[\s.-]?[0-9]{3}[\s.-]?[0-9]{3,4}/);
  const phone = phoneMatch ? phoneMatch[0].trim() : '';

  // 4. Địa chỉ / Vị trí
  let location = '';
  const locationMatch = text.match(/(?:địa chỉ|address|khu vực|location|nơi ở)[\s:]+([^\n,]+(?:,[^\n]+)?)/i) ||
                        text.match(/(?:Hà Nội|TP\.?\s*Hồ Chí Minh|Hồ Chí Minh|Đà Nẵng|Cần Thơ|Hải Phòng|Bình Dương|Đồng Nai)[^\n]*/i);
  if (locationMatch) {
    location = locationMatch[0].replace(/^(địa chỉ|address|khu vực|location|nơi ở)[\s:]+/i, '').trim().slice(0, 80);
  }

  // 5. LinkedIn & Portfolio
  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_]+/i);
  const linkedin = linkedinMatch ? (linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : `https://${linkedinMatch[0]}`) : '';

  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9-_]+/i);
  const portfolio = githubMatch ? (githubMatch[0].startsWith('http') ? githubMatch[0] : `https://${githubMatch[0]}`) : '';

  // 6. Kỹ năng
  const foundTech = new Set();
  const lowerText = text.toLowerCase();
  COMMON_TECH_SKILLS.forEach((skill) => {
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(?:^|[\\s,;•|()/\\[\\]-])${escaped}(?:[\\s,;•|()/\\[\\]-]|\$)`, 'i');
    if (regex.test(text)) {
      foundTech.add(skill);
    }
  });

  const foundSoft = new Set();
  COMMON_SOFT_SKILLS.forEach((skill) => {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSoft.add(skill);
    }
  });

  // 7. Học vấn (Dùng thuật toán bóc tách chi tiết)
  const education = extractEducation(text);

  // 8. Kinh nghiệm & Dự án
  const experience = extractExperience(text);
  const projects = extractProjects(text);

  // 9. Tóm tắt / Mục tiêu nghề nghiệp
  let summary = '';
  const summarySectionMatch = text.match(/(?:mục tiêu nghề nghiệp|mục tiêu|tổng quan|giới thiệu|tóm tắt|objective|summary|about me)[\s:]*([\s\S]{30,450}?)(?=\n\s*(?:học vấn|kỹ năng|kinh nghiệm|dự án|education|skills|experience|projects|$))/i);
  if (summarySectionMatch && summarySectionMatch[1]) {
    summary = summarySectionMatch[1].trim().replace(/\n+/g, ' ');
  } else {
    summary = `Hồ sơ năng lực của ứng viên ${fullName || ''}. Định hướng phát triển chuyên môn, sẵn sàng học hỏi và đóng góp giá trị cho doanh nghiệp.`;
  }

  return {
    personal: {
      fullName: fullName || 'Ứng viên',
      email: email || '',
      phone: phone || '',
      location: location || 'Việt Nam',
      linkedin: linkedin || '',
      portfolio: portfolio || '',
      photoUrl: '',
    },
    education: education,
    experience: experience,
    projects: projects,
    skills: {
      technical: Array.from(foundTech).length > 0 ? Array.from(foundTech) : ['Kỹ năng chuyên môn'],
      soft: Array.from(foundSoft).length > 0 ? Array.from(foundSoft) : ['Làm việc nhóm', 'Giao tiếp'],
    },
    activities: [],
    certifications: [],
    achievements: [],
    summary: summary,
  };
}
