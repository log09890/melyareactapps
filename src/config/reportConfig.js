// src/config/reportConfig.js
import React from 'react';
import { 
    RevenueIcon, InventoryIcon, SalesRateIcon, ChannelIcon, 
    LifecycleIcon, StructureIcon 
} from '../components/Icons';

/**
 * Đây là nơi duy nhất để quản lý tất cả các báo cáo.
 * Khi bạn muốn thêm một báo cáo mới, chỉ cần thêm một object vào đây.
 */
export const reportList = [
  {
    path: '/sales',
    name: 'Doanh thu Chi tiết',
    description: 'Phân tích doanh thu, số lượng, giao dịch theo nhiều chiều.',
    // SỬA LỖI: Truyền component, không phải JSX
    icon: RevenueIcon,
    dataKey: 'salesDay', // Key này phải khớp với key trong DATA_URLS
    category: 'Phân tích Bán hàng'
  },
  {
    path: '/sales-rate',
    name: 'Phân tích Tỷ lệ Bán',
    description: 'Phân tích biên lợi nhuận theo các mức giảm giá.',
    // SỬA LỖI: Truyền component, không phải JSX
    icon: SalesRateIcon,
    dataKey: 'salesRate2025', // Mặc định hiển thị năm mới nhất
    category: 'Phân tích Bán hàng'
  },
  {
    path: '/channels',
    name: 'Hiệu suất Kênh bán',
    description: 'Phân tích hiệu quả và đóng góp của từng kênh bán hàng.',
    // SỬA LỖI: Truyền component, không phải JSX
    icon: ChannelIcon,
    dataKey: 'channelPerformance',
    category: 'Phân tích Bán hàng'
  },
   {
    path: '/structure-proportion',
    name: 'Tỷ trọng theo Kết cấu',
    description: 'Phân tích tỷ trọng bán hàng và tồn kho theo kết cấu SP.',
    // SỬA LỖI: Truyền component, không phải JSX
    icon: StructureIcon,
    dataKey: 'structureProportion',
    category: 'Phân tích Bán hàng'
  },
  {
    path: '/inventory',
    name: 'Báo cáo Tồn kho',
    description: 'Phân tích chi tiết tồn kho theo thuộc tính sản phẩm.',
    // SỬA LỖI: Truyền component, không phải JSX
    icon: InventoryIcon,
    dataKey: 'inventory',
    category: 'Quản lý Sản phẩm & Kho'
  },
  {
    path: '/lifecycle',
    name: 'Báo cáo Vòng đời SP',
    description: 'Theo dõi hiệu suất bán của sản phẩm theo các mốc thời gian.',
    // SỬA LỖI: Truyền component, không phải JSX
    icon: LifecycleIcon,
    dataKey: 'productLifecycle',
    category: 'Quản lý Sản phẩm & Kho'
  },
];

// Tự động tạo các danh mục từ danh sách báo cáo
export const reportCategories = [...new Set(reportList.map(r => r.category))];
