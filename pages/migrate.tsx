import { useState } from 'react';
import { useRouter } from 'next/router';

const texts = {
  zh: {
    title: '数据迁移',
    description: '将现有的 localStorage 数据迁移到 Supabase 数据库',
    migrate: '开始迁移',
    migrating: '迁移中...',
    success: '迁移成功！',
    error: '迁移失败',
    back: '返回首页',
    ordersFound: '找到 {count} 个订单',
    tasksFound: '找到 {count} 个任务',
    messagesFound: '找到 {count} 条消息',
    lang: '中文',
  },
  en: {
    title: 'Data Migration',
    description: 'Migrate existing localStorage data to Supabase database',
    migrate: 'Start Migration',
    migrating: 'Migrating...',
    success: 'Migration successful!',
    error: 'Migration failed',
    back: 'Back to Home',
    ordersFound: 'Found {count} orders',
    tasksFound: 'Found {count} tasks',
    messagesFound: 'Found {count} messages',
    lang: 'English',
  },
};

export default function MigratePage() {
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<{success: boolean; message: string} | null>(null);
  const [stats, setStats] = useState<{orders: number; tasks: number; messages: number} | null>(null);
  const router = useRouter();
  const t = texts[lang];

  // 分析现有数据
  const analyzeData = () => {
    try {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      let totalTasks = 0;
      let totalMessages = 0;

      orders.forEach((order: any) => {
        if (order.tasks) {
          totalTasks += order.tasks.length;
        }
      });

      // 统计聊天消息
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('chat_')) {
          try {
            const messages = JSON.parse(localStorage.getItem(key) || '[]');
            totalMessages += messages.length;
          } catch (e) {
            // 忽略无效的聊天数据
          }
        }
      }

      setStats({
        orders: orders.length,
        tasks: totalTasks,
        messages: totalMessages
      });
    } catch (error) {
      console.error('Analyze data error:', error);
    }
  };

  // 执行迁移
  const handleMigrate = async () => {
    setMigrating(true);
    setResult(null);

    try {
      const res = await fetch('/api/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();

      if (res.ok) {
        setResult({ success: true, message: t.success });
      } else {
        setResult({ success: false, message: data.error || t.error });
      }
    } catch (error) {
      setResult({ success: false, message: String(error) });
    } finally {
      setMigrating(false);
    }
  };

  // 页面加载时分析数据
  useState(() => {
    analyzeData();
  });

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

      <h1 className="text-3xl font-bold mb-6">{t.title}</h1>
      <p className="text-gray-600 mb-8">{t.description}</p>

      {stats && (
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h3 className="font-semibold mb-4">数据统计：</h3>
          <div className="space-y-2">
            <div>{t.ordersFound.replace('{count}', stats.orders.toString())}</div>
            <div>{t.tasksFound.replace('{count}', stats.tasks.toString())}</div>
            <div>{t.messagesFound.replace('{count}', stats.messages.toString())}</div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <button
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          onClick={handleMigrate}
          disabled={migrating}
        >
          {migrating ? t.migrating : t.migrate}
        </button>

        {result && (
          <div className={`p-4 rounded-lg ${
            result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {result.message}
          </div>
        )}

        <button
          className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300"
          onClick={() => router.push('/')}
        >
          {t.back}
        </button>
      </div>
    </div>
  );
} 