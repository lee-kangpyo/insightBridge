import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';

const step1Schema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요.')
    .email('유효한 이메일 형식이 아닙니다.')
    .refine(
      (val) => {
        const domain = val.split('@')[1] || '';
        return domain.includes('.ac.kr') || domain.includes('edu');
      },
      { message: '대학교 이메일 도메인이어야 합니다.' }
    ),
  verificationCode: z
    .string()
    .length(6, '인증번호는 6자리입니다.')
    .regex(/^\d+$/, '숫자만 입력 가능합니다.'),
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다.')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, '영문과 숫자를 포함해야 합니다.'),
  confirmation: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
}).refine(
  (data) => data.password === data.confirmation,
  { message: '비밀번호가 일치하지 않습니다.', path: ['confirmation'] }
);

export default function Step1Form({ initialData, verified: verifiedProp, onComplete }) {
  const [verified, setVerified] = useState(verifiedProp || false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [sendError, setSendError] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      email: initialData?.email || '',
      verificationCode: '',
      password: initialData?.password || '',
      confirmation: '',
    },
    mode: 'onChange',
  });

  const emailValue = watch('email');
  const passwordValue = watch('password');

  const handleSendVerification = async () => {
    if (!emailValue) {
      setSendError('이메일을 먼저 입력해주세요.');
      return;
    }
    setSendLoading(true);
    setSendError('');
    try {
      await api.post('/api/auth/send-verification', { email: emailValue });
      setVerificationSent(true);
    } catch (err) {
      setSendError(err.response?.data?.detail || '인증번호 전송에 실패했습니다.');
    } finally {
      setSendLoading(false);
    }
  };

  const handleVerifyCode = async (code) => {
    if (!code || code.length !== 6) return;
    setVerifyLoading(true);
    setVerifyError('');
    try {
      await api.post('/api/auth/verify-code', { email: emailValue, code });
      setVerified(true);
    } catch (err) {
      setVerifyError(err.response?.data?.detail || '인증번호가 일치하지 않습니다.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const onSubmit = (data) => {
    if (!verified) {
      setVerifyError('이메일 인증을 완료해주세요.');
      return;
    }
    onComplete({
      email: data.email,
      password: data.password,
      verified: true,
    });
  };

  const isFormValid =
    verified &&
    !errors.email &&
    !errors.password &&
    !errors.confirmation &&
    passwordValue?.length >= 8;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-sm mx-auto" noValidate>
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-[0.75rem] uppercase tracking-wider font-bold text-on-surface-variant px-4 font-login-body"
        >
          이메일 주소
        </label>
        <div className="relative">
          <input
            id="email"
            type="email"
            inputMode="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            {...register('email')}
            placeholder="대학교 이메일을 입력하세요"
            className="custom-input w-full h-12 px-6 pr-32 placeholder:text-outline-variant text-on-surface outline-none font-login-body"
            autoComplete="username"
            disabled={verified}
          />
          <button
            type="button"
            onClick={handleSendVerification}
            disabled={sendLoading || !emailValue || verified}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3 text-xs font-bold bg-primary-container text-on-primary rounded-lg hover:bg-[#00366b] active:scale-[0.98] transition-all border-0 cursor-pointer disabled:opacity-50"
          >
            {sendLoading ? '전송 중...' : verified ? '인증 완료' : '인증번호 요청'}
          </button>
        </div>
        {errors.email && (
          <p className="text-red-500 text-xs px-4 mt-1">{errors.email.message}</p>
        )}
        {sendError && (
          <p className="text-red-500 text-xs px-4 mt-1">{sendError}</p>
        )}
      </div>

      {verificationSent && !verified && (
        <div className="space-y-2">
          <label
            htmlFor="verificationCode"
            className="block text-[0.75rem] uppercase tracking-wider font-bold text-on-surface-variant px-4 font-login-body"
          >
            인증번호
          </label>
          <div className="relative">
            <input
              id="verificationCode"
              type="text"
              inputMode="numeric"
              maxLength={6}
              {...register('verificationCode')}
              placeholder="6자리 인증번호"
              className="custom-input w-full h-12 px-6 pr-24 placeholder:text-outline-variant text-on-surface outline-none font-login-body tracking-widest text-center"
            />
            <button
              type="button"
              onClick={() => handleVerifyCode(watch('verificationCode'))}
              disabled={verifyLoading || watch('verificationCode')?.length !== 6}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3 text-xs font-bold bg-surface-variant text-on-surface-variant rounded-lg hover:bg-outline-variant active:scale-[0.98] transition-all border-0 cursor-pointer disabled:opacity-50"
            >
              {verifyLoading ? '확인 중...' : '확인'}
            </button>
          </div>
          {errors.verificationCode && (
            <p className="text-red-500 text-xs px-4 mt-1">{errors.verificationCode.message}</p>
          )}
          {verifyError && (
            <p className="text-red-500 text-xs px-4 mt-1">{verifyError}</p>
          )}
          <p className="text-on-surface-variant text-xs px-4 mt-1">
            인증번호가 발송되었습니다. 이메일을 확인해주세요.
          </p>
        </div>
      )}

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
            {...register('password')}
            placeholder="8자 이상, 영문+숫자 포함"
            className="custom-input w-full h-12 px-6 pr-12 placeholder:text-outline-variant text-on-surface outline-none font-login-body"
            autoComplete="new-password"
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
        {errors.password && (
          <p className="text-red-500 text-xs px-4 mt-1">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirmation"
          className="block text-[0.75rem] uppercase tracking-wider font-bold text-on-surface-variant px-4 font-login-body"
        >
          비밀번호 확인
        </label>
        <div className="relative">
          <input
            id="confirmation"
            type={showConfirmation ? 'text' : 'password'}
            {...register('confirmation')}
            placeholder="비밀번호를 다시 입력하세요"
            className="custom-input w-full h-12 px-6 pr-12 placeholder:text-outline-variant text-on-surface outline-none font-login-body"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmation(!showConfirmation)}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 cursor-pointer hover:text-primary-container transition-colors"
            aria-label={showConfirmation ? '비밀번호 숨기기' : '비밀번호 표시'}
          >
            <span className="material-symbols-outlined text-[22px]">
              {showConfirmation ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
        {errors.confirmation && (
          <p className="text-red-500 text-xs px-4 mt-1">{errors.confirmation.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={!isFormValid || verifyLoading}
        className="w-full h-14 bg-primary-container text-on-primary rounded-full font-login-headline font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary-container/25 hover:bg-[#00366b] active:scale-[0.98] transition-all border-0 cursor-pointer disabled:opacity-50"
      >
        다음
        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
      </button>
    </form>
  );
}
