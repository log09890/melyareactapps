// src/hooks/useCsvData.js
import { useState, useEffect } from 'react';

// Custom Hook để tải và xử lý dữ liệu từ một URL CSV
export const useCsvData = (url) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Chỉ chạy nếu có URL và thư viện PapaParse đã được tải từ CDN
        if (!url || !window.Papa) {
            if (!window.Papa) {
                setError("Thư viện PapaParse chưa được tải. Vui lòng kiểm tra kết nối mạng và file index.html.");
            }
            setLoading(false);
            return;
        };
        
        setLoading(true);
        setError(null);
        setData([]); // Xóa dữ liệu cũ khi tải url mới

        window.Papa.parse(url, {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length) {
                    setError(`Lỗi định dạng CSV: ${results.errors[0].message}`);
                } else {
                    setData(results.data);
                }
                setLoading(false);
            },
            error: (err) => {
                setError(`Lỗi tải file CSV: ${err.message}`);
                setLoading(false);
            },
        });
    }, [url]); // Chạy lại hook này mỗi khi URL thay đổi

    return { data, loading, error };
};
