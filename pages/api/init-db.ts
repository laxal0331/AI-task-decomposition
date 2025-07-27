import { NextApiRequest, NextApiResponse } from 'next';
import { teamMembers, saveAllData } from '../../lib/dataStore';
import { seedTeamMembers } from '../../lib/teamData';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 检查团队成员是否为空
    const members = teamMembers;
    if (!members || members.length === 0) {
      // 初始化团队成员数据
      await new Promise((resolve) => {
        seedTeamMembers(async (allMembers) => {
          try {
            teamMembers.push(...allMembers as any[]);
            saveAllData();
            console.log(`已初始化 ${allMembers.length} 个团队成员到localStorage`);
          } catch (e) {
            console.error('初始化成员出错:', e);
          }
          resolve(undefined);
        });
      });
    }
    res.status(200).json({ message: 'Team members initialized successfully', count: members.length });
  } catch (error) {
    console.error('Team members initialization error:', error);
    res.status(500).json({ message: 'Team members initialization failed', error: String(error) });
  }
} 