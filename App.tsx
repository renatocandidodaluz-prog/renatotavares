
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { pdfjs } from 'pdfjs-dist';
import ePub from 'epubjs';

// Configuração do worker para pdf.js
pdfjs.GlobalWorkerOptions.workerSrc = `//esm.sh/pdfjs-dist@4.4.168/build/pdf.worker.min.js`;

// --- ÍCONES ---
const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} width="32" height="32" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M8 5V19L19 12L8 5Z" /></svg>
);
const PauseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} width="32" height="32" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M6 19H10V5H6V19ZM14 5V19H18V5H14Z" /></svg>
);
const LoaderIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/><path d="M10.72,19.9a8,8,0,0,1-6.5-9.79A7.77,7.77,0,0,1,10.4,4.16a8,8,0,0,1,9.49,6.52A1.54,1.54,0,0,0,21.38,12h.13a1.37,1.37,0,0,0,1.38-1.54,11,11,0,1,0-12.7,12.39A1.54,1.54,0,0,0,12,21.34h0A1.47,1.47,0,0,0,10.72,19.9Z"><animateTransform attributeName="transform" type="rotate" dur="0.75s" values="0 12 12;360 12 12" repeatCount="indefinite"/></path></svg>
);

// --- UTILITÁRIOS ---
const splitIntoSentences = (text: string): string[] => {
    if (!text) return [];
    const cleanedText = text.replace(/(\r\n|\n|\r)/gm, " ").replace(/\s+/g, ' ').trim();
    const sentences = cleanedText.match(/[^.!?]+[.!?]*\s*|$/g) || [];
    return sentences.map(s => s.trim()).filter(s => s.length > 0);
};

const formatTime = (index: number, wordsPerSecond: number = 2): string => {
    // This is a rough estimation. A more accurate way would be to count words.
    // Assuming an average sentence has around 15-20 words and reading speed is ~3 words/sec.
    // Let's approximate based on sentences, assuming each sentence takes a few seconds.
    const averageSecondsPerSentence = 5; // Heuristic
    const totalSeconds = index * averageSecondsPerSentence;
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
};


