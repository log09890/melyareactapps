// src/utils/formatters.js
/**
 * File: src/utils/formatters.js
 * Description: Cung cấp các hàm tiện ích định dạng dữ liệu (số, ngày tháng).
 */

/**
 * Phân tích cú pháp một chuỗi ngày tháng (dd/mm/yyyy) thành đối tượng Date.
 * @param {string} dateString - Chuỗi ngày tháng cần phân tích.
 * @returns {Date|null} - Đối tượng Date hoặc null nếu không hợp lệ.
 */
export function parseDate(dateString) {
    if (!dateString || typeof dateString !== 'string') return null;
    const parts = dateString.split('/');
    if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
        const year = parseInt(parts[2], 10);
        // Basic validation for year, month, day
        if (year > 1000 && month >= 0 && month < 12 && day > 0 && day <= 31) {
             const dt = new Date(year, month, day);
             // Verify that the date wasn't rolled over (e.g. 31/04 becoming 01/05)
             if (dt.getFullYear() === year && dt.getMonth() === month && dt.getDate() === day) {
                return dt;
             }
        }
    }
    // Also try to parse other common formats if the first fails
    const dt = new Date(dateString);
    if (dt instanceof Date && !isNaN(dt)) {
        return dt;
    }
    return null;
}

/**
 * Định dạng một đối tượng Date thành chuỗi dd/mm/yyyy.
 * @param {Date} date - Đối tượng Date cần định dạng.
 * @returns {string} - Chuỗi ngày tháng đã định dạng.
 */
export function formatDate(date) {
    if (!(date instanceof Date) || isNaN(date)) return 'N/A';
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Định dạng một số với dấu phẩy ngăn cách hàng nghìn.
 * @param {number} number - Số cần định dạng.
 * @returns {string} - Chuỗi số đã định dạng.
 */
export function formatNumber(number) {
    if (number === null || number === undefined || isNaN(number)) return '0';
    return number.toLocaleString('vi-VN');
}
