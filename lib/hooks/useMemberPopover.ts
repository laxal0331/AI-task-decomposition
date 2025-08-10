import { useCallback } from 'react';

export function useMemberPopover(
  setSelectedMember: (m: any) => void,
  setPopupPos: (pos: { x: number; y: number } | null) => void,
  setPopupTaskIdx: (i: number | null) => void,
) {
  const handleMemberClick = useCallback((e: React.MouseEvent, member: any, taskIndex: number) => {
    const mouseX = (e as any).clientX;
    const mouseY = (e as any).clientY;
    const popupWidth = 240;
    const popupHeight = 180;

    let x = mouseX + 10;
    let y = mouseY - 20;
    if (typeof window !== 'undefined') {
      if (x + popupWidth > window.innerWidth) x = mouseX - popupWidth - 10;
      if (y + popupHeight > window.innerHeight) y = mouseY - popupHeight + 20;
      x = Math.max(10, Math.min(x, window.innerWidth - popupWidth - 10));
      y = Math.max(10, Math.min(y, window.innerHeight - popupHeight - 10));
    }

    setSelectedMember(member);
    setPopupPos({ x, y });
    setPopupTaskIdx(taskIndex);
  }, [setSelectedMember, setPopupPos, setPopupTaskIdx]);

  return { handleMemberClick };
}


