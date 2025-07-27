import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import React from 'react';
import { ProgressBar } from '../lib/ProgressBar';
import { STATUS } from './task-planner';

// 状态国际化映射表
const statusI18n = {
  zh: {
    [STATUS.NOT_STARTED]: '未开始',
    [STATUS.PENDING]: '等待接受',
    [STATUS.IN_PROGRESS]: '进行中',
    [STATUS.TESTING]: '测试中',
    [STATUS.COMPLETED]: '已完成',
    // 兼容老数据的中文状态
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
    // 兼容老数据的中文状态
    '未开始': 'Not Started',
    '等待接受': 'Pending Acceptance',
    '进行中': 'In Progress',
    '测试中': 'Testing',
    '已完成': 'Completed',
  }
};

const texts = {
  zh: {
    title: '分配结果',
    task: '任务',
    member: '分配开发者',
    back: '返回',
    noData: '无分配数据',
    finished: '订单已取消',
    finishOrder: '取消订单',
    confirmFinish: '确认取消订单？',
    confirm: '确认',
    cancel: '取消',
    status: '状态',
    expand: '展开',
    collapse: '收起',
    overallProgress: '整体进度',
    home: '首页',
    backHome: '返回首页',
    chat: '去交流区',
    delivered: '订单已交付',
    deliverOrder: '确认交付',
    confirmDeliver: '确认交付该订单？',
    lang: '中文',
  },
  en: {
    title: 'Assignment Result',
    task: 'Task',
    member: 'Assigned Developer',
    back: 'Back',
    noData: 'No assignment data',
    finished: 'Order Cancelled',
    finishOrder: 'Cancel Order',
    confirmFinish: 'Are you sure to cancel this order?',
    confirm: 'Confirm',
    cancel: 'Cancel',
    status: 'Status',
    expand: 'Expand',
    collapse: 'Collapse',
    overallProgress: 'Overall Progress',
    home: 'Home',
    backHome: 'Back Home',
    chat: 'Go to Chat',
    delivered: 'Order Delivered',
    deliverOrder: 'Deliver Order',
    confirmDeliver: 'Are you sure to deliver this order?',
    lang: 'English',
  },
};

// 状态颜色映射
const statusColor: Record<string, { text: string; bg: string }> = {
  [STATUS.NOT_STARTED]: { text: '#888', bg: '#f8fafc' },
  [STATUS.PENDING]: { text: '#eab308', bg: '#fffbe6' },
  [STATUS.IN_PROGRESS]: { text: '#1890ff', bg: '#e6f4ff' },
  [STATUS.TESTING]: { text: '#a21caf', bg: '#f3e8ff' },
  [STATUS.COMPLETED]: { text: '#22c55e', bg: '#e7fbe7' },
  // 兼容老数据的中文状态
  '未开始': { text: '#888', bg: '#f8fafc' },
  '等待接受': { text: '#eab308', bg: '#fffbe6' },
  '进行中': { text: '#1890ff', bg: '#e6f4ff' },
  '测试中': { text: '#a21caf', bg: '#f3e8ff' },
  '已完成': { text: '#22c55e', bg: '#e7fbe7' },
};

