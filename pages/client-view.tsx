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
      const res = await fetch('/api/orders');
      const data = await res.json();
      console.log('orders:', data.orders);
      if (data.orders && data.orders.length > 0) {
        // 强制取第一个订单测试
        const latestOrder = data.orders[0];
        console.log('latestOrder:', latestOrder);
        if (latestOrder && latestOrder.id) {
          const taskUrl = `/api/orders?orderId=${latestOrder.id}`;
          console.log('请求任务接口:', taskUrl);
          const tasksRes = await fetch(taskUrl);
          const tasksData = await tasksRes.json();
          console.log('tasksData:', tasksData);
          if (tasksData.tasks) {
            const tasksWithMember = (tasksData.tasks as any[]).map((task: any) => ({
              ...task,
              assignedMemberId: task.assigned_member_id,
              orderId: latestOrder.id
            }));
            console.log('tasksWithMember:', JSON.stringify(tasksWithMember, null, 2), 'memberId:', memberId);
            setTasks(tasksWithMember);
          } else {
            setTasks([]);
          }
        } else {
          setTasks([]);
        }
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Fetch tasks error:', error);
    }
  }, [memberId]);

  useEffect(() => {
    fetchLatestTasks();
    const interval = setInterval(fetchLatestTasks, 5000);
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
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (res.ok) {
        // 更新本地状态
        setTasks(tasks.map(t => 
          t.id === taskId ? { ...t, status } : t
        ));
      }
    } catch (error) {
      console.error('Update task status error:', error);
    }
  };

  // 增强过滤逻辑，确保类型一致且去除空格
  console.log('memberId:', memberId, 'assignedMemberIds:', tasks.map(t => t.assignedMemberId));
  const myTasks = tasks.filter(t => String(t.assignedMemberId).trim() === String(memberId).trim());
  console.log('myTasks:', myTasks);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6">
      {/* 右上角语言切换 */}
      <div style={{ position: 'fixed', right: 24, top: 24, zIndex: 3000 }}>
        <button 
          className="btn" 
          onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
        >
          {t.lang}
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-6">{t.title}</h1>
      
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
      
      <div className="mb-6 flex items-center gap-2">
        <span>{t.memberId}</span>
        <input value={memberId} onChange={e => setMemberId(e.target.value)} className="border rounded px-2 py-1" style={{width: 100}} placeholder={t.memberIdPlaceholder} />
      </div>
      {myTasks.length === 0 ? (
        <div className="text-gray-500">{t.noTask}</div>
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
  );
} 