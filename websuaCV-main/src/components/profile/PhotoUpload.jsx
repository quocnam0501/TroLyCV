import React, { useState, useRef } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';

/**
 * Nén và chuyển đổi ảnh sang Base64 Data URL (tối đa 400x400 px, dung lượng ~20-30KB)
 * Đảm bảo lưu mượt mà vào localStorage và hiển thị ổn định trên mọi mẫu CV / PDF.
 */
function compressImage(file, maxSize = 400, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không thể đọc file ảnh'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Định dạng hình ảnh không hợp lệ'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(e.target.result);
        }
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function PhotoUpload({ photoUrl, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn tệp hình ảnh (.jpg, .png, .jpeg, .webp)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Dung lượng ảnh tối đa là 10MB');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const compressedDataUrl = await compressImage(file);
      onChange(compressedDataUrl);
    } catch (err) {
      console.error('Photo upload error:', err);
      setError('Không thể xử lý ảnh. Vui lòng thử lại với file ảnh khác.');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 shadow-inner group">
        {photoUrl ? (
          <>
            <img src={photoUrl} alt="Ảnh đại diện" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute top-0 right-0 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 shadow-md transition-transform hover:scale-110"
              title="Xóa ảnh"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        ) : uploading ? (
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
        ) : (
          <Camera className="w-6 h-6 text-slate-300 group-hover:text-slate-400 transition-colors" />
        )}
      </div>
      <div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50 transition-colors"
        >
          {photoUrl ? 'Đổi ảnh đại diện' : 'Tải ảnh đại diện lên'}
        </button>
        <p className="text-xs text-slate-400 mt-0.5">Tùy chọn — hiển thị trực tiếp trên mẫu CV khi xuất PDF</p>
        {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}