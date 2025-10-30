import React, { useCallback, useEffect, useState } from 'react';
import { ReaderView } from '../features/reader/ReaderView';
import { ErrorDisplay } from '../features/shared/ErrorDisplay';
import { StatusBar } from '../features/reader/StatusBar';
import { Toast } from '../components/Toast';
import { translations } from '../localization/translations';
import { PlayerControlsUI } from '../features/player/PlayerControlsUI';
import { LANGUAGES } from '../constants';
import { PARAGRAPH_BREAK_MARKER, formatTime, countWords } from '../utils/textUtils';
import { Loader } from '../components/Loader';

const ACCEPTED_FILES = ".pdf,.epub,.txt";

const MOCK_BOOK = {
    fileName: "Livro de Exemplo.epub",
    originalChapters: [
        "Este é o primeiro parágrafo do capítulo um. Ele serve para apresentar a história e os personagens. A aventura está prestes a começar.",
        "O segundo parágrafo aprofunda o cenário. As montanhas se erguem ao longe, e um rio sinuoso corta a paisagem. O ar está fresco e limpo."
    ],
    totalWordCount: 50,
    translatedSentences: [
        "Este é o primeiro parágrafo do capítulo um.",
        "Ele serve para apresentar a história e os personagens.",
        "A aventura está prestes a começar.",
        PARAGRAPH_BREAK_MARKER,
        "O segundo parágrafo aprofunda o cenário.",
        "As montanhas se erguem ao longe, e um rio sinuoso corta a paisagem.",
        "O ar está fresco e limpo."
    ],
    chapterSentenceCounts: [7]
};


