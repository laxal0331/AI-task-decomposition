import { NextApiRequest, NextApiResponse } from 'next';
import { teamMemberService } from '../../../lib/dbService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    // 更新开发者信息
    try {
      const { name, name_en, roles, hourly_rate, speed_factor, available_hours, skills, experience_score } = req.body;
      await teamMemberService.update(id as string, {
        name,
        name_en,
        roles: Array.isArray(roles) ? roles : roles ? [roles] : undefined,
        hourly_rate,
        speed_factor,
        available_hours,
        skills: Array.isArray(skills) ? skills : skills ? [skills] : undefined,
        experience_score,
      });
      res.status(200).json({ success: true, message: 'Developer updated successfully' });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') console.error('Update developer error:', error);
      res.status(500).json({ error: 'Failed to update developer' });
    }
  } else if (req.method === 'DELETE') {
    // 删除开发者
    try {
      await teamMemberService.remove(id as string);
      res.status(200).json({ success: true, message: 'Developer deleted successfully' });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') console.error('Delete developer error:', error);
      res.status(500).json({ error: 'Failed to delete developer' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 