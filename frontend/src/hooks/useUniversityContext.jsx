import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

const STATUS_CHIP_LABELS = [
  { key: 'schl_tp', label: '학교종류' },
  { key: 'estb_gb', label: '설립구분' },
  { key: 'region', label: '지역' },
  { key: 'stts', label: '상태' },
];

export function useUniversityContext() {
  const { user } = useAuth();

  const result = useMemo(() => {
    const univNm = user?.univ_nm;
    const ready = Boolean(user && univNm && univNm.trim() !== '');
    const chips = user?.institution_chips;

    const statusChips = chips
      ? STATUS_CHIP_LABELS.map(({ key, label }) => ({
          label,
          value: chips[key] || '-',
        }))
      : [];

    return {
      schlNm: ready ? univNm : null,
      ready,
      statusChips,
    };
  }, [user]);

  return result;
}
