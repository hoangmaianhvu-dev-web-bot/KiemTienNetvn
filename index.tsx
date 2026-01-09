import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

/**
 * Hàm khởi tạo ứng dụng với cơ chế phòng vệ (Defense-in-depth)
 */
const initApplication = () => {
  const rootElement = document.getElementById('root');
  const loader = document.getElementById('loading-overlay');

  if (!rootElement) {
    console.error("Không tìm thấy phần tử root để mount ứng dụng.");
    return;
  }

  try {
    // 1. Tạo Root React
    const root = createRoot(rootElement);
    
    // 2. Render ứng dụng
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    // 3. Logic xử lý Loader an toàn
    const hideLoader = () => {
      if (loader) {
        loader.style.opacity = '0';
        loader.style.pointerEvents = 'none';
        setTimeout(() => {
          if (loader.parentNode) loader.parentNode.removeChild(loader);
        }, 600);
      }
    };

    // Đảm bảo loader biến mất khi hệ thống sẵn sàng
    if (document.readyState === 'complete') {
      hideLoader();
    } else {
      window.addEventListener('load', hideLoader);
      // Failsafe: Sau 4s vẫn tắt loader để người dùng không bị kẹt
      setTimeout(hideLoader, 4000);
    }

  } catch (err) {
    console.error("Lỗi nghiêm trọng khi khởi tạo React:", err);
    
    // Hiển thị giao diện Safe Mode thay vì màn hình đen
    rootElement.innerHTML = `
      <div style="height: 100vh; display: flex; align-items: center; justify-content: center; background: #0b0e14; color: #ffffff; font-family: 'Inter', sans-serif; padding: 40px; text-align: center;">
        <div style="max-width: 400px; padding: 40px; background: #151a24; border: 1px solid #ef4444; border-radius: 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
          <div style="font-size: 40px; margin-bottom: 20px;">🛡️</div>
          <h1 style="font-size: 18px; font-weight: 900; color: #ef4444; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Hệ Thống Tạm Ngắt</h1>
          <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin-bottom: 24px;">Không thể tải tài nguyên bảo mật. Vui lòng kiểm tra kết nối mạng hoặc tắt các Extension chặn quảng cáo.</p>
          <button onclick="window.location.reload()" style="width: 100%; background: #3b82f6; color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 800; cursor: pointer; transition: transform 0.2s;">THỬ LẠI NGAY</button>
        </div>
      </div>
    `;
  }
};

// Thực thi khởi tạo
initApplication();