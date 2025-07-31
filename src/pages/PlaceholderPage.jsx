import React from 'react';

/**
 * Component tạm thời cho các trang chưa được xây dựng.
 * Giúp kiểm tra routing hoạt động đúng.
 */
const PlaceholderPage = ({ title }) => {
  return (
    <div className="flex items-center justify-center h-full bg-slate-50">
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        <p className="mt-2 text-slate-500">
          Nội dung cho trang này sẽ được xây dựng trong giai đoạn tiếp theo.
        </p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
