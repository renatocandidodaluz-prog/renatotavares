import React from 'react';
import { Toast as ToastType } from '../types';

interface ToastProps {
    toast: ToastType | null;
    // Fix: Added t function to props to be passed down from MainLayout.
    t: (key: string, params?: Record<string, any>) => string;
}

const toastStyles = {
    info: {
        icon: 'fa-info-circle',
        iconColor: 'text-sky-500 dark:text-sky-400',
        borderColor: 'border-slate-300/50 dark:border-slate-600/50'
    },
    warning: {
        icon: 'fa-exclamation-triangle',
        iconColor: 'text-amber-500 dark:text-amber-400',
        borderColor: 'border-amber-400/50 dark:border-amber-600/50'
    },
    error: {
        icon: 'fa-times-circle',
        iconColor: 'text-red-500 dark:text-red-400',
        borderColor: 'border-red-400/50 dark:border-red-600/50'
    }
};

export const Toast: React.FC<ToastProps> = ({ toast, t }) => {
    // Fix: Removed useTranslation hook.
    if (!toast) return null;

    const type = toast.type || 'info';
    const styles = toastStyles[type];
    const message = t(toast.key, toast.params);

    return (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[90%]">
            <div className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-800 dark:text-white text-center text-sm py-2 px-4 rounded-full shadow-lg border ${styles.borderColor} animate-fade-in-down`}>
                <i className={`fas ${styles.icon} mr-2 ${styles.iconColor}`}></i>
                {message}
            </div>
            <style>{`
                @keyframes fade-in-down {
                    0% {
                        opacity: 0;
                        transform: translate(-50%, -20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translate(-50%, 0);
                    }
                }
                .animate-fade-in-down {
                    animation: fade-in-down 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};