import { useState } from 'react';
import { RefreshCw, Send, X } from 'lucide-react';

export function RefineBar({ onRefine, isLoading = false, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = feedback.trim();
    if (!trimmed) return;
    onRefine?.(trimmed);
    setFeedback('');
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setFeedback('');
    }
  };

  if (!isOpen) {
    return (
      <div className="mt-4 flex justify-start">
        <button
          onClick={() => setIsOpen(true)}
          disabled={disabled || isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface-variant border border-outline rounded-lg
                     hover:border-primary hover:text-primary transition-all duration-200
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          {isLoading ? '조회 중...' : '다른 방법 시도'}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="예: 재학생수를 다른 테이블에서 찾아봐"
          autoFocus
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 text-sm bg-surface-container-lowest border border-outline rounded-lg
                     text-on-surface placeholder:text-on-surface-variant
                     focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                     disabled:opacity-50 transition-all duration-200"
        />
        <button
          type="submit"
          disabled={!feedback.trim() || isLoading}
          className="p-2.5 rounded-lg bg-primary text-on-primary
                     hover:bg-primary-fixed-dim disabled:opacity-40 disabled:cursor-not-allowed
                     transition-all duration-200"
        >
          <Send size={16} />
        </button>
        <button
          type="button"
          onClick={() => { setIsOpen(false); setFeedback(''); }}
          className="p-2.5 rounded-lg border border-outline text-on-surface-variant
                     hover:border-primary hover:text-primary transition-all duration-200"
        >
          <X size={16} />
        </button>
      </form>
      <p className="mt-1.5 text-xs text-on-surface-variant">
        Enter 또는 전송 버튼으로 제출 · Esc로 취소
      </p>
    </div>
  );
}

export default RefineBar;
