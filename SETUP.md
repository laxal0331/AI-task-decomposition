# AI Remote PM 设置指南

## 环境变量配置

1. 在项目根目录创建 `.env.local` 文件
2. 添加以下内容：

```bash
# DeepSeek API 配置
DEEPSEEK_API_KEY=sk-8014635c61974c0ab3ac1483c686663c

# MySQL 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ai_remote_pm
DB_PORT=3306
```

## 获取 DeepSeek API 密钥

1. 访问 [DeepSeek 官网](https://platform.deepseek.com/)
2. 注册并登录账户
3. 在控制台中获取 API 密钥
4. 将密钥替换到 `.env.local` 文件中的 `your_deepseek_api_key_here`

## MySQL 数据库设置

### 1. 安装 MySQL

**Windows:**
- 下载并安装 [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)
- 安装时设置 root 密码

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

### 2. 创建数据库

1. 启动 MySQL 服务
2. 登录 MySQL：
```bash
mysql -u root -p
```

3. 创建数据库（可选，应用会自动创建）：
```sql
CREATE DATABASE IF NOT EXISTS ai_remote_pm;
```

4. 退出 MySQL：
```sql
EXIT;
```

### 3. 配置环境变量

确保 `.env.local` 文件中的数据库配置正确：
- `DB_HOST`: MySQL 服务器地址（通常是 localhost）
- `DB_USER`: MySQL 用户名（通常是 root）
- `DB_PASSWORD`: MySQL 密码
- `DB_NAME`: 数据库名称（ai_remote_pm）
- `DB_PORT`: MySQL 端口（通常是 3306）

## 启动项目

```bash
npm install
npm run dev
```

访问 `http://localhost:3000/task-planner` 测试功能。

## 故障排除

### 数据库连接错误

如果遇到 "Unknown database 'ai_remote_pm'" 错误：

1. 确保 MySQL 服务正在运行
2. 检查 `.env.local` 文件中的数据库配置
3. 确保 MySQL 用户有创建数据库的权限
4. 应用会自动创建数据库和表，如果仍有问题，可以手动创建：

```sql
CREATE DATABASE ai_remote_pm;
USE ai_remote_pm;
```

### 权限问题

如果遇到权限错误，确保 MySQL 用户有足够权限：

```sql
GRANT ALL PRIVILEGES ON ai_remote_pm.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
``` 