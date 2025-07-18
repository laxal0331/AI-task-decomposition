// 简单的测试脚本来验证teamData
const fs = require('fs');

// 读取teamData.ts文件
const content = fs.readFileSync('./lib/teamData.ts', 'utf8');

// 提取所有成员ID - 使用更简单的正则
const idMatches = content.match(/id:\s*(\d+)/g);
console.log('Raw matches:', idMatches);

const ids = idMatches ? idMatches.map(match => {
  const idMatch = match.match(/(\d+)/);
  return idMatch ? idMatch[1] : null;
}).filter(Boolean) : [];

console.log('Total team members found:', ids.length);
console.log('Sample IDs:', ids.slice(0, 10));

// 检查特定的ID
const targetIds = ['212', '284', '187', '105', '237'];
console.log('\nChecking target IDs:');
targetIds.forEach(id => {
  const found = ids.includes(id);
  console.log(`ID ${id}: ${found ? '✓ Found' : '✗ Not found'}`);
});

// 显示一些ID的范围
if (ids.length > 0) {
  const sortedIds = ids.map(id => parseInt(id)).sort((a, b) => a - b);
  console.log('\nID range:', sortedIds[0], 'to', sortedIds[sortedIds.length - 1]);
} 