import { CONTENT_TYPE_MAP } from '../../constants/contentTypes';

/**
 * 컨텐츠 목록 테이블
 * - 퍼블리싱 디자인 기준: NO / 타입(pill) / 콘텐츠명 / 생성일시
 * - 선택된 행: bg-[#f1f4f7] 하이라이트
 */
export default function ContentsTable({ contents, selectedId, onSelect }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 shadow-ambient h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-headline text-[22px] font-bold text-[#003875]">콘텐츠 목록</h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#e5e8eb] font-label text-[13px] text-[#424750]">
              <th className="py-3 px-6 font-semibold w-16">NO</th>
              <th className="py-3 px-6 font-semibold w-28">타입</th>
              <th className="py-3 px-6 font-semibold">콘텐츠명</th>
              <th className="py-3 px-6 font-semibold w-36">생성일시</th>
            </tr>
          </thead>
          <tbody className="font-body text-[14px] text-on-surface divide-y divide-[#e0e3e6]">
            {contents.map((item, index) => {
              const typeInfo = CONTENT_TYPE_MAP[item.contentType] || CONTENT_TYPE_MAP.sql;
              const isActive = item.contentId === selectedId;
              const formattedDate = (item.createdAt || item.generatedAt)
                ? (item.createdAt || item.generatedAt).replace('T', '\n').slice(0, 16).replace('T', ' ')
                : '-';

              const cardColorDots =
                item?.contentType === 'card' && Array.isArray(item?.data?.items)
                  ? item.data.items
                      .map((it) => (typeof it?.color === 'string' ? it.color.trim() : ''))
                      .filter(Boolean)
                      .slice(0, 3)
                  : [];

              return (
                <tr
                  key={item.contentId}
                  onClick={() => onSelect(item.contentId)}
                  className={`cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-[#f1f4f7]'
                      : 'hover:bg-[#f1f4f7]'
                  }`}
                >
                  {/* NO */}
                  <td className="py-5 px-6 text-center text-on-surface-variant">
                    {index + 1}
                  </td>

                  {/* 타입 pill */}
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium leading-snug"
                        style={{
                          backgroundColor: typeInfo.bgColor,
                          color: typeInfo.textColor,
                        }}
                      >
                        {typeInfo.label}
                      </span>
                      {cardColorDots.length > 0 && (
                        <span className="inline-flex items-center gap-1.5" aria-label="카드 항목 색상">
                          {cardColorDots.map((c, i) => (
                            <span
                              key={`${c}-${i}`}
                              className="w-2.5 h-2.5 rounded-full border border-white shadow-sm"
                              style={{ backgroundColor: c }}
                              title={c}
                            />
                          ))}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 콘텐츠명 */}
                  <td
                    className={`py-5 px-6 leading-snug ${
                      isActive ? 'font-medium text-[#006492]' : 'text-on-surface'
                    }`}
                  >
                    {item.contentName}
                  </td>

                  {/* 생성일시 */}
                  <td className="py-5 px-6 text-on-surface-variant text-sm leading-snug whitespace-pre-line">
                    {formattedDate}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
