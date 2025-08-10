import { describe, it, expect } from 'vitest';
import { normalizeTask } from '../../lib/services/orderLoaders';

describe('normalizeTask', () => {
  it('别名映射为主流角色', () => {
    const t: any = { id: 'x', title_zh: '架构', role_zh: '架构师', estimated_hours: 8 };
    const nt = normalizeTask(t);
    expect(nt.role).toBe('后端工程师');
  });
});


