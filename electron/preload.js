// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');

// "Phơi bày" các hàm an toàn ra môi trường web (giao diện)
// để các nút bấm có thể gọi được chúng.
contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('minimize-app'),
  maximize: () => ipcRenderer.send('maximize-app'),
  close: () => ipcRenderer.send('close-app'),
});
