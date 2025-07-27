import { useState, useEffect } from 'react';

export default function DebugPage() {
  const [localData, setLocalData] = useState<any>({});
  const [apiData, setApiData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const refreshLocalData = () => {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const members = JSON.parse(localStorage.getItem('teamMembers') || '[]');
    
    setLocalData({
      orders: {
        count: orders.length,
        latest: orders.slice(-3)
      },
      tasks: {
        count: tasks.length,
        assigned: tasks.filter((t: any) => t.assigned_member_id).length,
        latest: tasks.slice(-3)
      },
      members: {
        count: members.length,
        latest: members.slice(-3)
      }
    });
  };

  const refreshApiData = async () => {
    setLoading(true);
    try {
      const [ordersRes, tasksRes, membersRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/tasks'),
        fetch('/api/members')
      ]);

      const orders = ordersRes.ok ? await ordersRes.json() : [];
      const tasks = tasksRes.ok ? await tasksRes.json() : [];
      const members = membersRes.ok ? await membersRes.json() : [];

      setApiData({
        orders: {
          count: orders.length || 0,
          latest: (orders.slice && orders.slice(-3)) || []
        },
        tasks: {
          count: tasks.length || 0,
          assigned: (tasks.filter && tasks.filter((t: any) => t.assigned_member_id).length) || 0,
          latest: (tasks.slice && tasks.slice(-3)) || []
        },
        members: {
          count: members.length || 0,
          latest: (members.slice && members.slice(-3)) || []
        }
      });
    } catch (error) {
      console.error('API数据获取失败:', error);
      setApiData({ error: 'API获取失败' });
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshLocalData();
    refreshApiData();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>数据调试页面</h1>
      
      <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
        <button onClick={refreshLocalData} style={{ padding: '10px 20px', background: '#1890ff', color: 'white', border: 'none', borderRadius: 6 }}>
          刷新本地数据
        </button>
        <button onClick={refreshApiData} style={{ padding: '10px 20px', background: '#52c41a', color: 'white', border: 'none', borderRadius: 6 }}>
          刷新API数据
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* 本地数据 */}
        <div style={{ border: '1px solid #d9d9d9', borderRadius: 8, padding: 16 }}>
          <h2>本地数据 (localStorage)</h2>
          <div>
            <h3>订单</h3>
            <p>数量: {localData.orders?.count || 0}</p>
            <p>最新订单:</p>
            <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4, fontSize: 12 }}>
              {JSON.stringify(localData.orders?.latest || [], null, 2)}
            </pre>
          </div>
          <div>
            <h3>任务</h3>
            <p>总数: {localData.tasks?.count || 0}</p>
            <p>已分配: {localData.tasks?.assigned || 0}</p>
            <p>最新任务:</p>
            <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4, fontSize: 12 }}>
              {JSON.stringify(localData.tasks?.latest || [], null, 2)}
            </pre>
          </div>
          <div>
            <h3>成员</h3>
            <p>数量: {localData.members?.count || 0}</p>
            <p>最新成员:</p>
            <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4, fontSize: 12 }}>
              {JSON.stringify(localData.members?.latest || [], null, 2)}
            </pre>
          </div>
        </div>

        {/* API数据 */}
        <div style={{ border: '1px solid #d9d9d9', borderRadius: 8, padding: 16 }}>
          <h2>API数据 {loading && '(加载中...)'}</h2>
          {apiData.error ? (
            <div style={{ color: 'red' }}>{apiData.error}</div>
          ) : (
            <>
              <div>
                <h3>订单</h3>
                <p>数量: {apiData.orders?.count || 0}</p>
                <p>最新订单:</p>
                <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4, fontSize: 12 }}>
                  {JSON.stringify(apiData.orders?.latest || [], null, 2)}
                </pre>
              </div>
              <div>
                <h3>任务</h3>
                <p>总数: {apiData.tasks?.count || 0}</p>
                <p>已分配: {apiData.tasks?.assigned || 0}</p>
                <p>最新任务:</p>
                <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4, fontSize: 12 }}>
                  {JSON.stringify(apiData.tasks?.latest || [], null, 2)}
                </pre>
              </div>
              <div>
                <h3>成员</h3>
                <p>数量: {apiData.members?.count || 0}</p>
                <p>最新成员:</p>
                <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4, fontSize: 12 }}>
                  {JSON.stringify(apiData.members?.latest || [], null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ marginTop: 20, padding: 16, background: '#f0f8ff', borderRadius: 8 }}>
        <h3>同步建议</h3>
        <p>如果API数据为空但本地数据存在，说明需要同步数据到服务器。</p>
        <p>如果两者都不为空但数据不一致，说明存在同步问题。</p>
      </div>
    </div>
  );
} 