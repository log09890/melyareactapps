// src/pages/SalesRateReport.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';

import { DATA_URLS, COLUMN_MAPPINGS } from '../utils/constants';
// SỬA LỖI: Thêm getCommonChartOptions vào import
// THÊM CÁC DÒNG NÀY VÀO:
import { useTheme } from '../context/ThemeContext.jsx';
import { parseDate, formatNumber, formatDate } from '../utils/formatters.js';
import { getCommonChartOptions, getChartColors } from '../utils/chart-helpers.js';
import { useCsvData } from '../hooks/useCsvData';

import Loader from '../components/ui/Loader';
import PageHeader from '../components/ui/PageHeader';
import KpiCard from '../components/ui/KpiCard';
import FilterSelect from '../components/ui/FilterSelect';
import Modal from '../components/ui/Modal';

const classifyDiscount = (rateString) => {
    if (!rateString || typeof rateString !== 'string') return "Không xác định";
    const rate = parseFloat(rateString.replace('%', '')) / 100;
    if (isNaN(rate)) return "Không xác định";
    if (rate === 0) return "Nguyên giá";
    if (rate > 0 && rate < 0.25) return "Sale < 25%";
    if (rate >= 0.25 && rate < 0.30) return "25% đến <30%";
    if (rate >= 0.30 && rate < 0.40) return "30% đến < 40%";
    if (rate >= 0.40 && rate < 0.50) return "40% đến < 50%";
    if (rate >= 0.50 && rate < 0.60) return "50% đến < 60%";
    if (rate >= 0.60) return "Từ 60% trở lên";
    return "Chiết khấu không hợp lệ";
};

