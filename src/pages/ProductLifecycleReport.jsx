// src/pages/ProductLifecycleReport.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useCsvData } from '/src/hooks/useCsvData.js';
import { parseDate, formatNumber, formatDate } from '/src/utils/formatters.js';
import { DATA_URLS, COLUMN_MAPPINGS } from '/src/utils/constants.js';

import Loader from '/src/components/ui/Loader.jsx';
import PageHeader from '/src/components/ui/PageHeader.jsx';
import FilterSelect from '/src/components/ui/FilterSelect.jsx';
import KpiCard from '/src/components/ui/KpiCard.jsx';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/solid';

// --- Helper Components ---

const RateCell = ({ rate, oldRate }) => {
    const ratePercent = rate * 100;
    let colorClass = 'text-slate-600 dark:text-slate-300';
    if (ratePercent >= 50) colorClass = 'text-green-600 font-semibold';
    else if (ratePercent >= 20) colorClass = 'text-yellow-600';
    else if (ratePercent > 0) colorClass = 'text-red-600';

    const hasOldRate = typeof oldRate === 'number' && !isNaN(oldRate);
    const oldRatePercent = hasOldRate ? oldRate * 100 : 0;
    const diff = hasOldRate ? ratePercent - oldRatePercent : null;

    return (
        <td className={`p-3 text-right ${colorClass}`}>
            <span>{ratePercent.toFixed(1)}%</span>
            {diff !== null && (
                <span className={`ml-2 text-xs ${diff > 0 ? 'text-green-500' : diff < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    ({diff > 0 ? '+' : ''}{diff.toFixed(1)}%)
                </span>
            )}
        </td>
    );
};

const ComparisonKpiCard = ({ title, currentValue, oldValue }) => {
    const current = parseFloat(String(currentValue).replace(/[^\d.-]/g, '')) || 0;
    const old = parseFloat(String(oldValue).replace(/[^\d.-]/g, '')) || 0;
    const diff = current - old;
    const diffPercent = old !== 0 ? (diff / old) * 100 : (current > 0 ? 100 : 0);

    let diffColor = 'text-gray-500 dark:text-gray-400';
    let DiffIcon = MinusIcon;
    if (diff > 0) {
        diffColor = 'text-green-500';
        DiffIcon = ArrowUpIcon;
    } else if (diff < 0) {
        diffColor = 'text-red-500';
        DiffIcon = ArrowDownIcon;
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h3>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2">{currentValue}</p>
            {oldValue !== null && (
                 <div className={`flex items-center text-sm mt-1 ${diffColor}`}>
                    <DiffIcon className="h-4 w-4 mr-1"/>
                    <span>{diff > 0 ? '+' : ''}{formatNumber(diff)} ({diffPercent.toFixed(1)}%) so với kỳ trước</span>
                </div>
            )}
        </div>
    );
};


// --- Main Component ---

function ProductLifecycleReport() {
    const { data: rawData, loading, error } = useCsvData(DATA_URLS.productLifecycle);
    const cols = COLUMN_MAPPINGS.productLifecycle;

    const [selectedDate, setSelectedDate] = useState('');
    const [comparisonDate, setComparisonDate] = useState('');

    const processedData = useMemo(() => {
        if (!rawData || !rawData.length) return [];
        const parseNum = (val) => parseInt(String(val).replace(/[^\d]/g, '')) || 0;
        
        return rawData.map((row, index) => {
            const initial = parseNum(row[cols.initialProduction]);
            const sales2d = parseNum(row[cols.salesStore2d]) + parseNum(row[cols.salesOnline2d]);
            const sales5d = parseNum(row[cols.salesStore5d]) + parseNum(row[cols.salesOnline5d]);
            const sales10d = parseNum(row[cols.salesStore10d]) + parseNum(row[cols.salesOnline10d]);

            return {
                id: `${row[cols.productId]}-${index}`, ...row,
                inventoryDateStr: row[cols.inventoryDate], // Giữ lại chuỗi ngày gốc để lọc
                inventoryDate: parseDate(row[cols.inventoryDate]),
                [cols.initialProduction]: initial,
                total_2d: sales2d, rate_2d: initial > 0 ? sales2d / initial : 0,
                total_5d: sales5d, rate_5d: initial > 0 ? sales5d / initial : 0,
                total_10d: sales10d, rate_10d: initial > 0 ? sales10d / initial : 0,
            };
        });
    }, [rawData, cols]);

    const availableDates = useMemo(() => {
        const dates = [...new Set(processedData.map(item => item.inventoryDateStr))];
        // Sắp xếp ngày tháng (định dạng dd/mm/yyyy)
        dates.sort((a, b) => {
            const dateA = parseDate(a);
            const dateB = parseDate(b);
            if (!dateA) return 1;
            if (!dateB) return -1;
            return dateB - dateA; // Sắp xếp giảm dần, ngày mới nhất lên đầu
        });
        return dates;
    }, [processedData]);

    useEffect(() => {
        if (availableDates.length > 0 && !selectedDate) {
            setSelectedDate(availableDates[0]);
        }
    }, [availableDates, selectedDate]);

    const [filters, setFilters] = useState({ collection: 'Tất cả' });
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({ currentPage: 1, rowsPerPage: 50 });

    const getFilteredDataByDate = (dateStr) => {
        if (!dateStr) return [];
        const lowercasedFilter = searchTerm.toLowerCase();
        return processedData.filter(r => 
            r.inventoryDateStr === dateStr &&
            (filters.collection === 'Tất cả' || r[cols.collection] === filters.collection) &&
            (!searchTerm || 
             (r[cols.productName] || '').toLowerCase().includes(lowercasedFilter) || 
             (r[cols.productId] || '').toLowerCase().includes(lowercasedFilter))
        );
    };

    const mainReportData = useMemo(() => getFilteredDataByDate(selectedDate), [processedData, selectedDate, filters, searchTerm]);
    const comparisonReportData = useMemo(() => getFilteredDataByDate(comparisonDate), [processedData, comparisonDate, filters, searchTerm]);

    const { kpis, comparisonKpis } = useMemo(() => {
        const calculateKpis = (data) => {
            if (!data.length) return { totalSku: 0, topPerformers: 0 };
            const top = data.filter(p => p.rate_10d >= 0.7).length;
            return { totalSku: data.length, topPerformers: top };
        };
        return {
            kpis: calculateKpis(mainReportData),
            comparisonKpis: comparisonDate ? calculateKpis(comparisonReportData) : null
        };
    }, [mainReportData, comparisonReportData, comparisonDate]);

    useEffect(() => {
        setPagination(p => ({ ...p, currentPage: 1 }));
    }, [filters, searchTerm, selectedDate, comparisonDate]);

    const mergedData = useMemo(() => {
        const comparisonMap = comparisonDate ? new Map(comparisonReportData.map(item => [item[cols.productId], item])) : null;
        const startIndex = (pagination.currentPage - 1) * pagination.rowsPerPage;
        const paginated = mainReportData.slice(startIndex, startIndex + pagination.rowsPerPage);

        if (!comparisonMap) return paginated;

        return paginated.map(currentItem => ({
            ...currentItem,
            oldData: comparisonMap.get(currentItem[cols.productId]) || null
        }));
    }, [mainReportData, comparisonReportData, pagination, comparisonDate, cols.productId]);

    const totalPages = Math.ceil(mainReportData.length / pagination.rowsPerPage);
    const filterOptions = useMemo(() => ({
        collection: ['Tất cả', ...new Set(processedData.map(r => r[cols.collection]))].sort(),
    }), [processedData, cols]);

    if (loading) return <Loader />;
    if (error) return <div className="p-4 text-center text-red-500 bg-red-100 rounded-lg">{error}</div>;

    return (
        <div className="space-y-6 p-6">
            <PageHeader title="Báo cáo Vòng đời Sản phẩm" description="Theo dõi và so sánh hiệu suất bán của sản phẩm theo các mốc thời gian." />
            
            <section className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <FilterSelect label="Chọn ngày báo cáo chính" options={availableDates} value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
                    <FilterSelect label="So sánh với ngày" options={['Không so sánh', ...availableDates]} value={comparisonDate || 'Không so sánh'} onChange={e => setComparisonDate(e.target.value === 'Không so sánh' ? '' : e.target.value)} />
                </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                <ComparisonKpiCard title="Tổng số mã SP" currentValue={formatNumber(kpis.totalSku)} oldValue={comparisonKpis ? formatNumber(comparisonKpis.totalSku) : null} />
                <ComparisonKpiCard title="Sản phẩm bán tốt" currentValue={formatNumber(kpis.topPerformers)} oldValue={comparisonKpis ? formatNumber(comparisonKpis.topPerformers) : null} />
            </section>

            <section className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FilterSelect label="Bộ sưu tập" options={filterOptions.collection} value={filters.collection} onChange={e => setFilters({ ...filters, collection: e.target.value })} />
                    <input type="text" placeholder="Tìm kiếm theo Tên hoặc Mã sản phẩm..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 self-end border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600"/>
                </div>
            </section>

            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-slate-100 dark:bg-slate-700 text-xs uppercase">
                        <tr>
                            <th className="p-3 sticky left-0 bg-slate-100 dark:bg-slate-700 z-10">Sản phẩm</th>
                            <th className="p-3 text-center">KHSX</th>
                            <th className="p-3 text-center">Tồn kho</th>
                            {comparisonDate && <th className="p-3 text-center text-gray-500">Tồn kho (cũ)</th>}
                            <th className="p-3 text-center bg-sky-50 dark:bg-sky-900/50">Tỷ lệ 2 ngày</th>
                            <th className="p-3 text-center bg-teal-50 dark:bg-teal-900/50">Tỷ lệ 5 ngày</th>
                            <th className="p-3 text-center bg-indigo-50 dark:bg-indigo-900/50">Tỷ lệ 10 ngày</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mergedData.map(item => (
                            <tr key={item.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 group">
                                <td className="p-3 sticky left-0 bg-white dark:bg-slate-800 group-hover:bg-slate-50 dark:group-hover:bg-slate-700/50 font-medium z-10">
                                    <div className="font-bold">{item[cols.productName]}</div>
                                    <div className="text-xs text-slate-500">{item[cols.productId]}</div>
                                </td>
                                <td className="p-3 text-center font-semibold">{formatNumber(item[cols.initialProduction])}</td>
                                <td className="p-3 text-center">{formatNumber(item[cols.inventoryStock])}</td>
                                {comparisonDate && <td className="p-3 text-center text-gray-500">{item.oldData ? formatNumber(item.oldData[cols.inventoryStock]) : '-'}</td>}
                                <RateCell rate={item.rate_2d} oldRate={item.oldData?.rate_2d} />
                                <RateCell rate={item.rate_5d} oldRate={item.oldData?.rate_5d} />
                                <RateCell rate={item.rate_10d} oldRate={item.oldData?.rate_10d} />
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
