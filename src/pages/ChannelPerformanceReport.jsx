// src/pages/ChannelPerformanceReport.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';

import { DATA_URLS, COLUMN_MAPPINGS } from '../utils/constants';
import { useCsvData } from '../hooks/useCsvData';
import { parseDate, formatNumber } from '../utils/formatters';
import { getCommonChartOptions, getChartColors } from '../utils/chart-helpers';

import Loader from '../components/ui/Loader';
import PageHeader from '../components/ui/PageHeader';
import KpiCard from '../components/ui/KpiCard';
import FilterSelect from '../components/ui/FilterSelect';
import DateInput from '../components/ui/DateInput';

function ChannelPerformanceReport() {
    const { data: rawData, loading, error } = useCsvData(DATA_URLS.channelPerformance);
    const { date, revenue, quantity, channel } = COLUMN_MAPPINGS.channelPerformance;
    const { theme } = useTheme();

    const processedData = useMemo(() => {
        if (!rawData.length) return [];
        return rawData.map(row => ({
            date: parseDate(row[date]),
            revenue: parseFloat(String(row[revenue]).replace(/,/g, '')) || 0,
            quantity: parseInt(String(row[quantity]).replace(/,/g, '')) || 0,
            channel: row[channel] || 'Không xác định',
        })).filter(r => r.date);
    }, [rawData, date, revenue, quantity, channel]);

    const [filters, setFilters] = useState({ channel: 'Tất cả', fromDate: null, toDate: null });

    useEffect(() => {
        if(processedData.length > 0 && !filters.fromDate) {
            const dates = processedData.map(r => r.date);
            setFilters(prev => ({...prev, fromDate: new Date(Math.min(...dates)), toDate: new Date(Math.max(...dates))}));
        }
    }, [processedData]);

    const filteredData = useMemo(() => processedData.filter(r => {
        const { fromDate, toDate } = filters;
        return (filters.channel === 'Tất cả' || r.channel === filters.channel) &&
               (!fromDate || r.date >= fromDate) &&
               (!toDate || r.date <= toDate);
    }), [processedData, filters]);
    
    const kpis = useMemo(() => {
        const totalRevenue = filteredData.reduce((s, r) => s + r.revenue, 0);
        const totalQuantity = filteredData.reduce((s, r) => s + r.quantity, 0);
        const transactionCount = filteredData.length;
        return {
            totalRevenue: formatNumber(totalRevenue),
            totalQuantity: formatNumber(totalQuantity),
            aov: formatNumber(transactionCount > 0 ? totalRevenue / transactionCount : 0),
            upt: (transactionCount > 0 ? totalQuantity / transactionCount : 0).toFixed(2),
        };
    }, [filteredData]);
    
    const filterOptions = useMemo(() => ({
        channel: ['Tất cả', ...new Set(processedData.map(r => r.channel))].sort()
    }), [processedData]);
    
    const chartData = useMemo(() => {
        const pieGrouped = filteredData.reduce((acc, row) => {
            acc[row.channel] = (acc[row.channel] || 0) + row.revenue; return acc;
        }, {});

        const chartColors = getChartColors(theme === 'dark');
        const colorPalette = [chartColors.primary, chartColors.secondary, chartColors.tertiary, chartColors.success, chartColors.danger, '#f97316', '#6366f1'];

        return {
            revenuePie: {
                labels: Object.keys(pieGrouped),
                datasets: [{ 
                    data: Object.values(pieGrouped), 
                    backgroundColor: colorPalette
                }]
            }
        };
    }, [filteredData, theme]);

    if (loading) return <Loader />;
    if (error) return <div className="p-4 text-center text-red-500 bg-red-100 dark:bg-red-900/50 rounded-lg">{error}</div>;

    return (
        <div className="space-y-6">
            <PageHeader title="Báo cáo Hiệu suất Kênh bán" description="Phân tích chi tiết doanh thu và hiệu quả của từng kênh." />
            
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title="Tổng Doanh thu" value={kpis.totalRevenue} />
                <KpiCard title="Tổng Số lượng" value={kpis.totalQuantity} />
                <KpiCard title="AOV" value={kpis.aov} />
                <KpiCard title="UPT" value={kpis.upt} />
            </section>
            
            <section className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <FilterSelect 
                        label="Kênh bán" 
                        options={filterOptions.channel} 
                        value={filters.channel} 
                        onChange={e => setFilters({...filters, channel: e.target.value})} 
                    />
                    <DateInput 
                        label="Từ ngày" 
                        value={filters.fromDate} 
                        onChange={date => setFilters({...filters, fromDate: date})} 
                    />
                    <DateInput 
                        label="Đến ngày" 
                        value={filters.toDate} 
                        onChange={date => setFilters({...filters, toDate: date})} 
                    />
                </div>
            </section>
            
            <section className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-4 text-center">Tỷ trọng Doanh thu</h3>
                <div className="h-80 max-w-md mx-auto">
                    <Doughnut 
                        data={chartData.revenuePie} 
                        options={{...getCommonChartOptions(theme === 'dark'), plugins: { legend: { position: 'right'}}}} 
                    />
                </div>
            </section>
        </div>
    );
}

export default ChannelPerformanceReport;
