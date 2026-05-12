export default function Toast({ toast, onClose }) {
  if (!toast) return null;
  const tone =
    toast.type === "error"
      ? "bg-error text-on-error"
      : toast.type === "info"
        ? "bg-surface-container text-on-surface"
        : "bg-tertiary-fixed text-on-tertiary-fixed";
  const icon =
    toast.type === "error"
      ? "error"
      : toast.type === "info"
        ? "info"
        : "check_circle";

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 ${tone} px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-[expandIn_0.3s_ease-out]`}
      role="status"
      aria-live="polite"
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
      <span className="font-medium">{toast.message}</span>
      <button
        type="button"
        className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-on-surface/30"
        onClick={onClose}
        aria-label="알림 닫기"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
}
