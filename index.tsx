import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');
const loader = document.getElementById('loading-overlay');

if (rootElement) {
  const root = createRoot(rootElement);
  
  // Render App
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // Xử lý ẩn loader sau khi ứng dụng đã mount
  const hideLoader = () => {
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => {
        if (loader.parentNode) loader.remove();
      }, 500);
    }
  };

  // Đợi window load hoàn toàn hoặc timeout để chắc chắn không bị đen màn
  if (document.readyState === 'complete') {
    hideLoader();
  } else {
    window.addEventListener('load', hideLoader);
    setTimeout(hideLoader, 2000); // Failsafe
  }
}