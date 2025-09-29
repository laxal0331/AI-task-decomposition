import { Geist, Geist_Mono } from "next/font/google";
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/router';
import React from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const texts = {
  zh: {
    title: 'AI 远程项目管理',
    subtitle: '智能任务拆解与团队分配',
    taskPlanner: '任务拆解',
    taskPlannerDesc: 'AI 智能拆解项目任务',
    clientView: '开发者端',
    clientViewDesc: '接任务和沟通',
    lang: 'English',
    scrollTip: '往下滑动查看详情介绍',
    cards: [
      {
        title: '智能任务拆解',
        desc: 'AI自动将项目目标拆解为可执行任务，提升效率，减少遗漏。',
      },
      {
        title: '团队智能分配',
        desc: '根据成员能力与空闲度，智能分配任务，实现人岗最优。',
      },
      {
        title: '实时进度追踪',
        desc: '任务进展一目了然，支持多角色协作与沟通。',
      },
      {
        title: '开发者与客户无缝沟通',
        desc: '内置聊天系统，开发者与客户实时交流，减少沟通成本。',
      },
      {
        title: '一键交付与验收',
        desc: '任务完成后可一键交付，支持客户验收与反馈。',
      },
    ],
  },
  en: {
    title: 'AI Remote Project Management',
    subtitle: 'Smart Task Decomposition & Team Assignment',
    taskPlanner: 'Task Planner',
    taskPlannerDesc: 'AI-powered task decomposition',
    clientView: 'Developer Portal',
    clientViewDesc: 'Accept tasks and communicate',
    lang: '中文',
    scrollTip: 'Scroll down for more details',
    cards: [
      {
        title: 'Smart Task Decomposition',
        desc: 'AI automatically breaks down project goals into actionable tasks, improving efficiency and reducing omissions.',
      },
      {
        title: 'Intelligent Team Assignment',
        desc: 'Tasks are assigned based on member skills and availability, achieving optimal team performance.',
      },
      {
        title: 'Real-time Progress Tracking',
        desc: 'Task progress is clear at a glance, supporting multi-role collaboration and communication.',
      },
      {
        title: 'Seamless Developer-Client Communication',
        desc: 'Built-in chat system enables real-time communication between developers and clients, reducing communication costs.',
      },
      {
        title: 'One-click Delivery & Acceptance',
        desc: 'Tasks can be delivered with one click after completion, supporting client acceptance and feedback.',
      },
    ],
  },
};

