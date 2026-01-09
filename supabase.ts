
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://alqcdvvbhwahwnhpqajd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFscWNkdnZiaHdhaHduaHBxYWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODczMzgsImV4cCI6MjA4MzQ2MzMzOH0.FryAR3dH4OYO38M1n12CJbANQ9kh90H2Kq2t4eJQTKE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * SQL SCHEMA ĐẦY ĐỦ (Copy và chạy trong SQL Editor của Supabase):
 * 
 * -- 1. Bảng Profiles
 * create table public.profiles (
 *   id uuid references auth.users not null primary key,
 *   email text,
 *   full_name text,
 *   balance numeric default 0,
 *   total_earned numeric default 0,
 *   tasks_completed integer default 0,
 *   referral_code text unique,
 *   role text default 'user',
 *   created_at timestamp with time zone default now()
 * );
 * 
 * -- 2. Bảng Tasks
 * create table public.tasks (
 *   id uuid default gen_random_uuid() primary key,
 *   title text not null,
 *   reward numeric not null,
 *   type text check (type in ('link', 'social', 'app', 'video')),
 *   description text,
 *   url text,
 *   icon text default '🔗',
 *   created_at timestamp with time zone default now()
 * );
 * 
 * -- 3. Bảng Withdrawals
 * create table public.withdrawals (
 *   id uuid default gen_random_uuid() primary key,
 *   user_id uuid references public.profiles(id),
 *   amount numeric not null,
 *   method text check (method in ('bank', 'garena')),
 *   bank_name text,
 *   account_number text not null,
 *   status text default 'pending' check (status in ('pending', 'completed', 'rejected')),
 *   created_at timestamp with time zone default now()
 * );
 * 
 * -- 4. Bảng Announcements
 * create table public.announcements (
 *   id uuid default gen_random_uuid() primary key,
 *   title text not null,
 *   content text not null,
 *   created_at timestamp with time zone default now()
 * );
 * 
 * -- Enable RLS & Policies
 * alter table public.profiles enable row level security;
 * create policy "Viewable by all" on profiles for select using (true);
 * create policy "Self manage" on profiles for update using (auth.uid() = id);
 * 
 * alter table public.announcements enable row level security;
 * create policy "Public view" on announcements for select using (true);
 */
