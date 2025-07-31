// src/components/ui/Modal.jsx
import React, { useEffect } from 'react';

function Modal({ isOpen, onClose, title, children }) {
  // Hiệu ứng để khóa cuộn của trang nền khi modal mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Dọn dẹp hiệu ứng khi component bị hủy
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    // Lớp phủ nền
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose} // Đóng modal khi nhấp ra ngoài
    >
      {/* Container của modal */}
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl transform transition-all"
        onClick={(e) => e.stopPropagation()} // Ngăn việc đóng modal khi nhấp vào bên trong
      >
        {/* Header của modal */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        {/* Nội dung chi tiết */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
            {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
