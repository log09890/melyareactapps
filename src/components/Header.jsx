// src/components/Header.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTheme } from '/src/context/ThemeContext.jsx';
import { HomeIcon, ReportsIcon, CompareIcon, SettingsIcon, DatabaseIcon } from '/src/components/Icons.jsx';

function Header() {
    const { theme } = useTheme(); 
    const databaseUrl = "https://docs.google.com/spreadsheets/d/1ZkTTz5iba1VPP8etZjNdrqaxm6t5-yG6DfWSaVnruYg/edit?usp=sharing";

    return (
        // Thêm class để tour có thể nhận diện
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 h-16 flex items-center justify-between flex-shrink-0 z-20 shadow-sm tour-step-1-header">
            <NavLink to="/" className="flex items-center">
                <span className="hidden sm:block text-lg font-semibold ml-3 text-slate-700 dark:text-slate-200">Report System</span>
            </NavLink>
            
            <nav className="flex items-center gap-2">
                <NavLink to="/" title="Trang chủ" className={({isActive}) => `nav-icon ${isActive ? 'active' : ''}`}>
                    <HomeIcon />
                </NavLink>
                <NavLink to="/reports" title="Danh mục Báo cáo" className={({isActive}) => `nav-icon ${isActive ? 'active' : ''}`}>
                    <ReportsIcon />
                </NavLink>
                <a 
                  href={databaseUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  title="Mở Database" 
                  className="nav-icon"
                >
                    <DatabaseIcon />
                </a>
                <NavLink to="/comparison" title="So sánh" className={({isActive}) => `nav-icon ${isActive ? 'active' : ''}`}>
                    <CompareIcon />
                </NavLink>
                <NavLink to="/settings" title="Cài đặt" className={({isActive}) => `nav-icon ${isActive ? 'active' : ''}`}>
                    <SettingsIcon />
                </NavLink>
            </nav>
        </header>
    );
}

export default Header;
