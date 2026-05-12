export default function GeneralInfoSection({ value, onChange, contentType, onContentTypeChange, errors, showErrors }) {
  const handleChange = (field, fieldValue) => {
    onChange({ ...value, [field]: fieldValue });
  };

  const e = showErrors ? errors?.generalInfo : null;
  const contentNameError = e?.contentName || '';
  const creatorError = e?.creator || '';
  const createdAtError = e?.createdAt || '';
  const isDeletedError = e?.isDeleted || '';
  const generatedAtError = e?.generatedAt || '';

  return (
    <section className="bg-surface-container-lowest rounded-xl p-8 shadow-ambient flex flex-col gap-6 w-full">
      <div className="flex items-center gap-3 border-b border-surface-container-high pb-4">
        <span className="material-symbols-outlined text-secondary">info</span>
        <h2 className="font-headline text-xl font-bold text-primary">일반 정보</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div className="flex flex-col">
          <label className="ds-label">컨텐츠 ID</label>
          <input
            className="ds-input bg-surface-container-low text-on-surface border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none rounded-lg px-4 py-3 transition-all"
            type="text"
            value={value.contentId || ''}
            onChange={(e) => handleChange('contentId', e.target.value)}
            placeholder="자동 생성"
            readOnly={!value.isNew}
          />
        </div>
        <div className="flex flex-col">
          <label className="ds-label">컨텐츠 타입</label>
          <select
            className="ds-input bg-surface-container-low text-on-surface border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none rounded-lg px-4 py-3 transition-all cursor-pointer appearance-none"
            value={contentType}
            onChange={(e) => onContentTypeChange(e.target.value)}
          >
            <option value="chart">데이터 차트 (Chart)</option>
            <option value="grid">데이터 그리드 (Grid)</option>
            <option value="card">요약 카드 (Summary Card)</option>
            <option value="sql">SQL 쿼리 (SQL)</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="ds-label">컨텐츠명</label>
          <input
            className="ds-input bg-surface-container-low text-on-surface border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none rounded-lg px-4 py-3 transition-all"
            type="text"
            value={value.contentName || ''}
            onChange={(e) => handleChange('contentName', e.target.value)}
            placeholder="컨텐츠명을 입력하세요"
          />
          {contentNameError ? (
            <p className="mt-1 text-xs text-error">{contentNameError}</p>
          ) : null}
        </div>
        <div className="flex flex-col">
          <label className="ds-label">제작자</label>
          <input
            className="ds-input bg-surface-container-low text-on-surface border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none rounded-lg px-4 py-3 transition-all"
            type="text"
            value={value.creator || ''}
            onChange={(e) => handleChange('creator', e.target.value)}
            placeholder="제작자"
          />
          {creatorError ? (
            <p className="mt-1 text-xs text-error">{creatorError}</p>
          ) : null}
        </div>
        <div className="flex flex-col">
          <label className="ds-label">제작일시</label>
          <input
            className="ds-input bg-surface-container-low text-on-surface border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none rounded-lg px-4 py-3 transition-all"
            type="datetime-local"
            value={value.createdAt || ''}
            onChange={(e) => handleChange('createdAt', e.target.value)}
          />
          {createdAtError ? (
            <p className="mt-1 text-xs text-error">{createdAtError}</p>
          ) : null}
        </div>
        <div className="flex flex-col">
          <label className="ds-label">삭제여부</label>
          <select
            className="ds-input bg-surface-container-low text-on-surface border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none rounded-lg px-4 py-3 transition-all cursor-pointer appearance-none"
            value={value.isDeleted || 'N'}
            onChange={(e) => handleChange('isDeleted', e.target.value)}
          >
            <option value="N">사용</option>
            <option value="Y">삭제</option>
          </select>
          {isDeletedError ? (
            <p className="mt-1 text-xs text-error">{isDeletedError}</p>
          ) : null}
        </div>
        <div className="flex flex-col">
          <label className="ds-label">생성일시</label>
          <input
            className="ds-input bg-surface-container-low text-on-surface border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none rounded-lg px-4 py-3 transition-all"
            type="datetime-local"
            value={value.generatedAt || ''}
            onChange={(e) => handleChange('generatedAt', e.target.value)}
          />
          {generatedAtError ? (
            <p className="mt-1 text-xs text-error">{generatedAtError}</p>
          ) : null}
        </div>
        <div className="flex flex-col md:col-span-2">
          <label className="ds-label">기타메모</label>
          <textarea
            className="ds-input bg-surface-container-low text-on-surface border border-outline-variant focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none rounded-lg px-4 py-3 transition-all resize-none min-h-[100px]"
            value={value.memo || ''}
            onChange={(e) => handleChange('memo', e.target.value)}
            placeholder="기타 메모"
          />
        </div>
      </div>
    </section>
  );
}