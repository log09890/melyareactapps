// src/components/Navigation.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
// Import lại các icon đã thiếu
import { RevenueIcon, InventoryIcon, SalesRateIcon, ChannelIcon, CompareIcon } from './Icons'; 
import { LifecycleIcon } from './Icons'; 

function Navigation() {
    return (
        <nav className="hidden md:flex items-center h-full ml-10 space-x-2">
            {/* SỬA LỖI: Cập nhật đường dẫn cho Báo cáo Doanh thu */}
            <NavLink to="/sales" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title="Báo cáo Doanh thu">
                 <span className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium">
                    <RevenueIcon />
                    Doanh thu
                </span>
            </NavLink>
            
            <NavLink to="/inventory" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title="Báo cáo Tồn kho">
                <span className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium">
                    <InventoryIcon />
                    Tồn kho
                </span>
            </NavLink>
            
            <NavLink to="/sales-rate" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title="Phân tích Tỷ lệ">
                <span className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium">
                    <SalesRateIcon />
                    Tỷ lệ
                </span>
            </NavLink>

            <NavLink to="/channels" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title="Hiệu suất Kênh bán">
                <span className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium">
                    <ChannelIcon />
                    Kênh bán
                </span>
            </NavLink>

            <NavLink to="/lifecycle" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title="Báo cáo Vòng đời SP">
                 <span className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium">
                    <LifecycleIcon />
                    Vòng đời SP
                </span>
            </NavLink>
            
            <NavLink to="/comparison" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} title="So sánh Báo cáo">
                 <span className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium">
                    <CompareIcon />
                    So sánh
                </span>
            </NavLink>

        </nav>
    );
}

export default Navigation;
