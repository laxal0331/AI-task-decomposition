import { NextApiRequest, NextApiResponse } from 'next';
import { teamMembers, saveAllData } from '../../../lib/dataStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      const updates = req.body;

      const memberIndex = teamMembers.findIndex(m => m.id === id);
      if (memberIndex !== -1) {
        teamMembers[memberIndex] = { ...teamMembers[memberIndex], ...updates };
        saveAllData();
      }
      res.status(200).json({ success: true, message: 'Developer updated successfully' });
    } catch (error) {
      console.error('Update developer error:', error);
      res.status(500).json({ error: 'Failed to update developer' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 