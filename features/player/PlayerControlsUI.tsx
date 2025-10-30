import React from 'react';
import { PlayIcon, PauseIcon } from '../../components/Icons';
import { Language, NarrationMode, PlaybackState, Voice } from '../../types';

const ACCEPTED_FILES = ".pdf,.epub,.txt";

interface PlayerControlsUIProps {
    playbackState: PlaybackState;
    handlePlayPause: () => void;
    playDisabled: boolean;
    isPlaying: boolean;
    isLoading: boolean;
    totalSentences: number;
    currentSentenceIndex: number;
    handleTimelineChange: (index: number) => void;
    speed: number;
    handleSpeedChange: (speed: number) => void;
    presetSpeeds: { value: number, label: string }[];
    language: Language;
    languages: Language[];
    handleLanguageChange: (langCode: string) => void;
    selectedVoiceId: string;
    setVoice: (voiceId: string) => void;
    currentVoices: Voice[];
    onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
    fileName: string;
    currentChapter: number;
    totalChapters: number;
    elapsedTime: string;
    totalTime: string;
    narrationMode: NarrationMode;
    setNarrationMode: (mode: NarrationMode) => void;
    isApiKeySet: boolean;
    hasNativeVoices: boolean;
    // Fix: Added t function to props to be passed down from MainLayout.
    t: (key: string, params?: Record<string, any>) => string;
}

