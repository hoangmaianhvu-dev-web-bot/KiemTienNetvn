import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

/**
 * Khởi tạo ứng dụng với logic ẩn loading cực mạnh
 */
const startApplication = () => {
  const rootElement = document.getElementById('root');
  const overlay = document.getElementById('loading-overlay');

  if (!rootElement) return;

  const hideOverlay = () => {
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 500);
    }
  };

  // CƠ CHẾ GIẢI CỨU: Sau 5 giây tự động ẩn loading dù có chuyện gì xảy ra
  const safetyNet = setTimeout(() => {
    console.warn("Hệ thống khởi động lâu hơn dự kiến, tự động bỏ qua loading.");
    hideOverlay();
  }, 5000);

  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    // Kiểm tra nếu trang đã load xong
    if (document.readyState === 'complete') {
      clearTimeout(safetyNet);
      hideOverlay();
    } else {
      window.addEventListener('load', () => {
        clearTimeout(safetyNet);
        hideOverlay();
      });
    }

  } catch (err) {
    console.error("Lỗi khởi tạo React:", err);
    clearTimeout(safetyNet);
    hideOverlay();
  }
};

startApplication();