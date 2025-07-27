import { useState, useEffect } from 'react';
import { smartMatchDevelopersForTask } from '../lib/smartMatch';

export default function TestAssignmentModes() {
  const [teamData, setTeamData] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<any>({});

  useEffect(() => {
    // 从 localStorage 获取成员数据
    const storedMembers = localStorage.getItem('teamMembers');
    if (storedMembers) {
      setTeamData(JSON.parse(storedMembers));
    }
  }, []);

  const testAllModes = () => {
    const testTasks = [
      { role: '前端工程师', estimated_hours: 8, title: '前端开发任务' },
      { role: '后端工程师', estimated_hours: 12, title: '后端开发任务' },
      { role: 'UI设计师', estimated_hours: 6, title: 'UI设计任务' }
    ];

    const modes = ['fast', 'balanced', 'slow'] as const;
    const results: any = {};

    modes.forEach(mode => {
      const modeResults = testTasks.map((task, index) => {
        const matchResults = smartMatchDevelopersForTask(
          task,
          teamData,
          {},
          mode
        ).filter(r => r.canAssign);

        return {
          task: task.title,
          role: task.role,
          estimated_hours: task.estimated_hours,
          recommendations: matchResults.slice(0, 3).map(r => ({
            name: r.member.name,
            speed_factor: r.member.speed_factor,
            hourly_rate: r.member.hourly_rate,
            effectiveHours: r.effectiveHours,
            totalAvailable: r.totalAvailable
          }))
        };
      });

      results[mode] = modeResults;
    });

    setTestResults(results);
  };

  const getModeName = (mode: string) => {
    const names = {
      fast: '最快模式',
      balanced: '均衡模式', 
      slow: '最便宜模式'
    };
    return names[mode as keyof typeof names] || mode;
  };

  const getModeDescription = (mode: string) => {
    const descriptions = {
      fast: '优先选择速度因子高的成员，实现并行工作',
      balanced: '平衡速度与成本，考虑团队协作',
      slow: '选择时薪最低的成员，不考虑时间成本'
    };
    return descriptions[mode as keyof typeof descriptions] || '';
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>分配模式对比测试</h1>
      
      <div style={{ marginBottom: 20 }}>
        <button 
          onClick={testAllModes}
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
          测试所有模式
        </button>
      </div>

      {Object.keys(testResults).length > 0 && (
        <div style={{ display: 'grid', gap: 20 }}>
          {Object.entries(testResults).map(([mode, results]) => (
            <div key={mode} style={{ 
              border: '1px solid #ddd', 
              borderRadius: 8,
              padding: 16,
              background: mode === 'fast' ? '#f0f9ff' : 
                         mode === 'balanced' ? '#f0fdf4' : '#fef3f2'
            }}>
              <h3 style={{ 
                marginBottom: 8,
                color: mode === 'fast' ? '#0369a1' : 
                       mode === 'balanced' ? '#16a34a' : '#dc2626'
              }}>
                {getModeName(mode)}
              </h3>
              <p style={{ 
                fontSize: 14, 
                color: '#666', 
                marginBottom: 16,
                fontStyle: 'italic'
              }}>
                {getModeDescription(mode)}
              </p>
              
              <div style={{ display: 'grid', gap: 12 }}>
                {(results as any[]).map((result, index) => (
                  <div key={index} style={{ 
                    border: '1px solid #e5e7eb', 
                    padding: 12, 
                    borderRadius: 6,
                    background: '#fff'
                  }}>
                    <h4 style={{ marginBottom: 8 }}>
                      {result.task} ({result.role}, {result.estimated_hours}小时)
                    </h4>
                    <div style={{ display: 'grid', gap: 8 }}>
                      {result.recommendations.map((rec: any, recIndex: number) => (
                        <div key={recIndex} style={{ 
                          background: recIndex === 0 ? '#f8fafc' : '#fff',
                          padding: 8,
                          borderRadius: 4,
                          border: recIndex === 0 ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                          fontSize: 12
                        }}>
                          <strong>{recIndex + 1}. {rec.name}</strong>
                          <div style={{ color: '#666', marginTop: 4 }}>
                            速度因子: {rec.speed_factor} | 
                            时薪: ¥{rec.hourly_rate} | 
                            实际工时: {rec.effectiveHours.toFixed(1)}小时
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 20, padding: 16, background: '#f8fafc', borderRadius: 8 }}>
        <h3>模式说明</h3>
        <ul style={{ lineHeight: 1.6 }}>
          <li><strong>最快模式</strong>：优先选择速度因子高的成员，适合紧急项目</li>
          <li><strong>均衡模式</strong>：平衡速度与成本，适合常规项目</li>
          <li><strong>最便宜模式</strong>：选择时薪最低的成员，适合预算有限的项目</li>
        </ul>
      </div>
    </div>
  );
} 