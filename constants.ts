import { Language } from './types';

export const LANGUAGES: Language[] = [
    { 
        code: 'pt-BR', 
        name: 'Português (Brasil)', 
        translationTargetLanguage: 'Português do Brasil',
        voices: [
            { id: 'Kore', name: 'Kore' },
            { id: 'Puck', name: 'Puck' },
            { id: 'Charon', name: 'Charon' },
            { id: 'Zephyr', name: 'Zephyr' },
        ]
    },
    { 
        code: 'en-US', 
        name: 'English (USA)', 
        translationTargetLanguage: 'American English',
        voices: [
            { id: 'Zephyr', name: 'Zephyr' },
            { id: 'Puck', name: 'Puck' },
            { id: 'Charon', name: 'Charon' },
        ]
    },
    { 
        code: 'es-ES', 
        name: 'Español (España)', 
        translationTargetLanguage: 'Espanhol da Espanha',
        voices: [
            { id: 'Fenrir', name: 'Fenrir' },
            { id: 'Kore', name: 'Kore' },
        ]
    },
    { 
        code: 'ru-RU', 
        name: 'Русский (Россия)', 
        translationTargetLanguage: 'Russo',
        voices: [
            { id: 'Fenrir', name: 'Fenrir' },
            { id: 'Kore', name: 'Kore' },
        ]
    }
];