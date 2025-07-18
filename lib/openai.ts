export async function getTasksFromAI(goal: string) {
  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
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

  const json = await res.json();
  console.log("DeepSeek 原始响应：", JSON.stringify(json));

  try {
    const reply = json.choices?.[0]?.message?.content;
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
            splittable: false // 拆分后的子任务不可再拆分
          });
          remain -= thisHours;
          part++;
        }
      } else {
        newTasks.push({ ...t, splittable: false }); // 其它任务默认不可再拆分
      }
    }
    return newTasks;
  } catch (err) {
    console.error("解析 GPT 返回内容失败", err);
    return [];
  }
} 