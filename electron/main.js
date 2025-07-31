// electron/main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

// Hàm chính được bọc trong async để có thể sử dụng await cho dynamic import
async function main() {
  // Dynamic import cho ES Module 'electron-is-dev'
  const { default: isDev } = await import('electron-is-dev');

  function createWindow() {
    // Tạo cửa sổ trình duyệt.
    const mainWindow = new BrowserWindow({
      width: 1280,
      height: 800,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
      },
      // Đảm bảo bạn có file icon trong thư mục `assets` ở gốc dự án
      icon: path.join(__dirname, '../assets/favicon.ico') 
    });

    // Load URL của Vite dev server hoặc file build trong production
    mainWindow.loadURL(
      isDev
        ? 'http://localhost:5173' // Port mặc định của Vite
        : `file://${path.join(__dirname, '../dist/index.html')}`
    );

    // Mở DevTools nếu ở môi trường dev
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  }

  // Hàm này sẽ được gọi khi Electron đã khởi tạo xong
  app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
      // Trên macOS, thường sẽ tạo lại một cửa sổ trong ứng dụng khi
      // biểu tượng dock được nhấp và không có cửa sổ nào khác đang mở.
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  // Thoát ứng dụng khi tất cả các cửa sổ đã đóng, trừ trên macOS.
  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}

// Chạy hàm chính
main();