export default function Home() {
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [mounted, setMounted] = useState(false);
  const t = texts[lang];
  const router = useRouter();

  // 防止 SSR Hydration 不匹配
  useEffect(() => {
    setMounted(true);
  }, []);
  const [bg2Opacity, setBg2Opacity] = useState(0);
  const cardsRowRef = useRef<HTMLDivElement>(null);
  // 卡片点击直接跳转
  const handleCardClick = (type: 'task' | 'client') => {
    router.push(type === 'task' ? '/task-planner' : '/client-view');
  };

  useEffect(() => {
    const handleScroll = () => {
      // 计算滚动百分比，0=顶部，1=底部
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;
      setBg2Opacity(percent);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <div
      className={`${geistSans.className} ${geistMono.className} min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]`} 
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* 背景图片1 */}
      <div style={{
        position: 'fixed',
        zIndex: 0,
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        backgroundImage: 'url(/bg-home1.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 1,
        pointerEvents: 'none',
        transition: 'opacity 0.5s',
      }} />
      {/* 背景图片2，透明度随滚动变化 */}
      <div style={{
        position: 'fixed',
        zIndex: 1,
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        backgroundImage: 'url(/bg-home2.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: bg2Opacity,
        pointerEvents: 'none',
        transition: 'opacity 0.5s',
      }} />
      {/* 导航栏 */}
      <nav style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000, 
        background: '#1e293b', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '12px 24px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          width: '100%'
        }}>
          {/* 左侧：网站图标 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '32px',
            marginLeft: '0'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '20px',
              fontWeight: '700',
              color: '#ffffff'
            }}>
              <img 
                src="/favicon.ico" 
                alt="Logo" 
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px'
                }}
              />
              <span>{lang === 'zh' ? 'AI 远程项目管理' : 'AI Remote Project Management'}</span>
            </div>
            
            {/* 导航链接 */}
            <div style={{ display: 'flex', gap: '24px' }}>
              <button 
                onClick={() => handleCardClick('task')}
                style={{
                  background: '#1e293b',
                  border: '1px solid #1e293b',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#334155';
                  e.currentTarget.style.borderColor = '#334155';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#1e293b';
                  e.currentTarget.style.borderColor = '#1e293b';
                }}
              >
                {lang === 'zh' ? '任务拆解' : 'Task Planner'}
              </button>
              <button 
                onClick={() => handleCardClick('client')}
                style={{
                  background: '#1e293b',
                  border: '1px solid #1e293b',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#334155';
                  e.currentTarget.style.borderColor = '#334155';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#1e293b';
                  e.currentTarget.style.borderColor = '#1e293b';
                }}
              >
                {lang === 'zh' ? '开发者端' : 'Developer Portal'}
              </button>
            </div>
          </div>
          
          {/* 右侧：语言切换 */}
        <button 
          className="btn" 
          onClick={()=>setLang(lang==='zh'?'en':'zh')}
            style={{
              fontSize: '14px',
              padding: '8px 16px',
              marginRight: '0'
            }}
        >
          {mounted ? t.lang : 'English'}
        </button>
        </div>
      </nav>

      {/* 内容区 zIndex 2+ */}
      <div style={{ position: 'relative', zIndex: 2, paddingTop: '80px' }}>
        
        <main className="flex flex-col items-start justify-center min-h-screen">
          <div className="main-title-wrap" style={{ marginTop: '40px' }}>
            <h1 className="font-bold mb-4 text-gray-900 dark:text-white main-title" 
              style={{
                fontSize: 'clamp(28px, 8vw, 72px)',
                WebkitTextStroke: '1.5px rgba(0,0,0,0.18)',
                textShadow: '0 4px 16px rgba(0,0,0,0.12)',
                color: '#fff',
                lineHeight: 1.1,
              }}
            >
              {!mounted ? (
                <><span>AI</span><br/><span>远程项目管理</span></>
              ) : lang === 'zh' ? (
                <><span>AI</span><br/><span>远程项目管理</span></>
              ) : (
                <><span>AI</span><br/><span>Remote Project Management</span></>
              )}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 main-subtitle"
              style={{
                WebkitTextStroke: '0.5px rgba(0,0,0,0.12)',
                textShadow: '0 1px 4px rgba(0,0,0,0.10)',
                color: '#fff',
                fontSize: 'clamp(16px, 2.5vw, 32px)',
                marginLeft: 2,
                marginBottom: 32,
              }}
            >
              {mounted ? t.subtitle : '智能任务拆解与团队分配'}
            </p>
          </div>

          {/* 第一个长方形位置留空 */}
          <div style={{ width: '96vw', maxWidth: 1400, height: 64, margin: '220px auto 0 auto', background: 'none', border: 'none', boxShadow: 'none', position: 'relative', zIndex: 1, marginBottom: 64 }} />

          {/* 任务拆解卡片和描述 */}
          <div ref={cardsRowRef} className="cards-row" style={{ margin: '0 auto', width: '100%', maxWidth: 1200, padding: '0 16px', position: 'relative', height: '100vh' }}>
            {/* 描述文字 */}
            <div style={{
              position: 'absolute',
              right: '0',
              top: '45%',
              transform: 'translateY(-50%)',
              textAlign: 'right',
              maxWidth: '700px',
              paddingLeft: '100px'
            }}>
              <div style={{
                fontSize: '20px',
                color: '#ffffff',
                marginBottom: '20px',
                lineHeight: '1.6',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}>
                {lang === 'zh' ? 
                  'AI自动将项目目标拆解为可执行任务，提升效率，减少遗漏。' : 
                  'AI automatically breaks down project goals into actionable tasks, improving efficiency and reducing omissions.'
                }
              </div>
              <div style={{
                fontSize: '20px',
                color: '#ffffff',
                marginBottom: '20px',
                lineHeight: '1.6',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}>
                {lang === 'zh' ? 
                  '根据成员能力与空闲度，智能分配任务，实现人岗最优。' : 
                  'Tasks are assigned based on member skills and availability, achieving optimal team performance.'
                }
              </div>
              <div style={{
                fontSize: '20px',
                color: '#ffffff',
                marginBottom: '20px',
                lineHeight: '1.6',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}>
                {lang === 'zh' ? 
                  '任务进展一目了然，支持多角色协作与沟通。' : 
                  'Task progress is clear at a glance, supporting multi-role collaboration and communication.'
                }
              </div>
            </div>
            
            {/* 任务拆解卡片 */}
            <div
              className="card-responsive card-hover-blue"
              onClick={() => handleCardClick('task')}
              style={{
                background: '#dbeafe',
                borderRadius: 16,
                boxShadow: '0 4px 16px 0 rgba(30,41,59,0.10)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 24px',
                minHeight: 'auto',
                width: 'auto',
                transition: 'background 0.3s, box-shadow 0.3s',
                position: 'absolute',
                right: '0',
                top: '70%',
                transform: 'translateY(-50%)',
              }}
            >
                              <h3 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 700, color: '#1e293b', margin: 0 }}>{mounted ? t.taskPlanner : '任务拆解'}</h3>
            </div>
          </div>
          
          {/* 开发者端卡片 - 第二页 */}
          <div className="developer-section" style={{ margin: '0 auto', width: '100%', maxWidth: 1200, padding: '0 16px', position: 'relative', height: '50vh' }}>
            {/* 开发者端描述文字 */}
            <div className="dev-desc" style={{
              position: 'absolute',
              left: '0',
              top: lang === 'zh' ? '15%' : '13%',
              transform: 'translateY(-50%)',
              textAlign: 'left',
              maxWidth: '600px'
            }}>
              <div style={{
                fontSize: '20px',
                color: '#ffffff',
                marginBottom: '20px',
                lineHeight: '1.6',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}>
                {lang === 'zh' ? 
                  '内置聊天系统，开发者与客户实时交流，减少沟通成本。' : 
                  'Built-in chat system enables real-time communication between developers and clients, reducing communication costs.'
                }
              </div>
              <div style={{
                fontSize: '20px',
                color: '#ffffff',
                marginBottom: '20px',
                lineHeight: '1.6',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}>
                {lang === 'zh' ? 
                  '任务完成后可一键交付，支持客户验收与反馈。' : 
                  'Tasks can be delivered with one click after completion, supporting client acceptance and feedback.'
                }
              </div>
            </div>
            
            <div
              className="card-responsive card-hover-blue dev-card"
              onClick={() => handleCardClick('client')}
              style={{
                background: '#dbeafe',
                borderRadius: 16,
                boxShadow: '0 4px 16px 0 rgba(30,41,59,0.10)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 24px',
                minHeight: 'auto',
                width: 'auto',
                transition: 'background 0.3s, box-shadow 0.3s',
                position: 'absolute',
                left: '0',
                top: '40%',
                transform: 'translateY(-50%)',
              }}
            >
                              <h3 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 700, color: '#1e293b', margin: 0 }}>{mounted ? t.clientView : '开发者端'}</h3>
            </div>
          </div>
          
          {/* 页脚 */}
          <footer style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            background: '#1e293b',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '12px 24px',
            textAlign: 'center'
          }}>
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              color: '#ffffff',
              fontSize: '14px',
              opacity: 0.8
            }}>
              <div style={{ marginBottom: '4px' }}>
                {lang === 'zh' ? '© 2024 AI 远程项目管理. All rights reserved.' : '© 2024 AI Remote Project Management. All rights reserved.'}
          </div>
              <div>
                <a 
                  href="https://github.com/laxal0331/AI-task-decomposition" 
                  target="_blank" 
                  rel="noopener noreferrer"
                style={{
                    color: '#60a5fa',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#93c5fd';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#60a5fa';
                  }}
                >
                  @https://github.com/laxal0331/AI-task-decomposition
                </a>
              </div>
            </div>
          </footer>
        </main>
      </div>
      <style jsx global>{`
        #scroll-tip.scroll-tip-responsive {
          position: absolute;
          left: 0;
          right: 0;
          margin: 0 auto;
          text-align: center;
          top: 74vh;
          font-size: 22px;
          color: #fff;
          letter-spacing: 2px;
          font-weight: 700;
          text-shadow: 0 4px 16px rgba(0,0,0,0.18);
          user-select: none;
          cursor: default;
          line-height: 1.2;
          display: inline-block;
          z-index: 10;
          width: auto;
          max-width: 400px;
          pointer-events: none;
        }
        .main-title-wrap {
          position: absolute;
          top: 120px;
          left: 32px;
          text-align: left;
          max-width: 900px;
          z-index: 20;
        }
        @media (max-width: 600px) {
          .main-title-wrap {
            position: static !important;
            top: auto !important;
            left: auto !important;
            margin: 24px 0 0 0 !important;
            padding: 0 12px !important;
            z-index: 1 !important;
          }
          .cards-row-responsive {
            flex-direction: column !important;
            gap: 18px !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .card-responsive {
            width: 100% !important;
            max-width: 600px !important;
            margin: 0 0 18px 0 !important;
            min-width: 0 !important;
          }
          #scroll-tip.scroll-tip-responsive {
            position: static !important;
            top: auto !important;
            margin: 32px auto 0 auto !important;
            display: block !important;
            font-size: 16px !important;
            width: auto !important;
            max-width: 90vw !important;
            pointer-events: none !important;
          }
          .main-title {
            font-size: clamp(20px, 6vw, 32px) !important;
          }
          .main-subtitle {
            font-size: 16px !important;
          }
          .cards-row-responsive {
            flex-direction: column !important;
            gap: 18px !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .card-responsive {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            box-sizing: border-box !important;
          }
        }
        .cards-row-responsive {
          justify-content: center;
          align-items: center;
          gap: 24px;
        }
        .card-responsive {
          width: clamp(120px, 60vw, 520px);
          min-width: 120px;
          max-width: 100%;
          margin-left: 0 !important;
          margin-right: auto !important;
          box-sizing: border-box;
          transition: width 0.3s;
        }
        @media (max-width: 700px) {
          .cards-row {
            justify-content: flex-start !important;
          }
          .card-responsive {
            margin-left: 0 !important;
            margin-right: auto !important;
          }
        }
        .card-hover-blue:hover {
          background: #93c5fd !important;
        }
        .feature-row-grid {
          width: 100vw;
          max-width: 600px;
          margin: 0 auto;
          padding-left: 12px;
          padding-right: 12px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          box-sizing: border-box;
        }
        .card-responsive {
          width: 100%;
          margin: 0;
          box-sizing: border-box;
        }
        .cards-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(180px, 1fr));
          gap: 48px;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }
        @media (max-width: 1100px) {
          .cards-row {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
        .card-responsive {
          width: 100%;
          min-width: 0;
          margin: 0;
          box-sizing: border-box;
        }
        @media (max-width: 414px) {
          .main-title-wrap {
            margin-top: 80px !important;
          }
        }
        
        /* 导航栏响应式 */
        @media (max-width: 768px) {
          nav {
            padding: 8px 16px !important;
          }
          nav div div:first-child {
            gap: 16px !important;
            margin-left: 0 !important;
          }
          nav div div:first-child span {
            display: none !important;
          }
          nav div div:nth-child(2) {
            gap: 12px !important;
          }
          nav div div:nth-child(2) button {
            font-size: 14px !important;
            padding: 6px 12px !important;
          }
          nav div button {
            margin-right: 0 !important;
          }
        }
        
        @media (max-width: 1024px) {
          nav div div:first-child span {
            font-size: 16px !important;
          }
        }
        
        /* 描述文字响应式 */
        @media (max-width: 768px) {
          .cards-row > div:first-child {
            max-width: 95% !important;
            right: 16px !important;
            top: 40% !important;
            padding-left: 50px !important;
          }
          .cards-row > div:first-child div {
            font-size: 18px !important;
            margin-bottom: 16px !important;
          }
          .cards-row > div:last-child {
            top: 80% !important;
            right: 16px !important;
          }
        }
        
        @media (max-width: 480px) {
          .cards-row > div:first-child {
            max-width: 90% !important;
            top: 35% !important;
            padding-left: 30px !important;
          }
          .cards-row > div:first-child div {
            font-size: 16px !important;
            margin-bottom: 14px !important;
          }
        }
        
        /* 页脚响应式 */
        @media (max-width: 768px) {
          footer {
            padding: 8px 16px !important;
          }
          footer div {
            font-size: 12px !important;
          }
          footer a {
            font-size: 11px !important;
            word-break: break-all !important;
          }
        }
        
        /* 开发者端描述文字响应式 - 仿照任务拆解区域 */
        @media (max-width: 768px) {
          .cards-row:last-child > div:first-child {
            max-width: 95% !important;
            left: 16px !important;
            top: 40% !important;
            padding-right: 50px !important;
          }
          .cards-row:last-child > div:first-child div {
            font-size: 18px !important;
            margin-bottom: 16px !important;
          }
          /* 开发者端按钮响应式 - 与任务拆解按钮保持一致间隔 */
          .cards-row:last-child > div:last-child {
            top: 80% !important;
          }
        }
        
        @media (max-width: 480px) {
          .cards-row:last-child > div:first-child {
            max-width: 90% !important;
            top: 35% !important;
            padding-right: 30px !important;
          }
          .cards-row:last-child > div:first-child div {
            font-size: 16px !important;
            margin-bottom: 14px !important;
          }
          /* 开发者端按钮响应式 - 手机端 */
          .cards-row:last-child > div:last-child {
            top: 75% !important;
          }
        }
      `}</style>
      <style jsx global>{`
        /* 开发者端区域 - 移动端间距优化 */
        @media (max-width: 768px) {
          .developer-section .dev-desc {
            max-width: 95% !important;
            left: 16px !important;
            top: 38% !important;
            padding-right: 50px !important;
            transform: translateY(-50%) !important;
          }
          .developer-section .dev-card {
            left: 16px !important;
            top: 82% !important;
            transform: translateY(-50%) !important;
          }
        }
        @media (max-width: 480px) {
          .developer-section .dev-desc {
            max-width: 90% !important;
            top: 34% !important;
            padding-right: 30px !important;
          }
          .developer-section .dev-card {
            top: 78% !important;
          }
        }
      `}</style>
    </div>
  );
}
