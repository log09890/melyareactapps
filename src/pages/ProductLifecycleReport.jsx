// src/pages/ProductLifecycleReport.jsx
import React, { useState, useEffect, useMemo } from 'react';

import { DATA_URLS, COLUMN_MAPPINGS } from '/src/utils/constants.js';
import { useCsvData } from '/src/hooks/useCsvData.js';
import { parseDate, formatNumber, formatDate } from '/src/utils/formatters.js';

import Loader from '/src/components/ui/Loader.jsx';
import PageHeader from '/src/components/ui/PageHeader.jsx';
import FilterSelect from '/src/components/ui/FilterSelect.jsx';
import KpiCard from '/src/components/ui/KpiCard.jsx';
import { ThumbsUpIcon, ThumbsDownIcon } from '/src/components/Icons.jsx';

// Component để hiển thị một ô tỷ lệ với màu sắc
const RateCell = ({ rate }) => {
    const ratePercent = rate * 100;
    let colorClass = 'text-slate-600 dark:text-slate-300';
    if (ratePercent >= 50) colorClass = 'text-green-600 font-semibold';
    else if (ratePercent >= 20) colorClass = 'text-yellow-600';
    else if (ratePercent > 0) colorClass = 'text-red-600';

    return <td className={`p-3 text-right ${colorClass}`}>{ratePercent.toFixed(1)}%</td>;
}

