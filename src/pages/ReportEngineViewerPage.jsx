// src/pages/ReportEngineViewerPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { useCsvData } from '../hooks/useCsvData.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Loader from '../components/ui/Loader.jsx';
import KpiCard from '../components/ui/KpiCard.jsx';
import { Bar } from 'react-chartjs-2';
import { getCommonChartOptions } from '../utils/chart-helpers.js';
import { formatNumber } from '../utils/formatters.js';
import { useScript, useCss } from '../hooks/useScript.js';

const WidgetRenderer = ({ widget, rawData }) => {
    const { type, config } = widget;
    
    const processedData = useMemo(() => {
        if (!rawData || rawData.length === 0 || !config) return null;
        const numericColumn = (col) => rawData.map(row => parseFloat(String(row[col]).replace(/,/g, '')) || 0);

        switch(type) {
            case 'kpi':
                const columnData = numericColumn(config.column);
                if (!config.column || columnData.length === 0) return 'N/A';
                switch(config.aggregation) {
                    case 'sum': return formatNumber(columnData.reduce((a, b) => a + b, 0));
                    case 'count': return formatNumber(rawData.length);
                    case 'average': return formatNumber(columnData.reduce((a, b) => a + b, 0) / columnData.length);
                    default: return 'N/A';
                }
            case 'bar':
                const { dimension, metric } = config;
                if (!dimension || !metric) return null;
                const grouped = rawData.reduce((acc, row) => {
                    const key = row[dimension];
                    const value = parseFloat(row[metric]) || 0;
                    if (!acc[key]) acc[key] = 0;
                    acc[key] += value;
                    return acc;
                }, {});
                return {
                    labels: Object.keys(grouped),
                    datasets: [{
                        label: metric,
                        data: Object.values(grouped),
                        backgroundColor: 'rgba(59, 130, 246, 0.5)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 1,
                    }]
                };
            case 'table':
                return {
                    columns: config.columns || [],
                    rows: rawData,
                };
            default: return null;
        }
    }, [rawData, type, config]);

    if (!processedData) return <div className="flex items-center justify-center h-full"><Loader message="Đang xử lý widget..."/></div>;

    switch(type) {
        case 'kpi':
            return <KpiCard title={config.title || 'KPI'} value={processedData} />;
        case 'bar':
            return <Bar data={processedData} options={getCommonChartOptions(document.documentElement.classList.contains('dark'))} />;
        case 'table':
            return (
                <div className="overflow-auto h-full">
                     <h3 className="text-lg font-semibold mb-2">{config.title || "Bảng dữ liệu"}</h3>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 dark:bg-slate-700 sticky top-0">
                            <tr>{processedData.columns.map(c => <th key={c} className="p-2">{c}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {processedData.rows.slice(0, 100).map((row, i) => ( // Giới hạn 100 dòng để tránh treo
                                <tr key={i}>{processedData.columns.map(c => <td key={c} className="p-2 truncate max-w-xs">{row[c]}</td>)}</tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        default: return <div>Loại widget không được hỗ trợ.</div>
    }
}

const ReportEngineViewerPage = () => {
    const { reportId } = useParams();
    const [reportConfig, setReportConfig] = useState(null);
    const [loadingConfig, setLoadingConfig] = useState(true);
    
    useCss('https://cdnjs.cloudflare.com/ajax/libs/react-grid-layout/1.4.4/css/styles.min.css');
    useCss('https://cdnjs.cloudflare.com/ajax/libs/react-resizable/3.0.5/css/styles.min.css');
    const rglStatus = useScript('https://cdnjs.cloudflare.com/ajax/libs/react-grid-layout/1.4.4/react-grid-layout.min.js');

    useEffect(() => {
        const fetchConfig = async () => {
            setLoadingConfig(true);
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            const docRef = doc(db, `artifacts/${appId}/public/data/reports`, reportId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setReportConfig(docSnap.data());
            } else {
                console.error("Không tìm thấy báo cáo!");
            }
            setLoadingConfig(false);
        };
        fetchConfig();
    }, [reportId]);
    
    const { data: rawData, loading: loadingData } = useCsvData(reportConfig?.dataUrl);

    if (!rglStatus.loaded || loadingConfig) {
        let loadingMessage = "Đang tải báo cáo...";
        if (!rglStatus.loaded) {
            loadingMessage = "Đang tải thư viện layout...";
        }
        return <Loader message={loadingMessage} />;
    }

    if (rglStatus.error) {
        return <div className="flex items-center justify-center h-screen text-red-500">Lỗi khi tải thư viện layout. Vui lòng kiểm tra kết nối mạng và thử lại.</div>;
    }
    
    if (!reportConfig) {
        return <div className="p-6 text-center">Không tìm thấy báo cáo.</div>;
    }
    
    const RGL = window.ReactGridLayout;
    const { name, widgets, layout } = reportConfig;

    return (
        <div className="p-4">
            <PageHeader title={name} description="Báo cáo được tạo tự động" />
            {loadingData ? <Loader message="Đang tải dữ liệu..." /> :
                <RGL
                    className="layout"
                    layout={layout}
                    isDraggable={false}
                    isResizable={false}
                    cols={12}
                    rowHeight={30}
                    width={1200}
                >
                    {widgets.map(w => (
                        <div key={w.i} className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-md overflow-hidden">
                            <WidgetRenderer widget={w} rawData={rawData} />
                        </div>
                    ))}
                </RGL>
            }
        </div>
    );
};

export default ReportEngineViewerPage;
