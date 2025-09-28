// 导入fetch（Node.js环境兼容性）
const fetch = (...args: any[]) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// 多语言错误提示
const errorMessages = {
  zh: {
    aiNoUnderstand: (reply: string) => `AI无法理解您的需求：${reply.substring(0, 200)}...请提供更清晰、具体的项目目标，例如：'开发一个在线购物网站，包含用户注册、商品浏览、购物车、支付功能'`,
    aiDataFormatError: 'AI返回的任务数据格式有误，请重新尝试。如果问题持续出现，请尝试使用更具体的项目描述。',
    aiNotTaskData: (content: string) => `AI返回的不是任务数据，而是说明文字：${content.substring(0, 200)}...请提供更明确的项目目标。`,
    aiInvalidData: 'AI返回的任务数据无效，请尝试提供更详细的项目需求描述。',
    deepseekApiError: (status: number, error: string) => `DeepSeek API请求失败: ${status} - ${error}`,
    openaiApiError: (status: number, error: string) => `OpenAI API请求失败: ${status} - ${error}`,
    deepseekTimeout: 'DeepSeek API 请求超时，请稍后重试',
    openaiTimeout: 'OpenAI API 请求超时，请稍后重试',
    deepseekResponseError: 'DeepSeek API 响应格式错误',
    openaiResponseError: 'OpenAI API 响应格式错误',
  },
  en: {
    aiNoUnderstand: (reply: string) => `AI cannot understand your requirements: ${reply.substring(0, 200)}... Please provide clearer and more specific project goals, for example: 'Develop an online shopping website with user registration, product browsing, shopping cart, and payment functions'`,
    aiDataFormatError: 'The task data returned by AI is in the wrong format. Please try again. If the problem persists, try using more specific project descriptions.',
    aiNotTaskData: (content: string) => `AI returned explanatory text instead of task data: ${content.substring(0, 200)}... Please provide clearer project goals.`,
    aiInvalidData: 'The task data returned by AI is invalid. Please try providing more detailed project requirements.',
    deepseekApiError: (status: number, error: string) => `DeepSeek API request failed: ${status} - ${error}`,
    openaiApiError: (status: number, error: string) => `OpenAI API request failed: ${status} - ${error}`,
    deepseekTimeout: 'DeepSeek API request timeout, please try again later',
    openaiTimeout: 'OpenAI API request timeout, please try again later',
    deepseekResponseError: 'DeepSeek API response format error',
    openaiResponseError: 'OpenAI API response format error',
  }
};

