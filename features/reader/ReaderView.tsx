import React, { useRef, useEffect } from 'react';
import { ChapterLoader } from '../../components/ChapterLoader';
import { Loader } from '../../components/Loader';
import { PARAGRAPH_BREAK_MARKER } from '../../utils/textUtils';

interface ReaderViewProps {
    t: (key: string, params?: Record<string, any>) => string;
    originalChapters: string[];
    translatedSentences: string[];
    chapterSentenceCounts: number[];
    currentSentenceIndex: number;
}


const MemoizedReaderView: React.FC<ReaderViewProps> = ({
    t, originalChapters, translatedSentences, chapterSentenceCounts, currentSentenceIndex
}) => {
    const currentSentenceRef = useRef<HTMLSpanElement | null>(null);

    // Efeito para rolar a visão para a sentença atualmente em reprodução.
    useEffect(() => {
        if (currentSentenceRef.current) {
            currentSentenceRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [currentSentenceIndex]);
    
    if (originalChapters.length === 0) {
        return (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                <i className="fas fa-book-open-reader text-7xl text-slate-400 dark:text-slate-500 mb-6"></i>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">{t('reader_empty_title')}</h2>
                <p className="max-w-sm text-slate-500 dark:text-slate-400">
                    {t('reader_empty_message')}
                </p>
            </div>
        );
    }

    let sentenceOffset = 0;
    const chaptersTranslated = chapterSentenceCounts.length;

    const renderChapterContent = (chapterIndex: number) => {
        const chapterSentences = translatedSentences.slice(
            sentenceOffset,
            sentenceOffset + chapterSentenceCounts[chapterIndex]
        );
        const chapterGlobalStartIndex = sentenceOffset;
        let sentenceCounterInChapter = 0;

        const paragraphs: { sentence: string, index: number }[][] = [];
        let currentParagraph: { sentence: string, index: number }[] = [];

        chapterSentences.forEach((sentence) => {
            const globalIndex = chapterGlobalStartIndex + sentenceCounterInChapter;
            if (sentence === PARAGRAPH_BREAK_MARKER) {
                if (currentParagraph.length > 0) {
                    paragraphs.push(currentParagraph);
                }
                currentParagraph = [];
            } else {
                currentParagraph.push({ sentence, index: globalIndex });
            }
            sentenceCounterInChapter++;
        });

        if (currentParagraph.length > 0) {
            paragraphs.push(currentParagraph);
        }
        
        return (
            <>
                <h2 className="text-3xl font-serif text-center font-semibold text-sky-700 dark:text-sky-400/90 mt-8 mb-6 pb-2">
                    {t('reader_chapter_title')} {chapterIndex + 1}
                </h2>
                {paragraphs.map((p, pIndex) => (
                    <p key={`${chapterIndex}-${pIndex}`} className="text-justify indent-8 first-of-type:indent-0">
                        {p.map(s => {
                            const isCurrent = s.index === currentSentenceIndex;
                            return (
                                 <span
                                    key={s.index}
                                    ref={isCurrent ? currentSentenceRef : null}
                                    className={`transition-colors duration-300 p-1 rounded ${isCurrent ? 'bg-sky-200 text-sky-900 dark:bg-sky-500/20 dark:text-sky-200' : ''}`}
                                >
                                    {s.sentence}{' '}
                                </span>
                            );
                        })}
                    </p>
                ))}
            </>
        );
    };

    return (
        <div className="w-full flex-grow overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
            <div className="text-gray-800 dark:text-gray-300 text-lg leading-relaxed font-serif">
                {originalChapters.map((_, chapterIndex) => {
                    const isTranslated = chapterIndex < chaptersTranslated;
                    const chapterContent = isTranslated ? (
                        renderChapterContent(chapterIndex)
                    ) : (
                        // Fix: Passed t function prop to ChapterLoader.
                        <ChapterLoader chapterNumber={chapterIndex + 1} t={t} />
                    );
                    
                    if (isTranslated) {
                        sentenceOffset += chapterSentenceCounts[chapterIndex];
                    }

                    return <div key={chapterIndex}>{chapterContent}</div>;
                })}
            </div>
        </div>
    );
};

export const ReaderView = React.memo(MemoizedReaderView);