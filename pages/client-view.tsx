import { useState, useEffect, useCallback } from 'react';
import { ProgressBar } from '../lib/ProgressBar';
import { useRouter } from 'next/router';
import { STATUS } from './task-planner';

const texts = {
  zh: {
    title: '开发端任务进度',
    memberId: '开发者ID：',
    noTask: '当前没有分配给你的任务',
    accept: '接受任务',
    revoke: '撤回',
    confirmAccept: '确认接受该任务？',
    confirmRevoke: '确认撤回该任务？',
    confirm: '确认',
    cancel: '取消',
    status: {
      '未开始': '未开始',
      '等待接受': '等待接受',
      '进行中': '进行中',
      '测试中': '测试中',
      '已完成': '已完成',
    },
    lang: 'English',
    finishDev: '开发完成',
    confirmFinishDev: '确认开发完成，进入测试？',
    finishTest: '测试完成',
    confirmFinishTest: '确认测试完成，任务结束？',
    revokeTest: '撤回',
    confirmRevokeTest: '确认撤回到开发中？',
    revokeDone: '撤回',
    confirmRevokeDone: '确认撤回到测试中？',
    memberIdPlaceholder: '请输入开发者ID',
    chat: '去交流区',
    currentStatus: '当前状态：',
  },
  en: {
    title: 'Developer Task Progress',
    memberId: 'Developer ID:',
    noTask: 'No tasks assigned to you',
    accept: 'Accept Task',
    revoke: 'Revoke',
    confirmAccept: 'Are you sure to accept this task?',
    confirmRevoke: 'Are you sure to revoke this task?',
    confirm: 'Confirm',
    cancel: 'Cancel',
    status: {
      '未开始': 'Not Started',
      '等待接受': 'Pending Acceptance',
      '进行中': 'In Progress',
      '测试中': 'Testing',
      '已完成': 'Completed',
    },
    lang: '中文',
    finishDev: 'Finish Development',
    confirmFinishDev: 'Confirm development finished and move to testing?',
    finishTest: 'Finish Testing',
    confirmFinishTest: 'Confirm testing finished and mark as completed?',
    revokeTest: 'Revoke',
    confirmRevokeTest: 'Revoke to development in progress?',
    revokeDone: 'Revoke',
    confirmRevokeDone: 'Revoke to testing?',
    memberIdPlaceholder: 'Please enter developer ID',
    chat: 'Go to Chat',
    currentStatus: 'Current Status:',
  },
};

const statusMap = {
  zh: {
    [STATUS.NOT_STARTED]: '未开始',
    [STATUS.PENDING]: '等待接受',
    [STATUS.IN_PROGRESS]: '进行中',
    [STATUS.TESTING]: '测试中',
    [STATUS.COMPLETED]: '已完成',
    // 兼容老数据
    '未开始': '未开始',
    '等待接受': '等待接受',
    '进行中': '进行中',
    '测试中': '测试中',
    '已完成': '已完成',
  },
  en: {
    [STATUS.NOT_STARTED]: 'Not Started',
    [STATUS.PENDING]: 'Pending Acceptance',
    [STATUS.IN_PROGRESS]: 'In Progress',
    [STATUS.TESTING]: 'Testing',
    [STATUS.COMPLETED]: 'Completed',
    // 兼容老数据
    '未开始': 'Not Started',
    '等待接受': 'Pending Acceptance',
    '进行中': 'In Progress',
    '测试中': 'Testing',
    '已完成': 'Completed',
  }
};

