import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const mountApp = () => {
  const rootElement = document.getElementById('root');
  const loader = document.getElementById('loading-overlay');

  if (!rootElement) return;

  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    const removeLoader = () => {
      if (loader) {
        loader.style.opacity = '0';
        loader.style.pointerEvents = 'none';
        setTimeout(() => {
          if (loader.parentNode) loader.parentNode.removeChild(loader);
        }, 500);
      }
    };

    if (document.readyState === 'complete') {
      removeLoader();
    } else {
      window.addEventListener('load', removeLoader);
      setTimeout(removeLoader, 3000); // Failsafe
    }
  } catch (err) {
    console.error("Mounting error:", err);
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="height: 100vh; display: flex; align-items: center; justify-content: center; background: #0b0e14; color: #ef4444; padding: 20px; text-align: center; font-family: sans-serif;">
          <div>
            <h1 style="font-size: 24px; font-weight: 900; margin-bottom: 10px;">LỖI KHỞI TẠO HỆ THỐNG</h1>
            <p style="color: #6b7280; font-size: 14px;">Vui lòng kiểm tra kết nối mạng hoặc tắt các Extension chặn quảng cáo và tải lại trang.</p>
            <button onclick="window.location.reload()" style="margin-top: 20px; background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;">TẢI LẠI TRANG</button>
          </div>
        </div>
      `;
    }
  }
};

mountApp();