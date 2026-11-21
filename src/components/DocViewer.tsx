import React from 'react';
import { Copy, Download } from 'lucide-react';

interface DocViewerProps {
  title: string;
  filename: string;
  content: string;
  onNotify: (message: string, type: 'success' | 'error') => void;
}

export const DocViewer: React.FC<DocViewerProps> = ({ title, filename, content, onNotify }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      onNotify(`${filename} مەزمۇنى كۆچۈرۈلدى!`, 'success');
    } catch {
      onNotify('كۆچۈرۈشتە خاتالىق كۆرۈلدى', 'error');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    onNotify(`${filename} چۈشۈرۈلدى`, 'success');
  };

  const lines = content.split('\n');

  return (
    <article className="glass-surface mx-auto max-w-4xl rounded-[22px] p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-900/10 pb-4 dark:border-white/10">
        <div>
          <h2 className="text-[22px] font-bold text-[#1A1E24] dark:text-slate-100">{title}</h2>
          <p className="mt-0.5 text-[13px] text-[#555D6B] dark:text-slate-400">{filename} · ئېنتىرپرايس سەۋىيەلىك ھۆججەت</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="glass-pill flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold text-[#1A1E24] transition-transform duration-150 hover:-translate-y-0.5 dark:text-slate-100"
          >
            <Copy className="h-4 w-4 text-[#1F75FE]" />
            <span>كۆچۈرۈش</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="primary-glass-cta flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold text-white transition-transform duration-150 hover:-translate-y-0.5"
          >
            <Download className="h-4 w-4" />
            <span>چۈشۈرۈش (.md)</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {lines.map((line, i) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={i} className="h-1" />;
          if (trimmed === '---') {
            return <hr key={i} className="my-2 border-slate-900/10 dark:border-white/10" />;
          }
          if (trimmed.startsWith('# ')) {
            return (
              <h3 key={i} className="mt-2 text-[20px] font-bold text-[#1A1E24] dark:text-slate-100">
                {trimmed.slice(2)}
              </h3>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h4 key={i} className="mt-3 text-[17px] font-bold text-[#F05A28]">
                {trimmed.slice(3)}
              </h4>
            );
          }
          if (trimmed.startsWith('### ')) {
            return (
              <h5 key={i} className="mt-2 text-[15px] font-bold text-[#1F75FE] dark:text-[#7DB2FF]">
                {trimmed.slice(4)}
              </h5>
            );
          }
          if (trimmed.startsWith('```')) {
            return null;
          }
          if (trimmed.startsWith('|')) {
            return (
              <div
                key={i}
                dir="auto"
                className="overflow-x-auto rounded-lg bg-white/55 px-3 py-1.5 font-mono text-[12.5px] text-[#1A1E24] dark:bg-slate-900/55 dark:text-slate-200"
              >
                {trimmed}
              </div>
            );
          }
          if (/^(\*|-|\d+\.)\s/.test(trimmed)) {
            return (
              <p key={i} className="uyghur-paragraph text-[14.5px] text-[#1A1E24] dark:text-slate-200">
                {trimmed}
              </p>
            );
          }
          return (
            <p key={i} className="uyghur-paragraph text-[15px] text-[#1A1E24] dark:text-slate-200">
              {trimmed}
            </p>
          );
        })}
      </div>
    </article>
  );
};
