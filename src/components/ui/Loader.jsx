// src/components/ui/Loader.jsx
import React from 'react';

// Loader giờ đây là một thanh tiến trình
const Loader = ({ progress = 0, message = "Đang tải dữ liệu..." }) => {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-800/80 z-10 space-y-4 rounded-lg">
        <div className="w-3/4 max-w-sm">
            <p className="text-center text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">{message}</p>
            <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2.5 overflow-hidden">
                <div 
                    className="bg-amber-500 h-2.5 rounded-full transition-all duration-200"
                    style={{width: `${progress}%`}}
                ></div>
            </div>
            <p className="text-center text-sm text-slate-500 mt-2">{Math.round(progress)}%</p>
        </div>
      </div>
    );
};

export default Loader;
