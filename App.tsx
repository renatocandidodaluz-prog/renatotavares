import React from 'react';
import { MainLayout } from './layouts/MainLayout';

const App: React.FC = () => {
    return (
        // Container principal que define o fundo e centraliza o "cartão" da aplicação.
        <div className="min-h-screen bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-200 font-sans flex flex-col items-center justify-center p-2 sm:p-4 transition-colors duration-300">
            {/* O "cartão" da aplicação com estilo, sombra e layout flexível. */}
            <div className="w-full max-w-md h-[96vh] max-h-[900px] bg-white dark:bg-slate-800 rounded-3xl shadow-lg shadow-slate-400/30 dark:shadow-black/50 flex flex-col overflow-hidden selection:bg-sky-500/30 relative transition-colors duration-300">
                <MainLayout />
            </div>
        </div>
    );
};

export default App;