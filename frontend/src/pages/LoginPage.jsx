import LoginHeader from '../components/login/LoginHeader';
import LoginGlassPanel from '../components/login/LoginGlassPanel';
import LoginFooter from '../components/login/LoginFooter';

export default function LoginPage() {
  return (
    <div className="login-root font-login-body text-on-surface flex flex-col min-h-svh">
      <div className="login-bg-pattern academic-bg" aria-hidden />
      <div className="relative z-10 flex flex-col flex-1 min-h-svh">
        <LoginHeader />
        <main className="flex-1 flex items-center justify-center px-4 relative">
          <LoginGlassPanel />
        </main>
        <LoginFooter />
      </div>
    </div>
  );
}