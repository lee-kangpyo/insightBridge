import React, { useEffect, useId, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';

type CloseReason = 'overlay' | 'escape' | 'close_button';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ModalVariant = 'dialog' | 'form';

export interface ModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  /**
   * 프로젝트 공통 규격(권장)
   * - dialog: 짧은 설정/확인 모달
   * - form: 긴 입력 폼/에디터 모달
   */
  variant?: ModalVariant;
  /** variant를 무시하고 수동으로 조정해야 할 때만 사용(권장 X) */
  size?: ModalSize;
  onClose: (reason?: CloseReason) => void;
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
  zIndexClassName?: string; // e.g. "z-[110]"
}

const SIZE_CLASS: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-[1100px]',
  full: 'max-w-[min(96vw,1400px)]',
};

const VARIANT_PRESET: Record<ModalVariant, { size: ModalSize }> = {
  dialog: { size: 'sm' },
  form: { size: 'xl' },
};

function pickScrollLockTarget(): HTMLElement {
  const main = document.querySelector('main');
  if (!main) return document.body;
  const style = window.getComputedStyle(main);
  const overflowY = style.overflowY;
  if (overflowY === 'auto' || overflowY === 'scroll') return main as HTMLElement;
  return document.body;
}

function getFocusableElements(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];
  const nodes = Array.from(root.querySelectorAll<HTMLElement>(selectors.join(',')));
  return nodes.filter((el) => {
    const style = window.getComputedStyle(el);
    const isHidden = style.display === 'none' || style.visibility === 'hidden';
    return !isHidden && el.offsetParent !== null;
  });
}

export default function Modal({
  isOpen,
  title,
  description,
  variant = 'dialog',
  size,
  onClose,
  closeOnOverlay = true,
  closeOnEscape = true,
  showCloseButton = true,
  footer,
  children,
  zIndexClassName = 'z-[110]',
}: ModalProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  const labelledBy = useMemo(() => titleId, [titleId]);
  const describedBy = useMemo(() => (description ? descId : undefined), [description, descId]);
  const preset = VARIANT_PRESET[variant];
  const resolvedSize: ModalSize = size ?? preset.size;

  useEffect(() => {
    if (!isOpen) return undefined;

    lastActiveElementRef.current = (document.activeElement as HTMLElement) ?? null;

    const scrollLockTarget = pickScrollLockTarget();
    const prevOverflow = scrollLockTarget.style.overflow;
    scrollLockTarget.style.overflow = 'hidden';

    const panel = panelRef.current;
    const focusables = getFocusableElements(panel);
    const initial = focusables[0] ?? panel;
    window.setTimeout(() => initial?.focus?.(), 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        e.preventDefault();
        onClose('escape');
        return;
      }
      if (e.key !== 'Tab') return;

      const panelEl = panelRef.current;
      if (!panelEl) return;

      const items = getFocusableElements(panelEl);
      if (items.length === 0) {
        e.preventDefault();
        panelEl.focus();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && (active === first || active === panelEl)) {
        e.preventDefault();
        last.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      scrollLockTarget.style.overflow = prevOverflow;
      lastActiveElementRef.current?.focus?.();
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const modal = (
    <div className={`fixed inset-0 ${zIndexClassName} flex items-center justify-center p-4`}>
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => {
          if (closeOnOverlay) onClose('overlay');
        }}
        aria-hidden
      />

      {/* 패널 자체가 스크롤 컨테이너: 헤더/푸터 위에서도 휠 스크롤이 자연스럽게 동작 */}
      <div
        ref={panelRef}
        className={[
          'relative w-full',
          SIZE_CLASS[resolvedSize],
          'max-h-[calc(100vh-2rem)]',
          'overflow-y-auto',
          'rounded-xl border border-outline-variant bg-surface-container-lowest shadow-xl outline-none',
        ].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-outline-variant bg-surface-container-lowest px-6 py-4">
          <div className="min-w-0">
            <h2 id={labelledBy} className="font-headline text-base font-semibold text-on-surface">
              {title}
            </h2>
            {description ? (
              <p id={descId} className="mt-0.5 text-xs text-on-surface-variant">
                {description}
              </p>
            ) : null}
          </div>

          {showCloseButton ? (
            <button
              type="button"
              onClick={() => onClose('close_button')}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="닫기"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>

        <div className="px-6 py-6">{children}</div>

        {footer ? (
          <div className="sticky bottom-0 z-10 border-t border-outline-variant bg-surface-container-low px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