// Component bảng phân tích có thể tái sử dụng
// UPDATE: Cập nhật tiêu đề để phản ánh mốc 10 ngày
const AnalysisTable = ({ title, data, icon }) => (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-3 text-slate-700 dark:text-slate-200">
            {icon}
            {title}
        </h3>
        <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-700 sticky top-0">
                    <tr>
                        <th className="p-2">Sản phẩm</th>
                        {/* UPDATE: Thay đổi tiêu đề cột */}
                        <th className="p-2 text-right">Tỷ lệ bán 10 ngày</th>
                        <th className="p-2 text-right">Tồn kho</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(item => (
                        <tr key={item.id} className="border-b dark:border-slate-700">
                            <td className="p-2">{item[COLUMN_MAPPINGS.productLifecycle.productName]}</td>
                            {/* UPDATE: Sử dụng rate_10d */}
                            <RateCell rate={item.rate_10d} />
                            <td className="p-2 text-right">{formatNumber(item[COLUMN_MAPPINGS.productLifecycle.inventoryStock])}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);


function ProductLifecycleReport() {
    const { data: rawData, loading, error } = useCsvData(DATA_URLS.productLifecycle);
    const cols = COLUMN_MAPPINGS.productLifecycle;

    // UPDATE: Thay đổi logic xử lý dữ liệu để tính toán cho 2, 5, 10 ngày
    // Lưu ý: Dữ liệu nguồn không có sẵn cho 5 và 10 ngày, nên chúng ta sẽ ánh xạ từ dữ liệu 7 và 14 ngày gần nhất.
    const processedData = useMemo(() => {
        if (!rawData.length) return [];
        const parseNum = (val) => parseInt(String(val).replace(/[^\d]/g, '')) || 0;
        
        return rawData.map((row, index) => {
            const initial = parseNum(row[cols.initialProduction]);
            
            // Dữ liệu 2 ngày (giữ nguyên)
            const sales2d = parseNum(row[cols.salesStore2d]) + parseNum(row[cols.salesOnline2d]);
            
            // Dữ liệu 5 ngày (ánh xạ từ dữ liệu 7 ngày)
            const sales5d = parseNum(row[cols.salesStore7d]) + parseNum(row[cols.salesOnline7d]);

            // Dữ liệu 10 ngày (ánh xạ từ dữ liệu 14 ngày)
            const sales10d = parseNum(row[cols.salesStore14d]) + parseNum(row[cols.salesOnline14d]);

            return {
                id: index,
                ...row,
                inventoryDate: parseDate(row[cols.inventoryDate]),
                [cols.initialProduction]: initial,
                total_2d: sales2d,
                rate_2d: initial > 0 ? sales2d / initial : 0,
                total_5d: sales5d,
                rate_5d: initial > 0 ? sales5d / initial : 0,
                total_10d: sales10d,
                rate_10d: initial > 0 ? sales10d / initial : 0,
            };
        });
    }, [rawData, cols]);

    const [filters, setFilters] = useState({ collection: 'Tất cả' });
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({ currentPage: 1, rowsPerPage: 50 });

    const filteredData = useMemo(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        return processedData.filter(r => 
            (filters.collection === 'Tất cả' || r[cols.collection] === filters.collection) &&
            (!searchTerm || 
             (r[cols.productName] || '').toLowerCase().includes(lowercasedFilter) || 
             (r[cols.productId] || '').toLowerCase().includes(lowercasedFilter))
        );
    }, [processedData, filters, searchTerm, cols]);

    // UPDATE: Cập nhật logic phân loại sản phẩm tốt/cần chú ý dựa trên mốc 10 ngày
    const { topPerformers, underperformers, latestInventoryDate } = useMemo(() => {
        const top = filteredData
            .filter(p => p.rate_10d >= 0.7) // Tỷ lệ bán tốt > 70% sau 10 ngày
            .sort((a, b) => b.rate_10d - a.rate_10d);

        const under = filteredData
            .filter(p => p.rate_10d < 0.4 && p[cols.inventoryStock] > 10) // Tỷ lệ bán chậm < 40% sau 10 ngày và tồn > 10
            .sort((a, b) => b[cols.inventoryStock] - a[cols.inventoryStock]);

        const inventoryDates = filteredData.map(r => r.inventoryDate).filter(Boolean);
        const latestDate = inventoryDates.length > 0
            ? formatDate(new Date(Math.max(...inventoryDates.map(d => d.getTime()))))
            : 'N/A';

        return { topPerformers: top, underperformers: under, latestInventoryDate: latestDate };
    }, [filteredData, cols]);

    useEffect(() => {
        setPagination(p => ({ ...p, currentPage: 1 }));
    }, [filters, searchTerm]);

    const paginatedData = useMemo(() => {
        const startIndex = (pagination.currentPage - 1) * pagination.rowsPerPage;
        return filteredData.slice(startIndex, startIndex + pagination.rowsPerPage);
    }, [filteredData, pagination]);

    const totalPages = Math.ceil(filteredData.length / pagination.rowsPerPage);

    const filterOptions = useMemo(() => ({
        collection: ['Tất cả', ...new Set(processedData.map(r => r[cols.collection]))].sort(),
    }), [processedData, cols]);
    
    if (loading) return <Loader />;
    if (error) return <div className="p-4 text-center text-red-500 bg-red-100 rounded-lg">{error}</div>;

    return (
        <div className="space-y-6 p-6">
            <PageHeader title="Báo cáo Vòng đời Sản phẩm" description="Theo dõi hiệu suất bán của sản phẩm theo các mốc thời gian." />
            
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <KpiCard title="Tổng số mã SP" value={formatNumber(filteredData.length)} />
                <KpiCard title="Sản phẩm bán tốt" value={formatNumber(topPerformers.length)} />
                <KpiCard title="Ngày tồn kho gần nhất" value={latestInventoryDate} />
            </section>

            <section className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FilterSelect label="Bộ sưu tập" options={filterOptions.collection} value={filters.collection} onChange={e => setFilters({ ...filters, collection: e.target.value })} />
                    <input type="text" placeholder="Tìm kiếm theo Tên hoặc Mã sản phẩm..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 self-end border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                </div>
            </section>

            {/* UPDATE: Cập nhật tiêu đề bảng phân tích */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnalysisTable 
                    title="Sản phẩm bán tốt (Tỷ lệ > 70%/10 ngày)" 
                    data={topPerformers}
                    icon={<ThumbsUpIcon className="text-green-500" />}
                />
                <AnalysisTable 
                    title="Sản phẩm cần chú ý (Tỷ lệ < 40%/10 ngày, Tồn > 10)" 
                    data={underperformers}
                    icon={<ThumbsDownIcon className="text-red-500" />}
                />
            </section>

            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <table className="w-full text-sm text-left whitespace-nowrap">
                    {/* UPDATE: Cập nhật tiêu đề bảng chính */}
                    <thead className="bg-slate-100 dark:bg-slate-700 text-xs uppercase">
                        <tr>
                            <th className="p-3 sticky left-0 bg-slate-100 dark:bg-slate-700 z-10">Sản phẩm</th>
                            <th className="p-3">Bộ sưu tập</th>
                            <th className="p-3 text-center">KHSX</th>
                            <th className="p-3 text-center">Tồn kho</th>
                            <th className="p-3 text-center bg-sky-50 dark:bg-sky-900/50">Tổng 2 ngày</th>
                            <th className="p-3 text-center bg-sky-50 dark:bg-sky-900/50">Tỷ lệ 2 ngày</th>
                            <th className="p-3 text-center bg-teal-50 dark:bg-teal-900/50">Tổng 5 ngày</th>
                            <th className="p-3 text-center bg-teal-50 dark:bg-teal-900/50">Tỷ lệ 5 ngày</th>
                            <th className="p-3 text-center bg-indigo-50 dark:bg-indigo-900/50">Tổng 10 ngày</th>
                            <th className="p-3 text-center bg-indigo-50 dark:bg-indigo-900/50">Tỷ lệ 10 ngày</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* UPDATE: Cập nhật dữ liệu hiển thị trong bảng */}
                        {paginatedData.map(item => (
                            <tr key={item.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 group">
                                <td className="p-3 sticky left-0 bg-white dark:bg-slate-800 group-hover:bg-slate-50 dark:group-hover:bg-slate-700/50 font-medium z-10">
                                    <div className="font-bold">{item[cols.productName]}</div>
                                    <div className="text-xs text-slate-500">{item[cols.productId]}</div>
                                </td>
                                <td className="p-3">{item[cols.collection]}</td>
                                <td className="p-3 text-center font-semibold">{formatNumber(item[cols.initialProduction])}</td>
                                <td className="p-3 text-center">{formatNumber(item[cols.inventoryStock])}</td>
                                <td className="p-3 text-center bg-sky-50 dark:bg-sky-900/50">{formatNumber(item.total_2d)}</td>
                                <RateCell rate={item.rate_2d} />
                                <td className="p-3 text-center bg-teal-50 dark:bg-teal-900/50">{formatNumber(item.total_5d)}</td>
                                <RateCell rate={item.rate_5d} />
                                <td className="p-3 text-center bg-indigo-50 dark:bg-indigo-900/50">{formatNumber(item.total_10d)}</td>
                                <RateCell rate={item.rate_10d} />
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
    );
}

export default ProductLifecycleReport;
