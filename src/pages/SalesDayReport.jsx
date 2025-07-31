// src/pages/SalesDayReport.jsx
// **QUAN TRỌNG**: Component này giờ đây nhận 'data' làm prop và không tự fetch dữ liệu nữa.
import React, { useState, useMemo, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';

import { COLUMN_MAPPINGS } from '../utils/constants';
import { parseDate, formatNumber, formatDate } from '../utils/formatters';
import { getCommonChartOptions, getChartColors } from '../utils/chart-helpers';

import PageHeader from '../components/ui/PageHeader';
import KpiCard from '../components/ui/KpiCard';
import FilterSelect from '../components/ui/FilterSelect';
import DateInput from '../components/ui/DateInput';
import Modal from '../components/ui/Modal';

function SalesDayReport({ data: rawData = [] }) { // Nhận data từ props
    const { date, productId, productName, revenue, quantity, channel, tower, structure, material } = COLUMN_MAPPINGS.salesDay;
    const { theme } = useTheme();

    const processedData = useMemo(() => {
        if (!rawData.length) return [];
        return rawData.map((row, index) => ({
            ...row,
            id: index,
            date: parseDate(row[date]),
            revenue: parseFloat(String(row[revenue]).replace(/,/g, '')) || 0,
            quantity: parseInt(String(row[quantity]).replace(/,/g, '')) || 0,
        })).filter(r => r.date);
    }, [rawData, date, revenue, quantity]);
    
    // ... (toàn bộ logic còn lại của component không thay đổi)
    // ... (state cho filter, pagination, v.v. vẫn hoạt động như cũ)

    const [activeTab, setActiveTab] = useState('overview');
    const [selectedItem, setSelectedItem] = useState(null);
    const [pagination, setPagination] = useState({ currentPage: 1, rowsPerPage: 20 });
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        channel: 'Tất cả', tower: 'Tất cả', structure: 'Tất cả', material: 'Tất cả',
        fromDate: null, toDate: null,
    });
    
    useEffect(() => {
        if (processedData.length > 0) {
            const dates = processedData.map(r => r.date);
            setFilters(prev => ({
                ...prev,
                fromDate: new Date(Math.min(...dates)),
                toDate: new Date(Math.max(...dates)),
            }));
        }
    }, [processedData]);

    const filteredData = useMemo(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        return processedData.filter(r => {
            const { fromDate, toDate } = filters;
            const textMatch = !searchTerm ||
                (r[productName] || '').toLowerCase().includes(lowercasedFilter) ||
                (r[productId] || '').toLowerCase().includes(lowercasedFilter);

            return textMatch &&
                   (filters.channel === 'Tất cả' || r[channel] === filters.channel) &&
                   (filters.tower === 'Tất cả' || r[tower] === filters.tower) &&
                   (filters.structure === 'Tất cả' || r[structure] === filters.structure) &&
                   (filters.material === 'Tất cả' || r[material] === filters.material) &&
                   (!fromDate || r.date >= fromDate) &&
                   (!toDate || r.date <= toDate);
        });
    }, [processedData, filters, searchTerm, productName, productId, channel, tower, structure, material]);
    
    useEffect(() => {
        setPagination(p => ({ ...p, currentPage: 1 }));
    }, [filters, searchTerm]);

    const paginatedDetails = useMemo(() => {
        const startIndex = (pagination.currentPage - 1) * pagination.rowsPerPage;
        return filteredData.slice(startIndex, startIndex + pagination.rowsPerPage);
    }, [filteredData, pagination]);

    const totalPages = Math.ceil(filteredData.length / pagination.rowsPerPage);
    
    const kpis = useMemo(() => ({
        totalRevenue: formatNumber(filteredData.reduce((s, r) => s + r.revenue, 0)),
        totalQuantity: formatNumber(filteredData.reduce((s, r) => s + r.quantity, 0)),
        transactionCount: formatNumber(filteredData.length),
    }), [filteredData]);

    const filterOptions = useMemo(() => ({
        channel: ['Tất cả', ...new Set(processedData.map(r => r[channel]))].sort(),
        tower: ['Tất cả', ...new Set(processedData.map(r => r[tower]))].sort(),
        structure: ['Tất cả', ...new Set(processedData.map(r => r[structure]))].sort(),
        material: ['Tất cả', ...new Set(processedData.map(r => r[material]))].sort(),
    }), [processedData, channel, tower, structure, material]);

    const revenueTrendData = useMemo(() => {
        const grouped = filteredData.reduce((acc, row) => {
            const dateStr = formatDate(row.date);
            acc[dateStr] = (acc[dateStr] || 0) + row.revenue;
            return acc;
        }, {});
        const sortedDates = Object.keys(grouped).sort((a, b) => parseDate(a) - parseDate(b));
        const chartColors = getChartColors(theme === 'dark');
        return {
            labels: sortedDates,
            datasets: [{
                label: 'Doanh thu',
                data: sortedDates.map(d => grouped[d]),
                borderColor: chartColors.primary,
                backgroundColor: 'rgba(217, 119, 6, 0.1)',
                fill: true,
                tension: 0.3
            }]
        };
    }, [filteredData, theme]);

    return (
        <>
            <div className="space-y-6">
                <PageHeader title="Báo cáo Doanh thu Chi tiết" description="Phân tích đa chiều về hiệu quả kinh doanh." />
                
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <KpiCard title="Tổng Doanh thu" value={kpis.totalRevenue} />
                    <KpiCard title="Tổng Số lượng" value={kpis.totalQuantity} />
                    <KpiCard title="Tổng Giao dịch" value={kpis.transactionCount} />
                </section>
                
                <section className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
                        <FilterSelect label="Kênh bán" options={filterOptions.channel} value={filters.channel} onChange={e => setFilters({...filters, channel: e.target.value})} />
                        <FilterSelect label="Tháp SP" options={filterOptions.tower} value={filters.tower} onChange={e => setFilters({...filters, tower: e.target.value})} />
                        <FilterSelect label="Kết cấu" options={filterOptions.structure} value={filters.structure} onChange={e => setFilters({...filters, structure: e.target.value})} />
                        <FilterSelect label="Chất liệu" options={filterOptions.material} value={filters.material} onChange={e => setFilters({...filters, material: e.target.value})} />
                        <DateInput label="Từ ngày" value={filters.fromDate} onChange={date => setFilters({...filters, fromDate: date})} />
                        <DateInput label="Đến ngày" value={filters.toDate} onChange={date => setFilters({...filters, toDate: date})} />
                    </div>
                </section>

                <section className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                    <div className="border-b border-slate-200 dark:border-slate-700">
                        <nav className="-mb-px flex space-x-6">
                            <button onClick={() => setActiveTab('overview')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Tổng quan</button>
                            <button onClick={() => setActiveTab('details')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'details' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Chi tiết Giao dịch</button>
                        </nav>
                    </div>

                    <div className="mt-6">
                        {activeTab === 'overview' && (
                            <div className="h-96">
                                <Line data={revenueTrendData} options={getCommonChartOptions(theme === 'dark')} />
                            </div>
                        )}
                        {activeTab === 'details' && (
                            <div>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo Tên hoặc Mã sản phẩm..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full p-2 mb-4 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600"
                                />
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-700">
                                            <tr>
                                                <th className="p-3">Ngày bán</th>
                                                <th className="p-3">Sản phẩm</th>
                                                <th className="p-3 text-right">Doanh thu</th>
                                                <th className="p-3">Kênh</th>
                                                <th className="p-3">Tháp SP</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedDetails.map(item => (
                                                <tr key={item.id} onClick={() => setSelectedItem(item)} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
                                                    <td className="p-3">{formatDate(item.date)}</td>
                                                    <td className="p-3 font-medium">{item[productName]}</td>
                                                    <td className="p-3 text-right">{formatNumber(item.revenue)}</td>
                                                    <td className="p-3">{item[channel]}</td>
                                                    <td className="p-3">{item[tower]}</td>
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

            <Modal
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                title="Chi tiết giao dịch"
            >
                {selectedItem && (
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                        {Object.keys(COLUMN_MAPPINGS.salesDay).map(key => {
                             const header = COLUMN_MAPPINGS.salesDay[key];
                             let value = selectedItem[header];
                             if (key === 'date') value = formatDate(selectedItem.date);
                             else if (key === 'revenue' || key === 'quantity') value = formatNumber(selectedItem[key]);
                             
                             return (
                                <div key={key} className="border-b border-slate-200 dark:border-slate-700 pb-2">
                                    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{header}</dt>
                                    <dd className="mt-1 text-base text-slate-900 dark:text-slate-100">{value || 'N/A'}</dd>
                                </div>
                             )
                        })}
                    </dl>
                )}
            </Modal>
        </>
    );
}

export default SalesDayReport;
