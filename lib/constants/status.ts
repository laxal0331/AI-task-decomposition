export const STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  TESTING: 'TESTING',
  COMPLETED: 'COMPLETED',
} as const;

export const statusTextToCode: { [key: string]: string } = {
  [STATUS.NOT_STARTED]: STATUS.NOT_STARTED,
  [STATUS.PENDING]: STATUS.PENDING,
  [STATUS.IN_PROGRESS]: STATUS.IN_PROGRESS,
  [STATUS.TESTING]: STATUS.TESTING,
  [STATUS.COMPLETED]: STATUS.COMPLETED,
  '未开始': STATUS.NOT_STARTED,
  '等待接受': STATUS.PENDING,
  '进行中': STATUS.IN_PROGRESS,
  '测试中': STATUS.TESTING,
  '已完成': STATUS.COMPLETED,
  'Not Started': STATUS.NOT_STARTED,
  'Pending Acceptance': STATUS.PENDING,
  'In Progress': STATUS.IN_PROGRESS,
  'Testing': STATUS.TESTING,
  'Completed': STATUS.COMPLETED,
};

export const statusColorMap: Record<string, string> = {
  '已取消': '#e11d48',
  '已交付': '#16a34a',
  '进行中': '#eab308',
  '未开始': '#888',
  'IN_PROGRESS': '#eab308',
  'CANCELLED': '#e11d48',
  'COMPLETED': '#16a34a',
  'NOT_STARTED': '#888',
  'DELIVERED': '#16a34a',
  'Cancelled': '#e11d48',
  'Delivered': '#16a34a',
  'In Progress': '#eab308',
  'Not Started': '#888',
  'Completed': '#16a34a',
};


