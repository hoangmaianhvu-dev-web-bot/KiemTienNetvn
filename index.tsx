import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

const init = () => {
  const rootEl = document.getElementById('root');
  if (!rootEl) return;

  try {
    const root = createRoot(rootEl);
    root.render(<App />);

    const hideLoader = () => {
      const loader = document.getElementById('loading-overlay');
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500);
      }
    };

    if (document.readyState === 'complete') hideLoader();
    else window.addEventListener('load', hideLoader);
    setTimeout(hideLoader, 3000);
  } catch (err) {
    console.error("React Init Failed:", err);
    rootEl.innerHTML = `<div style="color:white;text-align:center;padding:50px;">Lỗi khởi tạo. Vui lòng tải lại trang.</div>`;
  }
};

init();