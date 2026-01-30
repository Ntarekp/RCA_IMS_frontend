import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ToastProvider } from './context/ToastContext';
import { ReportProvider } from './context/ReportContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ToastProvider>
      <ReportProvider>
        <App />
      </ReportProvider>
    </ToastProvider>
  </React.StrictMode>
);