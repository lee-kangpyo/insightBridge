export default function LoginHeader() {
  return (
    <header className="relative z-10 flex justify-between items-center w-full px-8 md:px-12 py-8 text-[#004282]">
      <div className="text-2xl font-login-headline font-bold tracking-tight text-primary-container">
        EZ Dashboard
      </div>
      <button
        type="button"
        className="hidden"
        aria-label="관리자 문의"
      >
        <span className="material-symbols-outlined text-[20px]">help_outline</span>
        관리자 문의
      </button>
    </header>
  );
}
