import DetailRow from './DetailRow';

const chartTypeLabel = {
  bar: '세로 막대형',
  stacked_bar: '누적 막대형',
  line: '꺾은선형',
  pie: '원형 (파이)',
  scatter: '산점도',
};
const legendLabel = { top: '상단', right: '우측', bottom: '하단', hidden: '숨김' };
const positionLabel = { top: '상단', bottom: '하단', left: '좌측', right: '우측' };

export default function ChartDetail({ data, className, detailClassName }) {
  return (
    <div className={`flex flex-col${className ? ` ${className}` : ''}`}>
      <DetailRow label="차트 제목" value={data?.chartTitle} className={detailClassName} />
      <DetailRow label="제목 위치" value={positionLabel[data?.chartTitlePosition]} className={detailClassName} />
      <DetailRow label="차트 유형" value={chartTypeLabel[data?.chartType]} className={detailClassName} />
      <DetailRow label="X축 컬럼명" value={data?.xAxis} className={detailClassName} />
      <DetailRow label="Y축 컬럼명" value={data?.yAxis} className={detailClassName} />
      <DetailRow label="범례 위치" value={legendLabel[data?.legendPosition]} className={detailClassName} />
    </div>
  );
}