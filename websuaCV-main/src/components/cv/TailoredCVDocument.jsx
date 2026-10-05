import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function TailoredCVDocument({ content }) {
  return (
    <div className="bg-white text-slate-900" style={{ width: '794px', minHeight: '1123px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div className="px-12 py-10">
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h1 className="text-2xl font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">{children}</h1>,
            h2: ({ children }) => <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mt-6 mb-2 pb-1 border-b border-slate-200">{children}</h2>,
            h3: ({ children }) => <h3 className="text-base font-semibold text-slate-800 mt-3 mb-1">{children}</h3>,
            h4: ({ children }) => <h4 className="text-sm font-semibold text-slate-700 mt-2 mb-1">{children}</h4>,
            p: ({ children }) => <p className="text-sm text-slate-700 leading-relaxed mb-2">{children}</p>,
            ul: ({ children }) => <ul className="list-disc list-inside text-sm text-slate-700 space-y-1 mb-2 pl-2">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside text-sm text-slate-700 space-y-1 mb-2 pl-2">{children}</ol>,
            li: ({ children }) => <li className="text-sm text-slate-700 leading-relaxed">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
            em: ({ children }) => <em className="italic text-slate-600">{children}</em>,
            hr: () => <hr className="border-slate-200 my-4" />,
            a: ({ href, children }) => <a href={href} className="text-indigo-600 underline break-all">{children}</a>,
            blockquote: ({ children }) => <blockquote className="border-l-2 border-slate-200 pl-3 italic text-slate-600 text-sm my-2">{children}</blockquote>,
          }}
        >
          {content || ''}
        </ReactMarkdown>
      </div>
    </div>
  );
}