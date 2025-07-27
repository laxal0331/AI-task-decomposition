import { useState, useEffect } from 'react';
import { translateSkills, translateRoles } from '../lib/teamData';

export default function TestSkills() {
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [testSkills, setTestSkills] = useState<string[]>(['React', 'UI设计', '数据库', '敏捷开发', '通用技能', '学习能力', '沟通协调', '问题解决', '团队合作']);
  const [testRoles, setTestRoles] = useState<string[]>(['前端工程师', 'UI设计师', '杂项专员']);

  const translatedSkills = translateSkills(testSkills, lang);
  const translatedRoles = translateRoles(testRoles, lang);

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>技能和角色翻译测试</h1>
      
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
      </div>

      <div style={{ marginBottom: 20 }}>
        <h3>测试角色:</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {testRoles.map((role, index) => (
            <span key={index} style={{ 
              background: '#f0f0f0', 
              padding: '5px 10px', 
              borderRadius: 5,
              fontSize: 14
            }}>
              {role}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h3>角色翻译结果 ({lang === 'zh' ? '中文' : 'English'}):</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {translatedRoles.map((role, index) => (
            <span key={index} style={{ 
              background: '#e8f5e8', 
              padding: '5px 10px', 
              borderRadius: 5,
              fontSize: 14,
              color: '#2e7d32'
            }}>
              {role}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h3>测试技能:</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {testSkills.map((skill, index) => (
            <span key={index} style={{ 
              background: '#f0f0f0', 
              padding: '5px 10px', 
              borderRadius: 5,
              fontSize: 14
            }}>
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3>技能翻译结果 ({lang === 'zh' ? '中文' : 'English'}):</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {translatedSkills.map((skill, index) => (
            <span key={index} style={{ 
              background: '#e3f2fd', 
              padding: '5px 10px', 
              borderRadius: 5,
              fontSize: 14,
              color: '#1976d2'
            }}>
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 30 }}>
        <h3>映射表:</h3>
        <div style={{ fontSize: 12, color: '#666' }}>
          <h4>角色映射:</h4>
          <p>前端工程师 → Frontend Engineer</p>
          <p>UI设计师 → UI Designer</p>
          <p>杂项专员 → General Specialist</p>
          <h4>技能映射:</h4>
          <p>React → React</p>
          <p>UI设计 → UI Design</p>
          <p>数据库 → Database</p>
          <p>敏捷开发 → Agile Development</p>
          <p>通用技能 → General Skills</p>
          <p>学习能力 → Learning Ability</p>
          <p>沟通协调 → Communication & Coordination</p>
          <p>问题解决 → Problem Solving</p>
          <p>团队合作 → Teamwork</p>
        </div>
      </div>

      <div style={{ marginTop: 20, padding: 20, background: '#f5f5f5', borderRadius: 8 }}>
        <h3>调试信息:</h3>
        <p><strong>当前语言:</strong> {lang}</p>
        <p><strong>技能翻译函数:</strong> 已导入</p>
        <p><strong>角色翻译函数:</strong> 已导入</p>
        <button 
          onClick={() => {
            console.log('测试技能翻译:', translateSkills(['通用技能', '学习能力'], 'en'));
            console.log('测试角色翻译:', translateRoles(['杂项专员'], 'en'));
          }}
          style={{ 
            background: '#1890ff', 
            color: '#fff', 
            border: 'none', 
            padding: '8px 16px', 
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          测试翻译函数
        </button>
      </div>
    </div>
  );
} 