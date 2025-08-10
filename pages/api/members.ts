import { NextApiRequest, NextApiResponse } from 'next';
import { teamMemberService } from '../../lib/dbService';

const DEBUG = process.env.NODE_ENV !== 'production';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      if (DEBUG) console.log('开始获取成员数据...');
      
      const members = await teamMemberService.getAll();
      if (DEBUG) console.log('返回成员数据，数量:', members?.length || 0);
      res.status(200).json({ members });
    } catch (error) {
      console.error('获取成员失败:', error);
      res.status(500).json({ error: '获取成员失败', details: String(error) });
    }
  } else if (req.method === 'POST') {
    // 创建新开发者
    try {
      const { id, name, name_en, roles, hourly_rate, speed_factor, available_hours, skills } = req.body;
      const memberId = id || `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const hours = typeof available_hours === 'string'
        ? available_hours.split('/').map((h: string) => parseInt(h) || 0)
        : Array.isArray(available_hours) ? available_hours : [40, 35, 30, 25];

      await teamMemberService.create({
        id: memberId,
        name,
        name_en,
        roles: Array.isArray(roles) ? roles : [roles],
        hourly_rate,
        speed_factor,
        available_hours: hours,
        skills: Array.isArray(skills) ? skills : (skills ? [skills] : []),
      });

      res.status(201).json({ success: true, message: 'Developer created successfully', id: memberId });
    } catch (error) {
      console.error('Create developer error:', error);
      res.status(500).json({ error: 'Failed to create developer', details: String(error) });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 