// src/components/ui/PageHeader.jsx
import React from 'react';

const PageHeader = ({ title, description }) => (
    <header className="flex justify-between items-start pb-6 border-b border-slate-200 dark:border-slate-700 mb-6">
        <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{title}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{description}</p>
        </div>
    </header>
);

export default PageHeader;
