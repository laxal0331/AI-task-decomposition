import { seedTeamMembers } from './lib/teamData.js';
import { teamMemberService } from './lib/dbService.js';
import { initDatabase } from './lib/database.js';

async function init() {
  try {
    await initDatabase();
    console.log('数据库初始化成功');
  } catch (err) {
    console.error('数据库初始化失败:', err);
    process.exit(1);
  }
  try {
    // 检查 team_members 表是否为空
    const members = await teamMemberService.getAll();
    if (!members || members.length === 0) {
      // 分批写入成员
      await new Promise((resolve) => {
        seedTeamMembers(async (allMembers) => {
          const batchSize = 100;
          for (let i = 0; i < allMembers.length; i += batchSize) {
            const batch = allMembers.slice(i, i + batchSize);
            try {
              await teamMemberService.bulkInsert(batch);
              console.log(`已写入 ${Math.min(i + batch.length, allMembers.length)}/${allMembers.length}`);
            } catch (e) {
              console.error('写入成员批次出错:', e);
            }
          }
          console.log(`已全部写入 ${allMembers.length} 个团队成员到数据库`);
          resolve();
        });
      });
    } else {
      console.log(`团队成员表已有 ${members.length} 条数据，无需重复写入`);
    }
  } catch (err) {
    console.error('成员写入流程出错:', err);
    process.exit(1);
  }
}

init(); 