export async function getTasksFromAI(goal: string, lang: 'zh' | 'en' = 'zh') {
  // 优先用 DeepSeek，其次用 OpenAI
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const t = errorMessages[lang];

  if (deepseekKey) {
    // DeepSeek API 调用
    try {
      if (process.env.NODE_ENV !== 'production') console.log("开始调用DeepSeek API，目标：", goal);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25秒超时
      
      const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${deepseekKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: `你是一个项目管理专家，请将用户的项目目标拆解成开发任务列表。输出格式要求：JSON 数组，每个对象包含 "title_zh"（任务名中文）、"title_en"（任务名英文）、"role_zh"（执行角色中文）、"role_en"（执行角色英文）、"estimated_hours"（预计工时，单位小时）。所有内容都要中英文双语输出。`,
            },
            {
              role: "user",
              content: goal,
            },
          ],
          temperature: 0,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(t.deepseekApiError(res.status, errorText));
      }
      const json = await res.json();
      const reply = json.choices?.[0]?.message?.content;
      if (!reply) throw new Error(t.deepseekResponseError);
      
      if (process.env.NODE_ENV !== 'production') console.log("DeepSeek AI 原始响应:", reply);
      
      // 检查AI是否返回了错误提示而不是任务数据
      const isErrorResponse = lang === 'zh' 
        ? (reply.includes("由于您没有提供") || reply.includes("请提供") || reply.includes("无法") || !reply.includes("["))
        : (reply.includes("I cannot") || reply.includes("I need more") || reply.includes("Please provide") || !reply.includes("["));
      
      if (isErrorResponse) {
        throw new Error(t.aiNoUnderstand(reply));
      }
      
      const cleaned = reply.replace(/```json|```/g, "").trim();
      
      // 尝试解析JSON，如果失败给出友好提示
      let tasks;
      try {
        tasks = JSON.parse(cleaned);
      } catch (parseError) {
        if (process.env.NODE_ENV !== 'production') console.log("JSON解析失败，原始内容:", cleaned);
        
        // 检查是否看起来像JSON但有格式错误
        if (cleaned.startsWith('[') || cleaned.startsWith('{')) {
          throw new Error(t.aiDataFormatError);
        } else {
          throw new Error(t.aiNotTaskData(cleaned));
        }
      }
      
      // 验证解析的数据结构
      if (!Array.isArray(tasks) || tasks.length === 0) {
        throw new Error(t.aiInvalidData);
      }
      // 自动拆分可拆分大任务为多个子环节
      const SPLIT_HOURS = 20; // 超过20小时的任务自动拆分
      const splittableRoles = ['前端工程师', '后端工程师', '测试工程师', '数据库工程师', '全栈工程师', 'DevOps工程师'];
      const newTasks = [];
      for (const t of tasks) {
        if (splittableRoles.includes(t.role_zh) && t.estimated_hours > SPLIT_HOURS) {
          let remain = t.estimated_hours;
          let part = 1;
          while (remain > 0) {
            const thisHours = Math.min(SPLIT_HOURS, remain);
            newTasks.push({
              ...t,
              title_zh: `${t.title_zh}-${part}`,
              title_en: `${t.title_en} - Part ${part}`,
              estimated_hours: thisHours,
              splittable: false
            });
            remain -= thisHours;
            part++;
          }
        } else {
          newTasks.push({ ...t, splittable: false });
        }
      }
      // 角色规范化：仅允许预设角色，按关键词映射，无法命中则归为“杂项专员”
      const ROLE_CATALOG = [
        { zh: '前端工程师', en: 'Frontend Engineer', keywords: ['前端', 'web', 'h5', '小程序', 'react', 'vue'] },
        { zh: '后端工程师', en: 'Backend Engineer', keywords: ['后端', '服务端', '接口', 'spring', 'java', 'node', 'go', 'python', '架构', '系统架构'] },
        { zh: 'UI设计师', en: 'UI Designer', keywords: ['ui', '视觉', '界面'] },
        { zh: 'UX设计师', en: 'UX Designer', keywords: ['ux', '交互', '体验', '用户研究', '用户体验'] },
        { zh: '测试工程师', en: 'Test Engineer', keywords: ['测试', 'qa', '质量', '质量保证'] },
        { zh: '数据库工程师', en: 'Database Engineer', keywords: ['数据库', 'dba', '数据表', '数据建模'] },
        { zh: '产品经理', en: 'Product Manager', keywords: ['产品经理', 'pm', '产品'] },
        { zh: 'DevOps工程师', en: 'DevOps Engineer', keywords: ['devops', '运维', '部署', 'ci/cd', '系统管理员'] },
        { zh: '全栈工程师', en: 'Full Stack Engineer', keywords: ['全栈'] },
      ];
      const FALLBACK = { zh: '杂项专员', en: 'General Specialist' };
      const normalizeRole = (raw?: string) => {
        const s = (raw || '').toLowerCase();
        for (const r of ROLE_CATALOG) {
          if (r.keywords.some(k => s.includes(k.toLowerCase()))) return r;
        }
        // 直接精确匹配（AI 已给标准名）
        const direct = ROLE_CATALOG.find(r => r.zh === raw || r.en.toLowerCase() === s);
        return direct || FALLBACK;
      };
      const normalized = newTasks.map((t: any) => {
        const r = normalizeRole(t.role_zh || t.role || '');
        return {
          ...t,
          role_zh: r.zh,
          role_en: r.en,
        };
      });
      return normalized;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(t.deepseekTimeout);
      }
      throw new Error(`DeepSeek AI任务拆解失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else if (openaiKey) {
    // OpenAI API 调用
    try {
      if (process.env.NODE_ENV !== 'production') console.log("开始调用OpenAI API，目标：", goal);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25秒超时
      
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `你是一个项目管理专家，请将用户的项目目标拆解成开发任务列表。输出格式要求：JSON 数组，每个对象包含 "title_zh"（任务名中文）、"title_en"（任务名英文）、"role_zh"（执行角色中文）、"role_en"（执行角色英文）、"estimated_hours"（预计工时，单位小时）。所有内容都要中英文双语输出。`,
            },
            {
              role: "user",
              content: goal,
            },
          ],
          temperature: 0,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(t.openaiApiError(res.status, errorText));
      }
      const json = await res.json();
      const reply = json.choices?.[0]?.message?.content;
      if (!reply) throw new Error(t.openaiResponseError);
      
      if (process.env.NODE_ENV !== 'production') console.log("OpenAI 原始响应:", reply);
      
      // 检查AI是否返回了错误提示而不是任务数据
      const isErrorResponse = lang === 'zh' 
        ? (reply.includes("由于您没有提供") || reply.includes("请提供") || reply.includes("无法") || !reply.includes("["))
        : (reply.includes("I cannot") || reply.includes("I need more") || reply.includes("Please provide") || !reply.includes("["));
      
      if (isErrorResponse) {
        throw new Error(t.aiNoUnderstand(reply));
      }
      
      const cleaned = reply.replace(/```json|```/g, "").trim();
      
      // 尝试解析JSON，如果失败给出友好提示
      let tasks;
      try {
        tasks = JSON.parse(cleaned);
      } catch (parseError) {
        if (process.env.NODE_ENV !== 'production') console.log("JSON解析失败，原始内容:", cleaned);
        
        // 检查是否看起来像JSON但有格式错误
        if (cleaned.startsWith('[') || cleaned.startsWith('{')) {
          throw new Error(t.aiDataFormatError);
        } else {
          throw new Error(t.aiNotTaskData(cleaned));
        }
      }
      
      // 验证解析的数据结构
      if (!Array.isArray(tasks) || tasks.length === 0) {
        throw new Error(t.aiInvalidData);
      }
      // 自动拆分可拆分大任务为多个子环节
      const SPLIT_HOURS = 20; // 超过20小时的任务自动拆分
      const splittableRoles = ['前端工程师', '后端工程师', '测试工程师', '数据库工程师', '全栈工程师', 'DevOps工程师'];
      const newTasks = [];
      for (const t of tasks) {
        if (splittableRoles.includes(t.role_zh) && t.estimated_hours > SPLIT_HOURS) {
          let remain = t.estimated_hours;
          let part = 1;
          while (remain > 0) {
            const thisHours = Math.min(SPLIT_HOURS, remain);
            newTasks.push({
              ...t,
              title_zh: `${t.title_zh}-${part}`,
              title_en: `${t.title_en} - Part ${part}`,
              estimated_hours: thisHours,
              splittable: false
            });
            remain -= thisHours;
            part++;
          }
        } else {
          newTasks.push({ ...t, splittable: false });
        }
      }
      // 同上进行角色规范化
      const ROLE_CATALOG = [
        { zh: '前端工程师', en: 'Frontend Engineer', keywords: ['前端', 'web', 'h5', '小程序', 'react', 'vue'] },
        { zh: '后端工程师', en: 'Backend Engineer', keywords: ['后端', '服务端', '接口', 'spring', 'java', 'node', 'go', 'python', '架构', '系统架构'] },
        { zh: 'UI设计师', en: 'UI Designer', keywords: ['ui', '视觉', '界面'] },
        { zh: 'UX设计师', en: 'UX Designer', keywords: ['ux', '交互', '体验', '用户研究', '用户体验'] },
        { zh: '测试工程师', en: 'Test Engineer', keywords: ['测试', 'qa', '质量', '质量保证'] },
        { zh: '数据库工程师', en: 'Database Engineer', keywords: ['数据库', 'dba', '数据表', '数据建模'] },
        { zh: '产品经理', en: 'Product Manager', keywords: ['产品经理', 'pm', '产品'] },
        { zh: 'DevOps工程师', en: 'DevOps Engineer', keywords: ['devops', '运维', '部署', 'ci/cd', '系统管理员'] },
        { zh: '全栈工程师', en: 'Full Stack Engineer', keywords: ['全栈'] },
      ];
      const FALLBACK = { zh: '杂项专员', en: 'General Specialist' };
      const normalizeRole = (raw?: string) => {
        const s = (raw || '').toLowerCase();
        for (const r of ROLE_CATALOG) {
          if (r.keywords.some(k => s.includes(k.toLowerCase()))) return r;
        }
        const direct = ROLE_CATALOG.find(r => r.zh === raw || r.en.toLowerCase() === s);
        return direct || FALLBACK;
      };
      const normalized = newTasks.map((t: any) => {
        const r = normalizeRole(t.role_zh || t.role || '');
        return {
          ...t,
          role_zh: r.zh,
          role_en: r.en,
        };
      });
      return normalized;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error(t.openaiTimeout);
      }
      throw new Error(`OpenAI AI任务拆解失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else {
    throw new Error("未检测到可用的 AI API Key，请在 .env.local 配置 DEEPSEEK_API_KEY 或 OPENAI_API_KEY");
  }
} 