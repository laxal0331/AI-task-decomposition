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

- 本项目自带一份默认数据库数据（`data/seed.sql`），用于测试和演示。
- 你可以通过如下命令导入默认数据（需先启动本地 MySQL 并创建数据库）：
  ```bash
  mysql -u root -p ai_remote_pm < data/seed.sql
  ```
- 这些数据仅供测试体验，可随时删除或替换为自己的数据。

- The project includes default database data (`data/seed.sql`) for testing and demo purposes.
- You can import the default data with the following command (make sure MySQL is running and the database is created):
  ```bash
  mysql -u root -p ai_remote_pm < data/seed.sql
  ```
- These data are for testing only and can be deleted or replaced at any time.

---

## 测试说明 Testing

- 项目根目录下有若干 Node.js 测试脚本（如 `test-api-response.js`、`test-assignment.js` 等），用于验证 API 和核心业务逻辑。
- 运行方式 How to run:
  ```bash
  node test-api-response.js
  node test-assignment.js
  # 依此类推 / and so on
  ```
- 这些脚本主要用于开发阶段的功能验证，非自动化测试框架（如 Jest）脚本。
- There are several Node.js test scripts in the project root (e.g., `test-api-response.js`, `test-assignment.js`, etc.) for API and core logic validation.
- These scripts are for development-time validation, not formal automated test frameworks (like Jest).

---

## 数据库与未来计划 Database & Planned Features

- 当前数据库集成正在重构，未来将支持更灵活的数据存储和迁移。
- 详情见 “Work in Progress” 或 “Planned Features” 部分。
- The database integration is being refactored for more flexible storage and migration.
- See the “Work in Progress” or “Planned Features” section for details.

---

## 环境变量配置 Environment Variables

请将项目根目录下的 `.env.example` 文件复制为 `.env.local`，并根据实际情况填写数据库、API 密钥等敏感信息：

Please copy `.env.example` to `.env.local` in the project root, and fill in your own database credentials, API keys, etc.

**支持的 AI Key：**
- `DEEPSEEK_API_KEY`（优先使用）
- `OPENAI_API_KEY`（如未配置 DeepSeek，则自动使用 OpenAI）

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
# 如需初始化数据库，可运行 / To initialize the database:
mysql -u root -p ai_remote_pm < data/seed.sql
```

---

## 主要技术栈 Tech Stack

- Next.js / React / TypeScript
- Node.js API 路由 / Node.js API routes
- OpenAI API 集成 / OpenAI API integration
- CSS/响应式设计 / CSS/Responsive design
- MySQL 数据库 / MySQL database

---

## 贡献与反馈 Contribution & Feedback

欢迎 issue、PR 或建议！  
Issues, PRs, and suggestions are welcome!