function SalesRateReport() {
    const [year, setYear] = useState('2025');
    const dataUrl = year === '2024' ? DATA_URLS.salesRate2024 : DATA_URLS.salesRate2025;
    const { data: rawData, loading, error } = useCsvData(dataUrl);
    const { month, channel, productId, productName, revenue, profit, discountRateInitial } = COLUMN_MAPPINGS.salesRate;

    const processedData = useMemo(() => {
        if (!rawData.length) return [];
        return rawData.map((row, index) => {
            const revenueNum = parseFloat(String(row[revenue]).replace(/,/g, '')) || 0;
            const profitNum = parseFloat(String(row[profit]).replace(/,/g, '')) || 0;
            return {
                ...row, 
                id: index,
                revenue: revenueNum, 
                profit: profitNum, 
                profitMargin: revenueNum > 0 ? profitNum / revenueNum : 0, 
                discountCategory: classifyDiscount(row[discountRateInitial])
            };
        });
    }, [rawData]);
    
    const [activeTab, setActiveTab] = useState('analysis');
    const [selectedItem, setSelectedItem] = useState(null);
    const [pagination, setPagination] = useState({ currentPage: 1, rowsPerPage: 20 });
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ month: 'Tất cả', channel: 'Tất cả', classification: 'Tất cả' });
    
    const filteredData = useMemo(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        return processedData.filter(r => 
            (filters.month === 'Tất cả' || r[month] == filters.month) && 
            (filters.channel === 'Tất cả' || r[channel] === filters.channel) && 
            (filters.classification === 'Tất cả' || r.discountCategory === filters.classification) &&
            (!searchTerm || (r[productName] || '').toLowerCase().includes(lowercasedFilter) || (r[productId] || '').toLowerCase().includes(lowercasedFilter))
        );
    }, [processedData, filters, searchTerm]);
    
    useEffect(() => {
        setPagination(p => ({ ...p, currentPage: 1 }));
    }, [filters, searchTerm, year]);

    const paginatedDetails = useMemo(() => {
        const startIndex = (pagination.currentPage - 1) * pagination.rowsPerPage;
        return filteredData.slice(startIndex, startIndex + pagination.rowsPerPage);
    }, [filteredData, pagination]);

    const totalPages = Math.ceil(filteredData.length / pagination.rowsPerPage);

    const kpis = useMemo(() => {
        const totalRevenue = filteredData.reduce((s, r) => s + r.revenue, 0);
        const totalProfit = filteredData.reduce((s, r) => s + r.profit, 0);
        const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
        return { 
            totalRevenue: formatNumber(totalRevenue), 
            totalProfit: formatNumber(totalProfit), 
            avgProfitMargin: `${avgMargin.toFixed(1)}%` 
        };
    }, [filteredData]);

    const filterOptions = useMemo(() => ({
        month: ['Tất cả', ...new Set(processedData.map(r => r[month]))].sort(),
        channel: ['Tất cả', ...new Set(processedData.map(r => r[channel]))].sort(),
        classification: ["Tất cả", "Nguyên giá", "Sale < 25%", "25% đến <30%", "30% đến < 40%", "40% đến < 50%", "50% đến < 60%", "Từ 60% trở lên", "Chiết khấu không hợp lệ"],
    }), [processedData]);
    
    const profitMarginChartData = useMemo(() => {
        if (!filteredData.length) return null;
        const grouped = filteredData.reduce((acc, row) => {
            const key = row.discountCategory;
            if (!acc[key]) acc[key] = { total: 0, count: 0 };
            acc[key].total += row.profitMargin; 
            acc[key].count++;
            return acc;
        }, {});
        const avgData = Object.entries(grouped)
            .map(([key, {total, count}]) => ({ key, avg: count > 0 ? total / count : 0}))
            .sort((a,b) => b.avg - a.avg);
        
        return { 
            labels: avgData.map(i => i.key), 
            datasets: [{ 
                label: 'Biên lợi nhuận', 
                data: avgData.map(i => i.avg), 
                backgroundColor: '#0ea5e9'
            }]
        };
    }, [filteredData]);
    
    if (loading) return <Loader message={`Đang tải dữ liệu năm ${year}...`} />;
    if (error) return <div className="p-4 text-center text-red-500 bg-red-100 rounded-lg">{error}</div>;

    return (
        <>
            <div className="space-y-6 p-6">
                <PageHeader title={`Báo cáo Phân tích Tỷ lệ Bán - ${year}`} description="Phân tích chi tiết về các tỷ lệ trong kinh doanh." />
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6"><KpiCard title="Tổng Doanh thu" value={kpis.totalRevenue} /><KpiCard title="Tổng Lợi nhuận gộp" value={kpis.totalProfit} /><KpiCard title="Biên Lợi nhuận TB" value={kpis.avgProfitMargin} /></section>
                
                <section className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <FilterSelect label="Năm" options={['2025', '2024']} value={year} onChange={e => setYear(e.target.value)} />
                        <FilterSelect label="Tháng" options={filterOptions.month} value={filters.month} onChange={e => setFilters({...filters, month: e.target.value})} />
                        <FilterSelect label="Kênh bán" options={filterOptions.channel} value={filters.channel} onChange={e => setFilters({...filters, channel: e.target.value})} />
                        <FilterSelect label="Mức giảm giá" options={filterOptions.classification} value={filters.classification} onChange={e => setFilters({...filters, classification: e.target.value})} />
                    </div>
                </section>
                
                <section className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                    <div className="border-b border-slate-200 dark:border-slate-700">
                        <nav className="-mb-px flex space-x-6">
                            <button onClick={() => setActiveTab('analysis')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'analysis' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Phân tích Tỷ lệ</button>
                            <button onClick={() => setActiveTab('details')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'details' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Chi tiết</button>
                        </nav>
                    </div>

                    <div className="mt-6">
                        {activeTab === 'analysis' && profitMarginChartData && (
                            <div className="h-96"><Bar data={profitMarginChartData} options={{...getCommonChartOptions(), indexAxis: 'y', scales: { x: { ticks: { callback: v => `${(v * 100).toFixed(0)}%` }}}, plugins: { legend: { display: false }}}} /></div>
                        )}
                        {activeTab === 'details' && (
                             <div>
                                <input type="text" placeholder="Tìm kiếm theo Tên hoặc Mã sản phẩm..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 mb-4 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-700">
                                            <tr>
                                                <th className="p-3">Sản phẩm</th><th className="p-3 text-right">Doanh thu</th><th className="p-3 text-right">Lợi nhuận</th><th className="p-3">Biên LN</th><th className="p-3">Kênh</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedDetails.map(item => (
                                                <tr key={item.id} onClick={() => setSelectedItem(item)} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
                                                    <td className="p-3 font-medium">{item[productName]}</td><td className="p-3 text-right">{formatNumber(item.revenue)}</td><td className="p-3 text-right text-green-600">{formatNumber(item.profit)}</td><td className="p-3 text-blue-600">{(item.profitMargin * 100).toFixed(1)}%</td><td className="p-3">{item[channel]}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {totalPages > 1 && (
                                     <div className="flex justify-end items-center mt-4 gap-2">
                                        <button onClick={() => setPagination(p=>({...p, currentPage: p.currentPage - 1}))} disabled={pagination.currentPage === 1} className="px-3 py-1 text-sm font-medium text-slate-500 bg-white rounded-md border border-slate-300 hover:bg-slate-100 disabled:opacity-50">Trước</button>
                                        <span className="text-sm text-slate-700 dark:text-slate-300">Trang {pagination.currentPage} / {totalPages}</span>
                                        <button onClick={() => setPagination(p=>({...p, currentPage: p.currentPage + 1}))} disabled={pagination.currentPage === totalPages} className="px-3 py-1 text-sm font-medium text-slate-500 bg-white rounded-md border border-slate-300 hover:bg-slate-100 disabled:opacity-50">Sau</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title="Chi tiết sản phẩm">
                {selectedItem && (
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                        {Object.keys(COLUMN_MAPPINGS.salesRate).map(key => (
                             <div key={key} className="border-b border-slate-200 dark:border-slate-700 pb-2">
                                <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{COLUMN_MAPPINGS.salesRate[key]}</dt>
                                <dd className="mt-1 text-base text-slate-900 dark:text-slate-100">{String(selectedItem[COLUMN_MAPPINGS.salesRate[key]]) || 'N/A'}</dd>
                            </div>
                        ))}
                    </dl>
                )}
            </Modal>
        </>
    );
}

export default SalesRateReport;
