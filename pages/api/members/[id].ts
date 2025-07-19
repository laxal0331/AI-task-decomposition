import { NextApiRequest, NextApiResponse } from 'next';
import db from '../../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    // 更新开发者信息
    try {
      const { name, name_en, role, hourly_rate, speed_factor, available_hours, skills } = req.body;
      
      const [result] = await db.execute(`
        UPDATE team_members 
        SET name = ?, name_en = ?, roles = ?, hourly_rate = ?, speed_factor = ?, available_hours = ?, skills = ?, experience_score = ?
        WHERE id = ?
      `, [name, name_en, JSON.stringify([role]), hourly_rate, speed_factor, available_hours, JSON.stringify(skills), 70, id]);

      if ((result as any).affectedRows > 0) {
        res.status(200).json({ success: true, message: 'Developer updated successfully' });
      } else {
        res.status(404).json({ error: 'Developer not found' });
      }
    } catch (error) {
      console.error('Update developer error:', error);
      res.status(500).json({ error: 'Failed to update developer' });
    }
  } else if (req.method === 'DELETE') {
    // 删除开发者
    try {
      const [result] = await db.execute('DELETE FROM team_members WHERE id = ?', [id]);
      
      if ((result as any).affectedRows > 0) {
        res.status(200).json({ success: true, message: 'Developer deleted successfully' });
      } else {
        res.status(404).json({ error: 'Developer not found' });
      }
    } catch (error) {
      console.error('Delete developer error:', error);
      res.status(500).json({ error: 'Failed to delete developer' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 