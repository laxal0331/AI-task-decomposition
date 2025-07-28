import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    // 更新开发者信息
    try {
      const { name, name_en, role, hourly_rate, speed_factor, available_hours, skills } = req.body;
      
      const { error } = await supabase
        .from('team_members')
        .update({
          name,
          name_en,
          roles: JSON.stringify([role]),
          hourly_rate,
          speed_factor,
          available_hours,
          skills: JSON.stringify(skills),
          experience_score: 70
        })
        .eq('id', id);

      if (error) {
        console.error('Update developer error:', error);
        return res.status(500).json({ error: 'Failed to update developer', details: error.message });
      }
      
      res.status(200).json({ success: true, message: 'Developer updated successfully' });
    } catch (error) {
      console.error('Update developer error:', error);
      res.status(500).json({ error: 'Failed to update developer' });
    }
  } else if (req.method === 'DELETE') {
    // 删除开发者
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Delete developer error:', error);
        return res.status(500).json({ error: 'Failed to delete developer', details: error.message });
      }
      
      res.status(200).json({ success: true, message: 'Developer deleted successfully' });
    } catch (error) {
      console.error('Delete developer error:', error);
      res.status(500).json({ error: 'Failed to delete developer' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 