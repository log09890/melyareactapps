// src/context/WorkspaceContext.jsx
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// **SỬA LỖI:** Cập nhật lại đường dẫn import
import { DATA_URLS } from '/src/utils/constants.js';

const WorkspaceContext = createContext(null);

export const useWorkspace = () => useContext(WorkspaceContext);

export const WorkspaceProvider = ({ children }) => {
    // **CẢI TIẾN: Khởi tạo state từ sessionStorage để giữ lại trạng thái sau khi reload**
    const [openReports, setOpenReports] = useState(() => {
        try {
            const item = sessionStorage.getItem('ws_openReports');
            return item ? JSON.parse(item) : [];
        } catch (error) {
            console.error("Lỗi khi đọc openReports từ sessionStorage", error);
            return [];
        }
    });

    const [activeReportId, setActiveReportId] = useState(() => {
        return sessionStorage.getItem('ws_activeReportId') || null;
    });

    const [reportStates, setReportStates] = useState(() => {
        try {
            const item = sessionStorage.getItem('ws_reportStates');
            const parsedItem = item ? JSON.parse(item) : {};
            // Khôi phục lại data thật từ dataContent
            for (const id in parsedItem) {
                if (parsedItem[id].dataContent) {
                    parsedItem[id].data = parsedItem[id].dataContent;
                    delete parsedItem[id].dataContent;
                }
            }
            return parsedItem;
        } catch (error) {
            console.error("Lỗi khi đọc reportStates từ sessionStorage", error);
            return {};
        }
    });
    
    const navigate = useNavigate();

    // **CẢI TIẾN: Sử dụng useEffect để tự động lưu state vào sessionStorage mỗi khi có thay đổi**
    useEffect(() => {
        try {
            sessionStorage.setItem('ws_openReports', JSON.stringify(openReports));
        } catch (error) {
            console.error("Lỗi khi lưu openReports vào sessionStorage", error);
        }
    }, [openReports]);

    useEffect(() => {
        try {
            if (activeReportId) {
                sessionStorage.setItem('ws_activeReportId', activeReportId);
            } else {
                sessionStorage.removeItem('ws_activeReportId');
            }
        } catch (error) {
            console.error("Lỗi khi lưu activeReportId vào sessionStorage", error);
        }
    }, [activeReportId]);

    useEffect(() => {
        try {
            // Chỉ lưu những phần cần thiết, tránh lưu dữ liệu lớn không cần thiết
            const statesToSave = {};
            for (const id in reportStates) {
                const { isLoading, progress, error, data } = reportStates[id];
                // Chỉ lưu trữ nếu có dữ liệu để tránh làm đầy sessionStorage
                if (data) {
                    statesToSave[id] = { isLoading, progress, error, dataContent: data }; 
                } else {
                    statesToSave[id] = { isLoading, progress, error, data: false };
                }
            }
            sessionStorage.setItem('ws_reportStates', JSON.stringify(statesToSave));
        } catch (error) {
            console.error("Lỗi khi lưu reportStates vào sessionStorage", error);
        }
    }, [reportStates]);

    const setReportState = (reportId, newState) => {
        setReportStates(prev => ({
            ...prev,
            [reportId]: { ...(prev[reportId] || {}), ...newState }
        }));
    };

    const loadReportData = useCallback(async (report) => {
        const reportId = report.id;
        if (!report.dataUrl || reportStates[reportId]?.data || reportStates[reportId]?.isLoading) {
            return;
        }
        
        setReportState(reportId, { isLoading: true, progress: 0, error: null, data: null });

        try {
            const response = await fetch(report.dataUrl);
            if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);
            const reader = response.body.getReader();
            const contentLength = +response.headers.get('Content-Length');
            let receivedLength = 0;
            let chunks = [];
            
            while(true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
                receivedLength += value.length;
                if (contentLength) {
                    setReportState(reportId, { progress: (receivedLength / contentLength) * 100 });
                }
            }
            
            const resultBlob = new Blob(chunks);
            const resultText = await resultBlob.text();
            
            window.Papa.parse(resultText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length) {
                         setReportState(reportId, { error: `Lỗi định dạng CSV: ${results.errors[0].message}`, isLoading: false });
                    } else {
                        setReportState(reportId, { data: results.data, progress: 100, isLoading: false });
                    }
                },
                error: (err) => setReportState(reportId, { error: `Lỗi phân tích CSV: ${err.message}`, isLoading: false }),
            });
        } catch (err) {
            setReportState(reportId, { error: `Lỗi tải file: ${err.message}`, isLoading: false });
        }
    }, [reportStates]);

    const activateReport = useCallback((reportId) => {
        if (!reportId) return;
        setActiveReportId(reportId);
        navigate('/workspace');
    }, [navigate]);

    const openReport = useCallback((report) => {
        const reportId = report.isCustom ? report.id : (report.id || report.path.split('/').pop());
        const dataUrl = report.isCustom ? report.dataUrl : DATA_URLS[report.dataKey];
        const finalReport = { ...report, id: reportId, dataUrl };
        
        setOpenReports(current => {
            if (!current.find(r => r.id === finalReport.id)) {
                return [...current, finalReport];
            }
            return current;
        });
        activateReport(finalReport.id);
        loadReportData(finalReport);
    }, [activateReport, loadReportData]);

    const closeReport = useCallback((reportIdToClose) => {
        const closingIndex = openReports.findIndex(r => r.id === reportIdToClose);
        if(closingIndex === -1) return;

        const newOpenReports = openReports.filter(r => r.id !== reportIdToClose);
        
        let newActiveId = activeReportId;
        if (activeReportId === reportIdToClose) {
            if (newOpenReports.length > 0) {
                 newActiveId = newOpenReports[Math.max(0, closingIndex - 1)].id;
            } else {
                newActiveId = null;
            }
        }
        
        setOpenReports(newOpenReports);
        setActiveReportId(newActiveId);

        setReportStates(current => {
            const newStates = { ...current };
            delete newStates[reportIdToClose];
            return newStates;
        });

        if (newOpenReports.length === 0) {
             navigate('/reports');
        }
    }, [activeReportId, navigate, openReports]);
    
    const value = { 
        openReports, 
        activeReportId, 
        setActiveReportId: activateReport,
        openReport, 
        closeReport, 
        reportStates 
    };
    
    return (
        <WorkspaceContext.Provider value={value}>
            {children}
        </WorkspaceContext.Provider>
    );
};
