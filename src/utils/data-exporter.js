/**
 * File: src/utils/data-exporter.js
 * Description: Cung cấp các hàm để xuất dữ liệu ra file (CSV, PNG).
 */
import Papa from 'papaparse';

/**
 * Chuyển đổi dữ liệu (mảng object) thành file CSV và tải về.
 * @param {Array<Object>} data - Dữ liệu cần xuất.
 * @param {string} filename - Tên file CSV.
 */
export function exportDataToCSV(data, filename) {
    if (!data || data.length === 0) {
        alert('Không có dữ liệu để xuất.');
        return;
    }
    // Sử dụng Papa.unparse để chuyển JSON thành chuỗi CSV
    const csv = Papa.unparse(data);
    
    // Tạo một Blob để chứa dữ liệu CSV (với BOM cho ký tự UTF-8 tiếng Việt)
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    
    // Tạo một thẻ <a> ẩn để kích hoạt việc tải file
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
