import { useState, useEffect } from 'react';
import { smartMatchDevelopersForTask } from '../lib/smartMatch';

export default function TestFastMode() {
  const [teamData, setTeamData] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    // 从 localStorage 获取成员数据
    const storedMembers = localStorage.getItem('teamMembers');
    if (storedMembers) {
      setTeamData(JSON.parse(storedMembers));
    }
  }, []);

  const testFastMode = () => {
    const testTasks = [
      { role: '前端工程师', estimated_hours: 8, title: '前端开发任务' },
      { role: '后端工程师', estimated_hours: 12, title: '后端开发任务' },
      { role: 'UI设计师', estimated_hours: 6, title: 'UI设计任务' }
    ];

    const results = testTasks.map((task, index) => {
      const matchResults = smartMatchDevelopersForTask(
        task,
        teamData,
        {},
        'fast'
      ).filter(r => r.canAssign);

      return {
        task: task.title,
        role: task.role,
        estimated_hours: task.estimated_hours,
        recommendations: matchResults.slice(0, 5).map(r => ({
          name: r.member.name,
          speed_factor: r.member.speed_factor,
          hourly_rate: r.member.hourly_rate,
          effectiveHours: r.effectiveHours,
          totalAvailable: r.totalAvailable
        }))
      };
    });

    setTestResults(results);
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>最快模式测试</h1>
      
      <div style={{ marginBottom: 20 }}>
        <button 
          onClick={testFastMode}
          style={{ 
            background: '#1890ff', 
            color: '#fff', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 16
          }}
        >
          测试最快模式
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h3>团队成员速度因子分布:</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {teamData.slice(0, 10).map((member, index) => (
            <span key={member.id} style={{ 
              background: member.speed_factor > 1.2 ? '#e8f5e8' : 
                         member.speed_factor > 1.0 ? '#fff3cd' : '#ffe6e6',
              padding: '4px 8px', 
              borderRadius: 4,
              fontSize: 12,
              border: '1px solid #ddd'
            }}>
              {member.name}: {member.speed_factor}
            </span>
          ))}
        </div>
      </div>

      {testResults.length > 0 && (
        <div>
          <h3>最快模式推荐结果:</h3>
          {testResults.map((result, index) => (
            <div key={index} style={{ 
              border: '1px solid #ddd', 
              padding: 16, 
              marginBottom: 16, 
              borderRadius: 8 
            }}>
              <h4 style={{ marginBottom: 12 }}>
                {result.task} ({result.role}, {result.estimated_hours}小时)
              </h4>
              <div style={{ display: 'grid', gap: 8 }}>
                {result.recommendations.map((rec: any, recIndex: number) => (
                  <div key={recIndex} style={{ 
                    background: recIndex === 0 ? '#e8f5e8' : '#f8f9fa',
                    padding: 8,
                    borderRadius: 4,
                    border: recIndex === 0 ? '2px solid #28a745' : '1px solid #ddd'
                  }}>
                    <strong>{recIndex + 1}. {rec.name}</strong>
                    <div style={{ fontSize: 12, color: '#666' }}>
                      速度因子: {rec.speed_factor} | 
                      时薪: ¥{rec.hourly_rate} | 
                      实际工时: {rec.effectiveHours}小时 | 
                      可用工时: {rec.totalAvailable}小时
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 