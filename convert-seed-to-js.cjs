const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, 'data', 'seed.sql');
const outputPath = path.join(__dirname, 'lib', 'dataStore.ts');

const seed = fs.readFileSync(seedPath, 'utf-8');
const match = seed.match(/INSERT INTO `team_members` VALUES ([\s\S]*?);/);

if (!match) {
  console.error('未找到 team_members 的 INSERT 语句');
  process.exit(1);
}

const raw = match[1];
const memberRows = raw.match(/\(([^)]+)\)/g);

const members = memberRows.map(row => {
  // 拆分每个字段
  // 字符串字段用单引号包裹，数字直接写
  // 结构: id, name, roles, skills, available_hours, experience_score, hourly_rate, speed_factor, name_en
  const fields = [];
  let buf = '';
  let inStr = false;
  for (let i = 0; i < row.length; i++) {
    const c = row[i];
    if (c === "'" && row[i - 1] !== '\\') inStr = !inStr;
    if (c === ',' && !inStr) {
      fields.push(buf.trim());
      buf = '';
    } else {
      buf += c;
    }
  }
  if (buf) fields.push(buf.trim());
  // 去掉括号
  const f = fields.map(s => s.replace(/^\('/, '').replace(/'$/, '').replace(/^'/, '').replace(/'$/, ''));
  return {
    id: f[0],
    name: f[1],
    roles: JSON.parse(f[2]),
    skills: JSON.parse(f[3]),
    available_hours: JSON.parse(f[4]),
    experience_score: Number(f[5]),
    hourly_rate: Number(f[6]),
    speed_factor: Number(f[7]),
    name_en: f[8]
  };
});

// 读取 dataStore.ts，替换 teamMembers
let dataStore = fs.readFileSync(outputPath, 'utf-8');
dataStore = dataStore.replace(
  /export const teamMembers = \[[\s\S]*?\];/,
  `export const teamMembers = ${JSON.stringify(members, null, 2)};`
);
fs.writeFileSync(outputPath, dataStore, 'utf-8');
console.log('teamMembers 数据已批量导入 lib/dataStore.ts'); 