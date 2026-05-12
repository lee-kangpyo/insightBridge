export default function GridSettings({ value, onChange, visible, errors, showErrors }) {
  const handleChange = (field, fieldValue) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const handleColumnChange = (index, field, fieldValue) => {
    const newColumns = [...value.columns];
    newColumns[index] = { ...newColumns[index], [field]: fieldValue };
    onChange({ ...value, columns: newColumns });
  };

  const addColumn = () => {
    const newColumns = [...value.columns, { displayName: '', dataKey: '', alignment: 'left' }];
    onChange({ ...value, columns: newColumns });
  };

  const removeColumn = (index) => {
    const newColumns = value.columns.filter((_, i) => i !== index);
    onChange({ ...value, columns: newColumns });
  };

  if (!visible) return null;

  const hasColumnsError = showErrors ? errors?.hasColumns : '';
  const sectionTitleError = showErrors ? errors?.sectionTitle : '';

  return (
    <section className="bg-surface-container-lowest rounded-xl p-8 shadow-ambient flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between border-b border-surface-container-high pb-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary">grid_on</span>
          <h2 className="font-headline text-xl font-bold text-primary">그리드 설정</h2>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col">
          <label className="ds-label">섹션 제목</label>
          <input
            className="ds-input bg-surface-container-low text-on-surface border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none rounded-lg px-4 py-3 transition-all"
            type="text"
            value={value.sectionTitle}
            onChange={(e) => handleChange('sectionTitle', e.target.value)}
            placeholder="그리드 섹션 제목을 입력하세요"
          />
          {sectionTitleError ? (
            <p className="mt-1 text-xs text-error">{sectionTitleError}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <label className="ds-label mb-0">컬럼 설정</label>
            <button
              type="button"
              onClick={addColumn}
              className="text-xs flex items-center gap-1 text-secondary hover:text-primary transition-colors font-medium"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              컬럼 추가
            </button>
          </div>
          {hasColumnsError ? (
            <p className="text-xs text-error">{hasColumnsError}</p>
          ) : null}
          {value.columns.map((column, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row gap-4 p-4 bg-surface-container-low rounded-lg border border-outline-variant/20 items-start md:items-end"
            >
              <div className="flex flex-col w-full">
                <label className="ds-label">컬럼 표시명</label>
                <input
                  className="ds-input bg-surface-container-low text-on-surface border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none rounded-lg px-4 py-3 transition-all"
                  type="text"
                  value={column.displayName}
                  onChange={(e) => handleColumnChange(index, 'displayName', e.target.value)}
                  placeholder="예: 학과명"
                />
                {showErrors && errors?.columns?.[index]?.displayName ? (
                  <p className="mt-1 text-xs text-error">{errors.columns[index].displayName}</p>
                ) : null}
              </div>
              <div className="flex flex-col w-full">
                <label className="ds-label">데이터 키</label>
                <input
                  className="ds-input bg-surface-container-low text-on-surface border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none rounded-lg px-4 py-3 transition-all"
                  type="text"
                  value={column.dataKey}
                  onChange={(e) => handleColumnChange(index, 'dataKey', e.target.value)}
                  placeholder="예: department_nm"
                />
                {showErrors && errors?.columns?.[index]?.dataKey ? (
                  <p className="mt-1 text-xs text-error">{errors.columns[index].dataKey}</p>
                ) : null}
              </div>
              <div className="flex flex-col w-full">
                <label className="ds-label">정렬</label>
                <select
                  className="ds-input bg-surface-container-low text-on-surface border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none rounded-lg px-4 py-3 transition-all cursor-pointer appearance-none"
                  value={column.alignment}
                  onChange={(e) => handleColumnChange(index, 'alignment', e.target.value)}
                >
                  <option value="left">좌측 정렬</option>
                  <option value="center">중앙 정렬</option>
                  <option value="right">우측 정렬</option>
                </select>
              </div>
              <div className="flex flex-col shrink-0">
                <label className="ds-label">금액</label>
                <div className="flex items-center h-[48px]">
                  <input
                    type="checkbox"
                    id={`isAmount-${index}`}
                    checked={column.isAmount || false}
                    onChange={(e) => handleColumnChange(index, 'isAmount', e.target.checked)}
                    className="w-5 h-5 rounded border-outline-variant text-secondary focus:ring-2 focus:ring-secondary/20 cursor-pointer"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeColumn(index)}
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