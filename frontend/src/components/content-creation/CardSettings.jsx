import { CARD_FORMATS, DEFAULT_CARD_ITEM } from '../../constants/cardFormatting';

function formatDefaults(format) {
  if (format === 'number') {
    return { format, decimalPlaces: 0, thousandSeparator: true, percentBase: '0to100', prefix: '', suffix: '' };
  }
  if (format === 'percent') {
    return { format, decimalPlaces: 1, thousandSeparator: true, percentBase: '0to100', prefix: '', suffix: '%' };
  }
  if (format === 'currency') {
    return { format, decimalPlaces: 0, thousandSeparator: true, percentBase: '0to100', prefix: '₩', suffix: '' };
  }
  return { format: 'raw', decimalPlaces: 0, thousandSeparator: false, percentBase: '0to100', prefix: '', suffix: '' };
}

function normalizeCardItem(item) {
  return {
    ...DEFAULT_CARD_ITEM,
    ...(item || {}),
    format: CARD_FORMATS.some((f) => f.value === item?.format) ? item.format : 'raw',
    decimalPlaces:
      item?.decimalPlaces === null || item?.decimalPlaces === undefined || item?.decimalPlaces === ''
        ? 0
        : Number(item.decimalPlaces),
    thousandSeparator: item?.thousandSeparator === undefined ? true : Boolean(item.thousandSeparator),
    nullDisplay: item?.nullDisplay === undefined || item?.nullDisplay === null ? '-' : item.nullDisplay,
  };
}

