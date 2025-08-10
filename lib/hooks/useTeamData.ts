import { useCallback } from 'react';
import { getMembers } from '../api/members';
import { getLocalStorage } from '../utils/storage';

export function useTeamDataHelpers() {
  const fetchMembersSafe = useCallback(async () => {
    try {
      const data = await getMembers();
      return data.members || [];
    } catch (e) {
      const savedMembers = JSON.parse(getLocalStorage('teamMembers') || '[]');
      return savedMembers;
    }
  }, []);

  return { fetchMembersSafe };
}


