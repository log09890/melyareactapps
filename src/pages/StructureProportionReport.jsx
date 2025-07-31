// src/pages/StructureProportionReport.jsx
import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useTheme } from '/src/context/ThemeContext.jsx';

import { DATA_URLS, COLUMN_MAPPINGS } from '/src/utils/constants.js';
import { useCsvData } from '/src/hooks/useCsvData.js';
import { formatNumber, formatDate, parseDate } from '/src/utils/formatters.js';
import { getCommonChartOptions, getChartColors } from '/src/utils/chart-helpers.js';


import Loader from '/src/components/ui/Loader.jsx';
import PageHeader from '/src/components/ui/PageHeader.jsx';
import KpiCard from '/src/components/ui/KpiCard.jsx';

const ProportionCell = ({ value }) => (
    <td className="p-3 text-right">
        {(value * 100).toFixed(1)}%
    </td>
);

function StructureProportionReport() {
    const { data: rawData, loading, error } = useCsvData(DATA_URLS.structureProportion);
    const cols = COLUMN_MAPPINGS.structureProportion;
    const { theme } = useTheme();

    const processedData = useMemo(() => {
        if (!rawData.length) return [];
        const parseNum = (val) => parseInt(String(val).replace(/[^\d]/g, '')) || 0;

        const totalSalesQuantity = rawData.reduce((sum, row) => sum + parseNum(row[cols.salesQuantity]), 0);
        const totalRevenue = rawData.reduce((sum, row) => sum + parseNum(row[cols.revenue]), 0);
        const totalInventory = rawData.reduce((sum, row) => sum + parseNum(row[cols.inventory]), 0);

        return rawData.map(row => {
            const salesQuantity = parseNum(row[cols.salesQuantity]);
            const revenue = parseNum(row[cols.revenue]);
            const inventory = parseNum(row[cols.inventory]);

            return {
                ...row,
                inventoryDate: parseDate(row[cols.inventoryDate]), // Xử lý cột ngày
                [cols.salesQuantity]: salesQuantity,
                [cols.revenue]: revenue,
                [cols.inventory]: inventory,
                [cols.openingBalance]: parseNum(row[cols.openingBalance]),
                [cols.closingBalance]: parseNum(row[cols.closingBalance]),
                salesQuantityProportion: totalSalesQuantity > 0 ? salesQuantity / totalSalesQuantity : 0,
                revenueProportion: totalRevenue > 0 ? revenue / totalRevenue : 0,
                inventoryProportion: totalInventory > 0 ? inventory / totalInventory : 0,
            };
        }).sort((a,b) => b[cols.revenue] - a[cols.revenue]);

    }, [rawData, cols]);

    const kpis = useMemo(() => {
        const totalRevenue = processedData.reduce((sum, row) => sum + row[cols.revenue], 0);
        const totalSales = processedData.reduce((sum, row) => sum + row[cols.salesQuantity], 0);
        const totalInventory = processedData.reduce((sum, row) => sum + row[cols.inventory], 0);

        const inventoryDates = processedData.map(r => r.inventoryDate).filter(Boolean);
        const firstDate = inventoryDates.length > 0 ? formatDate(new Date(Math.min(...inventoryDates.map(d => d.getTime())))) : 'N/A';
        const latestDate = inventoryDates.length > 0 ? formatDate(new Date(Math.max(...inventoryDates.map(d => d.getTime())))) : 'N/A';

        return {
            totalRevenue: formatNumber(totalRevenue),
            totalSales: formatNumber(totalSales),
            totalInventory: formatNumber(totalInventory),
            firstDate,
            latestDate,
        };
    }, [processedData, cols]);

    const chartData = useMemo(() => {
        const topN = 7;
        const topData = processedData.slice(0, topN);
        const otherData = processedData.slice(topN);
        
        const otherRevenue = otherData.reduce((sum, row) => sum + row[cols.revenue], 0);
        const otherInventory = otherData.reduce((sum, row) => sum + row[cols.inventory], 0);

        const revenueLabels = [...topData.map(d => d[cols.structureDetail]), 'Khác'];
        const revenueValues = [...topData.map(d => d[cols.revenue]), otherRevenue];

        const inventoryLabels = [...topData.map(d => d[cols.structureDetail]), 'Khác'];
        const inventoryValues = [...topData.map(d => d[cols.inventory]), otherInventory];
        
        const chartColors = getChartColors(theme === 'dark');
        const colorPalette = [chartColors.primary, chartColors.secondary, chartColors.tertiary, chartColors.success, '#f87171', '#fbbf24', '#a78bfa', '#64748b'];

        return {
            revenue: {
                labels: revenueLabels,
                datasets: [{ data: revenueValues, backgroundColor: colorPalette }]
            },
            inventory: {
                labels: inventoryLabels,
                datasets: [{ data: inventoryValues, backgroundColor: colorPalette }]
            }
        }
    }, [processedData, cols, theme]);

    if (loading) return <Loader />;
    if (error) return <div className="p-4 text-center text-red-500 bg-red-100 rounded-lg">{error}</div>;

    return (
        <div className="space-y-6 p-6">
            <PageHeader title="Báo cáo Tỷ trọng Kết cấu" description="Phân tích tỷ trọng doanh thu, sản lượng bán và tồn kho theo từng kết cấu sản phẩm." />

            <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <KpiCard title="Tổng Doanh thu" value={kpis.totalRevenue} />
                <KpiCard title="Tổng Sản lượng bán" value={kpis.totalSales} />
                <KpiCard title="Tổng Tồn kho" value={kpis.totalInventory} />
                <KpiCard title="Ngày đầu kỳ" value={kpis.firstDate} />
                <KpiCard title="Ngày cuối kỳ" value={kpis.latestDate} />
            </section>
            
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                    <h3 className="text-xl font-bold mb-4 text-center">Tỷ trọng Doanh thu</h3>
                    <div className="h-80"><Doughnut data={chartData.revenue} options={{...getCommonChartOptions(theme === 'dark'), plugins: { legend: { position: 'right'}}}}/></div>
                </div>
                 <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                    <h3 className="text-xl font-bold mb-4 text-center">Tỷ trọng Tồn kho</h3>
                    <div className="h-80"><Doughnut data={chartData.inventory} options={{...getCommonChartOptions(theme === 'dark'), plugins: { legend: { position: 'right'}}}}/></div>
                </div>
            </section>

            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-slate-100 dark:bg-slate-700 text-xs uppercase">
                        <tr>
                            <th className="p-3 sticky left-0 bg-slate-100 dark:bg-slate-700">Kết cấu chi tiết</th>
                            <th className="p-3 text-right">Tồn đầu kỳ</th>
                            <th className="p-3 text-right">Tồn cuối kỳ</th>
                            <th className="p-3 text-right">Sản lượng bán</th>
                            <th className="p-3 text-right">Tỷ trọng SL</th>
                            <th className="p-3 text-right">Doanh thu</th>
                            <th className="p-3 text-right">Tỷ trọng DT</th>
                            <th className="p-3 text-right">Tồn kho</th>
                            <th className="p-3 text-right">Tỷ trọng Tồn</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {processedData.map(item => (
                            <tr key={item[cols.structureDetail]} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 group">
                                <td className="p-3 sticky left-0 bg-white dark:bg-slate-800 group-hover:bg-slate-50 dark:group-hover:bg-slate-700/50 font-medium">{item[cols.structureDetail]}</td>
                                <td className="p-3 text-right">{formatNumber(item[cols.openingBalance])}</td>
                                <td className="p-3 text-right">{formatNumber(item[cols.closingBalance])}</td>
                                <td className="p-3 text-right">{formatNumber(item[cols.salesQuantity])}</td>
                                <ProportionCell value={item.salesQuantityProportion} />
                                <td className="p-3 text-right font-semibold">{formatNumber(item[cols.revenue])}</td>
                                <ProportionCell value={item.revenueProportion} />
                                <td className="p-3 text-right">{formatNumber(item[cols.inventory])}</td>
                                <ProportionCell value={item.inventoryProportion} />
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default StructureProportionReport;