export const MainLayout: React.FC = () => {
    const [theme, setTheme] = useState('dark');
    const [appStatus, setAppStatus] = useState('processing');
    const [fileName, setFileName] = useState(MOCK_BOOK.fileName);
    const [playbackState, setPlaybackState] = useState<'idle' | 'playing' | 'paused' | 'loading'>('idle');
    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1);
    const [languageCode, setLanguageCode] = useState('pt-BR');
    const [selectedVoiceId, setSelectedVoiceId] = useState('Kore');
    const [narrationMode, setNarrationMode] = useState<'ia' | 'native'>('ia');
    const [speed, setSpeed] = useState(1.0);

    const language = LANGUAGES.find(l => l.code === languageCode) || LANGUAGES[0];
    const isPlaying = playbackState === 'playing';

    const t = (key: string, params?: Record<string, any>): string => {
        const langTranslations = translations[languageCode] || translations['pt-BR'];
        const translation = langTranslations[key];
        if (typeof translation === 'function') return translation(params || {});
        if (typeof translation === 'string') return translation;
        return key;
    };

    useEffect(() => {
        document.documentElement.lang = language.code;
        document.title = t('document_title');
        const root = window.document.documentElement;
        root.classList.remove(theme === 'dark' ? 'light' : 'dark');
        root.classList.add(theme);
    }, [language.code, t, theme]);
    
    const isControlsVisible = appStatus !== 'initializing' && appStatus !== 'error';

    const handleFileChange = () => {};
    const handleReset = () => { setFileName(''); setAppStatus('empty'); };
    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    const handlePlayPause = () => setPlaybackState(prev => (prev === 'playing' ? 'paused' : 'playing'));
    const handleTimelineChange = (index: number) => setCurrentSentenceIndex(index);
    const handleLanguageChange = (code: string) => {
        setLanguageCode(code);
        const newLang = LANGUAGES.find(l => l.code === code);
        if (newLang) setSelectedVoiceId(newLang.voices[0].id);
    };

    if (appStatus === 'initializing') {
        return <Loader message={t('main_layout_initializing')} />;
    }
    
    if (appStatus === 'empty') {
        return (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                 <i className="fas fa-book-open-reader text-7xl text-slate-400 dark:text-slate-500 mb-6"></i>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">{t('reader_empty_title')}</h2>
                <p className="max-w-sm text-slate-500 dark:text-slate-400">
                    {t('reader_empty_message')}
                </p>
                <button onClick={() => { setAppStatus('processing'); setFileName(MOCK_BOOK.fileName); }} className="mt-4 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-full transition-colors">
                    Carregar Exemplo
                </button>
            </div>
        )
    }
    
    return (
        <>
            {/* Fix: Passed t function as a prop to Toast. */}
            <Toast toast={null} t={t} />
            {/* Estilos globais injetados para customizações que não são facilmente feitas com Tailwind */}
            <style>{`
                  :root { --scrollbar-border-color: #f1f5f9; } /* slate-100 */
                  .dark { --scrollbar-border-color: #1e2b3b; } /* slate-800 */
                  .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                  .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #38bdf8; border-radius: 20px; border: 3px solid var(--scrollbar-border-color); }
                  body { overflow: hidden; }
                  
                  /* Estilos para os controles deslizantes de velocidade e linha do tempo */
                  input[type=range].speed-slider, input[type=range].timeline-slider { -webkit-appearance: none; appearance: none; width: 100%; background: transparent; }
                  input[type=range].speed-slider:focus, input[type=range].timeline-slider:focus { outline: none; }

                  input[type=range].speed-slider::-webkit-slider-runnable-track { width: 100%; height: 6px; cursor: pointer; background: #cbd5e1; border-radius: 5px; }
                  .dark input[type=range].speed-slider::-webkit-slider-runnable-track { background: #334155; }
                  input[type=range].speed-slider::-webkit-slider-thumb { -webkit-appearance: none; height: 18px; width: 18px; border-radius: 50%; background: #e0f2fe; cursor: pointer; margin-top: -6px; border: 2px solid #0ea5e9; box-shadow: 0 0 5px #0ea5e9; }
                  
                  input[type=range].speed-slider::-moz-range-track { width: 100%; height: 6px; cursor: pointer; background: #cbd5e1; border-radius: 5px; }
                  .dark input[type=range].speed-slider::-moz-range-track { background: #334155; }
                  input[type=range].speed-slider::-moz-range-thumb { height: 14px; width: 14px; border-radius: 50%; background: #e0f2fe; cursor: pointer; border: 2px solid #0ea5e9; box-shadow: 0 0 5px #0ea5e9; }

                  input[type=range].timeline-slider::-webkit-slider-runnable-track { width: 100%; height: 8px; cursor: pointer; background: #e2e8f0; border-radius: 5px; }
                  .dark input[type=range].timeline-slider::-webkit-slider-runnable-track { background: #1e293b; }
                  input[type=range].timeline-slider::-webkit-slider-thumb { -webkit-appearance: none; height: 16px; width: 4px; border-radius: 2px; background: #e0f2fe; cursor: pointer; margin-top: -4px; box-shadow: 0 0 5px #0ea5e9; }
            `}</style>
             <header role="banner" className="flex items-center justify-between text-center py-4 px-6 border-b border-gray-200 dark:border-slate-700/80 relative z-20 shrink-0 transition-colors duration-300">
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-200 tracking-wide truncate transition-colors duration-300">
                    {t('header_title')}
                </h1>
                <div className="flex items-center gap-2 sm:gap-3">
                     {fileName && <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 max-w-[120px] truncate" title={fileName}>{fileName}</p>}
                     
                     <div className={`transition-all duration-300 ease-in-out ${fileName ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}>
                        <label htmlFor="file-upload-header" title={t('header_upload_button_title')} className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-sky-300 font-semibold text-xs py-1.5 px-3 sm:px-4 rounded-full shadow-md transition-all cursor-pointer flex items-center gap-2">
                             <i className="fas fa-file-arrow-up"></i>
                             <span className="hidden sm:inline">{t('header_upload_button')}</span>
                        </label>
                         <input 
                            id="file-upload-header"
                            type="file"
                            className="hidden"
                            accept={ACCEPTED_FILES}
                            onChange={handleFileChange}
                        />
                     </div>

                     <button 
                        onClick={toggleTheme}
                        className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-sky-300 font-semibold text-xs py-1.5 px-3 sm:px-4 rounded-full shadow-md transition-all cursor-pointer flex items-center gap-2"
                        aria-label={t('header_theme_button_title')}
                     >
                         {theme === 'dark' ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
                         <span className="hidden sm:inline">{t('header_theme_button')}</span>
                    </button>

                    <button 
                        onClick={handleReset}
                        className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-sky-300 font-semibold text-xs py-1.5 px-3 sm:px-4 rounded-full shadow-md transition-all cursor-pointer flex items-center gap-2"
                        aria-label={t('header_reset_button_title')}
                        title={t('header_reset_button_title')}
                     >
                         <i className="fas fa-times"></i>
                         <span className="hidden sm:inline">{t('header_reset_button')}</span>
                    </button>
                </div>
            </header>
            
            <main role="main" className="flex-grow flex flex-col overflow-hidden relative">
                {/* Fix: Passed t function as a prop to ErrorDisplay. */}
                {appStatus === 'error' ? <ErrorDisplay t={t} /> : <ReaderView {...MOCK_BOOK} currentSentenceIndex={currentSentenceIndex} t={t} />}
            </main>
            
            {isControlsVisible && (
                 <footer role="contentinfo" className="relative z-10 p-3 shrink-0">
                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-[90%] h-8 bg-white dark:bg-slate-800 blur-xl transition-colors duration-300"></div>
                    <StatusBar />
                     <PlayerControlsUI
                        playbackState={playbackState}
                        handlePlayPause={handlePlayPause}
                        playDisabled={false}
                        isPlaying={isPlaying}
                        isLoading={playbackState === 'loading'}
                        totalSentences={MOCK_BOOK.translatedSentences.length}
                        currentSentenceIndex={currentSentenceIndex}
                        handleTimelineChange={handleTimelineChange}
                        speed={speed}
                        handleSpeedChange={setSpeed}
                        presetSpeeds={[{ value: 1, label: '1.0x' }, { value: 1.5, label: '1.5x' }]}
                        language={language}
                        languages={LANGUAGES}
                        handleLanguageChange={handleLanguageChange}
                        selectedVoiceId={selectedVoiceId}
                        setVoice={setSelectedVoiceId}
                        currentVoices={language.voices}
                        onFileSelect={() => {}}
                        fileName={fileName}
                        currentChapter={1}
                        totalChapters={1}
                        elapsedTime={formatTime(30)}
                        totalTime={formatTime(120)}
                        narrationMode={narrationMode}
                        setNarrationMode={setNarrationMode}
                        isApiKeySet={true}
                        hasNativeVoices={true}
                        t={t}
                    />
                </footer>
            )}
        </>
    );
};