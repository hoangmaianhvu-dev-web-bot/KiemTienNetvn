
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
  id: string;
  title: string;
  reward: number;
  type: 'link' | 'social' | 'app' | 'video';
  description: string;
  url: string;
  icon: string;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  method: 'bank' | 'garena';
  status: 'pending' | 'completed' | 'rejected';
  created_at: string;
  bank_name?: string;
  account_number?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}
