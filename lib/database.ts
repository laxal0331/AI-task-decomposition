import mysql from 'mysql2/promise';

// MySQL 连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ai_remote_pm',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 初始化数据库表
export async function initDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // 创建订单表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        goal TEXT NOT NULL,
        assign_mode VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT '进行中',
        task_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 创建任务表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(255) PRIMARY KEY,
        order_id VARCHAR(255) NOT NULL,
        title_zh TEXT NOT NULL,
        title_en TEXT NOT NULL,
        role_zh VARCHAR(100) NOT NULL,
        role_en VARCHAR(100) NOT NULL,
        estimated_hours INT NOT NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        assigned_member_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);

    // 创建成员分配表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS task_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        task_id VARCHAR(255) NOT NULL,
        member_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
      )
    `);

    // 创建聊天消息表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(255) NOT NULL,
        task_id VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
      )
    `);

    // 创建成员表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS members (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        roles TEXT,
        skills TEXT,
        available_hours TEXT,
        experience_score INT,
        hourly_rate INT,
        speed_factor FLOAT
      )
    `);

    // 新增团队成员表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS team_members (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        name_zh VARCHAR(255),
        name_en VARCHAR(255),
        roles TEXT NOT NULL,
        skills TEXT NOT NULL,
        available_hours TEXT NOT NULL,
        experience_score INT NOT NULL,
        hourly_rate INT NOT NULL,
        speed_factor FLOAT NOT NULL
      )
    `);

    connection.release();
    console.log('MySQL database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// 导出连接池
export default pool; 