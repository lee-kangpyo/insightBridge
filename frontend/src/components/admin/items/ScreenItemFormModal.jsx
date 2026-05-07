import { useState, useEffect, useCallback } from 'react';
import { createItem, executeSqlPreview, getItem, handleApiError, updateItem } from '../../../services/adminApi';
import api from '../../../services/api';
import { FormTab, SqlTab, MappingTab } from './ItemEditorTabs';

const TABS = [
  { id: 'form', label: '형태' },
  { id: 'sql', label: 'SQL' },
  { id: 'mapping', label: '맵핑' },
];

function buildMappingPayload(mappingJson, contentType) {
  if (!mappingJson || typeof mappingJson !== 'object') return null;
  const next = { ...mappingJson };
  if (!next.type && contentType && ['chart', 'grid', 'card'].includes(contentType)) {
    next.type = contentType;
  }
  if (!next.type) return null;
  return next;
}

function validateMappingPayload(mappingPayload) {
  if (!mappingPayload || typeof mappingPayload !== 'object') return '';
  const type = mappingPayload.type;
  const mapping = mappingPayload.mapping;
  if (!type || !mapping || typeof mapping !== 'object') return '';

  if (type === 'card') {
    const hasValue = typeof mapping.value === 'string' && mapping.value.trim() !== '';
    const hasItems =
      (Array.isArray(mapping.items) && mapping.items.some((it) => it && typeof it.field === 'string' && it.field.trim())) ||
      (mapping.items &&
        typeof mapping.items === 'object' &&
        Object.values(mapping.items).some((it) => it && typeof it.field === 'string' && it.field.trim()));
    if (!hasValue && !hasItems) {
      return "카드 매핑 저장 실패: 'value' 또는 'items.field'를 1개 이상 설정해야 합니다.";
    }
  }

  return '';
}

