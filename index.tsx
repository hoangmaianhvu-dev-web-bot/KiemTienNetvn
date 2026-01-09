import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const initApp = () => {
  const rootElement = document.getElementById('root');
  const loader = document.getElementById('loading-overlay');

  if (rootElement) {
    try {
      const root = ReactDOM.createRoot(rootElement);
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );

      // Ẩn màn hình chờ sau khi render bắt đầu
      if (loader) {
        setTimeout(() => {
          loader.style.opacity = '0';
          setTimeout(() => {
            loader.style.visibility = 'hidden';
            loader.remove();
          }, 500);
        }, 300);
      }
    } catch (error) {
      console.error("React render error:", error);
      if (rootElement) {
        rootElement.innerHTML = `<div style="color: white; padding: 20px; text-align: center; font-family: sans-serif;">
          <h2 style="color: #ef4444;">Lỗi khởi tạo hệ thống</h2>
          <p>Vui lòng làm mới trang (F5). Nếu vẫn lỗi, hãy kiểm tra kết nối mạng.</p>
        </div>`;
      }
    }
  }
};

// Khởi chạy khi tài nguyên đã sẵn sàng
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}