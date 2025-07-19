import { NextApiRequest, NextApiResponse } from 'next';
import { teamMemberService } from '../../lib/dbService';
import { seedTeamMembers } from '../../lib/teamData';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      console.log('开始获取成员数据...');
      
      let members = await teamMemberService.getAll();
      console.log('获取到成员数量:', members?.length || 0);
      
      if (!members || members.length === 0) {
        console.log('成员数据为空，开始注入种子数据...');
        // 自动注入种子数据
        await new Promise((resolve, reject) => {
          seedTeamMembers(async (teamData) => {
            try {
              await teamMemberService.bulkInsert(teamData);
              resolve(null);
            } catch (error) {
              reject(error);
            }
          });
        });
        members = await teamMemberService.getAll();
        console.log('种子数据注入后成员数量:', members?.length || 0);
      }

      console.log('返回成员数据，数量:', members?.length || 0);
      res.status(200).json({ members });
    } catch (error) {
      console.error('获取成员失败:', error);
      res.status(500).json({ error: '获取成员失败', details: String(error) });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 