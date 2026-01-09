
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://alqcdvvbhwahwnhpqajd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFscWNkdnZiaHdhaHduaHBxYWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODczMzgsImV4cCI6MjA4MzQ2MzMzOH0.FryAR3dH4OYO38M1n12CJbANQ9kh90H2Kq2t4eJQTKE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * SQL SCHEMA FOR SUPABASE (Paste this into the SQL Editor):
 * 
 * create table public.profiles (
 *   id uuid references auth.users not null primary key,
 *   email text,
 *   full_name text,
 *   balance numeric default 0,
 *   total_earned numeric default 0,
 *   tasks_completed integer default 0,
 *   referral_code text unique,
 *   role text default 'user',
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * 
 * -- Enable RLS
 * alter table public.profiles enable row level security;
 * 
 * -- Policies
 * create policy "Public profiles are viewable by everyone." on profiles for select using (true);
 * create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
 * create policy "Users can update own profile." on profiles for update using (auth.uid() = id);
 */