// --- COMPONENTE PRINCIPAL ---
const App: React.FC = () => {
    // Estado do App
    const [isLoading, setIsLoading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [sentences, setSentences] = useState<string[]>([]);
    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);
    const [speed, setSpeed] = useState(1.0);
    
    // Refs
    const sentenceRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const mainContentRef = useRef<HTMLElement | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Efeitos
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
                const defaultVoice = availableVoices.find(v => v.lang.startsWith('pt-BR') || v.default) || availableVoices.find(v => v.lang.startsWith('en-US')) || availableVoices[0];
                if (defaultVoice) {
                    setSelectedVoiceURI(defaultVoice.voiceURI);
                }
            }
        };
        loadVoices();
        // onvoiceschanged is not reliable on all browsers. A timeout is a fallback.
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
             window.speechSynthesis.onvoiceschanged = loadVoices;
        } else {
            setTimeout(loadVoices, 500);
        }
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    const playCurrentSentence = useCallback(() => {
        if (sentences.length === 0 || currentSentenceIndex >= sentences.length) return;
    
        window.speechSynthesis.cancel(); // Cancel any previous speech
    
        const utterance = new SpeechSynthesisUtterance(sentences[currentSentenceIndex]);
        utteranceRef.current = utterance;
    
        const selectedVoice = voices.find(v => v.voiceURI === selectedVoiceURI);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        utterance.rate = speed;
    
        utterance.onend = () => {
            if (currentSentenceIndex < sentences.length - 1) {
                setCurrentSentenceIndex(prev => prev + 1);
            } else {
                setIsPlaying(false);
                setCurrentSentenceIndex(0); // Reset to start
            }
        };
    
        utterance.onerror = (event) => {
            console.error("SpeechSynthesisUtterance.onerror", event);
            setIsPlaying(false);
        };
    
        window.speechSynthesis.speak(utterance);
    }, [currentSentenceIndex, sentences, selectedVoiceURI, speed, voices]);

    useEffect(() => {
        if (isPlaying) {
            playCurrentSentence();
        } else {
            window.speechSynthesis.cancel();
        }
    
        return () => {
            window.speechSynthesis.cancel();
        };
    }, [isPlaying, playCurrentSentence]);
    

    useEffect(() => {
        const currentSentenceElement = sentenceRefs.current[currentSentenceIndex];
        const mainContentElement = mainContentRef.current;
        if (currentSentenceElement && mainContentElement) {
            const sentenceTop = currentSentenceElement.offsetTop;
            const sentenceHeight = currentSentenceElement.offsetHeight;
            const contentScrollTop = mainContentElement.scrollTop;
            const contentHeight = mainContentElement.clientHeight;

            // Check if the sentence is not visible
            const isSentenceAbove = sentenceTop < contentScrollTop;
            const isSentenceBelow = (sentenceTop + sentenceHeight) > (contentScrollTop + contentHeight);

            if (isSentenceAbove || isSentenceBelow) {
                mainContentElement.scrollTo({
                    top: sentenceTop - (contentHeight / 4), // Scroll to a bit above the sentence
                    behavior: 'smooth',
                });
            }
        }
    }, [currentSentenceIndex]);


    // Manipuladores de Eventos
    const resetState = () => {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setFileName(null);
        setSentences([]);
        setCurrentSentenceIndex(0);
        sentenceRefs.current = [];
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        resetState();
        setIsLoading(true);
        setFileName(file.name);

        try {
            let text = '';
            const fileExtension = file.name.split('.').pop()?.toLowerCase();

            if (fileExtension === 'pdf' || file.type === 'application/pdf') {
                const doc = await pdfjs.getDocument(URL.createObjectURL(file)).promise;
                const pageTexts = await Promise.all(
                    Array.from({ length: doc.numPages }, (_, i) => doc.getPage(i + 1).then(page => page.getTextContent()))
                );
                text = pageTexts.map(content => content.items.map((item: any) => item.str).join(' ')).join('\n');
            } else if (fileExtension === 'epub' || file.type === 'application/epub+zip') {
                const book = ePub(URL.createObjectURL(file));
                await book.ready;
                const allSections = await Promise.all(
                    book.spine.items.map(item => 
                        item.load(book.load.bind(book)).then(doc => {
                            const content = doc.body.textContent || '';
                            item.unload();
                            return content;
                        })
                    )
                );
                text = allSections.join(' ');
            } else {
                text = await file.text();
            }
            setSentences(splitIntoSentences(text));
        } catch (error) {
            console.error("Erro ao processar o arquivo:", error);
            alert("Não foi possível carregar o arquivo. Por favor, tente um formato diferente (PDF, EPUB, TXT).");
            resetState();
        } finally {
            setIsLoading(false);
            event.target.value = ''; // Permite recarregar o mesmo arquivo
        }
    };

    const togglePlayPause = useCallback(() => {
        if (sentences.length > 0) {
            setIsPlaying(prev => !prev);
        }
    }, [sentences]);

    const handleSentenceClick = (index: number) => {
        setCurrentSentenceIndex(index);
        if (!isPlaying) {
            setIsPlaying(true);
        } else {
            // If already playing, stop the current and start the new one
            playCurrentSentence();
        }
    };

    const handleProgressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newIndex = Number(event.target.value);
        setCurrentSentenceIndex(newIndex);
        if (isPlaying) {
             playCurrentSentence();
        }
    };

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    const presetSpeeds = [{ value: 0.8, label: '0.8x' }, { value: 1, label: '1.0x' }, { value: 1.2, label: '1.2x' }, { value: 1.5, label: '1.5x' }, { value: 2.0, label: '2.0x' }];

    const EmptyState = () => (
         <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 mb-6 bg-sky-100 dark:bg-sky-900/40 rounded-full flex items-center justify-center">
                <i className="fas fa-book-open-reader text-4xl text-sky-500 dark:text-sky-400"></i>
            </div>
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">Bem-vindo ao AI Ebook Reader</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">Carregue seu livro ou documento (PDF, EPUB, TXT) para começar a ouvir com vozes naturais.</p>
            <label htmlFor="file-upload-main" className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-sky-600/30 transition-all cursor-pointer flex items-center gap-3 text-lg">
                <i className="fas fa-file-arrow-up"></i>
                <span>Carregar Livro</span>
            </label>
            <input id="file-upload-main" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.epub,.txt" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-200 font-sans flex flex-col items-center justify-center p-2 sm:p-4 transition-colors duration-300">
            <div className="w-full max-w-md h-[96vh] max-h-[900px] bg-white dark:bg-slate-800 rounded-3xl shadow-lg shadow-slate-400/30 dark:shadow-black/50 flex flex-col overflow-hidden selection:bg-sky-500/30 relative transition-colors duration-300">
                <style>{`
                  :root { --scrollbar-border-color: #f1f5f9; }
                  .dark { --scrollbar-border-color: #1e2b3b; }
                  .custom-scrollbar::-webkit-scrollbar { width: 8px; }
                  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                  .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #38bdf8; border-radius: 20px; border: 3px solid var(--scrollbar-border-color); }
                  body { overflow: hidden; }
                `}</style>

                <header role="banner" className="flex items-center justify-between text-center py-4 px-6 border-b border-gray-200 dark:border-slate-700/80 relative z-20 shrink-0 transition-colors duration-300">
                    <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-200 tracking-wide truncate transition-colors duration-300">AI Reader</h1>
                    <div className="flex items-center gap-2 sm:gap-3">
                         {fileName && <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 max-w-[120px] truncate" title={fileName}>{fileName}</p>}
                        
                        <div className={`transition-all duration-300 ease-in-out ${fileName ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                            <label htmlFor="file-upload-header" title="Carregar outro livro" className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-sky-300 font-semibold text-xs py-1.5 px-3 sm:px-4 rounded-full shadow-md transition-all cursor-pointer flex items-center gap-2">
                                <i className="fas fa-file-arrow-up"></i> <span className="hidden sm:inline">Carregar</span>
                            </label>
                            <input id="file-upload-header" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.epub,.txt"/>
                        </div>

                         <button onClick={toggleTheme} className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-sky-300 font-semibold text-xs py-1.5 px-3 sm:px-4 rounded-full shadow-md transition-all cursor-pointer flex items-center gap-2" aria-label="Alternar tema">
                            {theme === 'dark' ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>} <span className="hidden sm:inline">Tema</span>
                        </button>

                         {fileName && <button onClick={resetState} className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-sky-300 font-semibold text-xs py-1.5 px-3 sm:px-4 rounded-full shadow-md transition-all cursor-pointer flex items-center gap-2" aria-label="Fechar livro" title="Fechar livro">
                            <i className="fas fa-times"></i> <span className="hidden sm:inline">Fechar</span>
                        </button>}
                    </div>
                </header>
                
                <main role="main" ref={mainContentRef} className="flex-grow flex flex-col overflow-hidden relative">
                    {isLoading ? (
                        <div className="absolute inset-0 bg-white/50 dark:bg-slate-800/50 flex flex-col items-center justify-center z-30 backdrop-blur-sm">
                            <LoaderIcon className="w-16 h-16 text-sky-500" />
                            <p className="mt-4 font-semibold text-lg text-slate-600 dark:text-slate-300">Processando seu livro...</p>
                        </div>
                    ) : sentences.length > 0 ? (
                        <div className="w-full flex-grow overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
                            <div className="text-gray-800 dark:text-gray-300 text-lg leading-relaxed font-serif text-justify">
                                {sentences.map((sentence, index) => (
                                    <span 
                                        key={index}
                                        ref={el => (sentenceRefs.current[index] = el)}
                                        onClick={() => handleSentenceClick(index)}
                                        className={`cursor-pointer transition-colors duration-300 p-1 rounded ${index === currentSentenceIndex ? 'bg-sky-200 text-sky-900 dark:bg-sky-500/20 dark:text-sky-200' : 'hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}
                                    >
                                        {sentence}{' '}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <EmptyState />
                    )}
                </main>
                
                {sentences.length > 0 && (
                     <footer role="contentinfo" className="relative z-10 p-3 shrink-0">
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-[90%] h-8 bg-white dark:bg-slate-800 blur-xl transition-colors duration-300"></div>
                        <div className="flex flex-col items-center justify-center gap-2 w-full bg-gray-50/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl p-3 border border-gray-200 dark:border-slate-700/50 shadow-lg transition-colors duration-300">
                            <div className="flex flex-col gap-2 w-full px-1">
                                <div className="flex items-center gap-2 w-full">
                                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 w-12 text-center tabular-nums">{formatTime(currentSentenceIndex)}</span>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max={sentences.length - 1} 
                                        value={currentSentenceIndex} 
                                        onChange={handleProgressChange} 
                                        className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-slate-700" 
                                        aria-label="Progresso da leitura"
                                    />
                                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 w-12 text-center tabular-nums">{formatTime(sentences.length)}</span>
                                </div>
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex-1 flex justify-start">
                                         <div className="relative flex items-center group">
                                             <i className="fas fa-volume-high text-sky-500 text-xs absolute left-0 pointer-events-none z-10 pl-3"></i>
                                             <select 
                                                value={selectedVoiceURI || ''}
                                                onChange={(e) => setSelectedVoiceURI(e.target.value)} 
                                                className="appearance-none bg-transparent text-slate-700 dark:text-slate-200 text-xs rounded-full focus:ring-sky-500 focus:border-sky-500 block w-32 pl-8 pr-6 py-1 transition-colors cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700/50 truncate"
                                                title="Selecione uma voz"
                                             >
                                                {voices.map(voice => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>)}
                                             </select>
                                             <i className="fas fa-chevron-down text-slate-500 dark:text-slate-400 absolute right-1 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none group-hover:text-sky-400"></i>
                                        </div>
                                    </div>
                                    <div className="flex-1 flex justify-center">
                                        <button onClick={togglePlayPause} className="w-16 h-16 bg-sky-600 hover:bg-sky-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-sky-600/30 transition-all shrink-0" aria-label={isPlaying ? "Pausar" : "Reproduzir"}>
                                            {isPlaying ? <PauseIcon /> : <PlayIcon />}
                                        </button>
                                    </div>
                                    <div className="flex-1 flex justify-end">
                                        <div className="relative flex items-center group">
                                            <i className="fas fa-gauge-high text-sky-500 text-xs absolute left-0 pointer-events-none z-10 pl-3"></i>
                                            <select value={speed} onChange={e => setSpeed(Number(e.target.value))} className="appearance-none bg-transparent text-slate-700 dark:text-slate-200 text-xs rounded-full focus:ring-sky-500 focus:border-sky-500 block w-full pl-8 pr-6 py-1 transition-colors cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700/50">
                                                {presetSpeeds.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                            </select>
                                            <i className="fas fa-chevron-down text-slate-500 dark:text-slate-400 absolute right-1 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none group-hover:text-sky-400"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default App;
