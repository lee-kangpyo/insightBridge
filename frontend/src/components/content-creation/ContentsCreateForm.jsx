import { useEffect, useMemo, useState } from 'react';
import GeneralInfoSection from './GeneralInfoSection';
import ChartSettings from './ChartSettings';
import GridSettings from './GridSettings';
import CardSettings from './CardSettings';
import SqlSettings from './SqlSettings';
import { createAdminContents, patchAdminContents } from '../../services/adminApi';

const INITIAL_GENERAL_INFO = {
  contentId: '',
  contentName: '',
  creator: '',
  createdAt: '',
  isDeleted: 'N',
  generatedAt: '',
  memo: '',
};

const INITIAL_CHART_DATA = {
  chartTitle: '',
  chartTitlePosition: 'top',
  chartType: 'bar',
  xAxis: '',
  yAxis: '',
  legendPosition: 'right',
};

const INITIAL_GRID_DATA = { sectionTitle: '', columns: [] };
const INITIAL_CARD_DATA = {
  cardTitle: '',
  titlePosition: 'left-top',
  items: [{ label: '', content: '', color: '#002c5a' }],
};
const INITIAL_SQL_DATA = { sql: '' };

function normalizeInitialContent(content) {
  if (!content) return null;
  return {
    generalInfo: {
      contentId: content.contentId ?? '',
      cnts_id: content.cnts_id ?? null,
      contentName: content.contentName ?? '',
      creator: content.creator ?? '',
      createdAt: content.createdAt ?? '',
      isDeleted: content.isDeleted ?? 'N',
      generatedAt: content.generatedAt ?? '',
      memo: content.memo ?? '',
    },
    contentType: content.contentType ?? 'chart',
    data: content.data ?? {},
  };
}

export default function ContentsCreateForm({
  mode = 'create',
  initialContent = null,
  onSaved,
  onCancel,
}) {
  const [generalInfo, setGeneralInfo] = useState(INITIAL_GENERAL_INFO);
  const [contentType, setContentType] = useState('chart');
  const [chartData, setChartData] = useState(INITIAL_CHART_DATA);
  const [gridData, setGridData] = useState(INITIAL_GRID_DATA);
  const [cardData, setCardData] = useState(INITIAL_CARD_DATA);
  const [sqlData, setSqlData] = useState(INITIAL_SQL_DATA);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const normalized = useMemo(() => normalizeInitialContent(initialContent), [initialContent]);

  useEffect(() => {
    if (mode !== 'edit') return;
    if (!normalized) return;

    setGeneralInfo(normalized.generalInfo);
    setContentType(normalized.contentType);

    // 타입별 초기값 주입(없는 필드는 기존 초기값으로 fallback)
    const data = normalized.data || {};
    setChartData({ ...INITIAL_CHART_DATA, ...(normalized.contentType === 'chart' ? data : {}) });
    setGridData({ ...INITIAL_GRID_DATA, ...(normalized.contentType === 'grid' ? data : {}) });
    setCardData({ ...INITIAL_CARD_DATA, ...(normalized.contentType === 'card' ? data : {}) });
    setSqlData({ ...INITIAL_SQL_DATA, ...(normalized.contentType === 'sql' ? data : {}) });
  }, [mode, normalized]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3000);
  };

  const activeData = useMemo(() => {
    return (
      (contentType === 'chart' && chartData) ||
      (contentType === 'grid' && gridData) ||
      (contentType === 'card' && cardData) ||
      (contentType === 'sql' && sqlData) ||
      {}
    );
  }, [contentType, chartData, gridData, cardData, sqlData]);

  const resetAll = () => {
    setGeneralInfo(INITIAL_GENERAL_INFO);
    setContentType('chart');
    setChartData(INITIAL_CHART_DATA);
    setGridData(INITIAL_GRID_DATA);
    setCardData(INITIAL_CARD_DATA);
    setSqlData(INITIAL_SQL_DATA);
  };

  const handleSave = async () => {
    const payload = {
      contentName: generalInfo.contentName,
      creator: generalInfo.creator,
      memo: generalInfo.memo,
      contentType,
      data: activeData,
    };

    setSaving(true);
    try {
      if (mode === 'edit') {
        const id = normalized?.generalInfo?.cnts_id;
        if (id === null || id === undefined) throw new Error('컨텐츠 수정: cnts_id가 없습니다.');
        const res = await patchAdminContents(id, payload);
        showToast('수정되었습니다.');
        onSaved?.(res);
      } else {
        const res = await createAdminContents(payload);
        showToast('저장되었습니다.');
        resetAll();
        onSaved?.(res);
      }
    } catch (err) {
      console.error('컨텐츠 저장 실패:', err);
      const msg = err?.response?.data?.detail || '저장에 실패했습니다.';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (mode !== 'edit') resetAll();
    onCancel?.();
  };

  return (
    <div>
      <div className="flex flex-col gap-8">
        <GeneralInfoSection
          value={generalInfo}
          onChange={setGeneralInfo}
          contentType={contentType}
          onContentTypeChange={setContentType}
        />
        <ChartSettings value={chartData} onChange={setChartData} visible={contentType === 'chart'} />
        <GridSettings value={gridData} onChange={setGridData} visible={contentType === 'grid'} />
        <CardSettings value={cardData} onChange={setCardData} visible={contentType === 'card'} />
        <SqlSettings value={sqlData} onChange={setSqlData} visible={contentType === 'sql'} />
      </div>

      <div className="sticky bottom-0 -mx-6 -mb-6 mt-6 flex items-center justify-end gap-3 border-t border-outline-variant bg-surface-container-lowest px-6 py-4">
        <button
          type="button"
          onClick={handleCancel}
          className="flex items-center gap-2 px-4 py-2.5 text-on-surface-variant font-medium rounded-lg hover:bg-surface-container-high transition-all"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-medium rounded-lg hover:bg-primary/90 shadow-sm transition-all disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-lg">check</span>
          {saving ? (mode === 'edit' ? '수정 중...' : '저장 중...') : mode === 'edit' ? '수정' : '저장'}
        </button>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[120] px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-[expandIn_0.3s_ease-out] ${
            toast.type === 'error'
              ? 'bg-error text-on-error'
              : toast.type === 'info'
                ? 'bg-secondary-container text-on-secondary-container'
                : 'bg-tertiary-fixed text-on-tertiary-fixed'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {toast.type === 'error' ? 'error' : toast.type === 'info' ? 'info' : 'check_circle'}
          </span>
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