export default function CardSettings({ value, onChange, visible, errors, showErrors }) {
  const handleChange = (field, fieldValue) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const handleItemChange = (index, field, fieldValue) => {
    const newItems = [...(value.items || [])];
    newItems[index] = { ...newItems[index], [field]: fieldValue };
    onChange({ ...value, items: newItems });
  };

  const handleItemFormatChange = (index, format) => {
    const newItems = [...(value.items || [])];
    newItems[index] = {
      ...normalizeCardItem(newItems[index]),
      ...formatDefaults(format),
    };
    onChange({ ...value, items: newItems });
  };

  const addItem = () => {
    const newItems = [...(value.items || []), { ...DEFAULT_CARD_ITEM }];
    onChange({ ...value, items: newItems });
  };

  const removeItem = (index) => {
    const newItems = value.items.filter((_, i) => i !== index);
    onChange({ ...value, items: newItems });
  };

  if (!visible) return null;

  const hasItemsError = showErrors ? errors?.hasItems : '';
  const cardTitleError = showErrors ? errors?.cardTitle : '';
  const titlePositionError = showErrors ? errors?.titlePosition : '';

  return (
    <section className="bg-surface-container-lowest rounded-xl p-8 shadow-ambient flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between border-b border-surface-container-high pb-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary">space_dashboard</span>
          <h2 className="font-headline text-xl font-bold text-primary">카드 설정</h2>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="ds-label">카드 제목</label>
            <input
              className="ds-input bg-surface-container-low text-on-surface border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none rounded-lg px-4 py-3 transition-all"
              type="text"
              value={value.cardTitle || ''}
              onChange={(e) => handleChange('cardTitle', e.target.value)}
              placeholder="카드 제목을 입력하세요"
            />
            {cardTitleError ? (
              <p className="mt-1 text-xs text-error">{cardTitleError}</p>
            ) : null}
          </div>
          <div className="flex flex-col">
            <label className="ds-label">제목 위치</label>
            <select
              className="ds-input bg-surface-container-low text-on-surface border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none rounded-lg px-4 py-3 transition-all cursor-pointer appearance-none"
              value={value.titlePosition || 'left-top'}
              onChange={(e) => handleChange('titlePosition', e.target.value)}
            >
              <option value="left-top">좌측 상단</option>
              <option value="center">중앙</option>
              <option value="right-top">우측 상단</option>
            </select>
            {titlePositionError ? (
              <p className="mt-1 text-xs text-error">{titlePositionError}</p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <label className="ds-label mb-0">카드 항목</label>
            <button
              type="button"
              onClick={addItem}
              className="text-xs flex items-center gap-1 text-secondary hover:text-primary transition-colors font-medium"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              항목 추가
            </button>
          </div>
          {hasItemsError ? (
            <p className="text-xs text-error">{hasItemsError}</p>
          ) : null}
          {(value.items || []).map((rawItem, index) => {
            const item = normalizeCardItem(rawItem);
            const itemErrors = showErrors ? errors?.items?.[index] : null;

            return (
            <div
              key={index}
              className="flex flex-col gap-4 p-4 bg-surface-container-low rounded-lg border border-outline-variant/20"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="flex flex-col md:col-span-3">
                  <label className="ds-label">라벨</label>
                  <input
                    className="ds-input bg-surface-container-low text-on-surface border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none rounded-lg px-4 py-3 transition-all"
                    type="text"
                    value={item.label || ''}
                    onChange={(e) => handleItemChange(index, 'label', e.target.value)}
                    placeholder="라벨"
                  />
                  {itemErrors?.label ? (
                    <p className="mt-1 text-xs text-error">{itemErrors.label}</p>
                  ) : null}
                </div>
                <div className="flex flex-col md:col-span-3">
                  <label className="ds-label">데이터 키</label>
                  <input
                    className="ds-input bg-surface-container-low text-on-surface border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none rounded-lg px-4 py-3 transition-all"
                    type="text"
                    value={item.content || ''}
                    onChange={(e) => handleItemChange(index, 'content', e.target.value)}
                    placeholder="예: admission_rate"
                  />
                  {itemErrors?.content ? (
                    <p className="mt-1 text-xs text-error">{itemErrors.content}</p>
                  ) : null}
                </div>
                <div className="flex flex-col md:col-span-2">
                  <label className="ds-label">포맷</label>
                  <select
                    className="ds-input bg-surface-container-low text-on-surface border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none rounded-lg px-4 py-3 transition-all cursor-pointer"
                    value={item.format}
                    onChange={(e) => handleItemFormatChange(index, e.target.value)}
                  >
                    {CARD_FORMATS.map((format) => (
                      <option key={format.value} value={format.value}>
                        {format.label}
                      </option>
                    ))}
                  </select>
                  {itemErrors?.format ? (
                    <p className="mt-1 text-xs text-error">{itemErrors.format}</p>
                  ) : null}
                </div>
                <div className="flex flex-col md:col-span-2">
                  <label className="ds-label">NULL 표시</label>
                  <input
                    className="ds-input bg-surface-container-low text-on-surface border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none rounded-lg px-4 py-3 transition-all"
                    type="text"
                    value={item.nullDisplay}
                    onChange={(e) => handleItemChange(index, 'nullDisplay', e.target.value)}
                    placeholder="-"
                  />
                </div>
                <div className="flex flex-col md:col-span-1">
                  <label className="ds-label">색상</label>
                  <div className="flex items-center h-[48px] gap-2">
                    <input
                      type="color"
                      id={`color-${index}`}
                      value={item.color || '#002c5a'}
                      onChange={(e) => handleItemChange(index, 'color', e.target.value)}
                      className="w-10 h-10 rounded border border-outline-variant cursor-pointer"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-2.5 text-on-surface-variant hover:text-error transition-colors rounded-lg hover:bg-error-container/50 md:col-span-1 justify-self-start md:justify-self-end"
                >
                  <span className="material-symbols-outlined text-xl">delete</span>
                </button>
              </div>

              {item.format !== 'raw' && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 rounded-lg bg-surface-container-lowest/60 p-3 border border-outline-variant/20">
                  <div className="flex flex-col">
                    <label className="ds-label">소수점</label>
                    <input
                      className="ds-input bg-surface-container-low text-on-surface border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none rounded-lg px-4 py-3 transition-all"
                      type="number"
                      min="0"
                      max="6"
                      value={Number.isFinite(item.decimalPlaces) ? item.decimalPlaces : 0}
                      onChange={(e) => handleItemChange(index, 'decimalPlaces', e.target.value)}
                    />
                    {itemErrors?.decimalPlaces ? (
                      <p className="mt-1 text-xs text-error">{itemErrors.decimalPlaces}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-col">
                    <label className="ds-label">천단위</label>
                    <select
                      className="ds-input bg-surface-container-low text-on-surface border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none rounded-lg px-4 py-3 transition-all cursor-pointer"
                      value={item.thousandSeparator ? 'Y' : 'N'}
                      onChange={(e) => handleItemChange(index, 'thousandSeparator', e.target.value === 'Y')}
                    >
                      <option value="Y">사용</option>
                      <option value="N">미사용</option>
                    </select>
                  </div>
                  {item.format === 'percent' && (
                    <div className="flex flex-col">
                      <label className="ds-label">퍼센트 기준</label>
                      <select
                        className="ds-input bg-surface-container-low text-on-surface border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none rounded-lg px-4 py-3 transition-all cursor-pointer"
                        value={item.percentBase || '0to100'}
                        onChange={(e) => handleItemChange(index, 'percentBase', e.target.value)}
                      >
                        <option value="0to100">0~100 값</option>
                        <option value="0to1">0~1 비율</option>
                      </select>
                      {itemErrors?.percentBase ? (
                        <p className="mt-1 text-xs text-error">{itemErrors.percentBase}</p>
                      ) : null}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <label className="ds-label">접두어</label>
                    <input
                      className="ds-input bg-surface-container-low text-on-surface border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none rounded-lg px-4 py-3 transition-all"
                      type="text"
                      value={item.prefix || ''}
                      onChange={(e) => handleItemChange(index, 'prefix', e.target.value)}
                      placeholder="예: ₩"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="ds-label">접미어</label>
                    <input
                      className="ds-input bg-surface-container-low text-on-surface border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none rounded-lg px-4 py-3 transition-all"
                      type="text"
                      value={item.suffix || ''}
                      onChange={(e) => handleItemChange(index, 'suffix', e.target.value)}
                      placeholder="예: %"
                    />
                  </div>
                </div>
              )}
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}