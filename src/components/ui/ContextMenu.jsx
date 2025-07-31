// src/components/ui/ContextMenu.jsx
import React, { useEffect, useRef } from 'react';

/**
 * Component menu ngữ cảnh, hiển thị tại vị trí con trỏ chuột.
 * @param {object} props
 * @param {Array} props.options - Mảng các lựa chọn cho menu.
 * @param {{x: number, y: number}} props.position - Vị trí hiển thị menu.
 * @param {Function} props.onClose - Hàm để đóng menu.
 */
const ContextMenu = ({ options, position, onClose }) => {
    const menuRef = useRef(null);

    // Tự động đóng menu khi người dùng nhấp ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    if (!position) return null;

    return (
        <div
            ref={menuRef}
            className="absolute z-50 w-48 bg-white dark:bg-slate-700 rounded-md shadow-lg border dark:border-slate-600 py-1"
            style={{ top: position.y, left: position.x }}
        >
            <ul>
                {options.map((option, index) => (
                    <li key={index}>
                        <button
                            onClick={() => {
                                option.onClick();
                                onClose(); // Tự động đóng menu sau khi chọn
                            }}
                            className={`w-full text-left flex items-center px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 ${option.className || ''}`}
                        >
                            {option.icon}
                            <span className="ml-2">{option.label}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ContextMenu;
