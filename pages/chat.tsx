import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';

const texts = {
  zh: {
    title: '任务交流区',
    inputPlaceholder: '输入消息...',
    send: '发送',
    back: '返回',
    empty: '暂无消息',
    lang: 'English',
    roleLabel: '我是',
    customer: '客户',
    developer: '开发者',
    selectRole: '请选择身份',
  },
  en: {
    title: 'Task Chat',
    inputPlaceholder: 'Type a message...',
    send: 'Send',
    back: 'Back',
    empty: 'No messages yet',
    lang: '中文',
    roleLabel: 'I am',
    customer: 'Customer',
    developer: 'Developer',
    selectRole: 'Please select your role',
  },
};

export default function Chat() {
  const router = useRouter();
  const { orderId, taskId, role: urlRole } = router.query;
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const t = texts[lang];
  const roleKey = `chat_role_${orderId}_${taskId}`;
  const [messages, setMessages] = useState<{text:string; time:number; role:string;}[]>([]);
  const [input, setInput] = useState('');
  const [role, setRole] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // 获取聊天消息
  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat?orderId=${orderId}&taskId=${taskId}`);
      const data = await res.json();
      
      if (data.messages) {
        const formattedMessages = data.messages.map((msg: any) => ({
          text: msg.message,
          time: new Date(msg.created_at).getTime(),
          role: msg.role
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
  };

  // 自动识别URL中的role参数，或用localStorage记住身份
  useEffect(() => {
    let r = '';
    // 新增：如果url中包含developer（不区分大小写），自动判定为开发者，否则为客户
    if (typeof window !== 'undefined' && window.location.search.toLowerCase().includes('developer')) {
      r = 'developer';
      setRole(r);
      localStorage.setItem(roleKey, r);
    } else {
      r = 'customer';
      setRole(r);
      localStorage.setItem(roleKey, r);
    }
  }, [urlRole, roleKey]);

  // 从数据库读取消息
  useEffect(() => {
    if (orderId && taskId) {
      fetchMessages();
    }
  }, [orderId, taskId, fetchMessages]);

  // 定时刷新消息
  useEffect(() => {
    if (!orderId || !taskId) return;
    
    const interval = setInterval(() => {
      fetchMessages();
    }, 3000); // 每3秒刷新一次
    
    return () => clearInterval(interval);
  }, [orderId, taskId, fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({behavior:'smooth'});
  }, [messages]);

  const sendMsg = async () => {
    if (!input.trim() || !role || !orderId || !taskId) return;
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          taskId,
          role,
          message: input
        })
      });
      
      if (res.ok) {
        setInput('');
        // 立即刷新消息列表
        await fetchMessages();
      } else {
        console.error('Send message failed');
      }
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  // 聊天区宽度放大
  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        backgroundImage: 'url("/bg-result.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div style={{maxWidth:700,minWidth:360,margin:'40px auto 0 auto',padding:32,background:'#fff',borderRadius:'0 0 16px 16px',boxShadow:'0 2px 16px rgba(0,0,0,0.10)'}}>
        {/* 右上角语言切换 */}
        <div style={{ position: 'fixed', right: 24, top: 24, zIndex: 3000 }}>
          <button 
            className="btn" 
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
          >
            {t.lang}
          </button>
        </div>
        
        <h2 style={{fontWeight:700,fontSize:26,marginBottom:20}}>{t.title} {orderId && taskId ? `#${String(orderId).slice(-4)}-${String(taskId).slice(-4)}` : ''}</h2>
        <div style={{minHeight:320,maxHeight:480,overflowY:'auto',background:'#f8fafc',borderRadius:10,padding:18,marginBottom:20}}>
          {messages.length === 0 ? <div style={{color:'#888'}}>{t.empty}</div> :
            messages.map((msg,i)=>{
              // 自己发的消息永远在右侧，对方在左侧
              const isMe = msg.role === role;
              const align = isMe ? 'flex-end' : 'flex-start';
              const bubbleColor = isMe ? '#1890ff' : '#e6f4ff';
              const textColor = isMe ? '#fff' : '#222';
              const nameColor = isMe ? '#1890ff' : '#888';
              const name = msg.role === 'customer' ? t.customer : t.developer;
              return (
                <div key={i} style={{display:'flex',flexDirection:'column',alignItems:align,margin:'12px 0'}}>
                  <span style={{fontSize:12,color:nameColor,marginBottom:2,marginLeft:isMe?0:4,marginRight:isMe?4:0}}>{name}</span>
                  <div style={{background:bubbleColor,color:textColor,padding:'10px 18px',borderRadius:10,maxWidth:420,wordBreak:'break-all',fontSize:16,boxShadow:isMe?'0 2px 8px rgba(24,144,255,0.08)':'0 1px 4px rgba(24,144,255,0.04)'}}>{msg.text}</div>
                </div>
              );
            })}
          <div ref={bottomRef}></div>
        </div>
        <div style={{display:'flex',gap:10}}>
          <input value={input} onChange={e=>setInput(e.target.value)} placeholder={t.inputPlaceholder} style={{flex:1,padding:'10px 14px',borderRadius:8,border:'1px solid #e5e7eb',fontSize:16}} onKeyDown={e=>{if(e.key==='Enter')sendMsg();}} />
          <button className="btn" style={{background:'#1890ff',color:'#fff',borderRadius:8,fontWeight:600,padding:'10px 28px',fontSize:16}} onClick={sendMsg}>{t.send}</button>
          <button className="btn" style={{background:'#f1f5f9',color:'#222',borderRadius:8,fontWeight:600,padding:'10px 28px',fontSize:16}} onClick={()=>router.back()}>{t.back}</button>
        </div>
      </div>
    </div>
  );
} 