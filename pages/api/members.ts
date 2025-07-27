import { NextApiRequest, NextApiResponse } from 'next';
import { teamMembers } from '../../lib/dataStore';
import { translateSkills, translateRoles } from '../../lib/teamData';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      console.log('=== 获取团队成员数据 ===');
      console.log('团队成员数量:', teamMembers.length);
      
      // 获取语言参数，默认为中文
      const { lang = 'zh' } = req.query;
      const currentLang = lang === 'en' ? 'en' : 'zh';
      
      // 翻译成员数据
      const translatedMembers = teamMembers.map(member => ({
        ...member,
        // 翻译角色
        roles: translateRoles(member.roles, currentLang as 'zh' | 'en'),
        // 翻译技能
        skills: translateSkills(member.skills, currentLang as 'zh' | 'en')
      }));
      
      console.log(`返回 ${currentLang === 'zh' ? '中文' : '英文'} 成员数据:`, translatedMembers.length);
      
      res.status(200).json({ 
        members: translatedMembers,
        total: translatedMembers.length
      });
    } catch (error) {
      console.error('获取团队成员失败:', error);
      res.status(500).json({ error: '获取团队成员失败' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 