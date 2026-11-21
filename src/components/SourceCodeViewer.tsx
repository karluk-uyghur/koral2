import React, { useState } from 'react';
import { AlertCircle, Check, Copy, Download, FileCode2, FolderArchive } from 'lucide-react';
import { downloadExtensionZip } from '../lib/pdfAndAiClient';

export interface SourceFileEntry {
  id: string;
  label: string;
  path: string;
  content: string;
}

interface SourceCodeViewerProps {
  files: SourceFileEntry[];
  onNotify: (message: string, type: 'success' | 'error') => void;
}

export const SourceCodeViewer: React.FC<SourceCodeViewerProps> = ({ files, onNotify }) => {
  const [selectedId, setSelectedId] = useState(files[0]?.id || '');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeFile = files.find((f) => f.id === selectedId) || files[0];

  const handleCopy = async (file: SourceFileEntry) => {
    try {
      await navigator.clipboard.writeText(file.content);
      setCopiedId(file.id);
      setTimeout(() => setCopiedId(null), 2000);
      onNotify(`${file.label} تولۇق كودى كۆچۈرۈلدى!`, 'success');
    } catch {
      onNotify('كۆچۈرۈشتە خاتالىق كۆرۈلدى', 'error');
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      {/* Install & ZIP Package Banner */}
      <section className="glass-surface rounded-[22px] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="primary-glass-cta flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] text-white">
              <FolderArchive className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-[#1A1E24] dark:text-slate-100">
                Chrome غا قاچىلاش ۋە تولۇق كود ھۆججەتلىرى
              </h2>
              <p className="mt-1 text-[13.5px] text-[#555D6B] dark:text-slate-300">
                بارلىق ھۆججەتلەر (manifest.json, popup.html, popup.js, background.js, icons, PRD, SPEC) بىرلا ZIP ئىچىدە تەييار.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                await downloadExtensionZip();
                onNotify('ZIP چۈشۈرۈلدى! ئالدى بىلەن يېشىپ (Extract)، ئاندىن Load unpacked ئارقىلىق قىسقۇچنى تاللاڭ.', 'success');
              } catch (err) {
                onNotify(err instanceof Error ? err.message : 'ZIP چۈشۈرۈشتە خاتالىق', 'error');
              }
            }}
            className="primary-glass-cta inline-flex cursor-pointer items-center gap-2 rounded-full px-6 py-3 text-[14px] font-bold text-white whitespace-nowrap transition-transform duration-150 hover:-translate-y-0.5 active:scale-97"
          >
            <Download className="h-4 w-4" />
            <span>karluk-learning-assistant.zip چۈشۈرۈش</span>
          </button>
        </div>

        <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            '1. ZIP ھۆججىتىنى چۈشۈرۈپ چوقۇم قىسقۇچقا يېشىڭ (Extract All).',
            '2. Chrome دا chrome://extensions بېتىنى ئېچىڭ.',
            '3. ئوڭ يۇقىرىدىكى «Developer mode» نى قوزغىتىڭ.',
            '4. «Load unpacked» نى بېسىپ، ئىچىدە manifest.json بار قىسقۇچنى تاللاڭ.'
          ].map((step, i) => (
            <li
              key={i}
              className="rounded-[16px] border border-white/75 bg-white/60 p-3 text-[13px] font-medium text-[#1A1E24] dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200"
            >
              {step}
            </li>
          ))}
        </ol>

        <div className="mt-4 flex items-start gap-2.5 rounded-[16px] border border-[#F05A28]/35 bg-[#F05A28]/10 p-3.5 text-[13px] text-[#1A1E24] dark:text-slate-100">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#F05A28]" />
          <div>
            <strong>قاچىلانمىسا دىققەت قىلىڭ:</strong>{' '}
            <code dir="ltr" className="rounded bg-white/70 px-1 py-0.5 font-mono text-[12px] dark:bg-slate-800">.zip</code>{' '}
            ھۆججىتىنى بىۋاسىتە Chrome غا سۆرەپ تاشلىماڭ (Chrome پەقەت يېشىلگەن قىسقۇچنى قوبۇل قىلىدۇ). يېشىلگەن قىسقۇچ ئىچىدە بىۋاسىتە{' '}
            <code dir="ltr" className="rounded bg-white/70 px-1 py-0.5 font-mono text-[12px] dark:bg-slate-800">manifest.json</code>{' '}
            بولۇشى كېرەك (ئەگەر ئىچىدە يەنە بىر قىسقۇچ بولسا، ئەڭ ئىچكى قىسقۇچنى تاللاڭ).
          </div>
        </div>
      </section>

      {/* Code Explorer */}
      <section className="glass-surface overflow-hidden rounded-[22px]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900/10 px-5 py-3.5 dark:border-white/10">
          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="قىستۇرما ھۆججەتلىرى">
            {files.map((file) => {
              const isSelected = file.id === activeFile?.id;
              return (
                <button
                  key={file.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedId(file.id)}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-1.5 text-[13px] font-semibold whitespace-nowrap ${
                    isSelected
                      ? 'border-[#1F75FE] bg-[#1F75FE] text-white shadow-[0_6px_16px_-4px_rgba(31,117,254,0.45)]'
                      : 'glass-pill text-[#1A1E24] hover:border-[#1F75FE]/50 dark:text-slate-100'
                  }`}
                >
                  <FileCode2 className="h-3.5 w-3.5" />
                  <span>{file.label}</span>
                </button>
              );
            })}
          </div>

          {activeFile && (
            <button
              type="button"
              onClick={() => handleCopy(activeFile)}
              className="glass-pill flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold text-[#1A1E24] dark:text-slate-100"
            >
              {copiedId === activeFile.id ? (
                <Check className="h-4 w-4 text-[#1FA982]" />
              ) : (
                <Copy className="h-4 w-4 text-[#F05A28]" />
              )}
              <span>{copiedId === activeFile.id ? 'كۆچۈرۈلدى' : 'تولۇق كودنى كۆچۈرۈش'}</span>
            </button>
          )}
        </div>

        {activeFile && (
          <div className="p-4">
            <div className="mb-2 flex items-center justify-between text-[12px] text-[#555D6B] dark:text-slate-400">
              <span>{activeFile.path}</span>
              <span className="tabular-nums">{activeFile.content.split('\n').length} قۇر</span>
            </div>
            <pre
              dir="ltr"
              className="max-h-[520px] overflow-auto rounded-[16px] border border-slate-900/10 bg-slate-950 p-4 text-left font-mono text-[12.5px] leading-relaxed text-slate-100 dark:border-white/10"
            >
              <code>{activeFile.content}</code>
            </pre>
          </div>
        )}
      </section>
    </div>
  );
};
