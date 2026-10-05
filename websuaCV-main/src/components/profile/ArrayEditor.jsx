import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function ArrayEditor({ items, onChange, renderItem, newItem, addLabel = 'Thêm' }) {
  const handleAdd = () => onChange([...items, { ...newItem, id: `item_${Date.now()}` }]);
  const handleUpdate = (index, updates) =>
    onChange(items.map((item, i) => (i === index ? { ...item, ...updates } : item)));
  const handleDelete = (index) => onChange(items.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={item.id || index} className="relative p-4 rounded-xl border border-slate-200 bg-slate-50/50">
          {renderItem(item, (updates) => handleUpdate(index, updates))}
          <button
            type="button"
            onClick={() => handleDelete(index)}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAdd}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 text-sm font-medium text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-all w-full justify-center"
      >
        <Plus className="w-4 h-4" /> {addLabel}
      </button>
    </div>
  );
}