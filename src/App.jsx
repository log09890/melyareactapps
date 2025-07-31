// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// **SỬA LỖI:** Sử dụng đường dẫn tương đối và loại bỏ phần mở rộng .jsx để trình biên dịch tự xử lý.
import Layout from './components/Layout';
import WelcomePage from './pages/WelcomePage';
import ReportsDirectoryPage from './pages/ReportsDirectoryPage';
import SettingsPage from './pages/SettingsPage';
import ComparisonDashboard from './pages/ComparisonDashboard';
import ReportEngineBuilderPage from './pages/ReportEngineBuilderPage';
import ReportEngineViewerPage from './pages/ReportEngineViewerPage';
import WorkspacePage from './pages/WorkspacePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<WelcomePage />} />
        
        {/* === CÁC ROUTE QUẢN LÝ BÁO CÁO ĐÃ ĐƯỢC CẬP NHẬT === */}
        <Route path="reports" element={<ReportsDirectoryPage />} />
        {/* Route để tạo báo cáo mới */}
        <Route path="reports/new" element={<ReportEngineBuilderPage />} />
        {/* Route để chỉnh sửa báo cáo đã có */}
        <Route path="reports/edit/:reportId" element={<ReportEngineBuilderPage />} />
        {/* Route để xem báo cáo đã tạo */}
        <Route path="report/view/:reportId" element={<ReportEngineViewerPage />} />

        {/* === CÁC TRANG CÔNG CỤ KHÁC === */}
        <Route path="workspace" element={<WorkspacePage />} />
        <Route path="comparison" element={<ComparisonDashboard />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
