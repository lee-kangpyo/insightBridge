import DetailRow from './DetailRow';

const positionLabel = { 'left-top': '좌측 상단', center: '중앙', 'right-top': '우측 상단' };
const formatLabel = { raw: '원문', number: '숫자', percent: '퍼센트', currency: '통화' };

export default function CardDetail({ data, className, detailClassName, itemClassName }) {
  return (
    <div className={`flex flex-col gap-3${className ? ` ${className}` : ''}`}>
      <DetailRow label="카드 제목" value={data?.cardTitle} className={detailClassName} />
      <DetailRow label="제목 위치" value={positionLabel[data?.titlePosition]} className={detailClassName} />
      {data?.items?.length > 0 && (
        <div>
          <p className="font-label text-on-surface-variant text-[13px] mb-2">항목 목록</p>
          <div className="flex flex-col gap-2">
            {data.items.map((item, i) => (
              <div key={i} className={`bg-surface-container-lowest rounded-md p-3 text-sm flex items-center gap-3${itemClassName ? ` ${itemClassName}` : ''}`}>
                <span
                  className={`w-3 h-3 rounded-full shrink-0${!item.color ? ' bg-primary' : ''}`}
                  style={item.color ? { backgroundColor: item.color } : undefined}
                />
                <span className="text-on-surface-variant min-w-[80px]">{item.label || '-'}</span>
                <span className="text-on-surface font-medium">{item.content || '-'}</span>
                <span className="ml-auto text-xs text-on-surface-variant">
                  {formatLabel[item.format] || formatLabel.raw}
                  {item.format !== 'raw' && item.decimalPlaces !== undefined ? ` · 소수 ${item.decimalPlaces}` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}