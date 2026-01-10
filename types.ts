
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  balance: number;
  total_earned: number;
  tasks_completed: number;
  referral_code: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Task {
  id: string; // Will be UUID string
  title: string;
  reward: number;
  type: string;
  description: string;
  url: string;
  icon: string;
  max_per_day: number;
  api_url?: string;
  method?: 'GET' | 'POST';
  json_key?: string;
  fallback_url?: string;
  created_at?: string;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  method: 'bank' | 'garena' | 'zing';
  status: 'pending' | 'completed' | 'rejected';
  created_at: string;
  bank_name?: string;
  account_number?: string;
  recipient_email?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}
