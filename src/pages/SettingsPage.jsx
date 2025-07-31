// src/pages/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAppConfig } from '../context/AppConfigContext.jsx';
import { reportList } from '../config/reportConfig.js';

function SettingsPage() { 
    const { theme, setTheme } = useTheme();
    const { reportUrls, saveReportUrls, loading: configLoading } = useAppConfig();

    const [urls, setUrls] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');

    useEffect(() => {
        if (!configLoading) {
            setUrls(reportUrls);
        }
    }, [reportUrls, configLoading]);

    const handleUrlChange = (dataKey, value) => {
        setUrls(prev => ({ ...prev, [dataKey]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus('');
        const success = await saveReportUrls(urls);
        if (success) {
            setSaveStatus('Đã lưu cấu hình thành công!');
        } else {
            setSaveStatus('Lỗi: Không thể lưu cấu hình.');
        }
        setIsSaving(false);
        setTimeout(() => setSaveStatus(''), 3000);
    };

    const themeOptions = [
        { value: 'light', label: 'Sáng' },
        { value: 'dark', label: 'Tối' },
        { value: 'system', label: 'Theo thiết bị' },
    ];
    
    const staticReports = reportList.filter(r => r.dataKey);

    return (
        <div className="space-y-8 p-4 sm:p-6">
            <PageHeader title="Cài đặt và Tiện ích" description="Quản lý các tùy chọn của hệ thống." />
            
            {/* Cài đặt Nguồn dữ liệu với giao diện mới */}
            <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                 <div className="max-w-3xl">
                    <h2 className="text-xl font-semibold mb-2 text-slate-800 dark:text-slate-100">Nguồn dữ liệu Báo cáo</h2>
                    <p className="text-sm text-slate-500 mb-8">Thay đổi các liên kết CSV cho các báo cáo tĩnh. URL phải được "Xuất bản lên web" từ Google Sheets.</p>
                 </div>
                 {configLoading ? (
                     <p>Đang tải cấu hình...</p>
                 ) : (
                    <div className="space-y-6">
                        {staticReports.map(report => (
                            <div key={report.dataKey} className="grid grid-cols-1 md:grid-cols-3 items-center gap-2 md:gap-6">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 md:text-right">
                                    {report.name}
                                </label>
                                <div className="md:col-span-2">
                                    <input 
                                        type="url"
                                        value={urls[report.dataKey] || ''}
                                        onChange={(e) => handleUrlChange(report.dataKey, e.target.value)}
                                        // **Style mới cho input để giống với ảnh**
                                        className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400"
                                        placeholder="https://docs.google.com/..."
                                    />
                                </div>
                            </div>
                        ))}
                        <div className="flex items-center justify-end gap-4 pt-4 md:col-span-3 border-t border-slate-200 dark:border-slate-700 mt-6">
                            {saveStatus && <p className={`text-sm ${saveStatus.includes('Lỗi') ? 'text-red-500' : 'text-green-600'}`}>{saveStatus}</p>}
                            <button onClick={handleSave} disabled={isSaving} className="btn-primary">
                                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </div>
                 )}
            </div>
            
            {/* Cài đặt Giao diện */}
            <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                 <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">Giao diện</h2>
                 <fieldset>
                    <legend className="sr-only">Lựa chọn giao diện</legend>
                    <div className="grid sm:grid-cols-3 gap-4">
                        {themeOptions.map((option) => (
                            <label key={option.value} className={`flex items-center p-4 rounded-lg cursor-pointer border-2 transition-all ${theme === option.value ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10' : 'border-transparent bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                                <input
                                    type="radio"
                                    name="theme-option"
                                    value={option.value}
                                    checked={theme === option.value}
                                    onChange={(e) => setTheme(e.target.value)}
                                    className="h-4 w-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                                />
                                <span className="ml-3 font-medium text-slate-700 dark:text-slate-300">{option.label}</span>
                            </label>
                        ))}
                    </div>
                </fieldset>
            </div>
        </div>
    ); 
}

export default SettingsPage;
