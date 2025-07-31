// src/pages/ReportEngineBuilderPage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../config/firebase.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import Loader from '../components/ui/Loader.jsx';

const COLS = 12;
const ROW_HEIGHT = 40; // Chiều cao của một hàng trong grid (pixels)

// --- Bắt đầu Component Modal Cấu hình ---
const ConfigModal = ({ widget, csvHeaders, onClose, onSave }) => {
    const [config, setConfig] = useState(widget.config || {});
    const handleSave = () => onSave(widget.i, config);

    const renderConfigFields = () => {
        switch(widget.type) {
            case 'kpi':
                return (
                    <div>
                        <label className="block mb-1 font-medium">Tiêu đề Widget</label>
                        <input type="text" className="input-field mb-4" value={config.title || ''} onChange={e => setConfig({...config, title: e.target.value})} placeholder="VD: Tổng doanh thu" />
                        <label className="block mb-1 font-medium">Cột dữ liệu</label>
                        <select className="input-field" value={config.column || ''} onChange={e => setConfig({...config, column: e.target.value})}>
                            <option value="">-- Chọn cột --</option>
                            {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                        <label className="block mt-4 mb-1 font-medium">Phép tính</label>
                         <select className="input-field" value={config.aggregation || 'sum'} onChange={e => setConfig({...config, aggregation: e.target.value})}>
                            <option value="sum">Tổng (Sum)</option>
                            <option value="count">Đếm (Count)</option>
                            <option value="average">Trung bình (Average)</option>
                        </select>
                    </div>
                );
            case 'bar':
                 return (
                     <div>
                        <label className="block mb-1 font-medium">Tiêu đề Widget</label>
                        <input type="text" className="input-field mb-4" value={config.title || ''} onChange={e => setConfig({...config, title: e.target.value})} placeholder="VD: Doanh thu theo kênh" />
                        <label className="block mb-1 font-medium">Trục X (Dimension)</label>
                        <select className="input-field" value={config.dimension || ''} onChange={e => setConfig({...config, dimension: e.target.value})}>
                             <option value="">-- Chọn cột --</option>
                            {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                        <label className="block mt-4 mb-1 font-medium">Trục Y (Metric)</label>
                        <select className="input-field" value={config.metric || ''} onChange={e => setConfig({...config, metric: e.target.value})}>
                            <option value="">-- Chọn cột --</option>
                            {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                    </div>
                );
            case 'table':
                 return (
                    <div>
                        <label className="block mb-1 font-medium">Tiêu đề Widget</label>
                        <input type="text" className="input-field mb-4" value={config.title || ''} onChange={e => setConfig({...config, title: e.target.value})} placeholder="VD: Dữ liệu chi tiết" />
                        <label className="block mb-1 font-medium">Các cột hiển thị</label>
                        <p className="text-sm text-slate-500 mb-2">Giữ Ctrl/Cmd để chọn nhiều cột.</p>
                        <select 
                            className="input-field h-40" 
                            multiple 
                            value={config.columns || []} 
                            onChange={e => setConfig({...config, columns: Array.from(e.target.selectedOptions, option => option.value)})}
                        >
                            {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                    </div>
                 )
            default: return <p>Loại widget này chưa hỗ trợ cấu hình.</p>;
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg w-full max-w-md shadow-xl">
                <h3 className="text-xl font-bold mb-4">Cấu hình Widget: {widget.type}</h3>
                <div className="space-y-4">
                    {renderConfigFields()}
                </div>
                <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button className="btn-secondary" onClick={onClose}>Hủy</button>
                    <button className="btn-primary" onClick={handleSave}>Lưu cấu hình</button>
                </div>
            </div>
        </div>
    );
};
// --- Kết thúc Component Modal Cấu hình ---

const ReportEngineBuilderPage = () => {
    const { reportId } = useParams();
    const navigate = useNavigate();

    const [reportName, setReportName] = useState('Báo cáo chưa có tên');
    const [dataUrl, setDataUrl] = useState('');
    const [csvHeaders, setCsvHeaders] = useState([]);
    
    const [widgets, setWidgets] = useState([]);
    const [layout, setLayout] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [configuringWidget, setConfiguringWidget] = useState(null);

    const WIDGET_PALETTE = [
        { type: 'kpi', name: 'KPI Card', defaultSize: { w: 3, h: 3 } },
        { type: 'bar', name: 'Biểu đồ cột', defaultSize: { w: 5, h: 5 } },
        { type: 'table', name: 'Bảng dữ liệu', defaultSize: { w: 6, h: 6 } },
    ];
    
    // Logic kéo thả
    const gridRef = useRef(null);
    const dragInfo = useRef(null);

    const handleMouseMove = useCallback((e) => {
        if (!dragInfo.current || !gridRef.current) return;
        e.preventDefault();
        
        const { id, initialMouseX, initialMouseY, initialGridX, initialGridY } = dragInfo.current;
        const gridRect = gridRef.current.getBoundingClientRect();
        const colWidth = gridRect.width / COLS;

        const deltaX = e.clientX - initialMouseX;
        const deltaY = e.clientY - initialMouseY;
        
        const newGridX = initialGridX + (deltaX / colWidth);
        const newGridY = initialGridY + (deltaY / ROW_HEIGHT);

        const currentItem = layout.find(item => item.i === id);
        const snappedX = Math.round(newGridX);
        const snappedY = Math.round(newGridY);
        
        const clampedX = Math.max(0, Math.min(snappedX, COLS - currentItem.w));
        const clampedY = Math.max(0, snappedY);

        if (clampedX !== currentItem.x || clampedY !== currentItem.y) {
            setLayout(prev => prev.map(item => item.i === id ? { ...item, x: clampedX, y: clampedY } : item));
        }
    }, [layout]);

    const handleMouseUp = useCallback(() => {
        dragInfo.current = null;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove]);

    const onDragStart = (e, id) => {
        const currentItem = layout.find(item => item.i === id);
        if (!currentItem) return;
        
        dragInfo.current = { 
            id,
            initialMouseX: e.clientX,
            initialMouseY: e.clientY,
            initialGridX: currentItem.x,
            initialGridY: currentItem.y
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };


    const handleDrop = (e) => {
        e.preventDefault();
        const widgetType = e.dataTransfer.getData('widgetType');
        const widgetPaletteItem = WIDGET_PALETTE.find(w => w.type === widgetType);
        if (!widgetPaletteItem) return;

        const gridRect = gridRef.current.getBoundingClientRect();
        const colWidth = gridRect.width / COLS;
        
        const x = Math.floor((e.clientX - gridRect.left) / colWidth);
        const y = Math.floor((e.clientY - gridRect.top) / ROW_HEIGHT);

        const newId = `widget-${Date.now()}`;
        const newWidget = { i: newId, type: widgetType, config: {} };
        setWidgets([...widgets, newWidget]);
        setLayout([...layout, { i: newId, x, y, ...widgetPaletteItem.defaultSize }]);
        
        setConfiguringWidget(newWidget);
        setIsModalOpen(true);
    };

    // ... Các hàm logic khác ...
    useEffect(() => {
        if (reportId) {
            const fetchReport = async () => {
                const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
                const docRef = doc(db, `artifacts/${appId}/public/data/reports`, reportId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setReportName(data.name);
                    setDataUrl(data.dataUrl);
                    setWidgets(data.widgets || []);
                    setLayout(data.layout || []);
                    if (data.dataUrl) fetchCsvHeaders(data.dataUrl);
                }
            };
            fetchReport();
        }
    }, [reportId]);

    const fetchCsvHeaders = useCallback((url) => {
        if (!url) return;
        window.Papa.parse(url, {
            download: true,
            header: true,
            skipEmptyLines: true,
            preview: 1,
            complete: (results) => setCsvHeaders(results.meta.fields || []),
            error: () => alert('Không thể tải hoặc phân tích CSV từ URL này.'),
        });
    }, []);

    const saveWidgetConfig = (widgetId, newConfig) => {
        setWidgets(widgets.map(w => w.i === widgetId ? { ...w, config: newConfig } : w));
        setIsModalOpen(false);
        setConfiguringWidget(null);
    };

    const removeWidget = (widgetId) => {
        setWidgets(widgets.filter(w => w.i !== widgetId));
        setLayout(layout.filter(l => l.i !== widgetId));
    };

    const editWidget = (widget) => {
        setConfiguringWidget(widget);
        setIsModalOpen(true);
    };
    
    const saveReport = async () => {
        if (!reportName || !dataUrl) {
            alert('Vui lòng nhập tên báo cáo và URL dữ liệu.');
            return;
        }
        const reportData = { name: reportName, dataUrl, widgets, layout, updatedAt: serverTimestamp() };
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const docRef = doc(db, `artifacts/${appId}/public/data/reports`, reportId || `report_${Date.now()}`);
        await setDoc(docRef, reportData, { merge: true });
        alert('Đã lưu báo cáo thành công!');
        navigate('/reports');
    };

    return (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-900 font-sans">
            <aside className="w-64 bg-white dark:bg-slate-800 p-4 space-y-4 flex-shrink-0 border-r border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold">Thành phần</h2>
                {WIDGET_PALETTE.map(widget => (
                    <div key={widget.type} className="p-3 border rounded-lg cursor-grab text-center bg-slate-50 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600" draggable onDragStart={e => e.dataTransfer.setData('widgetType', widget.type)}>
                        {widget.name}
                    </div>
                ))}
            </aside>

            <main className="flex-1 flex flex-col p-4 overflow-auto">
                <header className="flex justify-between items-center mb-4 flex-shrink-0">
                    <input type="text" value={reportName} onChange={e => setReportName(e.target.value)} className="text-2xl font-bold bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1" />
                    <button onClick={saveReport} className="btn-primary">Lưu Báo cáo</button>
                </header>
                <div className="mb-4 flex-shrink-0">
                     <input type="url" value={dataUrl} onChange={e => { setDataUrl(e.target.value); fetchCsvHeaders(e.target.value); }} className="input-field" placeholder="Nhập URL file CSV của bạn ở đây..." />
                </div>
                
                {/* **SỬA LỖI:** Thẻ đóng đã được sửa từ </RGL> thành </div> */}
                <div ref={gridRef} onDrop={handleDrop} onDragOver={e => e.preventDefault()} className="flex-1 bg-white dark:bg-slate-800 rounded-lg shadow-inner p-2 relative">
                    {/* Render Grid Background */}
                    {Array.from({ length: COLS * 30 }).map((_, i) => (
                        <div key={i} style={{ left: `${(i % COLS) * (100 / COLS)}%`, top: `${Math.floor(i / COLS) * ROW_HEIGHT}px`, width: `${100/COLS}%`, height: `${ROW_HEIGHT}px`}} className="absolute border-r border-b border-slate-200/50 dark:border-slate-700/50 box-border"></div>
                    ))}
                    
                    {/* Render Widgets */}
                    {widgets.map(w => {
                        const l = layout.find(item => item.i === w.i);
                        if (!l) return null;
                        const style = {
                            left: `${l.x * (100 / COLS)}%`,
                            top: `${l.y * ROW_HEIGHT}px`,
                            width: `${l.w * (100 / COLS)}%`,
                            height: `${l.h * ROW_HEIGHT}px`,
                        };
                        return (
                            <div key={w.i} style={style} className="absolute bg-slate-200 dark:bg-slate-700 rounded-lg p-2 group flex flex-col cursor-move" onMouseDown={e => onDragStart(e, w.i)}>
                               <div className="flex-grow flex items-center justify-center pointer-events-none">
                                    <span className="text-lg font-bold opacity-50">{w.config?.title || w.type.toUpperCase()}</span>
                               </div>
                                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); editWidget(w); }} className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs cursor-pointer">⚙️</button>
                                    <button onClick={(e) => { e.stopPropagation(); removeWidget(w.i); }} className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs cursor-pointer">&times;</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {isModalOpen && (
                <ConfigModal 
                    widget={configuringWidget}
                    csvHeaders={csvHeaders}
                    onClose={() => setIsModalOpen(false)}
                    onSave={saveWidgetConfig}
                />
            )}
        </div>
    );
};

export default ReportEngineBuilderPage;
