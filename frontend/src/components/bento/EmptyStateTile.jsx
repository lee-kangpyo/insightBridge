import { Link2, ArrowLeft } from 'lucide-react';

export function EmptyStateTile({ message = '표시할 데이터가 없습니다', subtext }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[320px] p-8 bg-surface-container-low rounded-xl">
      <div className="relative mb-8">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="drop-shadow-sm">
          <rect x="20" y="30" width="80" height="60" rx="8" fill="#002c5a" opacity="0.1" />
          <rect x="30" y="40" width="40" height="8" rx="4" fill="#002c5a" opacity="0.3" />
          <rect x="30" y="54" width="60" height="6" rx="3" fill="#002c5a" opacity="0.2" />
          <rect x="30" y="66" width="50" height="6" rx="3" fill="#002c5a" opacity="0.2" />
          <circle cx="85" cy="75" r="15" fill="#002c5a" opacity="0.15" />
          <path d="M80 75L88 83" stroke="#002c5a" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        </svg>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
          <Link2 size={18} className="text-on-primary-container" />
        </div>
      </div>
      <h3 className="text-lg font-headline font-semibold text-on-surface mb-2">{message}</h3>
      {subtext && <p className="text-sm text-on-surface-variant text-center max-w-xs">{subtext}</p>}
      <div className="mt-6 flex items-center gap-2 text-xs text-on-surface-variant">
        <ArrowLeft size={12} />
        <span>쿼리를 수정하거나 다른 질문을 시도해 보세요</span>
      </div>
    </div>
  );
}

export function EmptyStateSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[320px] p-8 bg-surface-container-low rounded-xl animate-pulse">
      <div className="w-28 h-28 bg-surface-container-high rounded-xl mb-8" />
      <div className="w-48 h-5 bg-surface-container-high rounded mb-3" />
      <div className="w-64 h-3 bg-surface-container-high rounded" />
    </div>
  );
}

export default EmptyStateTile;