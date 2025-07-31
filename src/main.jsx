// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter as Router } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { setupCharts } from './config/chart-config.js';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ReportProvider } from './context/ReportContext.jsx';
import { WorkspaceProvider } from './context/WorkspaceContext.jsx';
import { AppConfigProvider } from './context/AppConfigContext.jsx';

setupCharts();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <ThemeProvider>
        <AppConfigProvider>
          <ReportProvider>
            <WorkspaceProvider>
              <App />
            </WorkspaceProvider>
          </ReportProvider>
        </AppConfigProvider>
      </ThemeProvider>
    </Router>
  </React.StrictMode>
);
