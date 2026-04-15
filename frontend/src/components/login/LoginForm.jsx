import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const SHOW_CREDENTIAL_RECOVERY_LINK =
  (import.meta.env.VITE_SHOW_CREDENTIAL_RECOVERY_LINK ?? 'false') === 'true';
const REMEMBERED_EMAIL_KEY = 'remembered_email';

export default function LoginForm() {
  const [email, setEmail] = useState(() => localStorage.getItem(REMEMBERED_EMAIL_KEY) || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem(REMEMBERED_EMAIL_KEY));
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (rememberMe) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-sm mx-auto" noValidate>
      <div className="space-y-2">
        <label
          htmlFor="loginEmail"
          className="block text-[0.75rem] uppercase tracking-wider font-bold text-on-surface-variant px-4 font-login-body"
        >
          이메일 주소
        </label>
        <div className="relative">
          <input
            id="loginEmail"
            type="email"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 주소를 입력하세요"
            className="custom-input w-full h-12 px-6 pr-12 placeholder:text-outline-variant text-on-surface outline-none font-login-body"
            autoComplete="username"
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
            <span className="material-symbols-outlined text-[22px]">badge</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-[0.75rem] uppercase tracking-wider font-bold text-on-surface-variant px-4 font-login-body"
        >
          비밀번호
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="custom-input w-full h-12 px-6 pr-12 placeholder:text-outline-variant text-on-surface outline-none font-login-body"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 cursor-pointer hover:text-primary-container transition-colors"
            aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
          >
            <span className="material-symbols-outlined text-[22px]">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
      </div>

      <div
        className={`flex items-center py-1 px-1 gap-3 flex-wrap ${
          SHOW_CREDENTIAL_RECOVERY_LINK ? 'justify-between' : ''
        }`}
      >
        <label htmlFor="rememberMe" className="flex items-center gap-2.5 cursor-pointer group">
          <span className="relative flex items-center shrink-0">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="sr-only"
            />
            <span
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                rememberMe
                  ? 'bg-primary-container border-primary-container'
                  : 'border-outline-variant'
              }`}
            >
              <span
                className={`material-symbols-outlined text-white text-[16px] transition-transform ${
                  rememberMe ? 'scale-100' : 'scale-0'
                }`}
              >
                check
              </span>
            </span>
          </span>
          <span className="text-sm font-medium text-on-surface-variant group-hover:text-primary-container transition-colors font-login-body">
            이 기기에서 이메일 저장
          </span>
        </label>
        {SHOW_CREDENTIAL_RECOVERY_LINK ? (
          <a
            href="#"
            className="text-sm font-bold text-primary-container hover:underline transition-all font-login-body shrink-0"
          >
            자격 증명 찾기
          </a>
        ) : null}
      </div>

      {error && (
        <p className="text-red-500 text-sm text-center font-medium">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-14 bg-primary-container text-on-primary rounded-full font-login-headline font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary-container/25 hover:bg-[#00366b] active:scale-[0.98] transition-all border-0 cursor-pointer disabled:opacity-50"
      >
        로그인
        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
      </button>

      <p className="text-center text-sm text-on-surface-variant">
        계정이 없으신가요?{' '}
        <Link
          to="/signup"
          className="text-primary-container font-bold hover:underline"
        >
          회원가입
        </Link>
      </p>
    </form>
  );
}
