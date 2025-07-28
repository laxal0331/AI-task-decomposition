import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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