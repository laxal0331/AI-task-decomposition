// 简单的测试脚本来检查teamData
const fs = require('fs');
const path = require('path');

// 读取teamData.ts文件内容
const teamDataContent = fs.readFileSync(path.join(__dirname, 'lib/teamData.ts'), 'utf8');

// 提取teamData数组
const teamDataMatch = teamDataContent.match(/teamData\.push\({[\s\S]*?}\);/g);
console.log('Found', teamDataMatch ? teamDataMatch.length : 0, 'team members');

// 提取所有ID
const idMatches = teamDataContent.match(/id:\s*['"]?(\d+)['"]?/g);
const ids = idMatches ? idMatches.map(match => match.match(/\d+/)[0]) : [];
console.log('Sample IDs:', ids.slice(0, 10));

// 检查特定的ID是否存在
const targetIds = ['212', '284', '187', '105', '237'];
console.log('Looking for IDs:', targetIds);
targetIds.forEach(id => {
  const found = ids.includes(id);
  console.log(`ID ${id}: ${found ? 'Found' : 'Not found'}`);
}); 