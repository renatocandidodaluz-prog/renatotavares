export type PlaybackState = 'idle' | 'playing' | 'paused' | 'loading';

export type NarrationMode = 'ia' | 'native';

export interface Voice {
    id: string;
    name: string;
}

export interface Language {
    code: string;
    name: string;
    translationTargetLanguage: string;
    voices: Voice[];
}

export interface Toast {
    id: number;
    key: string;
    params?: Record<string, any>;
    type?: 'info' | 'warning' | 'error';
}

export interface ReadingHistory {
    fileName: string;
    originalChapters: string[];
    translatedSentences: string[];
    totalWordCount: number;
    chapterSentenceCounts: number[];
    currentSentenceIndex: number;
    selectedLanguageCode: string;
    selectedVoiceId: string;
    narrationMode: NarrationMode;
    timestamp: number;
}
