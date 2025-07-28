# AI Remote PM 设置指南

## 环境变量配置

1. 在项目根目录创建 `.env.local` 文件
2. 添加以下内容：

```bash
# DeepSeek API 配置
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Supabase 数据库配置
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 获取 DeepSeek API 密钥

1. 访问 [DeepSeek 官网](https://platform.deepseek.com/)
2. 注册并登录账户
3. 在控制台中获取 API 密钥
4. 将密钥替换到 `.env.local` 文件中的 `your_deepseek_api_key_here`

## Supabase 数据库设置

### 1. 创建 Supabase 项目

1. 访问 [Supabase 官网](https://supabase.com/)
2. 注册并登录账户
3. 创建新项目
4. 在项目设置中获取以下信息：
   - Project URL
   - Anon (public) key

### 2. 配置环境变量

确保 `.env.local` 文件中的 Supabase 配置正确：
- `SUPABASE_URL`: Supabase 项目 URL
- `SUPABASE_ANON_KEY`: Supabase 匿名密钥

### 3. 数据库表结构

项目会自动在 Supabase 中创建所需的表：
- `orders` - 订单表
- `tasks` - 任务表
- `team_members` - 团队成员表
- `chat_messages` - 聊天消息表

## 启动项目

```bash
npm install
npm run dev
```

访问 `http://localhost:3000/task-planner` 测试功能。

## 故障排除

### 数据库连接错误

如果遇到 Supabase 连接错误：

1. 确保 `.env.local` 文件中的 Supabase 配置正确
2. 检查 Supabase 项目是否正常运行
3. 确认 API 密钥权限是否正确

### 环境变量问题

确保所有必需的环境变量都已正确设置：
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `DEEPSEEK_API_KEY` 