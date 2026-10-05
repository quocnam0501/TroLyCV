import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Cấu hình worker local theo chuẩn Vite cùng origin
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
}

/**
 * Trích xuất nội dung văn bản từ file tải lên (PDF, TXT, MD, DOC, v.v.)
 * @param {File} file 
 * @returns {Promise<string>}
 */
export async function extractTextFromFile(file) {
  if (!file) return '';

  const fileName = file.name.toLowerCase();
  const extension = fileName.split('.').pop();

  // 1. Với file văn bản thuần (.txt, .md, .json)
  if (['txt', 'md', 'json', 'csv'].includes(extension)) {
    return await file.text();
  }

  // 2. Với file PDF (.pdf)
  if (extension === 'pdf') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        useSystemFonts: true,
      });

      const pdf = await loadingTask.promise;
      let fullText = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Nhóm các item theo toạ độ Y để giữ nguyên dòng, đoạn văn
        let lastY = null;
        const pageLines = [];
        let currentLine = [];

        for (const item of textContent.items) {
          if (!item.str && item.str !== ' ') continue;
          const currentY = item.transform ? Math.round(item.transform[5]) : null;
          if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 4) {
            if (currentLine.length > 0) {
              pageLines.push(currentLine.join(' '));
              currentLine = [];
            }
          }
          if (item.str.trim()) {
            currentLine.push(item.str.trim());
          }
          lastY = currentY;
        }

        if (currentLine.length > 0) {
          pageLines.push(currentLine.join(' '));
        }

        const pageText = pageLines.length > 0
          ? pageLines.join('\n')
          : textContent.items.map((item) => item.str || '').join(' ');

        if (pageText.trim()) {
          fullText.push(pageText.trim());
        }
      }

      const extracted = fullText.join('\n\n').trim();
      if (!extracted || extracted.length < 20) {
        throw new Error('File PDF là bản scan dạng ảnh hoặc không chứa văn bản có thể đọc được.');
      }
      return extracted;
    } catch (err) {
      console.warn('PDF extract error:', err);
      throw new Error(
        err.message || 'Không thể trích xuất văn bản từ file PDF này. Vui lòng mở file, sao chép nội dung và dán vào ô văn bản.'
      );
    }
  }

  // 3. Fallback cho các định dạng khác
  try {
    const rawText = await file.text();
    // Kiểm tra xem có phải chuỗi đọc được không
    if (/[\x00-\x08\x0E-\x1F]/.test(rawText.slice(0, 100))) {
      throw new Error('Định dạng file nhị phân chưa được hỗ trợ trích xuất tự động. Hãy sao chép nội dung và dán vào ô văn bản.');
    }
    return rawText;
  } catch {
    throw new Error('Không thể đọc file. Vui lòng sử dụng file PDF hoặc TXT, hoặc dán trực tiếp nội dung.');
  }
}
