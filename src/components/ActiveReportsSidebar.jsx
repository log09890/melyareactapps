// src/components/ActiveReportsSidebar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '/src/context/WorkspaceContext.jsx';
import * as Icons from '/src/components/Icons.jsx';
import WorkspaceTour from '/src/components/WorkspaceTour.jsx';

export default function ActiveReportsSidebar() {
    const { openReports, activeReportId, setActiveReportId, closeReport } = useWorkspace();
    const [isTourOpen, setIsTourOpen] = useState(false);
    const navigate = useNavigate(); // Khởi tạo hook navigate

    const handleClose = (e, reportId) => {
        e.preventDefault();
        e.stopPropagation();
        closeReport(reportId);
    };

    const handleAddNewReport = () => {
        navigate('/reports/new'); // Điều hướng đến trang tạo báo cáo
    };

    return (
        <>
            <aside className="w-16 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col items-center py-4 flex-shrink-0 tour-step-3-sidebar">
                {/* Nút Thêm Báo cáo Mới */}
                <div className="tour-step-add-report mb-4">
                    <button
                        onClick={handleAddNewReport}
                        className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                        title="Tạo Báo cáo mới"
                    >
                        <Icons.PlusIcon />
                    </button>
                </div>
                
                {/* Đường kẻ phân cách */}
                <hr className="w-10/12 border-t border-slate-200 dark:border-slate-700 mb-4" />

                {/* Các icon báo cáo đang mở */}
                <div className="flex-grow space-y-4 w-full flex flex-col items-center">
                    {openReports.map((report, index) => {
                        const IconComponent = Icons[report.icon] || Icons.ReportsIcon;
                        const isActive = report.id === activeReportId;
                        
                        const iconTourClass = index === 0 ? 'tour-step-4-sidebar-icon' : '';
                        const closeTourClass = index === 0 ? 'tour-step-5-close-icon' : '';

                        return (
                            <div key={report.id} className={`relative group ${iconTourClass}`}>
                                <button
                                    onClick={() => setActiveReportId(report.id)}
                                    className={`p-3 rounded-lg transition-colors ${isActive ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                    title={report.name}
                                >
                                    <IconComponent />
                                </button>
                                <div className={closeTourClass}>
                                    <button
                                        onClick={(e) => handleClose(e, report.id)}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-slate-400 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-opacity"
                                        title={`Đóng ${report.name}`}
                                    >
                                        &times;
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Nút hướng dẫn ở dưới cùng */}
                <div className="mt-auto tour-step-6-help-button">
                    <button
                        onClick={() => setIsTourOpen(true)}
                        className="p-3 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title="Hướng dẫn sử dụng"
                    >
                        <Icons.QuestionMarkCircleIcon />
                    </button>
                </div>
            </aside>
            
            <WorkspaceTour 
                enabled={isTourOpen}
                onExit={() => setIsTourOpen(false)}
            />
        </>
    );
}