export default function ClientView() {
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const t = texts[lang];
  const [memberId, setMemberId] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);
  const [acceptingTaskId, setAcceptingTaskId] = useState<string | null>(null);
  const [revokingTaskId, setRevokingTaskId] = useState<string | null>(null);
  const [finishingDevTaskId, setFinishingDevTaskId] = useState<string | null>(null);
  const [finishingTestTaskId, setFinishingTestTaskId] = useState<string | null>(null);
  const [revokingTestTaskId, setRevokingTestTaskId] = useState<string | null>(null);
  const [revokingDoneTaskId, setRevokingDoneTaskId] = useState<string | null>(null);
  const router = useRouter();

  const fetchLatestTasks = useCallback(async () => {
    try {
      console.log('=== 客户端视图获取任务数据 ===');
      console.log('当前成员ID:', memberId);
      
      // 如果成员ID为空，不显示任何任务
      if (!memberId || memberId.trim() === '') {
        console.log('成员ID为空，不显示任务');
        setTasks([]);
        return;
      }
      
      // 直接使用localStorage，确保数据一致性
      console.log('直接从localStorage获取数据...');
      const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const savedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      
      console.log('localStorage中的orders数量:', savedOrders.length);
      console.log('localStorage中的tasks数量:', savedTasks.length);
      
      if (savedOrders.length > 0 && savedTasks.length > 0) {
        // 取最新的订单
        const latestOrder = savedOrders[savedOrders.length - 1];
        console.log('localStorage最新订单:', latestOrder);
        
        // 获取该订单的任务
        const orderTasks = savedTasks.filter((task: any) => task.order_id === latestOrder.id);
        console.log('该订单的任务数量:', orderTasks.length);
        console.log('任务分配情况:', orderTasks.map((t: any) => ({ id: t.id, assigned_member_id: t.assigned_member_id, title: t.title_zh || t.title })));
        
        // 只显示分配给当前成员的任务
        const memberTasks = orderTasks.filter((task: any) => 
          String(task.assigned_member_id) === String(memberId)
        );
        
        console.log('分配给当前成员的任务数量:', memberTasks.length);
        
        const tasksWithMember = memberTasks.map((task: any) => ({
              ...task,
              assignedMemberId: task.assigned_member_id,
              orderId: latestOrder.id
            }));
        
        console.log('从localStorage获取的任务:', tasksWithMember);
        setTasks(tasksWithMember);
      } else {
        console.log('localStorage中也没有数据');
        setTasks([]);
      }
      
      // 额外：尝试从其他可能的localStorage键获取数据
      console.log('尝试从其他localStorage键获取数据...');
      const allKeys = Object.keys(localStorage);
      console.log('localStorage中的所有键:', allKeys);
      
      // 查找包含任务数据的键
      for (const key of allKeys) {
        if (key.includes('task') || key.includes('order')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '[]');
            console.log(`键 ${key} 中的数据:`, Array.isArray(data) ? data.length : data);
          } catch (e) {
            console.log(`键 ${key} 中的数据无法解析`);
          }
        }
      }
    } catch (error) {
      console.error('获取任务数据失败:', error);
      setTasks([]);
    }
  }, [memberId]);

  useEffect(() => {
    fetchLatestTasks();
    // 增加数据获取频率，确保及时获取到任务分配
    const interval = setInterval(fetchLatestTasks, 2000);
    return () => clearInterval(interval);
  }, [fetchLatestTasks]);

  const handleAccept = (taskId: string) => {
    setAcceptingTaskId(taskId);
  };

  const confirmAccept = async () => {
    if (!acceptingTaskId) return;
    await updateTaskStatus(acceptingTaskId, STATUS.IN_PROGRESS);
    setAcceptingTaskId(null);
  };

  const handleRevoke = (taskId: string) => {
    setRevokingTaskId(taskId);
  };

  const confirmRevoke = async () => {
    if (!revokingTaskId) return;
    await updateTaskStatus(revokingTaskId, STATUS.PENDING);
    setRevokingTaskId(null);
  };

  const handleFinishDev = (taskId: string) => {
    setFinishingDevTaskId(taskId);
  };

  const confirmFinishDev = async () => {
    if (!finishingDevTaskId) return;
    await updateTaskStatus(finishingDevTaskId, STATUS.TESTING);
    setFinishingDevTaskId(null);
  };

  const handleFinishTest = (taskId: string) => {
    setFinishingTestTaskId(taskId);
  };

  const confirmFinishTest = async () => {
    if (!finishingTestTaskId) return;
    await updateTaskStatus(finishingTestTaskId, STATUS.COMPLETED);
    setFinishingTestTaskId(null);
  };

  const handleRevokeTest = (taskId: string) => {
    setRevokingTestTaskId(taskId);
  };

  const confirmRevokeTest = async () => {
    if (!revokingTestTaskId) return;
    await updateTaskStatus(revokingTestTaskId, STATUS.IN_PROGRESS);
    setRevokingTestTaskId(null);
  };

  const handleRevokeDone = (taskId: string) => {
    setRevokingDoneTaskId(taskId);
  };

  const confirmRevokeDone = async () => {
    if (!revokingDoneTaskId) return;
    await updateTaskStatus(revokingDoneTaskId, STATUS.TESTING);
    setRevokingDoneTaskId(null);
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      console.log(`=== 更新任务状态 ===`);
      console.log(`任务ID: ${taskId}, 新状态: ${status}`);
      
      // 直接更新localStorage中的任务状态
      const savedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      const taskIndex = savedTasks.findIndex((t: any) => t.id === taskId);
      
      if (taskIndex !== -1) {
        savedTasks[taskIndex] = {
          ...savedTasks[taskIndex],
          status: status
        };
        localStorage.setItem('tasks', JSON.stringify(savedTasks));
        console.log(`任务 ${taskId} 状态已更新为: ${status}`);
        
        // 更新本地React状态
        setTasks(tasks.map(t => 
          t.id === taskId ? { ...t, status } : t
        ));
        
        // 可选：同时调用API更新服务器端（不等待结果）
        fetch(`/api/tasks/${taskId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        }).catch(error => {
          console.log('API更新失败，但localStorage已更新:', error);
        });
      } else {
        console.log(`未找到任务 ${taskId}`);
      }
    } catch (error) {
      console.error('更新任务状态失败:', error);
    }
  };

  // 增强过滤逻辑，确保类型一致且去除空格
  console.log('memberId:', memberId, 'assignedMemberIds:', tasks.map((t: any) => t.assignedMemberId));
  const myTasks = tasks.filter((t: any) => {
    const taskMemberId = String(t.assignedMemberId || '').trim();
    const currentMemberId = String(memberId || '').trim();
    const isAssigned = taskMemberId === currentMemberId;
    console.log(`任务 ${t.id} (${t.title_zh || t.title}): assignedMemberId=${taskMemberId}, currentMemberId=${currentMemberId}, isAssigned=${isAssigned}`);
    return isAssigned;
  });
  console.log('myTasks:', myTasks);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100vw', height: '100vh', overflow: 'auto', backgroundImage: 'url(/bg-client.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(16,24,40,0.32)', zIndex: 0, pointerEvents: 'none' }} />
      <div className="max-w-2xl mx-auto mt-10 p-6" style={{ position: 'relative', zIndex: 1 }}>
      {/* 左上角首页按钮 */}
      <div style={{ position: 'fixed', left: 24, top: 24, display: 'flex', gap: 12, zIndex: 3000 }}>
        <button
          style={{
            background: '#fff',
            color: '#1890ff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 16,
            padding: '6px 18px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            zIndex: 3001,
            cursor: 'pointer',
            letterSpacing: 2
          }}
          onClick={() => router.push('/')}
        >
          {lang === 'zh' ? '首页' : 'Home'}
        </button>
      </div>
      
      {/* 右上角语言切换 */}
      <div style={{ position: 'fixed', right: 24, top: 24, zIndex: 3000 }}>
        <button 
          className="btn" 
          onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
        >
          {t.lang}
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-6" style={{ color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>{t.title}</h1>
      
      {/* 管理开发者按钮 */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <button
          style={{
            background: '#1890ff',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 14,
            padding: '8px 16px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(24,144,255,0.15)'
          }}
          onClick={() => router.push('/developer-management')}
        >
          {lang === 'zh' ? '管理开发者' : 'Manage Developers'}
        </button>
      </div>
      
      <div className="mb-6 flex items-center gap-2" style={{ color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.18)' }}>
        <span>{t.memberId}</span>
        <input
          type="text"
          value={memberId}
          onChange={e => setMemberId(e.target.value)}
          placeholder={lang === 'zh' ? '请输入开发者ID（如 成员9）' : 'Please enter developer ID (e.g. member9)'}
          className="input"
          style={{ color: '#222', background: '#fff', border: '2px solid #222' }}
        />
      </div>
      {!memberId || memberId.trim() === '' ? (
        <div style={{ color: '#e0e7ef', textShadow: '0 1px 4px rgba(0,0,0,0.18)' }}>
          {lang === 'zh' ? '请输入开发者ID查看任务' : 'Please enter developer ID to view tasks'}
        </div>
      ) : myTasks.length === 0 ? (
        <div style={{ color: '#e0e7ef', textShadow: '0 1px 4px rgba(0,0,0,0.18)' }}>{t.noTask}</div>
      ) : (
        <div className="space-y-6">
          {myTasks.map((task, idx) => (
            <div key={idx} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24 }}>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>{lang === 'zh' ? (task.title_zh || task.title || '') : (task.title_en || task.title || '')}</div>
              <div style={{ marginBottom: 12, color: '#1890ff', fontWeight: 500 }}>{t.currentStatus}{statusMap[lang][task.status as keyof typeof statusMap.zh] || task.status}</div>
              <ProgressBar status={task.status} lang={lang} />
              <button className="btn mt-4" style={{ background: '#22c55e', color: '#fff', marginRight: 12 }} onClick={() => router.push(`/chat?orderId=${task.orderId || ''}&taskId=${task.id}&role=developer`)}>{t.chat}</button>
              {task.status === STATUS.PENDING && (
                <button className="btn mt-4" onClick={() => handleAccept(task.id)}>{t.accept}</button>
              )}
              {task.status === STATUS.IN_PROGRESS && (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn mt-4" style={{ background: '#e11d48', color: '#fff' }} onClick={() => handleRevoke(task.id)}>{t.revoke}</button>
                  <button className="btn mt-4" style={{ background: '#1890ff', color: '#fff' }} onClick={() => handleFinishDev(task.id)}>{t.finishDev}</button>
                </div>
              )}
              {task.status === STATUS.TESTING && (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn mt-4" style={{ background: '#e11d48', color: '#fff' }} onClick={() => handleRevokeTest(task.id)}>{t.revokeTest}</button>
                  <button className="btn mt-4" style={{ background: '#1890ff', color: '#fff' }} onClick={() => handleFinishTest(task.id)}>{t.finishTest}</button>
                </div>
              )}
              {task.status === STATUS.COMPLETED && (
                <button className="btn mt-4" style={{ background: '#e11d48', color: '#fff' }} onClick={() => handleRevokeDone(task.id)}>{t.revokeDone}</button>
              )}
            </div>
          ))}
        </div>
      )}
      {/* 接受任务确认弹窗 */}
      {acceptingTaskId && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.15)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, minWidth: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: 32, position: 'relative', textAlign: 'center'
          }}>
            <div style={{fontWeight:700, fontSize:22, marginBottom:18}}>{t.confirmAccept}</div>
            <div style={{display:'flex', justifyContent:'center', gap:24}}>
              <button style={{background:'#1890ff',color:'#fff',border:'none',borderRadius:8,fontWeight:700,fontSize:16,padding:'8px 28px',cursor:'pointer'}} onClick={confirmAccept}>{t.confirm}</button>
              <button style={{background:'#f1f5f9',color:'#222',border:'none',borderRadius:8,fontWeight:600,fontSize:16,padding:'8px 28px',cursor:'pointer'}} onClick={()=>setAcceptingTaskId(null)}>{t.cancel}</button>
            </div>
          </div>
        </div>
      )}
      {/* 撤回任务确认弹窗 */}
      {revokingTaskId && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.15)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, minWidth: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: 32, position: 'relative', textAlign: 'center'
          }}>
            <div style={{fontWeight:700, fontSize:22, marginBottom:18}}>{t.confirmRevoke}</div>
            <div style={{display:'flex', justifyContent:'center', gap:24}}>
              <button style={{background:'#e11d48',color:'#fff',border:'none',borderRadius:8,fontWeight:700,fontSize:16,padding:'8px 28px',cursor:'pointer'}} onClick={confirmRevoke}>{t.confirm}</button>
              <button style={{background:'#f1f5f9',color:'#222',border:'none',borderRadius:8,fontWeight:600,fontSize:16,padding:'8px 28px',cursor:'pointer'}} onClick={()=>setRevokingTaskId(null)}>{t.cancel}</button>
            </div>
          </div>
        </div>
      )}
      {/* 开发完成确认弹窗 */}
      {finishingDevTaskId && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.15)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, minWidth: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: 32, position: 'relative', textAlign: 'center'
          }}>
            <div style={{fontWeight:700, fontSize:22, marginBottom:18}}>{t.confirmFinishDev}</div>
            <div style={{display:'flex', justifyContent:'center', gap:24}}>
              <button style={{background:'#1890ff',color:'#fff',border:'none',borderRadius:8,fontWeight:700,fontSize:16,padding:'8px 28px',cursor:'pointer'}} onClick={confirmFinishDev}>{t.confirm}</button>
              <button style={{background:'#f1f5f9',color:'#222',border:'none',borderRadius:8,fontWeight:600,fontSize:16,padding:'8px 28px',cursor:'pointer'}} onClick={()=>setFinishingDevTaskId(null)}>{t.cancel}</button>
            </div>
          </div>
        </div>
      )}
      {/* 测试完成确认弹窗 */}
      {finishingTestTaskId && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.15)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, minWidth: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: 32, position: 'relative', textAlign: 'center'
          }}>
            <div style={{fontWeight:700, fontSize:22, marginBottom:18}}>{t.confirmFinishTest}</div>
            <div style={{display:'flex', justifyContent:'center', gap:24}}>
              <button style={{background:'#1890ff',color:'#fff',border:'none',borderRadius:8,fontWeight:700,fontSize:16,padding:'8px 28px',cursor:'pointer'}} onClick={confirmFinishTest}>{t.confirm}</button>
              <button style={{background:'#f1f5f9',color:'#222',border:'none',borderRadius:8,fontWeight:600,fontSize:16,padding:'8px 28px',cursor:'pointer'}} onClick={()=>setFinishingTestTaskId(null)}>{t.cancel}</button>
            </div>
          </div>
        </div>
      )}
      {/* 测试撤回确认弹窗 */}
      {revokingTestTaskId && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.15)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, minWidth: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: 32, position: 'relative', textAlign: 'center'
          }}>
            <div style={{fontWeight:700, fontSize:22, marginBottom:18}}>{t.confirmRevokeTest}</div>
            <div style={{display:'flex', justifyContent:'center', gap:24}}>
              <button style={{background:'#e11d48',color:'#fff',border:'none',borderRadius:8,fontWeight:700,fontSize:16,padding:'8px 28px',cursor:'pointer'}} onClick={confirmRevokeTest}>{t.confirm}</button>
              <button style={{background:'#f1f5f9',color:'#222',border:'none',borderRadius:8,fontWeight:600,fontSize:16,padding:'8px 28px',cursor:'pointer'}} onClick={()=>setRevokingTestTaskId(null)}>{t.cancel}</button>
            </div>
          </div>
        </div>
      )}
      {/* 已完成撤回确认弹窗 */}
      {revokingDoneTaskId && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.15)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, minWidth: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: 32, position: 'relative', textAlign: 'center'
          }}>
            <div style={{fontWeight:700, fontSize:22, marginBottom:18}}>{t.confirmRevokeDone}</div>
            <div style={{display:'flex', justifyContent:'center', gap:24}}>
              <button style={{background:'#e11d48',color:'#fff',border:'none',borderRadius:8,fontWeight:700,fontSize:16,padding:'8px 28px',cursor:'pointer'}} onClick={confirmRevokeDone}>{t.confirm}</button>
              <button style={{background:'#f1f5f9',color:'#222',border:'none',borderRadius:8,fontWeight:600,fontSize:16,padding:'8px 28px',cursor:'pointer'}} onClick={()=>setRevokingDoneTaskId(null)}>{t.cancel}</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
} 