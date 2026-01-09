import { createClient } from '@supabase/supabase-js';

// THÔNG TIN DỰ ÁN CỦA BẠN - ĐÃ CẤU HÌNH SẴN CHO GITHUB PAGES
const supabaseUrl = 'https://alqcdvvbhwahwnhpqajd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFscWNkdnZiaHdhaHduaHBxYWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODczMzgsImV4cCI6MjA4MzQ2MzMzOH0.FryAR3dH4OYO38M1n12CJbANQ9kh90H2Kq2t4eJQTKE';

let supabaseInstance: any;

try {
  // Khởi tạo client với cấu hình tối ưu cho Web App
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true, // Lưu phiên đăng nhập
      autoRefreshToken: true, // Tự động làm mới token
      detectSessionInUrl: true // Nhận diện session từ URL (cho email confirm)
    }
  });
} catch (error) {
  console.error("Lỗi kết nối database:", error);
  // Tạo mock client để tránh vỡ giao diện khi mất mạng
  supabaseInstance = {
    auth: { 
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: async () => ({ error: null })
    },
    from: () => ({
      select: () => ({ order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }), eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }), order: () => Promise.resolve({ data: [], error: null }) }) }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
      delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) })
    })
  };
}

export const supabase = supabaseInstance;