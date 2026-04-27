import DetailRow from './DetailRow';

export default function GridDetail({ data, className, detailClassName, columnItemClassName }) {
  return (
    <div className={`flex flex-col gap-3${className ? ` ${className}` : ''}`}>
      <DetailRow label="섹션 제목" value={data?.sectionTitle} className={detailClassName} />
      {data?.columns?.length > 0 && (
        <div>
          <p className="font-label text-on-surface-variant text-[13px] mb-2">컬럼 설정</p>
          <div className="flex flex-col gap-2">
            {data.columns.map((col, i) => (
              <div key={i} className={`bg-surface-container-lowest rounded-md p-3 text-sm flex flex-col gap-1${columnItemClassName ? ` ${columnItemClassName}` : ''}`}>
                <div className="flex gap-2">
                  <span className="text-on-surface-variant min-w-[60px]">표시명</span>
                  <span className="text-on-surface font-medium">{col.displayName || '-'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-on-surface-variant min-w-[60px]">데이터키</span>
                  <span className="text-on-surface font-mono text-xs">{col.dataKey || '-'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-on-surface-variant min-w-[60px]">정렬</span>
                  <span className="text-on-surface">
                    {{ left: '좌측', center: '중앙', right: '우측' }[col.alignment] || '-'}
                    {col.isAmount ? ' · 금액' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}