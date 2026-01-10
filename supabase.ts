
import { createClient } from '@supabase/supabase-js';

// THÔNG TIN DỰ ÁN - Đã đồng bộ với subdomain alqcdvvbhwahwnhpqajd
const supabaseUrl = 'https://alqcdvvbhwahwnhpqajd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFscWNkdnZiaHdhaHduaHBxYWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODczMzgsImV4cCI6MjA4MzQ2MzMzOH0.FryAR3dH4OYO38M1n12CJbANQ9kh90H2Kq2t4eJQTKE';

let supabaseInstance: any;

try {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      headers: { 'x-application-name': 'kiemtiennet' }
    }
  });
} catch (error) {
  console.error("Lỗi khởi tạo Supabase:", error);
  // Mock client dự phòng
  supabaseInstance = {
    auth: { 
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: async () => ({ error: null })
    },
    from: () => ({
      select: () => ({ 
        eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }), order: () => Promise.resolve({ data: [], error: null }) }),
        order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) })
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
      delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) })
    }),
    rpc: () => Promise.resolve({ data: { success: false, message: 'Offline mode' }, error: null })
  };
}

export const supabase = supabaseInstance;