export const PlayerControlsUI: React.FC<PlayerControlsUIProps> = (props) => {
    const {
        playbackState, handlePlayPause, playDisabled, isPlaying, isLoading,
        totalSentences, currentSentenceIndex, handleTimelineChange,
        speed, handleSpeedChange, presetSpeeds,
        language, languages, handleLanguageChange,
        selectedVoiceId, setVoice, currentVoices, onFileSelect, fileName,
        currentChapter, totalChapters, elapsedTime, totalTime,
        narrationMode, setNarrationMode, 
        isApiKeySet, hasNativeVoices,
        // Fix: Destructure t from props.
        t
    } = props;
    
    // Fix: Removed useTranslation hook.

    // --- Sub-componentes para melhor legibilidade ---
    
    const SelectPill: React.FC<{label: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, children: React.ReactNode, icon: string, disabled?: boolean, className?: string}> = 
    ({ label, value, onChange, children, icon, disabled, className = '' }) => (
         <div className={`relative flex items-center ${className}`}>
            <i className={`fas ${icon} text-sky-500 dark:text-sky-400 absolute left-3 pointer-events-none ${disabled ? 'opacity-50' : ''}`}></i>
            <select value={value} disabled={disabled} onChange={onChange}
                className="appearance-none bg-slate-200/80 dark:bg-slate-700/50 border border-transparent hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-white text-sm rounded-full focus:ring-sky-500 focus:border-sky-500 block w-full pl-9 pr-8 py-2.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={label}
            >{children}</select>
            <i className={`fas fa-chevron-down text-slate-500 dark:text-slate-400 absolute right-3 text-xs pointer-events-none ${disabled ? 'opacity-50' : ''}`}></i>
        </div>
    );
    
    const ModeButton: React.FC<{label: string, icon: string, mode: any, currentMode: any, onClick: (mode: any) => void, disabled?: boolean, title?: string}> =
    ({ label, icon, mode, currentMode, onClick, disabled, title }) => (
        <button 
            onClick={() => onClick(mode)}
            disabled={disabled}
            title={title}
            className={`w-full flex items-center justify-center gap-2 text-sm font-semibold py-2.5 px-4 rounded-full transition-all duration-200 ease-in-out
                ${currentMode === mode 
                    ? 'bg-sky-500 text-white shadow-md' 
                    : 'bg-slate-200/80 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 hover:bg-slate-300/80 dark:hover:bg-slate-600'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
            <i className={`fas ${icon}`}></i>
            {label}
        </button>
    );

    return (
        <div className="flex flex-col items-center justify-center gap-2 w-full bg-gray-50/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl p-3 border border-gray-200 dark:border-slate-700/50 shadow-lg transition-colors duration-300">
            {/* Seção de upload de arquivo, visível apenas quando nenhum livro está carregado */}
            <div className={`w-full px-1 transition-all duration-500 ease-in-out transform-gpu overflow-hidden ${!fileName ? 'max-h-40 opacity-100 py-1' : 'max-h-0 opacity-0'}`}>
                <label htmlFor="file-upload-player" title={t('player_load_book_button_title')} aria-label={t('player_load_book_button_title')} className="w-full flex items-center justify-center gap-3 bg-slate-200/80 dark:bg-slate-700/50 hover:bg-slate-300/80 dark:hover:bg-slate-600 rounded-full text-slate-700 dark:text-slate-200 font-semibold cursor-pointer transition-all py-3 px-4 text-base shadow-sm">
                    <i className="fas fa-folder-open text-sky-500 dark:text-sky-400"></i>
                    <span>{t('player_load_book_button')}</span>
                </label>
                <input 
                    id="file-upload-player"
                    type="file"
                    className="hidden"
                    accept={ACCEPTED_FILES}
                    onChange={onFileSelect}
                />
            </div>

            {/* Controles principais: Linha do Tempo e Botões */}
            <div className="flex flex-col gap-2 w-full px-1">
                {/* Linha do Tempo */}
                <div className="flex items-center gap-2 w-full">
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 w-12 text-center tabular-nums" title={t('player_elapsed_time_title')}>{elapsedTime}</span>
                    <input 
                        type="range" 
                        min="0" 
                        max={totalSentences > 0 ? totalSentences - 1 : 0} 
                        value={currentSentenceIndex >= 0 ? currentSentenceIndex : 0} 
                        onChange={(e) => handleTimelineChange(parseInt(e.target.value, 10))} 
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer timeline-slider" 
                        aria-label={t('player_progress_aria')}
                    />
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 w-12 text-center tabular-nums" title={t('player_total_time_title')}>{totalTime}</span>
                </div>
                {/* Linha de Controles */}
                <div className="flex items-center justify-between w-full">
                    {/* Lado Esquerdo: Capítulo */}
                    <div className="flex-1 flex justify-start">
                         <div className="flex items-center gap-x-2 text-xs text-slate-500 dark:text-slate-400">
                            <span title={t('player_chapter_info_title', { current: currentChapter, total: totalChapters })}>
                                <i className="fas fa-book mr-1 text-sky-500"></i>
                                {totalChapters > 0 ? `${currentChapter}/${totalChapters}` : '-/-'}
                            </span>
                        </div>
                    </div>
                    {/* Centro: Botão de Play/Pause */}
                    <div className="flex-1 flex justify-center">
                        <button onClick={handlePlayPause} disabled={playDisabled} className="w-16 h-16 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center shadow-lg shadow-sky-600/30 disabled:shadow-none transition-all shrink-0" aria-label={isPlaying ? t('player_pause_aria') : t('player_play_aria')}>
                            {isPlaying ? <PauseIcon /> : <PlayIcon isLoading={isLoading}/>}
                        </button>
                    </div>
                    {/* Lado Direito: Velocidade */}
                    <div className="flex-1 flex justify-end">
                        <div className="relative flex items-center">
                            <i className="fas fa-gauge-high text-sky-500 text-xs absolute left-0 pointer-events-none"></i>
                            <select value={speed} onChange={(e) => handleSpeedChange(parseFloat(e.target.value))} className="appearance-none bg-transparent text-slate-700 dark:text-slate-200 text-xs rounded-full focus:ring-sky-500 focus:border-sky-500 block w-full pl-5 pr-6 py-1 transition-colors cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700/50">
                                {presetSpeeds.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                            <i className="fas fa-chevron-down text-slate-500 dark:text-slate-400 absolute right-1 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none"></i>
                        </div>
                    </div>
                </div>
            </div>
            
             {/* Controles de Configuração: Idioma, Voz, Modo de Narração */}
             <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center w-full px-1 gap-2 pt-2">
                 <div className="flex w-full sm:w-auto items-center gap-2">
                     <SelectPill label={t('player_select_lang_aria')} value={language.code} onChange={(e) => handleLanguageChange(e.target.value)} icon="fa-globe" className="flex-grow">
                         {languages.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                         ))}
                     </SelectPill>
                     <SelectPill label={t('player_select_voice_aria')} value={selectedVoiceId} onChange={(e) => setVoice(e.target.value)} disabled={currentVoices.length === 0} icon="fa-microphone-alt" className="flex-grow">
                        {currentVoices.length > 0 ? (
                            currentVoices.map(voice => (
                                <option key={voice.id} value={voice.id}>{voice.name}</option>
                            ))
                        ) : (
                            <option value="" disabled>
                                {narrationMode === 'native' ? t('player_voice_placeholder_native') : t('player_voice_placeholder_general')}
                            </option>
                        )}
                     </SelectPill>
                 </div>
                <div className="w-full sm:w-auto sm:flex-grow grid grid-cols-2 gap-2">
                     <ModeButton 
                        label={t('player_narration_ia')}
                        icon="fa-brain-circuit"
                        mode="ia"
                        currentMode={narrationMode}
                        onClick={setNarrationMode}
                        disabled={!isApiKeySet}
                        title={!isApiKeySet ? t('player_narration_ia_title_no_key') : t('player_narration_ia_title')}
                    />
                    <ModeButton 
                        label={t('player_narration_native')}
                        icon="fa-volume-high"
                        mode="native"
                        currentMode={narrationMode}
                        onClick={setNarrationMode}
                        disabled={!hasNativeVoices}
                        title={hasNativeVoices ? t('player_narration_native_title') : t('player_narration_native_title_unavailable', { langName: language.name })}
                    />
                </div>
             </div>
        </div>
    );
};