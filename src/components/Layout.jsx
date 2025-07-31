// src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '/src/components/Header.jsx';
import ActiveReportsSidebar from '/src/components/ActiveReportsSidebar.jsx';

function Layout() {
    return (
        <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
            <Header />
            <div className="flex flex-grow overflow-hidden">
                {/* Thêm class để tour có thể nhận diện */}
                <main className="flex-grow overflow-auto relative tour-step-2-workspace">
                    <Outlet />
                </main>
                <ActiveReportsSidebar />
            </div>
        </div>
    );
}

export default Layout;
