import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

/**
 * Khởi tạo ứng dụng với cơ chế tự giải cứu (Safety Net) 7s
 */
const startApplication = () => {
  const rootElement = document.getElementById('root');
  const overlay = document.getElementById('loading-overlay');

  if (!rootElement) return;

  // HÀM CỨU CÁNH: Sau 7 giây tự động ẩn loading dù có lỗi gì xảy ra
  const safetyNet = setTimeout(() => {
    console.warn("Hệ thống phản hồi chậm, đã tự động bỏ qua loading.");
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      setTimeout(() => overlay.remove(), 500);
    }
  }, 7000);

  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    // Lắng nghe sự kiện ứng dụng đã sẵn sàng
    // Trong App.tsx chúng ta cũng sẽ thực hiện việc này khi mount
    window.addEventListener('load', () => {
      clearTimeout(safetyNet);
      if (overlay) {
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
        setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 500);
      }
    });

  } catch (err) {
    console.error("Lỗi nghiêm trọng khi khởi tạo React:", err);
    clearTimeout(safetyNet);
    if (overlay) overlay.remove();
  }
};

startApplication();