import React from 'react';

interface ErrorDisplayProps {
    error?: string | null;
    errorType?: 'generic' | 'quota';
    onReset?: () => void;
    t: (key: string, params?: Record<string, any>) => string;
}


export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
    error,
    errorType,
    onReset = () => {},
    t
}) => {
    const isQuotaError = errorType === 'quota';

    return (
        <div className={`flex-grow flex flex-col items-center justify-center text-center p-4 ${isQuotaError ? 'text-amber-500 dark:text-amber-300' : 'text-red-500 dark:text-red-400'}`}>
            <i className={`fas ${isQuotaError ? 'fa-wallet' : 'fa-exclamation-triangle'} text-5xl mb-6`}></i>
            <h2 className="text-xl font-bold mb-2">{isQuotaError ? t('error_quota_title') : t('error_generic_title')}</h2>
            <p className="max-w-md mb-6 text-slate-600 dark:text-slate-300">{error || t('error_unknown_message')}</p>
            {isQuotaError && (
                 <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer"
                    className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-6 rounded-full transition-colors mb-4 inline-block shadow-lg shadow-sky-600/30">
                    {t('error_billing_button')}
                </a>
            )}
            <button onClick={onReset} className={`font-bold py-2 px-6 rounded-full transition-colors ${isQuotaError ? 'bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200' : 'bg-sky-600 hover:bg-sky-500 text-white'}`}>
                {isQuotaError ? t('error_reset_button') : t('error_retry_button')}
            </button>
        </div>
    );
};