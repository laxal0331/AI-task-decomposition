import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { useState } from "react";
import { useRouter } from 'next/router';

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
  },
  en: {
    title: 'AI Remote Project Management',
    subtitle: 'Smart Task Decomposition & Team Assignment',
    taskPlanner: 'Task Planner',
    taskPlannerDesc: 'AI-powered task decomposition',
    clientView: 'Developer Portal',
    clientViewDesc: 'Accept tasks and communicate',
    lang: '中文',
  },
};

export default function Home() {
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const t = texts[lang];
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <div
      className={`${geistSans.className} ${geistMono.className} min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]`}
    >
      <button 
        style={{position:'absolute',right:24,top:24,zIndex:1000}} 
        className="btn" 
        onClick={()=>setLang(lang==='zh'?'en':'zh')}
      >
        {t.lang}
      </button>
      
      <main className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            {t.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          <div 
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
            onClick={() => navigateTo('/task-planner')}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {t.taskPlanner}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t.taskPlannerDesc}
              </p>
            </div>
          </div>

          <div 
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
            onClick={() => navigateTo('/client-view')}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {t.clientView}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t.clientViewDesc}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
