import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

/**
 * Khởi tạo ứng dụng với cơ chế tự giải cứu (Safety Net) 5s
 */
const startApplication = () => {
  const root = document.getElementById('root');
  const overlay = document.getElementById('loading-overlay');

  if (!root) return;

  // HÀM CỨU CÁNH: Sau 5 giây tự động ẩn loading dù có lỗi gì xảy ra
  const safetyNet = setTimeout(() => {
    console.log("Hệ thống phản hồi chậm, đã tự động bỏ qua loading.");
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      setTimeout(() => overlay.remove(), 500);
    }
  }, 5000);

  try {
    const reactRoot = createRoot(root);
    reactRoot.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    // Hàm ẩn loading an toàn khi React đã sẵn sàng
    window.addEventListener('load', () => {
      clearTimeout(safetyNet);
      if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 500);
      }
    });

  } catch (err) {
    console.error("Lỗi khởi tạo React:", err);
    clearTimeout(safetyNet);
    if (overlay) overlay.remove();
  }
};

startApplication();