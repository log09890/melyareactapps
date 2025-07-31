// src/pages/WorkspacePage.jsx
import React from 'react';
import { useWorkspace } from '/src/context/WorkspaceContext.jsx';
import Loader from '/src/components/ui/Loader.jsx';

import SalesDayReport from '/src/pages/SalesDayReport.jsx';
import InventoryReport from '/src/pages/InventoryReport.jsx';
import SalesRateReport from '/src/pages/SalesRateReport.jsx';
import ChannelPerformanceReport from '/src/pages/ChannelPerformanceReport.jsx';
import ProductLifecycleReport from '/src/pages/ProductLifecycleReport.jsx';
import StructureProportionReport from '/src/pages/StructureProportionReport.jsx';
import ReportEngineViewerPage from '/src/pages/ReportEngineViewerPage.jsx';

// Ánh xạ `id` báo cáo tĩnh với component của nó
const reportComponentMap = {
    'sales': SalesDayReport,
    'inventory': InventoryReport,
    'sales-rate': SalesRateReport,
    'channels': ChannelPerformanceReport,
    'lifecycle': ProductLifecycleReport,
    'structure-proportion': StructureProportionReport,
};

// Component wrapper để quản lý trạng thái tải và hiển thị cho mỗi báo cáo
const ReportContainer = ({ report, isVisible }) => {
    const { reportStates } = useWorkspace();
    const { isLoading, progress, error, data } = reportStates[report.id] || {};

    const ComponentToRender = report.isCustom 
        ? ReportEngineViewerPage 
        : reportComponentMap[report.id];
    
    if (!ComponentToRender) {
        return (
            <div style={{ display: isVisible ? 'block' : 'none' }} className="p-6 text-center">
                <h3 className="text-red-500">Lỗi: Không tìm thấy component cho báo cáo "{report.name}".</h3>
            </div>
        );
    }
    
    // **CẢI TIẾN:** Tách biệt logic render cho từng loại báo cáo
    const renderContent = () => {
        if (isLoading) {
            return <Loader progress={progress} />;
        }
        if (error) {
            return <div className="p-4 text-center text-red-500 bg-red-100 rounded-lg">{error}</div>;
        }
        // Report Engine tự tải dữ liệu thông qua reportId
        if (report.isCustom) {
            return <ComponentToRender reportId={report.id} />;
        }
        // Các báo cáo tĩnh nhận dữ liệu đã tải qua props
        if (data) {
            return <ComponentToRender data={data} />;
        }
        return null;
    };

    return (
        <div 
            style={{ display: isVisible ? 'block' : 'none' }}
            className="h-full w-full absolute top-0 left-0"
        >
            {/* Giữ padding ở đây để áp dụng cho tất cả nội dung bên trong */}
            <div className="p-6 h-full w-full overflow-auto">
                 {renderContent()}
            </div>
        </div>
    );
}

export default function WorkspacePage() {
    const { openReports, activeReportId } = useWorkspace();

    if (openReports.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                 <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-200">Không gian làm việc trống</h2>
                 <p className="mt-2 text-slate-500">Hãy vào "Danh mục Báo cáo" để bắt đầu mở một báo cáo.</p>
            </div>
        );
    }
    
    return (
        <div className="h-full relative p-0 sm:p-0">
            {openReports.map(report => (
                <ReportContainer 
                    key={report.id}
                    report={report}
                    isVisible={report.id === activeReportId}
                />
            ))}
        </div>
    );
}
