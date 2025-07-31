// src/utils/chart-helpers.js
import { formatNumber } from './formatters';

// **CẢI TIẾN: Hoàn toàn không phụ thuộc vào theme của DOM**
export function getChartColors(isDarkMode) {
  return {
    textColor: isDarkMode ? '#94a3b8' : '#475569',
    gridColor: isDarkMode ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.7)',
    tooltipBg: isDarkMode ? '#1e293b' : '#ffffff',
    primary: isDarkMode ? '#f59e0b' : '#d97706',
    secondary: '#0ea5e9',
    tertiary: '#8b5cf6',
    success: '#10b981',
    danger: '#ef4444'
  };
}

export function getCommonChartOptions(isDarkMode) {
    const colors = getChartColors(isDarkMode);
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { 
                    color: colors.textColor, 
                    font: { family: "'Be Vietnam Pro', sans-serif" } 
                },
            },
            tooltip: {
                backgroundColor: colors.tooltipBg,
                titleColor: isDarkMode ? '#e2e8f0' : '#1e293b',
                bodyColor: colors.textColor,
                borderColor: 'rgba(217, 119, 6, 0.3)',
                borderWidth: 1,
                padding: 12,
                titleFont: { weight: '600' },
                callbacks: {
                    label: (context) => {
                       let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        const value = context.parsed.y ?? context.parsed.x;
                        if (value !== null) {
                            // Check if the axis is formatted as a percentage
                            if (context.chart.options?.scales?.[context.chart.options.indexAxis === 'y' ? 'x' : 'y']?.ticks?.callback?.toString().includes('%')) {
                                label += `${(value * 100).toFixed(1)}%`;
                            } else {
                                label += formatNumber(value);
                            }
                        }
                        return label;
                    }
                },
            },
        },
        scales: {
            x: {
                ticks: { 
                    color: colors.textColor, 
                    font: { family: "'Be Vietnam Pro', sans-serif" } 
                },
                grid: { 
                    color: 'transparent', 
                    borderColor: colors.gridColor 
                },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    color: colors.textColor,
                    font: { family: "'Be Vietnam Pro', sans-serif" },
                    callback: (value) => {
                        if (Math.abs(value) >= 1000000) return `${value / 1000000} Tr`;
                        if (Math.abs(value) >= 1000) return `${value / 1000} K`;
                        return value;
                    },
                },
                grid: { 
                    color: colors.gridColor, 
                    borderDash: [3, 5], 
                    borderColor: 'transparent' 
                },
            },
        },
        animation: {
            duration: 400,
            easing: 'easeOutQuart'
        }
    };
};
