// src/components/ui/KpiCard.jsx
import React from 'react';

const KpiCard = ({ title, value, className = '' }) => (
    <div className={`bg-white dark:bg-slate-800 p-5 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-center items-center text-center ${className}`}>
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h3>
        <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-2">{value}</p>
    </div>
);

export default KpiCard;
