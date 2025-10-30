import React from 'react';

interface ChapterLoaderProps {
  chapterNumber: number;
  // Fix: Added t function to props to be passed down from ReaderView.
  t: (key: string, params?: Record<string, any>) => string;
}

export const ChapterLoader: React.FC<ChapterLoaderProps> = ({ chapterNumber, t }) => {
  // Fix: Removed useTranslation hook.
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 my-4 bg-slate-200/30 dark:bg-slate-700/30 rounded-lg border border-slate-300/50 dark:border-slate-600/50">
        <svg className="animate-spin h-8 w-8 text-sky-500 dark:text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-md text-gray-500 dark:text-gray-400">{t('chapter_loader_processing', { chapterNumber })}</p>
    </div>
  );
};