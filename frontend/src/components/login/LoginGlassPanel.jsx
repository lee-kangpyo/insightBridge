import LoginForm from './LoginForm';

export default function LoginGlassPanel() {
  return (
    <div className="w-full max-w-md">
      <div className="glass-panel rounded-3xl shadow-2xl shadow-primary-container/5 p-10 lg:p-14 border border-white">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary-container/20">
            <span
              className="material-symbols-outlined text-white text-4xl"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
            >
              account_balance
            </span>
          </div>
          <h1 className="font-login-headline text-2xl font-bold text-primary-container tracking-tight text-center">
            관리자 로그인
          </h1>
          <p className="text-on-surface-variant text-sm mt-3 text-center font-medium">
            기관 인증 정보를 입력하십시오.
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