export default function ResultPage() {
  const router = useRouter();
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const t = texts[lang];
  const [data, setData] = useState<{tasks: any[], selectedMembers: {[key: number]: string}, orderId?: string} | null>(null);
  const [finished, setFinished] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showDeliverModal, setShowDeliverModal] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [sortMode, setSortMode] = useState<'default' | 'status'>('default');
  const [teamData, setTeamData] = useState<any[]>([]);
  const [finishedType, setFinishedType] = useState<'cancelled' | 'delivered' | null>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);

  // 自动跳转到任务分配页面（未开始状态）
  useEffect(() => {
    if (orderStatus === '未开始' || orderStatus === 'NOT_STARTED') {
      if (router.query.orderId) {
        router.replace({
          pathname: '/task-planner',
          query: { orderId: router.query.orderId }
        });
      }
    }
  }, [orderStatus, router]);

  // 动态渲染交替镜像背景strip
  const [strips, setStrips] = useState<number[]>([]);
  useEffect(() => {
    const fillStrips = () => {
      const h = Math.max(window.innerHeight, document.body.scrollHeight, document.documentElement.scrollHeight);
      const count = Math.ceil((h - 512) / 512) + 4; // 多渲染几条，保证滚动时也填满
      setStrips(Array.from({ length: count }, (_, i) => i));
    };
    fillStrips();
    window.addEventListener('resize', fillStrips);
    window.addEventListener('scroll', fillStrips);
    return () => {
      window.removeEventListener('resize', fillStrips);
      window.removeEventListener('scroll', fillStrips);
    };
  }, []);

  useEffect(() => {
    // 立即检查localStorage中的订单状态
    if (router.query.orderId) {
      const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const order = savedOrders.find((o: any) => o.id === router.query.orderId);
      if (order) {
        console.log('找到订单，状态:', order.status);
        // 立即设置状态，不管是什么状态
        setOrderStatus(order.status);
        
        if (order.status === '已交付' || order.status === 'Delivered' || order.status === 'delivered' || 
            order.status === '已取消' || order.status === 'Cancelled' || order.status === 'cancelled') {
          console.log('订单已是最终状态，直接加载数据');
          tryLoadFromLocalStorage(router.query.orderId as string);
        } else {
          console.log('订单不是最终状态，正常获取数据');
          fetchOrderData(router.query.orderId as string);
        }
      } else {
        console.log('localStorage中未找到订单，从API获取');
        fetchOrderData(router.query.orderId as string);
      }
    }
    // 获取团队成员数据
    fetchTeamMembers();
    
    // 强制从localStorage同步最新数据
    const forceSyncFromLocalStorage = () => {
      if (router.query.orderId) {
        console.log('=== 强制从localStorage同步数据 ===');
        tryLoadFromLocalStorage(router.query.orderId as string);
      }
    };
    
    // 延迟500ms执行，确保页面完全加载
    setTimeout(forceSyncFromLocalStorage, 500);
  }, [router.query.orderId, router.query.data]);

  // 获取团队成员数据
  const fetchTeamMembers = async () => {
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      if (data.members && data.members.length > 0) {
        console.log('从API获取到团队成员数量:', data.members.length);
        console.log('团队成员示例:', data.members.slice(0, 3).map((m: any) => ({
          id: m.id,
          name: m.name,
          roles: m.roles
        })));
        setTeamData(data.members);
      } else {
        // API返回空数据，从localStorage获取
        console.log('API返回空成员数据，从localStorage获取...');
        const savedMembers = JSON.parse(localStorage.getItem('teamMembers') || '[]');
        if (savedMembers.length > 0) {
          console.log('从localStorage获取到团队成员数量:', savedMembers.length);
          setTeamData(savedMembers);
        }
      }
    } catch (error) {
      console.error('获取团队成员失败:', error);
      // API调用失败，从localStorage获取
      const savedMembers = JSON.parse(localStorage.getItem('teamMembers') || '[]');
      if (savedMembers.length > 0) {
        console.log('API失败，从localStorage获取团队成员:', savedMembers.length);
        setTeamData(savedMembers);
      }
    }
  };

  // 添加实时刷新功能（仅在非最终状态时）
  useEffect(() => {
    if (!router.query.orderId) return;
    
    // 检查当前状态，如果是最终状态则不刷新
    if (orderStatus && ['已交付', 'Delivered', 'delivered', '已取消', 'Cancelled', 'cancelled'].includes(orderStatus)) {
      console.log('订单已是最终状态，停止自动刷新');
      return;
    }
    
    // 每5秒刷新一次数据
    const interval = setInterval(() => {
      fetchOrderData(router.query.orderId as string);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [router.query.orderId, orderStatus]);

  useEffect(() => {
    async function fetchMembers() {
      const res = await fetch('/api/members');
      const data = await res.json();
      setTeamData(data.members || []);
    }
    fetchMembers();
  }, []);

  // 从数据库获取订单数据
  const fetchOrderData = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders?orderId=${orderId}`);
      const data = await res.json();
      
      if (data.error) {
        console.error('Fetch order error:', data.error);
        // API调用失败，尝试从localStorage读取
        console.log('尝试从localStorage读取数据...');
        tryLoadFromLocalStorage(orderId);
        return;
      }
      
      setData({
        tasks: data.tasks || [],
        selectedMembers: data.selectedMembers || {},
        orderId: orderId
      });
      if (data.order && data.order.status) {
        console.log('API返回的订单状态:', data.order.status);
        setOrderStatus(data.order.status);
      }
    } catch (error) {
      console.error('Fetch order error:', error);
      // API调用失败，尝试从localStorage读取
      console.log('API调用失败，尝试从localStorage读取数据...');
      tryLoadFromLocalStorage(orderId);
    }
  };

  // 从localStorage读取数据的备用方法
  const tryLoadFromLocalStorage = (orderId: string) => {
    try {
      const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const savedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      
      console.log('localStorage中订单数量:', savedOrders.length);
      console.log('localStorage中任务数量:', savedTasks.length);
      
      const order = savedOrders.find((o: any) => o.id === orderId);
      const orderTasks = savedTasks.filter((t: any) => t.order_id === orderId);
      
      if (order) {
        console.log('从localStorage找到订单:', order);
        console.log('从localStorage找到任务数量:', orderTasks.length);
        
        // 调试任务数据
        console.log('=== 结果页面任务数据调试 ===');
        orderTasks.forEach((task: any, index: number) => {
                                  console.log(`任务 ${index}:`, {
                          id: task.id,
                          name: task.name_zh || task.title_zh || task.title,
                          assigned_member_id: task.assigned_member_id,
                          status: task.status
                        });
        });
        
        setData({
          tasks: orderTasks,
          selectedMembers: {},
          orderId: orderId
        });
        console.log('localStorage中的订单状态:', order.status);
        setOrderStatus(order.status);
      } else {
        console.log('localStorage中未找到订单:', orderId);
      }
    } catch (error) {
      console.error('从localStorage读取数据失败:', error);
    }
  };

  const handleFinishOrder = () => setShowFinishModal(true);
  const confirmFinishOrder = async () => {
    if (!data?.orderId) return;
    setFinishedType('cancelled');
    setFinished(true);
    setShowFinishModal(false);
    setOrderStatus('已取消'); // 立即本地隐藏按钮
    
    // 立即更新localStorage中的订单状态
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const orderIndex = savedOrders.findIndex((o: any) => o.id === data.orderId);
    if (orderIndex !== -1) {
      savedOrders[orderIndex] = { ...savedOrders[orderIndex], status: '已取消' };
      localStorage.setItem('orders', JSON.stringify(savedOrders));
      console.log('已更新localStorage中的订单状态为已取消');
    }
    
    try {
      // 先同步localStorage到服务器
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientOrders: savedOrders,
          clientTasks: JSON.parse(localStorage.getItem('tasks') || '[]')
        })
      });
      const status = lang === 'zh' ? '已取消' : 'Cancelled';
      
      // 获取当前订单数据
      const currentOrder = savedOrders.find((o: any) => o.id === data.orderId);
      
      const res = await fetch(`/api/orders/${data.orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status,
          orderData: currentOrder // 同时发送订单数据
        }),
      });
      if (!res.ok) {
        alert(lang === 'zh' ? '取消订单失败' : 'Failed to cancel order');
      } else {
        console.log('取消订单成功');
      }
    } catch (error) {
      console.error('取消订单异常:', error);
      alert(lang === 'zh' ? '取消订单失败' : 'Failed to cancel order');
    }
  };

  const handleDeliverOrder = () => setShowDeliverModal(true);
  const confirmDeliverOrder = async () => {
    if (!data?.orderId) return;
    setFinishedType('delivered');
    setFinished(true);
    setShowDeliverModal(false);
    setOrderStatus('已交付'); // 立即本地隐藏按钮
    
    // 立即更新localStorage中的订单状态
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const orderIndex = savedOrders.findIndex((o: any) => o.id === data.orderId);
    if (orderIndex !== -1) {
      savedOrders[orderIndex] = { ...savedOrders[orderIndex], status: '已交付' };
      localStorage.setItem('orders', JSON.stringify(savedOrders));
      console.log('已更新localStorage中的订单状态为已交付');
    }
    
    try {
      console.log('=== 开始交付订单流程 ===');
      console.log('订单ID:', data.orderId);
      
      // 先同步localStorage到服务器
      const syncRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientOrders: savedOrders,
          clientTasks: JSON.parse(localStorage.getItem('tasks') || '[]')
        })
      });
      
      if (!syncRes.ok) {
        console.error('数据同步失败:', syncRes.status, syncRes.statusText);
        alert(lang === 'zh' ? '数据同步失败' : 'Data sync failed');
        return;
      }
      
      console.log('数据同步成功');
      
      // 等待一下确保数据同步完成
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const status = lang === 'zh' ? '已交付' : 'Delivered';
      console.log('发送PATCH请求，状态:', status);
      
      // 获取当前订单数据
      const currentOrder = savedOrders.find((o: any) => o.id === data.orderId);
      
      const res = await fetch(`/api/orders/${data.orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status,
          orderData: currentOrder // 同时发送订单数据
        }),
      });
      
      console.log('PATCH响应状态:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('PATCH请求失败:', res.status, errorText);
        alert(lang === 'zh' ? '交付订单失败' : 'Failed to deliver order');
      } else {
        console.log('交付订单成功');
      }
    } catch (error) {
      console.error('交付订单异常:', error);
      alert(lang === 'zh' ? '交付订单失败' : 'Failed to deliver order');
    }
  };

  // 重新分配任务
  const handleReassignTask = async (taskId: string, memberId: string) => {
    try {
      console.log('重新分配任务:', taskId, '给成员:', memberId);
      
      // 更新localStorage中的任务
      const savedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      const taskIndex = savedTasks.findIndex((t: any) => t.id === taskId);
      
      if (taskIndex !== -1) {
        // 找到对应的成员信息
        const member = teamData.find((m: any) => m.id === memberId);
        const displayName = lang === 'zh' 
          ? member?.name 
          : (member?.name_en || member?.name);
        
        // 更新任务分配
        savedTasks[taskIndex] = {
          ...savedTasks[taskIndex],
          assigned_member_id: memberId,
          assigned_member_name: displayName
        };
        
        // 保存到localStorage
        localStorage.setItem('tasks', JSON.stringify(savedTasks));
        
        // 同步到服务器
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientOrders: JSON.parse(localStorage.getItem('orders') || '[]'),
            clientTasks: savedTasks
          })
        });
        
        // 刷新页面数据
        if (data?.orderId) {
          fetchOrderData(data.orderId);
        }
        
        console.log('任务重新分配成功');
      }
    } catch (error) {
      console.error('重新分配任务失败:', error);
      alert(lang === 'zh' ? '重新分配失败' : 'Failed to reassign task');
    }
  };

  // 按状态排序任务
  const getSortedTasks = () => {
    if (!data?.tasks) return [];
    
    if (sortMode === 'status') {
      // 按状态分组排序
      const statusOrder = [STATUS.NOT_STARTED, STATUS.PENDING, STATUS.IN_PROGRESS, STATUS.TESTING, STATUS.COMPLETED];
      const groupedTasks: { [key: string]: any[] } = {};
      
      // 初始化分组
      statusOrder.forEach(status => {
        groupedTasks[status] = [];
      });
      
      // 分组任务
      data.tasks.forEach(task => {
        const status = task.status;
        if (groupedTasks[status]) {
          groupedTasks[status].push(task);
        } else {
          // 如果状态不在预定义列表中，放到最后
          if (!groupedTasks['other']) groupedTasks['other'] = [];
          groupedTasks['other'].push(task);
        }
      });
      
      // 按状态顺序返回任务
      const sortedTasks: any[] = [];
      statusOrder.forEach(status => {
        if (groupedTasks[status] && groupedTasks[status].length > 0) {
          sortedTasks.push(...groupedTasks[status]);
        }
      });
      
      // 添加其他状态的任务
      if (groupedTasks['other']) {
        sortedTasks.push(...groupedTasks['other']);
      }
      
      return sortedTasks;
    } else {
      // 默认顺序
      return data.tasks;
    }
  };

  // 计算整体进度（方案B：只有进行中/测试中/已完成才有进度）
  function getTaskProgress(status: string): number {
    switch (status) {
      case STATUS.NOT_STARTED: return 0;
      case STATUS.PENDING: return 0;
      case STATUS.IN_PROGRESS: return 0.5;
      case STATUS.TESTING: return 0.8;
      case STATUS.COMPLETED: return 1;
      // 兼容老数据
      case '未开始': return 0;
      case '等待接受': return 0;
      case '进行中': return 0.5;
      case '测试中': return 0.8;
      case '已完成': return 1;
      default: return 0;
    }
  }
  const overallProgress = data && data.tasks.length
    ? data.tasks.reduce((sum, t) => sum + getTaskProgress(t.status), 0) / data.tasks.length
    : 0;

  // 在组件顶部修改辅助函数
  function getRoleForChat() {
    return 'customer';
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        backgroundImage: 'url("/bg-result.jpg")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'top left',
        backgroundSize: '100% 512px',
        overflow: 'hidden',
      }}
    >
      {strips.map(i => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            top: 512 + i * 512,
            width: '100%',
            height: 512,
            backgroundImage: 'url("/bg-result2.jpg")',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '100% 512px',
            transform: i % 2 === 1 ? 'scaleY(-1)' : 'none',
            zIndex: 0,
          }}
        />
      ))}
      <div className="max-w-2xl mx-auto p-6" style={{ position: 'relative', margin: '40px auto 0 auto', borderRadius: '0 0 16px 16px' }}>
        <button
          style={{
            position: 'fixed',
            left: 24,
            top: 24,
            background: '#fff',
            color: '#1890ff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 16,
            padding: '6px 18px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            zIndex: 2000,
            cursor: 'pointer',
            letterSpacing: 2
          }}
          onClick={() => router.push('/task-planner')}
        >{t.home}</button>
        
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
        <div style={{marginBottom:32}}>
          <div style={{fontWeight:700, fontSize:18, marginBottom:8}}>{t.overallProgress}</div>
          <div style={{height:18, background:'#f1f5f9', borderRadius:9, overflow:'hidden', position:'relative'}}>
            <div style={{width: `${Math.round(overallProgress*100)}%`, height:'100%', background:'#1890ff', borderRadius:9, transition:'width 0.4s'}}></div>
            <span style={{position:'absolute', left:'50%', top:0, transform:'translateX(-50%)', fontWeight:600, color:'#222', fontSize:14}}>{Math.round(overallProgress*100)}%</span>
          </div>
        </div>
        <div style={{marginBottom:24, display:'flex', alignItems:'center'}}>
          <div style={{display:'flex', alignItems:'center', gap:16}}>
            <span style={{fontWeight:600}}>{lang === 'zh' ? '排序方式：' : 'Sort by:'}</span>
            <button
              className="btn"
              style={{background: sortMode==='default' ? '#1890ff' : '#f1f5f9', color: sortMode==='default' ? '#fff' : '#222', borderRadius:6, fontWeight:600, fontSize:14, padding:'4px 18px', border:'none', cursor:'pointer'}}
              onClick={()=>setSortMode('default')}
            >{lang==='zh'?'默认顺序':'Default'}</button>
            <button
              className="btn"
              style={{background: sortMode==='status' ? '#1890ff' : '#f1f5f9', color: sortMode==='status' ? '#fff' : '#222', borderRadius:6, fontWeight:600, fontSize:14, padding:'4px 18px', border:'none', cursor:'pointer'}}
              onClick={()=>setSortMode('status')}
            >{lang==='zh'?'按进程分类':'By Status'}</button>
          </div>
          <button
            className="btn"
            style={{marginLeft: 'auto', background: '#f1f5f9', color: '#1890ff', borderRadius:6, fontWeight:600, fontSize:14, padding:'4px 18px', border:'none', cursor:'pointer'}}
            onClick={() => {
              if (!data?.tasks) return;
              const allExpanded = data.tasks.every((task: any, i: number) => expanded[task.id || i]);
              if (allExpanded) {
                // 全部收起
                const newExp: Record<string, boolean> = {};
                data.tasks.forEach((task: any, i: number) => { newExp[task.id || i] = false; });
                setExpanded(newExp);
              } else {
                // 全部展开
                const newExp: Record<string, boolean> = {};
                data.tasks.forEach((task: any, i: number) => { newExp[task.id || i] = true; });
                setExpanded(newExp);
              }
            }}
          >
            {
              (() => {
                if (!data?.tasks) return '';
                const allExpanded = data.tasks.every((task: any, i: number) => expanded[task.id || i]);
                return lang === 'zh'
                  ? (allExpanded ? '全部收起' : '全部展开')
                  : (allExpanded ? 'Collapse All' : 'Expand All');
              })()
            }
          </button>
        </div>
        {finished ? (
          <div style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',height:'60vh'}}>
            <span style={{
              fontSize: '3rem',
              fontWeight: 700,
              color: finishedType === 'delivered' ? '#16a34a' : '#e11d48',
              letterSpacing: 6,
              padding: '32px 64px',
              borderRadius: 16,
              background: 'linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
              textAlign: 'center',
              lineHeight: 1.2
            }}>{finishedType === 'delivered' ? t.delivered : t.finished}</span>
            <button
              style={{
                marginTop: 32,
                background: '#1890ff',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 16,
                padding: '8px 28px',
                boxShadow: '0 2px 8px rgba(24,144,255,0.08)',
                cursor: 'pointer',
                letterSpacing: 2
              }}
              onClick={() => router.push('/task-planner')}
            >{t.backHome}</button>
          </div>
        ) : (
          <>
            {!data ? (
              <div className="text-gray-500 mb-8">{t.noData}</div>
            ) : (
                          <div style={{marginTop:32}}>
                {getSortedTasks().map((task, i) => {
                  const isExpanded = expanded[task.id] === true;
                  const taskStatusColor = statusColor[task.status] || statusColor[STATUS.NOT_STARTED];
                  
                  // 如果是按状态排序且是新状态组，显示分组标题
                  const showGroupHeader = sortMode === 'status' && 
                    (i === 0 || getSortedTasks()[i-1]?.status !== task.status);
                  
                  return (
                    <React.Fragment key={task.id}>
                      {showGroupHeader && (
                        <div style={{
                          marginBottom: 16,
                          padding: '12px 16px',
                          background: taskStatusColor.bg,
                          borderRadius: 8,
                          borderLeft: `4px solid ${taskStatusColor.text}`,
                          fontWeight: 700,
                          fontSize: 16,
                          color: taskStatusColor.text
                        }}>
                          {statusI18n[lang][task.status] || task.status}
                        </div>
                      )}
                      <div style={{ 
                        background: '#fff', 
                        borderRadius: 12, 
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', 
                        padding: 24, 
                        marginBottom: 18,
                        borderLeft: `4px solid ${taskStatusColor.text}`
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 18 }}>{lang === 'zh' ? (task.title_zh || task.title || task.name_zh || '') : (task.title_en || task.title || task.name_en || '')}</div>
                            <div style={{ 
                              margin: '8px 0', 
                              color: taskStatusColor.text,
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8
                            }}>
                              <div style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: taskStatusColor.text
                              }} />
                              {t.status}：{statusI18n[lang][task.status] || task.status}
                            </div>
                          </div>
                          <button
                            onClick={() => setExpanded(prev => ({ ...prev, [task.id]: !isExpanded }))}
                            style={{ background: '#f1f5f9', border: 'none', borderRadius: 6, padding: '4px 16px', fontWeight: 600, cursor: 'pointer', color: '#1890ff' }}
                          >
                            {isExpanded ? t.collapse : t.expand}
                          </button>
                        </div>
                        {isExpanded && (
                          <>
                            <div style={{ margin: '8px 0', color: '#1890ff', fontWeight: 500 }}>
                              {t.member}：
                              {(() => {
                                const memberId = task.assigned_member_id;
                                
                                console.log('=== 成员显示调试 ===');
                                console.log('任务ID:', task.id);
                                console.log('分配的成员ID:', memberId);
                                console.log('团队数据长度:', teamData.length);
                                
                                // 如果是"未开始"状态，显示开发者选择界面
                                if (task.status === '未开始' || task.status === 'NOT_STARTED') {
                                  return (
                                    <div style={{ marginTop: 12 }}>
                                      <div style={{ color: '#1890ff', fontWeight: 500, marginBottom: 8 }}>
                                        {lang === 'zh' ? '选择开发者：' : 'Select Developer:'}
                                      </div>
                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {teamData.map((member: any) => {
                                          const isSelected = task.assigned_member_id === member.id;
                                          const displayName = lang === 'zh' 
                                            ? member.name 
                                            : (member.name_en || member.name);
                                          
                                          return (
                                            <button
                                              key={member.id}
                                              onClick={() => handleReassignTask(task.id, member.id)}
                                              style={{
                                                background: isSelected ? '#1890ff' : '#f1f5f9',
                                                color: isSelected ? '#fff' : '#333',
                                                border: '1px solid #ddd',
                                                borderRadius: 6,
                                                padding: '6px 12px',
                                                fontSize: 12,
                                                cursor: 'pointer',
                                                fontWeight: isSelected ? 600 : 400
                                              }}
                                            >
                                              {displayName}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                }
                                
                                if (!memberId) {
                                  console.log('未分配成员ID');
                                  return <span style={{color:'#888'}}>{lang==='zh'?'未分配':'Unassigned'}</span>;
                                }
                                
                                const member = teamData.find(m => String(m.id) === String(memberId));
                                console.log('找到的成员:', member);
                                
                                if (!member) {
                                  console.log('在团队数据中未找到成员:', memberId);
                                  // 尝试从localStorage直接查找
                                  const savedMembers = JSON.parse(localStorage.getItem('teamMembers') || '[]');
                                  const fallbackMember = savedMembers.find((m: any) => String(m.id) === String(memberId));
                                  console.log('localStorage中找到的成员:', fallbackMember);
                                  
                                  if (fallbackMember) {
                                    const displayName = lang === 'zh' 
                                      ? fallbackMember.name 
                                      : (fallbackMember.name_en || fallbackMember.name);
                                    return `${displayName} (ID: ${memberId})`;
                                  }
                                  
                                  return `${lang === 'zh' ? '开发者' : 'Developer'} ${memberId}`;
                                }
                                
                                const displayName = lang === 'zh'
                                  ? member.name
                                  : (member.name_en || member.name);
                                console.log('最终显示名称:', displayName);
                                return displayName;
                              })()}
                            </div>
                            <ProgressBar status={task.status} lang={lang} />
                            <button
                              className="btn"
                              style={{ marginTop: 12 }}
                              onClick={() => router.push({
                                pathname: '/chat',
                                query: { orderId: data.orderId, taskId: task.id }
                              })}
                            >
                              {t.chat}
                            </button>
                          </>
                        )}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            )}
            {data?.orderId && orderStatus && orderStatus !== '已交付' && orderStatus !== 'Delivered' && orderStatus !== 'delivered' && orderStatus !== '已取消' && orderStatus !== 'Cancelled' && orderStatus !== 'cancelled' && (
              <div style={{display:'flex', gap: 16, marginBottom: 16}}>
                <button
                  style={{
                    background: '#e11d48',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 16,
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 28px',
                    boxShadow: '0 2px 8px rgba(225,29,72,0.10)',
                    cursor: 'pointer',
                    marginRight: 16
                  }}
                  onClick={handleFinishOrder}
                >
                  {t.finishOrder}
                </button>
                <button
                  style={{
                    background: '#16a34a',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 16,
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 28px',
                    boxShadow: '0 2px 8px rgba(22,163,74,0.10)',
                    cursor: 'pointer',
                  }}
                  onClick={handleDeliverOrder}
                >
                  {t.deliverOrder}
                </button>
              </div>
            )}
            {showFinishModal && (
              <div style={{
                position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
                background: 'rgba(0,0,0,0.15)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{
                  background: '#fff', borderRadius: 12, minWidth: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: 32, position: 'relative', textAlign: 'center'
                }}>
                  <div style={{fontWeight:700, fontSize:22, marginBottom:18}}>{t.confirmFinish}</div>
                  <div style={{display:'flex', justifyContent:'center', gap:24}}>
                    <button style={{background:'#e11d48',color:'#fff',border:'none',borderRadius:8,fontWeight:700,fontSize:16,padding:'8px 28px',cursor:'pointer'}} onClick={confirmFinishOrder}>{t.confirm}</button>
                    <button style={{background:'#f1f5f9',color:'#222',border:'none',borderRadius:8,fontWeight:600,fontSize:16,padding:'8px 28px',cursor:'pointer'}} onClick={()=>setShowFinishModal(false)}>{t.cancel}</button>
                  </div>
                </div>
              </div>
            )}
            {showDeliverModal && (
              <div style={{
                position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
                background: 'rgba(0,0,0,0.15)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{
                  background: '#fff', borderRadius: 12, minWidth: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: 32, position: 'relative', textAlign: 'center'
                }}>
                  <div style={{fontWeight:700, fontSize:22, marginBottom:18}}>{t.confirmDeliver}</div>
                  <div style={{display:'flex', justifyContent:'center', gap:24}}>
                    <button style={{background:'#16a34a',color:'#fff',border:'none',borderRadius:8,fontWeight:700,fontSize:16,padding:'8px 28px',cursor:'pointer'}} onClick={confirmDeliverOrder}>{t.confirm}</button>
                    <button style={{background:'#f1f5f9',color:'#222',border:'none',borderRadius:8,fontWeight:600,fontSize:16,padding:'8px 28px',cursor:'pointer'}} onClick={()=>setShowDeliverModal(false)}>{t.cancel}</button>
                  </div>
                </div>
              </div>
            )}
            <div style={{display:'flex', justifyContent:'center', marginTop: 32}}>
              <button className="btn" onClick={() => router.push('/task-planner')}>{t.back}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 