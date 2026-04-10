import { useContext, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function useUniversityContext() {
  const { user } = useAuth();

  const result = useMemo(() => {
    const univNm = user?.univ_nm;
    const ready = Boolean(user && univNm && univNm.trim() !== '');

    return {
      schlNm: ready ? univNm : null,
      ready,
    };
  }, [user]);

  return result;
}
