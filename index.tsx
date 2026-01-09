import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const initApp = () => {
  const rootElement = document.getElementById('root');

  if (rootElement) {
    try {
      const root = ReactDOM.createRoot(rootElement);
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    } catch (error) {
      console.error("React render error:", error);
      rootElement.innerHTML = `<div style="color: white; padding: 20px; text-align: center;">
        <h2>Lỗi khởi tạo hệ thống</h2>
        <p>Vui lòng làm mới trang (F5). Nếu vẫn lỗi, hãy kiểm tra kết nối mạng.</p>
      </div>`;
    }
  } else {
    console.error("Root element not found.");
  }
};

// Đảm bảo DOM đã tải xong trước khi khởi chạy React
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}