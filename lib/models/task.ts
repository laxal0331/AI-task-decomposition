export interface Task {
  title: string;
  role: string;
  estimated_hours: number;
  status: string;
  id: string;
  title_zh?: string;
  title_en?: string;
  role_zh?: string;
  role_en?: string;
  assigned_member_id?: string | null;
  order_id?: string;
}


