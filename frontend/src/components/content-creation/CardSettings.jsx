export default function CardSettings({ value, onChange, visible, errors, showErrors }) {
  const handleChange = (field, fieldValue) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const handleItemChange = (index, field, fieldValue) => {
    const newItems = [...(value.items || [])];
    newItems[index] = { ...newItems[index], [field]: fieldValue };
    onChange({ ...value, items: newItems });
  };

  const addItem = () => {
    const newItems = [...(value.items || []), { label: '', content: '', color: '#002c5a' }];
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
            <label className="ds-label mb-0">카드 내용</label>
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
          {(value.items || []).map((item, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row gap-4 p-4 bg-surface-container-low rounded-lg border border-outline-variant/20 items-start md:items-end"
            >
              <div className="flex flex-col w-full">
                <label className="ds-label">라벨</label>
                <input
                  className="ds-input bg-surface-container-low text-on-surface border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none rounded-lg px-4 py-3 transition-all"
                  type="text"
                  value={item.label || ''}
                  onChange={(e) => handleItemChange(index, 'label', e.target.value)}
                  placeholder="라벨"
                />
                {showErrors && errors?.items?.[index]?.label ? (
                  <p className="mt-1 text-xs text-error">{errors.items[index].label}</p>
                ) : null}
              </div>
              <div className="flex flex-col w-full">
                <label className="ds-label">내용</label>
                <input
                  className="ds-input bg-surface-container-low text-on-surface border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none rounded-lg px-4 py-3 transition-all"
                  type="text"
                  value={item.content || ''}
                  onChange={(e) => handleItemChange(index, 'content', e.target.value)}
                  placeholder="내용"
                />
                {showErrors && errors?.items?.[index]?.content ? (
                  <p className="mt-1 text-xs text-error">{errors.items[index].content}</p>
                ) : null}
              </div>
              <div className="flex flex-col shrink-0">
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
                className="p-2.5 text-on-surface-variant hover:text-error transition-colors rounded-lg hover:bg-error-container/50 self-end mb-[2px]"
              >
                <span className="material-symbols-outlined text-xl">delete</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}