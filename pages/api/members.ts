import { NextApiRequest, NextApiResponse } from 'next';
import { teamMemberService } from '../../lib/dbService';
import { seedTeamMembers } from '../../lib/teamData';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      let members = await teamMemberService.getAll();
      if (!members || members.length === 0) {
        // 自动注入种子数据
        await new Promise((resolve, reject) => {
          seedTeamMembers(async (teamData) => {
            await teamMemberService.bulkInsert(teamData);
            resolve(null);
          });
        });
        members = await teamMemberService.getAll();
      }
      res.status(200).json({ members });
    } catch (error) {
      res.status(500).json({ error: '获取成员失败', details: String(error) });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 