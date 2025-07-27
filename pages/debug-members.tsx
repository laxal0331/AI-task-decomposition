import { useState, useEffect } from 'react';
import { translateSkills, translateRoles } from '../lib/teamData';

export default function DebugMembers() {
  const [members, setMembers] = useState<any[]>([]);
  const [lang, setLang] = useState<'zh' | 'en'>('zh');

  useEffect(() => {
    // 从 localStorage 获取成员数据
    const storedMembers = localStorage.getItem('teamMembers');
    if (storedMembers) {
      setMembers(JSON.parse(storedMembers));
    }
  }, []);

  const testTranslation = () => {
    console.log('=== 翻译测试 ===');
    const testSkills = ['通用技能', '学习能力', '沟通协调', '问题解决', '团队合作'];
    console.log('原始技能:', testSkills);
    console.log('翻译后技能:', translateSkills(testSkills, 'en'));
    
    const testRoles = ['杂项专员', '前端工程师'];
    console.log('原始角色:', testRoles);
    console.log('翻译后角色:', translateRoles(testRoles, 'en'));
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>团队成员调试</h1>
      
      <div style={{ marginBottom: 20 }}>
        <label>
          语言切换: 
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value as 'zh' | 'en')}
            style={{ marginLeft: 10, padding: 5 }}
          >
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </label>
        <button 
          onClick={testTranslation}
          style={{ 
            marginLeft: 20, 
            background: '#1890ff', 
            color: '#fff', 
            border: 'none', 
            padding: '8px 16px', 
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          测试翻译
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h3>团队成员数据 ({members.length} 个):</h3>
        {members.slice(0, 5).map((member, index) => (
          <div key={member.id} style={{ 
            border: '1px solid #ddd', 
            padding: 10, 
            marginBottom: 10, 
            borderRadius: 4 
          }}>
            <h4>{member.name} (ID: {member.id})</h4>
            <p><strong>角色:</strong> {translateRoles(member.roles, lang).join(', ')}</p>
            <p><strong>技能:</strong> {translateSkills(member.skills, lang).join(', ')}</p>
            <p><strong>时薪:</strong> {member.hourly_rate}</p>
            <p><strong>速度:</strong> {member.speed_factor}</p>
          </div>
        ))}
        {members.length > 5 && (
          <p style={{ color: '#666' }}>... 还有 {members.length - 5} 个成员</p>
        )}
      </div>

      <div style={{ marginTop: 20, padding: 20, background: '#f5f5f5', borderRadius: 8 }}>
        <h3>技能翻译测试:</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {['通用技能', '学习能力', '沟通协调', '问题解决', '团队合作'].map((skill, index) => (
            <span key={index} style={{ 
              background: '#e3f2fd', 
              padding: '5px 10px', 
              borderRadius: 5,
              fontSize: 14,
              color: '#1976d2'
            }}>
              {translateSkills([skill], lang)[0]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
} 