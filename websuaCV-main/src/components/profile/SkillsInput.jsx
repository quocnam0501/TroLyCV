import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function SkillsInput({ label, skills = [], onChange, placeholder }) {
  const [input, setInput] = useState('');

  const addSkill = (value) => {
    const trimmed = value.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
    }
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(input);
    }
    if (e.key === 'Backspace' && !input && skills.length > 0) {
      onChange(skills.slice(0, -1));
    }
  };

  const removeSkill = (index) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label className="text-xs font-medium text-slate-500 mb-1 block">{label}</label>
      <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 min-h-[42px]">
        {skills.map((skill, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium">
            {skill}
            <button type="button" onClick={() => removeSkill(i)} className="text-indigo-400 hover:text-indigo-600">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => input && addSkill(input)}
          placeholder={skills.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] px-1 py-0.5 text-sm outline-none bg-transparent"
        />
      </div>
      <p className="text-[11px] text-slate-400 mt-1">Nhấn Enter hoặc dấu phẩy để thêm</p>
    </div>
  );
}