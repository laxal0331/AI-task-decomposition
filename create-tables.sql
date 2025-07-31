-- 创建 tasks 表
CREATE TABLE IF NOT EXISTS public.tasks (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255) NOT NULL,
  title_zh TEXT NOT NULL,
  title_en TEXT NOT NULL,
  role_zh VARCHAR(100) NOT NULL,
  role_en VARCHAR(100) NOT NULL,
  estimated_hours INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  assigned_member_id VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建 orders 表（如果不存在）
CREATE TABLE IF NOT EXISTS public.orders (
  id VARCHAR(255) PRIMARY KEY,
  goal TEXT NOT NULL,
  assign_mode VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT '待分配',
  task_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建 team_members 表（如果不存在）
CREATE TABLE IF NOT EXISTS public.team_members (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_zh VARCHAR(255) DEFAULT NULL,
  name_en VARCHAR(255) DEFAULT NULL,
  roles TEXT NOT NULL,
  skills TEXT NOT NULL,
  available_hours TEXT NOT NULL,
  experience_score INTEGER NOT NULL,
  hourly_rate INTEGER NOT NULL,
  speed_factor FLOAT NOT NULL
);

-- 创建 chat_messages 表（如果不存在）
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(255) NOT NULL,
  task_id VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 添加外键约束
ALTER TABLE public.tasks 
ADD CONSTRAINT fk_tasks_order_id 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

ALTER TABLE public.chat_messages 
ADD CONSTRAINT fk_chat_messages_order_id 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

ALTER TABLE public.chat_messages 
ADD CONSTRAINT fk_chat_messages_task_id 
FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE; 