# AI远程项目管理平台  
AI Remote Project Management Platform

> 一个基于 Next.js + TypeScript 的智能任务分解与团队分配平台，支持 AI 自动拆解项目目标、智能分配开发任务、团队成员管理与进度追踪。适用于远程开发团队、自由职业项目协作等场景。  
> A Next.js + TypeScript based platform for intelligent task decomposition and team assignment, supporting AI-powered project breakdown, smart developer matching, team management, and progress tracking. Ideal for remote teams and freelance project collaboration.

---

## 功能简介 Features

### 管理端 / AI端功能 (Admin/AI Side)
- AI 智能拆解项目目标为可执行任务  
  AI-powered decomposition of project goals into actionable tasks
- 智能匹配并分配开发者，支持多种分配策略  
  Smart developer matching and assignment with multiple strategies
- 团队成员管理与工时统计  
  Team member management and work hour statistics
- 任务进度实时追踪  
  Real-time task progress tracking
- 订单管理与历史记录  
  Order management and history
- 支持中英文切换  
  Bilingual support (English/Chinese)
- 响应式设计，适配 PC 和移动端  
  Responsive design for PC and mobile

### 开发者端功能 (Developer Side)
- 开发者登录后可查看分配给自己的任务  
  Developers can log in to view their assigned tasks
- 任务状态流转（接受、开发中、测试、完成、撤回等）  
  Task status flow (accept, in progress, testing, completed, revoke, etc.)
- 实时进度条与任务详情  
  Real-time progress bar and task details
- 与管理端/客户的交流入口  
  Communication portal with admin/client

---

## 数据库默认数据 Default Database Data

- 本项目使用 Supabase 作为数据库服务，无需本地数据库配置。
- 默认数据会自动在 Supabase 中创建，无需手动导入。
- 这些数据仅供测试体验，可随时删除或替换为自己的数据。

- The project uses Supabase as the database service, no local database setup required.
- Default data will be automatically created in Supabase, no manual import needed.
- These data are for testing only and can be deleted or replaced at any time.

---

## 测试与 CI/监控 Testing, CI & Monitoring

### 单元测试 Vitest
- 位置：`tests/unit/*`
- 覆盖：
  - 分配算法 `lib/services/assignment.ts`
  - 角色归一 `lib/services/orderLoaders.ts`
- 运行：
  ```bash
  npm run test        # 带覆盖率的一次性运行
  npm run test:unit   # watch/本地开发
  ```

### CI（GitHub Actions）
- 工作流：`.github/workflows/ci.yml`
- 步骤：`lint → build → test`
- 使用：推送到 `main` 或 PR 会自动触发。可在仓库设置里开启 Required status checks 强制通过后才可合并。

### 监控（Sentry 可选）
- 封装：`lib/monitoring/sentry.ts`
- 前端初始化：`pages/_app.tsx` 自动调用
- 启用方式：在 Vercel 环境变量中设置 `NEXT_PUBLIC_SENTRY_DSN`（可选再加服务端 `SENTRY_DSN`）。

---

## 数据库与未来计划 Database & Planned Features

- 当前使用 Supabase 作为数据库服务，提供云端的 PostgreSQL 数据库。
- 支持实时数据同步、用户认证、文件存储等功能。
- The project uses Supabase as the database service, providing cloud PostgreSQL database.
- Supports real-time data sync, user authentication, file storage, etc.

---

## 环境变量配置 Environment Variables

请将项目根目录下的 `.env.example` 文件复制为 `.env.local`，并根据实际情况填写数据库、API 密钥等敏感信息：

Please copy `.env.example` to `.env.local` in the project root, and fill in your own database credentials, API keys, etc.

**必需的环境变量：**
- `SUPABASE_URL` - Supabase 项目 URL
- `SUPABASE_ANON_KEY` - Supabase 匿名密钥
- `DEEPSEEK_API_KEY`（优先使用）或 `OPENAI_API_KEY`
 - （可选）`NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN` - Sentry 监控

> 系统会自动优先使用 DeepSeek，有哪个用哪个。
> The system will automatically use DeepSeek first, and fallback to OpenAI if DeepSeek is not configured.

```bash
cp .env.example .env.local
```

`.env.local` 文件不会被上传到仓库，请妥善保存。
The `.env.local` file is ignored by git and will not be uploaded to the repository.

---

## 快速启动 Quick Start

```bash
npm install
npm run dev
```

访问 http://localhost:3000 开始使用
Visit http://localhost:3000 to start using

---

## 架构与模块 Architecture

- pages：仅页面编排（`task-planner.tsx` 为中控），不放业务逻辑
- lib/constants：常量与文案映射
- lib/services：业务服务（分配、订单加载、提交等）
- lib/hooks：视图逻辑与交互封装
- components：UI 组件
- lib/smartMatch.ts：候选与模式排序算法
- lib/services/recommendationCache.ts：候选与选择快照（避免二次进入退化）

---

## 部署 Deployment

- 推荐 Vercel，一键导入 GitHub 仓库
- 环境变量：见上文
- 部署成功后可开启 Vercel Analytics 与 Sentry 监控

---

## 主要技术栈 Tech Stack

- Next.js / React / TypeScript
- Node.js API 路由 / Node.js API routes
- OpenAI API 集成 / OpenAI API integration
- CSS/响应式设计 / CSS/Responsive design
- Supabase 数据库 / Supabase database

---

## 贡献与反馈 Contribution & Feedback

欢迎 issue、PR 或建议！  
Issues, PRs, and suggestions are welcome!
