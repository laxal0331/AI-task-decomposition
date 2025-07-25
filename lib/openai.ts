export async function getTasksFromAI(goal: string) {
  // 优先用 DeepSeek，其次用 OpenAI
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (deepseekKey) {
    // DeepSeek API 调用
    try {
      console.log("开始调用DeepSeek API，目标：", goal);
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
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`DeepSeek API请求失败: ${res.status} - ${errorText}`);
      }
      const json = await res.json();
      const reply = json.choices?.[0]?.message?.content;
      if (!reply) throw new Error("DeepSeek API 响应格式错误");
      const cleaned = reply.replace(/```json|```/g, "").trim();
      let tasks = JSON.parse(cleaned);
      // 自动拆分可拆分大任务为多个子环节
      const SPLIT_HOURS = 20; // 超过20小时的任务自动拆分
      const splittableRoles = ['前端工程师', '后端工程师', '测试工程师', '数据库工程师', '全栈工程师', 'DevOps工程师'];
      let newTasks = [];
      let splitIdx = 1;
      for (let t of tasks) {
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
      return newTasks;
    } catch (err) {
      throw new Error(`DeepSeek AI任务拆解失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else if (openaiKey) {
    // OpenAI API 调用
    try {
      console.log("开始调用OpenAI API，目标：", goal);
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
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`OpenAI API请求失败: ${res.status} - ${errorText}`);
      }
      const json = await res.json();
      const reply = json.choices?.[0]?.message?.content;
      if (!reply) throw new Error("OpenAI API 响应格式错误");
      const cleaned = reply.replace(/```json|```/g, "").trim();
      let tasks = JSON.parse(cleaned);
      // 自动拆分可拆分大任务为多个子环节
      const SPLIT_HOURS = 20; // 超过20小时的任务自动拆分
      const splittableRoles = ['前端工程师', '后端工程师', '测试工程师', '数据库工程师', '全栈工程师', 'DevOps工程师'];
      let newTasks = [];
      let splitIdx = 1;
      for (let t of tasks) {
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
      return newTasks;
    } catch (err) {
      throw new Error(`OpenAI AI任务拆解失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else {
    throw new Error("未检测到可用的 AI API Key，请在 .env.local 配置 DEEPSEEK_API_KEY 或 OPENAI_API_KEY");
  }
} 