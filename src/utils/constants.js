// src/utils/constants.js

// URL của các nguồn dữ liệu Google Sheets
export const DATA_URLS = {
    salesDay: "https://docs.google.com/spreadsheets/d/e/2PACX-1vT6tcIfrKkMcoipgzanmtHvNYcbCXmH4rbP3OhOOLqiY692cqD11DtmvWTY9VWtVahjIJD-0LziSsoE/pub?gid=390884034&single=true&output=csv",
    inventory: "https://docs.google.com/spreadsheets/d/e/2PACX-1vT6tcIfrKkMcoipgzanmtHvNYcbCXmH4rbP3OhOOLqiY692cqD11DtmvWTY9VWtVahjIJD-0LziSsoE/pub?gid=53173167&single=true&output=csv",
    salesRate2024: "https://docs.google.com/spreadsheets/d/e/2PACX-1vT6tcIfrKkMcoipgzanmtHvNYcbCXmH4rbP3OhOOLqiY692cqD11DtmvWTY9VWtVahjIJD-0LziSsoE/pub?gid=0&single=true&output=csv",
    salesRate2025: "https://docs.google.com/spreadsheets/d/e/2PACX-1vT6tcIfrKkMcoipgzanmtHvNYcbCXmH4rbP3OhOOLqiY692cqD11DtmvWTY9VWtVahjIJD-0LziSsoE/pub?gid=653818056&single=true&output=csv",
    channelPerformance: "https://docs.google.com/spreadsheets/d/e/2PACX-1vT6tcIfrKkMcoipgzanmtHvNYcbCXmH4rbP3OhOOLqiY692cqD11DtmvWTY9VWtVahjIJD-0LziSsoE/pub?gid=390884034&single=true&output=csv",
    productLifecycle: "https://docs.google.com/spreadsheets/d/e/2PACX-1vT6tcIfrKkMcoipgzanmtHvNYcbCXmH4rbP3OhOOLqiY692cqD11DtmvWTY9VWtVahjIJD-0LziSsoE/pub?gid=972661397&single=true&output=csv",
    structureProportion: "https://docs.google.com/spreadsheets/d/e/2PACX-1vT6tcIfrKkMcoipgzanmtHvNYcbCXmH4rbP3OhOOLqiY692cqD11DtmvWTY9VWtVahjIJD-0LziSsoE/pub?gid=1083502039&single=true&output=csv"
};

// Ánh xạ tên cột trong dữ liệu gốc
export const COLUMN_MAPPINGS = {
    salesDay: { date: 'Ngày bán', productId: 'Mã sản phẩm', productName: 'Tên sản phẩm', revenue: 'Doanh thu', quantity: 'Doanh số(SL)', channel: 'Kênh bán', tower: 'Tháp SP', structure: 'Kết cấu', material: 'Chất liệu' },
    inventory: { date: "Ngày lấy BC", productId: "Mã sản phẩm", productName: "Tên sản phẩm", totalStock: "Tổng tồn", tower: "Tháp SP", line: "Dòng SP", structure: "Kết cấu" },
    salesRate: { month: 'Tháng xuất dữ liệu', channel: 'Kênh bán', productId: 'Mã sản phẩm', productName: 'Tên sản phẩm', salesAmount: 'Doanh số (Tiền)', totalDiscount: 'Tổng chiết khấu', revenue: 'Doanh thu', profit: 'Lợi nhuận gộp', discountRateInitial: 'Tỷ lệ giảm giá (so với giá bán ban đầu)' },
    channelPerformance: { date: 'Ngày bán', revenue: 'Doanh thu', quantity: 'Doanh số(SL)', channel: 'Kênh bán' },
    // UPDATE: Cập nhật tên cột cho các mốc 5 và 10 ngày, loại bỏ các mốc không dùng tới
    productLifecycle: {
        productId: 'Mã sản phẩm',
        productName: 'Tên sản phẩm',
        collection: 'Bộ sưu tập',
        launchDate: 'Ngày mở bán',
        initialProduction: 'KHSX lần đầu',
        inventoryDate: 'Ngày lấy số liệu tồn kho',
        inventoryStock: 'Tồn kho',
        salesStore2d: 'Số lượng bán tại cửa hàng sau 2 ngày',
        salesOnline2d: 'Số lượng bán online sau 2 ngày',
        salesStore5d: 'Số lượng bán tại cửa hàng sau 5 ngày',
        salesOnline5d: 'Số lượng bán online sau 5 ngày',
        salesStore10d: 'Số lượng bán tại cửa hàng sau 10 ngày',
        salesOnline10d: 'Số lượng bán online sau 10 ngày',
    },
    structureProportion: {
    structureDetail: 'Kết cấu chi tiết',
    salesQuantity: 'Sản lượng bán',
    revenue: 'Doanh thu',
    inventory: 'Tồn kho',
    openingBalance: 'Đầu kỳ',
    closingBalance: 'Cuối kỳ',
    inventoryDate: 'Ngày lấy tồn kho',
  }
};
