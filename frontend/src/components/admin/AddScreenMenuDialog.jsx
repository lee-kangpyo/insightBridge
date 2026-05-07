import { useState, useEffect } from "react";
import Modal from "../common/Modal";
import ScreenPreviewModal from "./ScreenPreviewModal";

export default function AddScreenMenuDialog({
  open,
  screens,
  loading,
  saving,
  error,
  onClose,
  onSubmit,
}) {
  const [selectedScrId, setSelectedScrId] = useState("");
  const [previewScrId, setPreviewScrId] = useState(null);

  useEffect(() => {
    if (open) setSelectedScrId("");
  }, [open]);

  const selectedScreen = screens.find((s) => s.scr_id === selectedScrId);

  const footer = (
    <div className="flex flex-col sm:flex-row gap-3 justify-end">
      <button
        type="button"
        className="h-11 px-4 rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-colors font-medium"
        onClick={() => onClose()}
        disabled={saving}
      >
        취소
      </button>
      <button
        type="button"
        className={`h-11 px-5 rounded-lg text-on-primary font-semibold transition-colors inline-flex items-center justify-center gap-2 ${
          saving || !selectedScrId
            ? "bg-primary/60 cursor-not-allowed"
            : "bg-primary hover:bg-primary/90"
        }`}
        onClick={() => onSubmit(selectedScrId)}
        disabled={saving || !selectedScrId}
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
        {saving ? "추가 중…" : "메뉴 추가"}
      </button>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={open}
        onClose={() => onClose()}
        title="슬롯 화면 추가"
        description="연동할 슬롯 화면을 선택하면 메뉴가 자동 생성됩니다. 이미 다른 메뉴에서 사용 중인 화면도 선택할 수 있습니다."
        variant="form"
        size="xl"
        footer={footer}
      >
        {error && (
          <div className="mb-4 p-3 bg-error/10 border border-error rounded-lg text-error text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-0 border border-outline-variant/40 rounded-xl overflow-hidden h-[480px]">
          {/* Left: Screen List */}
          <div className="w-full sm:w-[320px] shrink-0 flex flex-col border-b sm:border-b-0 sm:border-r border-outline-variant/40 bg-surface-container-lowest">
            <div className="px-4 py-3 border-b border-outline-variant/20 text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              화면 목록 ({screens.length})
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto">
              {loading ? (
                <p className="text-sm text-on-surface-variant py-4 px-4">불러오는 중…</p>
              ) : screens.length === 0 ? (
                <p className="text-sm text-on-surface-variant py-4 px-4">
                  사용 가능한 슬롯 화면이 없습니다.
                </p>
              ) : (
                screens.map((screen) => (
                  <button
                    key={screen.scr_id}
                    type="button"
                    onClick={() => setSelectedScrId(screen.scr_id)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-b border-outline-variant/10 last:border-0 ${
                      selectedScrId === screen.scr_id
                        ? "bg-primary-container/20 text-primary"
                        : "hover:bg-surface-container-high text-on-surface"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                      dashboard
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{screen.scr_nm}</div>
                      <div className="text-[11px] text-on-surface-variant truncate">
                        {screen.template_nm || '템플릿 미지정'} · 연동 {screen.linked_menu_cnt ?? 0}개
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right: Detail Panel */}
          <div className="flex-1 min-w-0 bg-surface-container-lowest flex flex-col">
            {selectedScreen ? (
              <div className="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col gap-5">
                <div>
                  <h3 className="text-lg font-headline font-bold text-primary mb-1">
                    {selectedScreen.scr_nm}
                  </h3>
                  <p className="text-xs font-mono text-on-surface-variant">
                    {selectedScreen.scr_id}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-container-low rounded-lg p-3 flex flex-col gap-1">
                    <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">
                      템플릿
                    </span>
                    <span className="text-sm font-semibold text-on-surface">
                      {selectedScreen.template_nm || '미지정'}
                    </span>
                  </div>
                  <div className="bg-surface-container-low rounded-lg p-3 flex flex-col gap-1">
                    <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">
                      사용 슬롯
                    </span>
                    <span className="text-sm font-semibold text-on-surface">
                      {selectedScreen.used_slot_cnt ?? 0}개
                    </span>
                  </div>
                </div>

                <div className="bg-surface-container-low rounded-lg p-3 flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">
                    연동 메뉴 ({selectedScreen.linked_menu_cnt ?? 0}개)
                  </span>
                  {selectedScreen.linked_menus && selectedScreen.linked_menus.length > 0 ? (
                    <ul className="flex flex-col gap-1">
                      {selectedScreen.linked_menus.map((menuNm, idx) => (
                        <li key={`${menuNm}-${idx}`} className="text-sm text-on-surface flex items-center gap-2">
                          <span className="material-symbols-outlined text-[14px] text-on-surface-variant">menu</span>
                          {menuNm}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-on-surface-variant">연동된 메뉴가 없습니다.</p>
                  )}
                </div>

                <div className="bg-surface-container-low rounded-lg p-3 flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">
                    자동 생성 정보
                  </span>
                  <div className="text-sm text-on-surface">
                    <div>경로: <code className="text-primary font-mono">/view/menu/&lt;menu_id&gt;</code> (자동 생성)</div>
                    <div>화면 ID: <code className="text-primary font-mono">{selectedScreen.scr_id}</code></div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewScrId(selectedScreen.scr_id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-secondary bg-secondary-container/30 rounded-lg hover:bg-secondary-container/50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    미리보기
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-on-surface-variant text-sm">
                왼쪽에서 화면을 선택하세요
              </div>
            )}
          </div>
        </div>
      </Modal>

      <ScreenPreviewModal
        isOpen={!!previewScrId}
        onClose={() => setPreviewScrId(null)}
        scrId={previewScrId}
      />
    </>
  );
}
