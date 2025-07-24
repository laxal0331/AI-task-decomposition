import Image from "next/image";
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
  const t = texts[lang];
  const router = useRouter();
  const [bg2Opacity, setBg2Opacity] = useState(0);
  // 动画用refs
  const introRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null)
  ];
  const [visible, setVisible] = useState([false, false, false, false, false]);
  const [hoveredIndex, setHoveredIndex] = useState<number|null>(null);
  const [flippedIndex, setFlippedIndex] = useState<number|null>(null);
  // 吸底提示字滚动逻辑
  const [tipFixed, setTipFixed] = useState(true);
  const [tipAbsTop, setTipAbsTop] = useState<number | undefined>(undefined);
  const cardsRowRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  // 卡片点击直接跳转
  const handleCardClick = (type: 'task' | 'client') => {
    router.push(type === 'task' ? '/task-planner' : '/client-view');
  };
  useEffect(() => {
    const onScroll = () => {
      const cards = cardsRowRef.current;
      if (!cards) return;
      const cardsRect = cards.getBoundingClientRect();
      if (cardsRect.bottom < window.innerHeight) {
        setTipFixed(false);
        setTipAbsTop(window.scrollY + cardsRect.bottom + 24); // 24px间距
      } else {
        setTipFixed(true);
        setTipAbsTop(undefined);
      }
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // 计算滚动百分比，0=顶部，1=底部
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight > 0 ? Math.min(Math.max(scrollTop / docHeight, 0), 1) : 0;
      setBg2Opacity(percent);
      setVisible(visible => visible.map((v, i) => {
        if (v) return true;
        const el = introRefs[i].current;
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight - 80;
      }));
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 动画严格串行：先滑动logo，滑动2秒后再翻转
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (hoveredIndex !== null) {
      setFlippedIndex(null); // 先复位翻转
      timer = setTimeout(() => setFlippedIndex(hoveredIndex), 2000);
    } else {
      setFlippedIndex(null);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [hoveredIndex]);

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
      {/* 内容区 zIndex 2+ */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <button 
          style={{position:'absolute',right:24,top:24,zIndex:1000}} 
          className="btn" 
          onClick={()=>setLang(lang==='zh'?'en':'zh')}
        >
          {t.lang}
        </button>
        
        <main className="flex flex-col items-start justify-center min-h-screen">
          <div className="main-title-wrap">
            <h1 className="font-bold mb-4 text-gray-900 dark:text-white main-title" 
              style={{
                fontSize: 'clamp(28px, 8vw, 72px)',
                WebkitTextStroke: '1.5px rgba(0,0,0,0.18)',
                textShadow: '0 4px 16px rgba(0,0,0,0.12)',
                color: '#fff',
                lineHeight: 1.1,
              }}
            >
              {lang === 'zh'
                ? (<><span>AI</span><br/><span>远程项目管理</span></>)
                : (<span className="en-title">AI Remote Project Management</span>)}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 main-subtitle"
              style={{
                WebkitTextStroke: '0.5px rgba(0,0,0,0.12)',
                textShadow: '0 1px 4px rgba(0,0,0,0.10)',
                color: '#222',
                fontSize: 'clamp(16px, 2.5vw, 32px)',
                marginLeft: 2,
                marginBottom: 32,
              }}
            >
              {t.subtitle}
            </p>
          </div>

          {/* 第一个长方形位置留空 */}
          <div style={{ width: '96vw', maxWidth: 1400, height: 64, margin: '220px auto 0 auto', background: 'none', border: 'none', boxShadow: 'none', position: 'relative', zIndex: 1, marginBottom: 64 }} />

          {/* 三层结构：背景 -> 长方形 -> 卡片 */}
          <div ref={cardsRowRef} className="cards-row" style={{ margin: '0 auto', width: '100%', maxWidth: 1200, padding: '0 16px' }}>
            <div
              className="card-responsive card-hover-blue"
              onClick={() => handleCardClick('task')}
              style={{
                background: '#dbeafe',
                borderRadius: 32,
                boxShadow: '0 8px 32px 0 rgba(30,41,59,0.10)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'clamp(24px, 5vw, 48px)',
                minHeight: 180,
                width: '100%',
                transition: 'background 0.3s, box-shadow 0.3s',
              }}
            >
              <svg width="56" height="56" viewBox="0 0 80 80" fill="none" style={{ marginBottom: 16 }}>
                <rect x="16" y="28" width="40" height="16" rx="8" fill="#3ecf8e"/>
                <circle cx="40" cy="56" r="12" fill="#3ecf8e"/>
              </svg>
              <h3 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>{t.taskPlanner}</h3>
              <p style={{ fontSize: 'clamp(12px, 2vw, 16px)', color: '#3b4a5a', opacity: 0.98, fontWeight: 500, textAlign: 'center' }}>{t.taskPlannerDesc}</p>
            </div>
            <div
              className="card-responsive card-hover-blue"
              onClick={() => handleCardClick('client')}
              style={{
                background: '#dbeafe',
                borderRadius: 32,
                boxShadow: '0 8px 32px 0 rgba(30,41,59,0.10)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'clamp(24px, 5vw, 48px)',
                minHeight: 180,
                width: '100%',
                transition: 'background 0.3s, box-shadow 0.3s',
              }}
            >
              <svg width="56" height="56" viewBox="0 0 80 80" fill="none" style={{ marginBottom: 16 }}>
                <circle cx="40" cy="40" r="32" fill="#3ecf8e" opacity="0.12"/>
                <path d="M40 32a8 8 0 110 16 8 8 0 010-16zm0 18c-8 0-16 4-16 8v4h32v-4c0-4-8-8-16-8z" fill="#3ecf8e"/>
              </svg>
              <h3 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>{t.clientView}</h3>
              <p style={{ fontSize: 'clamp(12px, 2vw, 16px)', color: '#3b4a5a', opacity: 0.98, fontWeight: 500, textAlign: 'center' }}>{t.clientViewDesc}</p>
            </div>
          </div>
          {/* 下滑提示文字 */}
          <div
            id="scroll-tip"
            ref={tipRef}
            className="scroll-tip-responsive"
            style={{
              position: tipFixed ? 'fixed' : 'absolute',
              left: 0,
              right: 0,
              bottom: tipFixed ? 0 : undefined,
              top: !tipFixed && tipAbsTop !== undefined ? tipAbsTop : undefined,
              margin: '0 auto',
              textAlign: 'center',
              zIndex: 10,
              width: 'auto',
              maxWidth: 1200,
            }}
          >
            <span
              style={{ display: 'inline-block', padding: '6px 18px', borderRadius: 8 }}
            >
              {t.scrollTip}
              <br />
              <span style={{ display: 'inline-block', marginTop: 6 }}>
                <svg width="38" height="24" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 6l6 6 6-6" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </span>
          </div>
        </main>
        {/* 功能介绍区块，紧跟卡片下方 */}
        <section className="w-[90vw] max-w-6xl mx-auto mt-24 mb-20 px-0 grid grid-cols-1 gap-12">
          {[0,1,2,3,4].map((i) => {
            const item = {
              ...texts[lang].cards[i],
              color: [
                '#b7f5d8',
                '#c7e3fa',
                '#ffe6b3',
                '#e3d7fa',
                '#b3eaf7',
              ][i],
              backColor: [
                '#f6fefb',
                '#f7fbfe',
                '#fffdf7',
                '#faf7fe',
                '#f7fcfd',
              ][i],
              icon: [
                (<svg className="logo-breath" width="56" height="56" viewBox="0 0 56 56" fill="none"><circle cx="28" cy="28" r="28" fill="#e6f9ef"/><g><rect x="18" y="22" width="20" height="8" rx="4" fill="#3ecf8e"/><circle cx="28" cy="32" r="6" fill="#3ecf8e"/></g></svg>),
                (<svg className="logo-rotate" width="56" height="56" viewBox="0 0 56 56" fill="none"><circle cx="28" cy="28" r="28" fill="#eaf6fd"/><g><circle cx="28" cy="24" r="7" fill="#60a5fa"/><ellipse cx="28" cy="32" rx="12" ry="6" fill="#60a5fa" opacity="0.18"/><g><circle cx="16" cy="32" r="2.5" fill="#60a5fa"/><circle cx="40" cy="32" r="2.5" fill="#60a5fa"/></g></g></svg>),
                (<svg className="logo-pulse" width="56" height="56" viewBox="0 0 56 56" fill="none"><circle cx="28" cy="28" r="28" fill="#fff7e0"/><rect x="18" y="32" width="20" height="4" rx="2" fill="#fbbf24"/><rect x="18" y="20" width="12" height="4" rx="2" fill="#fbbf24"/><circle className="pulse-dot" cx="34" cy="22" r="3" fill="#fbbf24"/></svg>),
                (<svg className="logo-chat" width="56" height="56" viewBox="0 0 56 56" fill="none"><circle cx="28" cy="28" r="28" fill="#f5f3ff"/><rect x="16" y="20" width="24" height="12" rx="6" fill="#a78bfa" opacity="0.18"/><rect x="20" y="24" width="16" height="4" rx="2" fill="#a78bfa"/><circle cx="36" cy="26" r="2" fill="#a78bfa"/><g><circle className="chat-dot" cx="24" cy="30" r="1.5" fill="#a78bfa"/><circle className="chat-dot" cx="28" cy="30" r="1.5" fill="#a78bfa"/><circle className="chat-dot" cx="32" cy="30" r="1.5" fill="#a78bfa"/></g></svg>),
                (<svg className="logo-bounce" width="56" height="56" viewBox="0 0 56 56" fill="none"><circle cx="28" cy="28" r="28" fill="#e0f7fa"/><path d="M20 28l6 6 10-10" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><circle className="bounce-dot" cx="28" cy="28" r="6" fill="#06b6d4" opacity="0.18"/></svg>),
              ][i],
            };
            const isLeft = i % 2 === 0;
            const isHovered = hoveredIndex === i;
            const isFlipped = flippedIndex === i;
            // 动画：logo初始在一侧，悬停时滑到对侧，滑动完成后卡片翻转，logo保持在新侧
            // 计算logo实际位置
            const logoTranslate = isHovered && !isFlipped
              ? (isLeft ? 'translateX(90vw)' : 'translateX(-90vw)')
              : isFlipped
                ? (isLeft ? 'translateX(90vw)' : 'translateX(-90vw)')
                : 'translateX(0)';
            const logoOrder = isFlipped ? (isLeft ? 1 : 0) : (isLeft ? 0 : 1);
            const contentOrder = isFlipped ? (isLeft ? 0 : 1) : (isLeft ? 1 : 0);
            return (
              <div
                key={i}
                className={`flip-card flip-x card-animate${isFlipped ? ' flipped' : ''}`}
                style={{
                  perspective: '1200px',
                  minHeight: 240,
                  borderRadius: 48,
                  width: 0,
                  flexDirection: 'row',
                  display: 'flex',
                  alignItems: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'width 1.2s cubic-bezier(.4,2,.3,1)',
                  animation: 'card-expand 1.2s cubic-bezier(.4,2,.3,1) forwards',
                  animationDelay: `${i * 0.2}s`,
                }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flip-card-inner" style={{ transitionDuration: `1.6s` }}>
                  {/* 正面 */}
                  <div className="flip-card-front flex items-center rounded-2xl"
                    style={{
                      background: item.color,
                      color: '#222',
                      minHeight: 160,
                      padding: 0,
                      flex: 1,
                      flexDirection: 'row',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <div className="logo-slide" style={{
                      flex: `0 0 calc(7vw + 60px)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      transition: 'transform 2s cubic-bezier(.4,2,.3,1)',
                      transform: logoTranslate,
                      order: logoOrder,
                    }}>{
                      React.cloneElement(item.icon, { width: '8vw', height: '8vw', style: { minWidth: 56, minHeight: 56, maxWidth: 120, maxHeight: 120 } })
                    }</div>
                    <div style={{flex: 1, display:'flex', alignItems:'center', height:'100%', justifyContent: 'center', padding: '0 32px', order: contentOrder}}>
                      <h2 className="font-bold text-center w-full" style={{letterSpacing:1, fontSize: 'clamp(24px, 2.5vw, 48px)'}}>{item.title}</h2>
                    </div>
                  </div>
                  {/* 背面 */}
                  <div className="flip-card-back flex items-center rounded-2xl"
                    style={{
                      background: item.backColor,
                      color: '#444',
                      minHeight: 160,
                      padding: 0,
                      flex: 1,
                      flexDirection: 'row',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <div className="logo-slide" style={{
                      flex: `0 0 calc(7vw + 60px)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      order: logoOrder,
                    }}>{
                      React.cloneElement(item.icon, { width: '8vw', height: '8vw', style: { minWidth: 56, minHeight: 56, maxWidth: 120, maxHeight: 120 } })
                    }</div>
                    <div style={{flex: 1, display:'flex', alignItems:'center', height:'100%', justifyContent: 'center', padding: '0 32px', order: contentOrder}}>
                      <p className="text-center w-full" style={{maxWidth: '90%', margin: '0 auto', fontWeight: 500, fontSize: 'clamp(20px, 2vw, 32px)'}}>{item.desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </div>
      <style jsx global>{`
        .flip-card {
          width: 100%;
          cursor: pointer;
          margin-bottom: 0;
        }
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 1.6s cubic-bezier(.4,2,.3,1);
          transform-style: preserve-3d;
          min-height: 160px;
        }
        .flip-card.flip-x .flip-card-inner {
          transition: transform 1.6s cubic-bezier(.4,2,.3,1);
        }
        .flip-card:hover .flip-card-inner,
        .flip-card.flip-x:hover .flip-card-inner {
          transform: rotateX(180deg);
        }
        .flip-card-front, .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          box-sizing: border-box;
        }
        .flip-card-front {
          z-index: 2;
        }
        .flip-card-back {
          transform: rotateX(180deg);
          z-index: 3;
        }
        .logo-breath rect, .logo-breath circle {
          transform-box: fill-box;
          transform-origin: 50% 50%;
          animation: breath 2s infinite alternate;
        }
        @keyframes breath {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        .logo-rotate g > circle {
          transform-box: fill-box;
          transform-origin: 50% 50%;
        }
        .logo-pulse .pulse-dot {
          animation: pulse 1.2s infinite;
        }
        @keyframes pulse {
          0% { r: 3; opacity: 1; }
          50% { r: 6; opacity: 0.3; }
          100% { r: 3; opacity: 1; }
        }
        .logo-chat .chat-dot {
          animation: chatdot 1.5s infinite alternate;
        }
        @keyframes chatdot {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
        .logo-bounce .bounce-dot {
          animation: bounce 1.4s infinite;
        }
        @keyframes bounce {
          0% { cy: 28; }
          30% { cy: 22; }
          60% { cy: 28; }
          100% { cy: 28; }
        }
        .card-monday {
          transition: box-shadow 0.3s, transform 0.3s;
        }
        .card-monday:hover {
          box-shadow: 0 8px 32px 0 rgba(80,120,255,0.18), 0 2px 16px 0 rgba(60,220,180,0.10);
          transform: translateY(-6px) scale(1.03);
        }
        .card-animate.flipped .flip-card-inner {
          transform: rotateX(180deg) !important;
        }
        .card-animate .flip-card-inner {
          transition: transform 1.6s cubic-bezier(.4,2,.3,1);
        }
        @keyframes card-expand {
          from { width: 0; }
          to { width: 100%; }
        }
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
          top: 32px;
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
          .logo-slide svg {
            width: 48px !important;
            height: 48px !important;
          }
          .flip-card-front h2, .flip-card-back p {
            font-size: 18px !important;
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
        .en-title {
          white-space: nowrap;
          display: inline-block;
        }
        @media (max-width: 550px) {
          .en-title {
            white-space: normal;
            display: block;
          }
        }
      `}</style>
    </div>
  );
}
