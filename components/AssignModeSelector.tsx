import React from 'react';

type Props = {
  assignMode: 'slow' | 'balanced' | 'fast';
  setAssignMode: (m: 'slow' | 'balanced' | 'fast') => void;
  t: any;
};

export default function AssignModeSelector({ assignMode, setAssignMode, t }: Props) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <span className="font-bold" style={{ color: '#fff' }}>{t.mode}</span>
      <label style={{ marginLeft: 12, color: '#fff' }}>
        <input type="radio" name="assignMode" value="fast" checked={assignMode === 'fast'} onChange={() => setAssignMode('fast')} />
        <span style={{ marginLeft: 4 }}>{t.fast}</span>
      </label>
      <label style={{ marginLeft: 12, color: '#fff' }}>
        <input type="radio" name="assignMode" value="balanced" checked={assignMode === 'balanced'} onChange={() => setAssignMode('balanced')} />
        <span style={{ marginLeft: 4 }}>{t.balanced}</span>
      </label>
      <label style={{ marginLeft: 12, color: '#fff' }}>
        <input type="radio" name="assignMode" value="slow" checked={assignMode === 'slow'} onChange={() => setAssignMode('slow')} />
        <span style={{ marginLeft: 4 }}>{t.slow}</span>
      </label>
    </div>
  );
}


