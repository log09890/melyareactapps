// src/pages/ComparisonDashboard.jsx
import React, { useState } from 'react';

// Import tất cả các trang báo cáo
import SalesDayReport from './SalesDayReport';
import InventoryReport from './InventoryReport';
import SalesRateReport from './SalesRateReport';
import ChannelPerformanceReport from './ChannelPerformanceReport';

// Định nghĩa các báo cáo có sẵn để lựa chọn
const reportOptions = [
  { value: 'none', label: '--- Chọn báo cáo ---' },
  { value: 'salesDay', label: 'Báo cáo Doanh thu', component: <SalesDayReport /> },
  { value: 'inventory', label: 'Báo cáo Tồn kho', component: <InventoryReport /> },
  { value: 'salesRate', label: 'Báo cáo Tỷ lệ Bán', component: <SalesRateReport /> },
  { value: 'channels', label: 'Báo cáo Kênh bán', component: <ChannelPerformanceReport /> },
];

// Component để render một panel báo cáo
const ReportPanel = ({ selectedReport, onSelectReport }) => {
  const selectedComponent = reportOptions.find(opt => opt.value === selectedReport)?.component || null;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="p-2 border-b border-slate-200 dark:border-slate-700">
        <select
          value={selectedReport || 'none'}
          onChange={(e) => onSelectReport(e.target.value)}
          className="w-full bg-white dark:bg-slate-700 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          {reportOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-grow overflow-y-auto">
        {selectedComponent ? (
          <div className="p-1">{selectedComponent}</div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            Vui lòng chọn một báo cáo để hiển thị
          </div>
        )}
      </div>
    </div>
  );
};


function ComparisonDashboard() {
  const [leftPanel, setLeftPanel] = useState('salesDay');
  const [rightPanel, setRightPanel] = useState('inventory');

  return (
    <div className="p-2 sm:p-4 h-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        {/* Panel bên trái */}
        <ReportPanel selectedReport={leftPanel} onSelectReport={setLeftPanel} />
        
        {/* Panel bên phải */}
        <ReportPanel selectedReport={rightPanel} onSelectReport={setRightPanel} />
      </div>
    </div>
  );
}

export default ComparisonDashboard;
