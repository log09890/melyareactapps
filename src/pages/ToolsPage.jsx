import React from 'react';
import PageHeader from '../components/ui/PageHeader';
import { TableCellsIcon, DocumentDuplicateIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

// Một component thẻ công cụ có thể tái sử dụng
const ToolCard = ({ icon, title, description, actionText }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col hover:shadow-lg transition-shadow duration-300">
    <div className="flex-shrink-0">{icon}</div>
    <div className="flex-grow mt-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>
    <button className="mt-6 w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors duration-300">
      {actionText}
    </button>
  </div>
);

const ToolsPage = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full bg-gray-50 dark:bg-gray-900">
      <PageHeader title="Bộ Công Cụ" description="Tập hợp các tiện ích giúp bạn xử lý, phân tích và kiểm tra dữ liệu một cách hiệu quả." />
      
      <div className="mt-8 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <ToolCard 
          icon={<TableCellsIcon className="h-8 w-8 text-indigo-500" />}
          title="Chuyển đổi CSV sang JSON"
          description="Tải lên tệp CSV của bạn và chuyển đổi nhanh chóng sang định dạng JSON để sử dụng trong các báo cáo hoặc API."
          actionText="Bắt đầu chuyển đổi"
        />
        <ToolCard 
          icon={<DocumentDuplicateIcon className="h-8 w-8 text-teal-500" />}
          title="Tạo bản sao báo cáo"
          description="Sao chép nhanh một báo cáo hiện có với tất cả các cấu hình, bộ lọc và biểu đồ để thử nghiệm các kịch bản mới."
          actionText="Chọn báo cáo"
        />
        <ToolCard 
          icon={<CheckBadgeIcon className="h-8 w-8 text-emerald-500" />}
          title="Kiểm tra dữ liệu"
          description="Xác thực một tệp dữ liệu để đảm bảo nó tuân thủ đúng định dạng và các quy tắc trước khi nhập vào hệ thống."
          actionText="Tải tệp lên"
        />
        
        {/* Thẻ công cụ sắp ra mắt */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700">
           <div className="text-center">
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Công cụ mới</h3>
             <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Sắp ra mắt...</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsPage;