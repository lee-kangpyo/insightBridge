export default function LoginFooter() {
  return (
    <footer className="relative z-10 font-login-body text-[0.75rem] font-medium flex flex-col md:flex-row justify-center gap-4 md:gap-8 items-center w-full py-12 text-[#004282]">
      <span className="opacity-60">&copy; 2026 EZ Dashboard. All rights reserved.</span>
      <div className="flex gap-6">
        <a
          href="#"
          className="opacity-60 hover:opacity-100 hover:text-primary-container transition-all duration-300"
        >
          개인정보 처리방침
        </a>
        <a
          href="#"
          className="opacity-60 hover:opacity-100 hover:text-primary-container transition-all duration-300"
        >
          이용약관
        </a>
        <a
          href="#"
          className="opacity-60 hover:opacity-100 hover:text-primary-container transition-all duration-300"
        >
          접근성 안내
        </a>
        <a
          href="#"
          className="opacity-60 hover:opacity-100 hover:text-primary-container transition-all duration-300"
        >
          관리자 문의
        </a>
      </div>
    </footer>
  );
}
