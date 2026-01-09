import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://alqcdvvbhwahwnhpqajd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFscWNkdnZiaHdhaHduaHBxYWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODczMzgsImV4cCI6MjA4MzQ2MzMzOH0.FryAR3dH4OYO38M1n12CJbANQ9kh90H2Kq2t4eJQTKE';

/**
 * Khởi tạo Supabase client với cơ chế bắt lỗi an toàn.
 * Nếu bị chặn bởi Extension, ứng dụng sẽ không bị 'đen màn' mà vẫn load được UI cơ bản.
 */
let supabaseInstance: any;

try {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  });
} catch (error) {
  console.error("Supabase Initialization Failed:", error);
  // Tạo một mock object để tránh lỗi undefined khi các component khác gọi tới
  supabaseInstance = {
    auth: { getSession: async () => ({ data: { session: null } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }) },
    from: () => ({ select: () => ({ order: () => ({ limit: () => Promise.resolve({ data: [] }) }), eq: () => ({ maybeSingle: () => Promise.resolve({ data: null }) }) }) })
  };
}

export const supabase = supabaseInstance;