export default function ScreenItemFormModal({ isOpen, mode, editItemId, onClose, onSaved }) {
  const [activeTab, setActiveTab] = useState('form');
  const [itemName, setItemName] = useState('');
  const [selectedCnts, setSelectedCnts] = useState(null);
  const [selectedSql, setSelectedSql] = useState(null);
  const [mappingJson, setMappingJson] = useState({});
  const [contentDetail, setContentDetail] = useState(null);
  const [sqlPreviewData, setSqlPreviewData] = useState(null);
  const [sqlPreviewLoading, setSqlPreviewLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const isMappingEnabled = selectedCnts && selectedSql;
  const resetMapping = useCallback(() => {
    // 문서 기준: 형태/SQL 변경 시 매핑 즉시 초기화(데이터 오염 방지)
    setMappingJson({ type: '', mapping: {} });
  }, []);

  useEffect(() => {
    // 신규 등록 시: 선택한 형태 정보에 맞춰 mapping_json 최소 스키마를 자동 보정한다.
    // 주의: SQL/형태 변경 시 resetMapping()이 실행되어 mapping_json이 비워질 수 있으므로,
    // selectedSql/selectedCnts 변경에도 다시 보정되게 한다.
    if (!isOpen) return;
    if (mode !== 'create') return;
    if (!contentDetail?.contentType) return;

    const ct = contentDetail.contentType;
    if (!['chart', 'grid', 'card'].includes(ct)) return;

    setMappingJson((prev) => {
      const base = prev && typeof prev === 'object' ? prev : {};
      let changed = false;
      const next = { ...base };

      if (!next.type) {
        next.type = ct;
        changed = true;
      }
      if (!next.mapping || typeof next.mapping !== 'object') {
        next.mapping = {};
        changed = true;
      }

      if (ct === 'chart') {
        if (!next.chartType) {
          const fromShape = contentDetail?.data?.chartType;
          next.chartType = typeof fromShape === 'string' && fromShape.trim() ? fromShape : 'bar';
          changed = true;
        }
        if (typeof next.mapping.categoryField !== 'string') {
          next.mapping.categoryField = '';
          changed = true;
        }
        if (!next.mapping.series || typeof next.mapping.series !== 'object') {
          next.mapping.series = {};
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [isOpen, mode, contentDetail, selectedCnts?.cnts_id, selectedSql?.cnts_id]);

  useEffect(() => {
    if (!isOpen) return;
    if (!selectedCnts || !selectedSql) return;

    // 요약 카드(Summary Card, contentType === 'card')일 때만 미리보기 결과를 기본 로드합니다.
    const contentType = contentDetail?.contentType || selectedCnts?.contentType;
    if (contentType !== 'card') return;

    if (sqlPreviewLoading) return;

    if (sqlPreviewData && (Array.isArray(sqlPreviewData?.rows) || Array.isArray(sqlPreviewData?.columns))) {
      return;
    }

    let cancelled = false;
    (async () => {
      setSqlPreviewLoading(true);
      setError(null);
      try {
        const data = await executeSqlPreview(selectedSql.cnts_id);
        if (cancelled) return;
        setSqlPreviewData(data);
      } catch (e) {
        if (!cancelled) setError(handleApiError(e, 'SQL 미리보기를 불러오지 못했습니다.'));
      } finally {
        if (!cancelled) setSqlPreviewLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  // NOTE:
  // - sqlPreviewLoading을 dependency에 포함하면 setSqlPreviewLoading(true) 직후 effect가 재실행되면서
  //   이전 async의 cleanup이 실행되어 cancelled=true가 될 수 있습니다.
  // - 로딩 중 상태 변화는 여기의 fetch 취소 사유가 아니므로 dependency에서 제외합니다.
  }, [isOpen, activeTab, contentDetail?.contentType, selectedCnts?.cnts_id, selectedSql?.cnts_id, sqlPreviewData]);

  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setActiveTab('form');
    setContentDetail(null);
    setSqlPreviewData(null);
    setSqlPreviewLoading(false);

    if (mode === 'create') {
      setItemName('');
      setSelectedCnts(null);
      setSelectedSql(null);
      setMappingJson({});
      return;
    }

    if (!editItemId) return;

    let cancelled = false;
    (async () => {
      setLoadingEdit(true);
      try {
        const row = await getItem(editItemId);
        if (cancelled) return;
        setItemName(row.item_nm || '');
        const mj = row.mapping_json;
        setMappingJson(mj && typeof mj === 'object' ? mj : {});

        let cnts = null;
        let sql = null;
        if (row.shape_cnts_id) {
          const { data } = await api.get(`/api/admin/contents/${row.shape_cnts_id}`);
          const c = data.content;
          cnts = {
            cnts_id: c.cnts_id,
            contentName: c.contentName,
            contentType: c.contentType,
          };
        }
        if (row.sql_cnts_id) {
          const { data } = await api.get(`/api/admin/contents/${row.sql_cnts_id}`);
          const c = data.content;
          sql = {
            cnts_id: c.cnts_id,
            contentName: c.contentName,
            contentType: c.contentType,
          };
        }
        if (!cancelled) {
          setSelectedCnts(cnts);
          setSelectedSql(sql);
        }
      } catch (e) {
        if (!cancelled) setError(handleApiError(e, '아이템을 불러오지 못했습니다.'));
      } finally {
        if (!cancelled) setLoadingEdit(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, mode, editItemId]);

  const handleSave = useCallback(async () => {
    if (!itemName.trim()) {
      setError('아이템 이름을 입력해주세요.');
      return;
    }

    const mappingPayload = buildMappingPayload(mappingJson, selectedCnts?.contentType);
    const mappingValidationError = validateMappingPayload(mappingPayload);
    if (mappingValidationError) {
      setError(mappingValidationError);
      return;
    }

    const payload = {
      item_nm: itemName.trim(),
      shape_cnts_id: selectedCnts?.cnts_id ?? null,
      sql_cnts_id: selectedSql?.cnts_id ?? null,
      mapping_json: mappingPayload,
    };

    setSaving(true);
    setError(null);
    try {
      if (mode === 'create') {
        await createItem(payload);
      } else {
        await updateItem(editItemId, payload);
      }
      onSaved?.();
      onClose?.();
    } catch (err) {
      setError(handleApiError(err, '저장 중 오류가 발생했습니다.'));
    } finally {
      setSaving(false);
    }
  }, [itemName, selectedCnts, selectedSql, mappingJson, mode, editItemId, onSaved, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface rounded-xl shadow-lg w-full max-w-[1100px] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline/20">
          <h2 className="text-lg font-semibold text-on-surface">
            {mode === 'create' ? '아이템 등록' : `아이템 수정 (#${editItemId})`}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-4 border-b border-outline/20">
          <label className="block text-sm font-medium text-on-surface-variant mb-1">아이템 이름</label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            disabled={loadingEdit}
            className="w-full max-w-md px-3 py-2 text-sm bg-surface-container rounded-lg border border-outline focus:outline-none focus:border-primary disabled:opacity-60"
            placeholder="표시 이름"
          />
        </div>

        <div className="flex border-b border-outline/20">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (tab.id === 'mapping' && !isMappingEnabled) return;
                setActiveTab(tab.id);
                setError(null);
              }}
              disabled={tab.id === 'mapping' && !isMappingEnabled}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              } ${tab.id === 'mapping' && !isMappingEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto p-6 min-h-[240px]">
          {loadingEdit && (
            <div className="text-center py-12 text-on-surface-variant text-sm">불러오는 중...</div>
          )}
          {!loadingEdit && error && (
            <div className="mb-4 p-3 bg-error-container text-error rounded-lg text-sm">{error}</div>
          )}
          {!loadingEdit && activeTab === 'form' && (
            <FormTab
              selectedCnts={selectedCnts}
              onSelectCnts={(cnts) => {
                setSelectedCnts(cnts);
                resetMapping();
              }}
              onContentDetailChange={setContentDetail}
            />
          )}
          {!loadingEdit && activeTab === 'sql' && (
            <SqlTab
              selectedSql={selectedSql}
              onSelectSql={(sql) => {
                setSelectedSql(sql);
                setSqlPreviewData(null);
                resetMapping();
              }}
              onPreviewDataChange={setSqlPreviewData}
            />
          )}
          {!loadingEdit && activeTab === 'mapping' && isMappingEnabled && (
            <MappingTab
              selectedCnts={selectedCnts}
              selectedSql={selectedSql}
              contentDetail={contentDetail}
              sqlPreviewData={sqlPreviewData}
              mappingJson={mappingJson}
              onMappingJsonChange={setMappingJson}
            />
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-outline/20">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-on-surface-variant bg-surface-container rounded-lg border border-outline hover:bg-surface-container-high transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loadingEdit}
            className="px-4 py-2 text-sm font-medium text-on-primary bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
