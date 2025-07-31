import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// 如果没有环境变量，创建一个模拟的客户端
let supabase: any;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Using mock client.');
  
  // 创建一个模拟的supabase客户端
  supabase = {
    from: (table: string) => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
    }),
  };
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

// 数据库表类型定义
export interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string;
          goal: string;
          assign_mode: string;
          status: string;
          task_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          goal: string;
          assign_mode: string;
          status?: string;
          task_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          goal?: string;
          assign_mode?: string;
          status?: string;
          task_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          order_id: string;
          title_zh: string;
          title_en: string;
          role_zh: string;
          role_en: string;
          estimated_hours: number;
          status: string;
          assigned_member_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          order_id: string;
          title_zh: string;
          title_en: string;
          role_zh: string;
          role_en: string;
          estimated_hours: number;
          status?: string;
          assigned_member_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          title_zh?: string;
          title_en?: string;
          role_zh?: string;
          role_en?: string;
          estimated_hours?: number;
          status?: string;
          assigned_member_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      team_members: {
        Row: {
          id: string;
          name: string;
          name_zh: string;
          name_en: string;
          roles: string;
          skills: string;
          available_hours: string;
          experience_score: number;
          hourly_rate: number;
          speed_factor: number;
        };
        Insert: {
          id: string;
          name: string;
          name_zh: string;
          name_en: string;
          roles: string;
          skills: string;
          available_hours: string;
          experience_score: number;
          hourly_rate: number;
          speed_factor: number;
        };
        Update: {
          id?: string;
          name?: string;
          name_zh?: string;
          name_en?: string;
          roles?: string;
          skills?: string;
          available_hours?: string;
          experience_score?: number;
          hourly_rate?: number;
          speed_factor?: number;
        };
      };
      chat_messages: {
        Row: {
          id: number;
          order_id: string;
          task_id: string;
          role: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          order_id: string;
          task_id: string;
          role: string;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          order_id?: string;
          task_id?: string;
          role?: string;
          message?: string;
          created_at?: string;
        };
      };
    };
  };
} 