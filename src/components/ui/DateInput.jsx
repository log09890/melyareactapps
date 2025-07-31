// src/components/ui/DateInput.jsx
import React from 'react';

const DateInput = ({ label, value, onChange, ...props }) => {
    // Hàm này chuyển đổi đối tượng Date sang định dạng 'yyyy-mm-dd' mà input yêu cầu
    const formatDateForInput = (date) => {
        if (!date || !(date instanceof Date)) return '';
        try {
            return date.toISOString().split('T')[0];
        } catch (error) {
            console.error("Invalid date value for input:", date);
            return '';
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>
            <input
                type="date"
                value={formatDateForInput(value)}
                // Khi người dùng chọn ngày mới, chuyển nó thành đối tượng Date và xử lý múi giờ
                onChange={(e) => onChange(new Date(e.target.value + 'T00:00:00'))}
                className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                {...props}
            />
        </div>
    );
};

export default DateInput;
