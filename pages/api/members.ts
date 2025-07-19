import { NextApiRequest, NextApiResponse } from 'next';
import { teamMemberService } from '../../lib/dbService';
import { seedTeamMembers } from '../../lib/teamData';
import db from '../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      console.log('开始获取成员数据...');
      
      // 测试数据库连接
      console.log('测试数据库连接...');
      const [testResult] = await db.execute('SELECT 1 as test');
      console.log('数据库连接测试成功:', testResult);
      
      // 直接查询数据库
      const [rows] = await db.execute('SELECT * FROM team_members ORDER BY id ASC');
      console.log('数据库查询结果:', rows);
      console.log('获取到成员数量:', (rows as any[])?.length || 0);
      
      if (!rows || (rows as any[]).length === 0) {
        console.log('数据库中没有找到开发者数据');
        res.status(200).json({ members: [] });
        return;
      }
      
      // 处理数据格式
      const members = (rows as any[]).map((row, index) => {
        try {
          let availableHours = [];
          try {
            // 尝试解析为JSON数组
            availableHours = JSON.parse(row.available_hours || '[]');
          } catch (hoursError) {
            // 如果解析失败，尝试解析为字符串格式
            if (typeof row.available_hours === 'string' && row.available_hours.includes('/')) {
              availableHours = row.available_hours.split('/').map((h: string) => parseInt(h) || 0);
            } else {
              availableHours = [40, 35, 30, 25]; // 默认值
            }
          }
          
          return {
            ...row,
            roles: JSON.parse(row.roles || '[]'),
            skills: JSON.parse(row.skills || '[]'),
            available_hours: availableHours
          };
        } catch (parseError) {
          console.error(`解析第${index + 1}条记录失败:`, parseError);
          return {
            ...row,
            roles: [],
            skills: [],
            available_hours: [40, 35, 30, 25]
          };
        }
      });
      
      console.log('返回成员数据，数量:', members?.length || 0);
      res.status(200).json({ members });
    } catch (error) {
      console.error('获取成员失败:', error);
      res.status(500).json({ error: '获取成员失败', details: String(error) });
    }
  } else if (req.method === 'POST') {
    // 创建新开发者
    try {
      const { name, name_en, role, hourly_rate, speed_factor, available_hours, skills } = req.body;
      
      // 生成唯一ID
      const id = `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 将可用工时字符串转换为数组格式
      let availableHoursArray: number[] = [];
      if (typeof available_hours === 'string') {
        availableHoursArray = available_hours.split('/').map((h: string) => parseInt(h) || 0);
      } else if (Array.isArray(available_hours)) {
        availableHoursArray = available_hours;
      } else {
        availableHoursArray = [40, 35, 30, 25]; // 默认值
      }
      
      const [result] = await db.execute(`
        INSERT INTO team_members (id, name, name_en, roles, hourly_rate, speed_factor, available_hours, skills, experience_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [id, name, name_en, JSON.stringify([role]), hourly_rate, speed_factor, JSON.stringify(availableHoursArray), JSON.stringify(skills), 70]);

      if ((result as any).affectedRows > 0) {
        res.status(201).json({ success: true, message: 'Developer created successfully', id });
      } else {
        res.status(500).json({ error: 'Failed to create developer' });
      }
    } catch (error) {
      console.error('Create developer error:', error);
      res.status(500).json({ error: 'Failed to create developer', details: String(error) });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 