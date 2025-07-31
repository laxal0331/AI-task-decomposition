import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function DebugRoute() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>
          路由调试页面
        </h1>
        
        <div style={{ marginBottom: '20px' }}>
          <h3>路由信息：</h3>
          <p><strong>当前路径：</strong> {router.asPath}</p>
          <p><strong>路由对象：</strong> {JSON.stringify(router, null, 2)}</p>
          <p><strong>是否已挂载：</strong> {mounted ? '是' : '否'}</p>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <h3>测试按钮：</h3>
          <button
            onClick={() => router.push('/')}
            style={{
              background: '#4CAF50',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            返回首页
          </button>
          
          <button
            onClick={() => router.push('/task-planner')}
            style={{
              background: '#2196F3',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            跳转到任务拆解
          </button>
          
          <button
            onClick={() => window.location.href = '/task-planner'}
            style={{
              background: '#FF9800',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            强制跳转（window.location）
          </button>
        </div>
        
        <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
          <h3>调试信息：</h3>
          <p><strong>User Agent：</strong> {typeof window !== 'undefined' ? window.navigator.userAgent : '服务器端'}</p>
          <p><strong>当前时间：</strong> {new Date().toLocaleString()}</p>
          <p><strong>页面URL：</strong> {typeof window !== 'undefined' ? window.location.href : '服务器端'}</p>
        </div>
      </div>
    </div>
  );
} 