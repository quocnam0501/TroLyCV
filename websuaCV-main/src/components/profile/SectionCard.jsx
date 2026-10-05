import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function SectionCard({ title, icon: Icon, children, defaultOpen = true, action }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between p-5 cursor-pointer select-none" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-5 h-5 text-indigo-500" />}
          <h3 className="font-bold text-slate-900">{title}</h3>
        </div>
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          {action}
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </div>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}