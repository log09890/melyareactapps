// src/pages/ReportsDirectoryPage.jsx
import React, { useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader.jsx';
import { useReports } from '../context/ReportContext.jsx';
import { useWorkspace } from '../context/WorkspaceContext.jsx';
import { db } from '../config/firebase.js';
import { doc, deleteDoc } from 'firebase/firestore';
import { PlusIcon, TrashIcon, CustomizeIcon } from '../components/Icons.jsx';
import Loader from '../components/ui/Loader.jsx';
import ContextMenu from '../components/ui/ContextMenu.jsx';
import * as Icons from '../components/Icons.jsx';

const ReportCard = ({ report, onDelete, onCustomize }) => {
    const { openReport } = useWorkspace();
    const IconComponent = Icons[report.icon] || Icons.ReportsIcon;
    const [menuState, setMenuState] = useState({ visible: false, x: 0, y: 0 });

    const handleRightClick = (e) => {
        e.preventDefault();
        if (report.isCustom) {
            setMenuState({ visible: true, x: e.pageX, y: e.pageY });
        }
    };
    
    const closeMenu = () => setMenuState({ ...menuState, visible: false });

    const menuOptions = [
        { label: 'Tùy chỉnh', icon: <CustomizeIcon />, onClick: () => onCustomize(report.id) },
        { label: 'Xóa', icon: <TrashIcon />, onClick: () => onDelete(report.id, report.name), className: 'text-red-600 dark:text-red-400' },
    ];

    const handleClick = (e) => {
        e.preventDefault();
        openReport(report);
    };

    return (
        <>
            <a
                href="#"
                onClick={handleClick}
                className="block p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group"
                onContextMenu={handleRightClick}
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
                        <IconComponent />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600">{report.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{report.description}</p>
                    </div>
                </div>
            </a>
            {menuState.visible && (
                <ContextMenu
                    options={menuOptions}
                    position={{ x: menuState.x, y: menuState.y }}
                    onClose={closeMenu}
                />
            )}
        </>
    );
};

function ReportsDirectoryPage() {
  const { allReports, isLoading } = useReports();
  const navigate = useNavigate();

  const handleDeleteReport = async (reportId, reportName) => {
      if (window.confirm(`Bạn có chắc chắn muốn xóa báo cáo "${reportName}" không?`)) {
          try {
              const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
              // **SỬA LỖI: Xóa từ collection 'reports'**
              const reportDocRef = doc(db, `artifacts/${appId}/public/data/reports`, reportId);
              await deleteDoc(reportDocRef);
              alert('Đã xóa báo cáo thành công.');
          } catch (error) {
              console.error("Lỗi khi xóa báo cáo: ", error);
              alert('Đã có lỗi xảy ra khi xóa báo cáo.');
          }
      }
  };

  const handleCustomizeReport = (reportId) => {
      navigate(`/reports/edit/${reportId}`);
  };

  const categorizedReports = useMemo(() => {
    if (!allReports) return {};
    return allReports.reduce((acc, report) => {
      const category = report.category || 'Báo cáo Tùy chỉnh';
      if (!acc[category]) acc[category] = [];
      acc[category].push(report);
      return acc;
    }, {});
  }, [allReports]);

  if (isLoading) return <Loader message="Đang tải danh sách báo cáo..." />;

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader title="Danh mục Báo cáo" description="Chọn một báo cáo để xem chi tiết hoặc so sánh." />
        <NavLink to="/reports/new" className="btn-primary flex-shrink-0 flex items-center gap-2">
            <PlusIcon />
            Tạo Báo cáo Mới
        </NavLink>
      </div>
      
      <div className="space-y-8">
        {Object.keys(categorizedReports).map(category => (
          <section key={category}>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">
                {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categorizedReports[category].map(report => (
                <ReportCard 
                    key={report.path || report.id} 
                    report={report} 
                    onDelete={handleDeleteReport}
                    onCustomize={handleCustomizeReport}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default ReportsDirectoryPage;
