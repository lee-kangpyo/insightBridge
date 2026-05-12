import { useState, useEffect } from 'react';
import { CONTENT_TYPE_MAP } from '../../constants/contentTypes';
import { DetailRow, ChartDetail, GridDetail, CardDetail, SqlDetail } from '../content-detail';

/* ────────────── 읽기전용 필드 공통 컴포넌트 ────────────── */
function ReadField({ label, value, colSpan = 1, isTextarea = false }) {
  return (
    <div className={`space-y-2 ${colSpan === 2 ? 'col-span-2' : ''}`}>
      <label className="font-label text-[13px] text-[#424750] block">{label}</label>
      {isTextarea ? (
        <textarea
          readOnly
          value={value || ''}
          rows={4}
          className="w-full font-body text-sm text-on-surface bg-[#f1f4f7] p-3 rounded-md border-0 focus:ring-0 resize-none"
        />
      ) : (
        <div className="font-body text-sm text-on-surface bg-[#f1f4f7] p-3 rounded-md h-11 flex items-center">
          {value || '-'}
        </div>
      )}
    </div>
  );
}

/* ────────────── 아코디언 패널 ────────────── */
function AccordionPanel({ icon, title, isOpen, onToggle, children }) {
  return (
    <div className="bg-[#f1f4f7] rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <h3
          className={`font-headline text-[15px] font-bold flex items-center gap-2 ${
            isOpen ? 'text-[#006492]' : 'text-[#424750]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
          {title}
        </h3>
        <span className="material-symbols-outlined text-[18px] text-[#424750] transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          expand_more
        </span>
      </button>
      {isOpen && (
        <div className="px-5 pb-5">
          {children}
        </div>
      )}
    </div>
  );
}

/* ────────────── 메인 상세 컴포넌트 ────────────── */
export default function ContentsDetail({ content, onEdit, onDelete }) {
  const [openPanel, setOpenPanel] = useState(null);

  useEffect(() => {
    if (content) {
      setOpenPanel(content.contentType);
    }
  }, [content?.contentId]);

  if (!content) {
    return (
      <div className="bg-surface-container-lowest rounded-xl p-8 shadow-ambient h-full flex items-center justify-center">
        <p className="text-on-surface-variant text-sm">항목을 선택하세요</p>
      </div>
    );
  }

  const typeInfo = CONTENT_TYPE_MAP[content.contentType] || CONTENT_TYPE_MAP.sql;

  const panels = [
    {
      key: 'chart',
      icon: 'bar_chart',
      title: '차트정보상세',
      component: <ChartDetail data={content.data} />,
    },
    {
      key: 'grid',
      icon: 'grid_on',
      title: '그리드정보상세',
      component: <GridDetail data={content.data} columnItemClassName="bg-white" />,
    },
    {
      key: 'card',
      icon: 'space_dashboard',
      title: '카드정보상세',
      component: <CardDetail data={content.data} itemClassName="bg-white" />,
    },
    {
      key: 'sql',
      icon: 'database',
      title: 'SQL정보상세',
      component: <SqlDetail data={content.data} />,
    },
  ];

  const togglePanel = (key) => {
    setOpenPanel((prev) => (prev === key ? null : key));
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 shadow-ambient h-full flex flex-col overflow-y-auto">
      {/* 헤더 */}
      <div className="border-b border-[#e0e3e6] pb-6 mb-6 shrink-0 flex items-start justify-between gap-4">
        <h2 className="font-headline text-[22px] font-bold text-[#003875]">콘텐츠 상세 정보</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit?.(content)}
            className="inline-flex items-center gap-2 rounded-lg border border-outline bg-surface-container-lowest px-3.5 py-2 text-sm font-semibold text-on-surface shadow-sm hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            수정
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(content)}
            className="inline-flex items-center gap-2 rounded-lg border border-error/40 bg-error/10 px-3.5 py-2 text-sm font-semibold text-error shadow-sm hover:bg-error/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            삭제
          </button>
        </div>
      </div>

      {/* 일반정보 */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 shrink-0">
        <ReadField label="콘텐츠ID" value={content.contentId} />
        <ReadField
          label="타입"
          value={typeInfo.label}
        />
        <ReadField label="콘텐츠명" value={content.contentName} colSpan={2} />
        <ReadField label="제작자" value={content.creator} />
        <ReadField label="제작일시" value={content.createdAt?.replace('T', ' ')} />
        <ReadField label="삭제여부" value={content.isDeleted} />
        <ReadField label="생성일시" value={content.generatedAt?.replace('T', ' ')} />
        <ReadField label="기타메모" value={content.memo} colSpan={2} isTextarea />
      </div>

      {/* 타입별 상세 아코디언 */}
      <div className="pt-6 mt-6 border-t border-[#e0e3e6] flex flex-col gap-3">
        {panels.map((panel) => (
          <AccordionPanel
            key={panel.key}
            icon={panel.icon}
            title={panel.title}
            isOpen={openPanel === panel.key}
            onToggle={() => togglePanel(panel.key)}
          >
            {panel.component}
          </AccordionPanel>
        ))}
      </div>
    </div>
  );
}