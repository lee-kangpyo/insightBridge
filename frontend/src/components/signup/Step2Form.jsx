import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const MOBILE_CARRIERS = [
  { value: 'SKT', label: 'SKT' },
  { value: 'KT', label: 'KT' },
  { value: 'LG', label: 'LG U+' },
  { value: 'SKT_AL', label: '알뜰폰(SKT)' },
  { value: 'KT_AL', label: '알뜰폰(KT)' },
  { value: 'LG_AL', label: '알뜰폰(LG)' },
];

const step2Schema = z.object({
  name: z.string().min(1, '이름을 입력해주세요.'),
  mobile_co_cd: z.string().min(1, '통신사를 선택해주세요.'),
  phone: z
    .string()
    .min(1, '휴대전화 번호를 입력해주세요.')
    .regex(/^010-\d{3,4}-\d{4}$/, '010-XXXX-XXXX 형식으로 입력해주세요.'),
});

export default function Step2Form({ initialData, onComplete, onBack }) {
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      name: initialData?.name || '',
      mobile_co_cd: initialData?.mobile_co_cd || '',
      phone: initialData?.phone || '',
    },
  });

  const watchPhone = watch('phone', '');

  const onSubmit = (data) => {
    setError('');
    try {
      onComplete(data);
    } catch (err) {
      setError(err.response?.data?.detail || '오류가 발생했습니다.');
    }
  };

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    if (digits.length === 10) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-sm mx-auto" noValidate>
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="block text-[0.75rem] uppercase tracking-wider font-bold text-on-surface-variant px-4 font-login-body"
        >
          성명
        </label>
        <input
          id="name"
          type="text"
          {...register('name')}
          placeholder="이름을 입력하세요"
          className="custom-input w-full h-12 px-6 placeholder:text-outline-variant text-on-surface outline-none font-login-body"
        />
        {errors.name && (
          <p className="text-red-500 text-xs px-4">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="mobile_co_cd"
          className="block text-[0.75rem] uppercase tracking-wider font-bold text-on-surface-variant px-4 font-login-body"
        >
          통신사
        </label>
        <select
          id="mobile_co_cd"
          {...register('mobile_co_cd')}
          className="custom-input w-full h-12 px-6 text-on-surface outline-none font-login-body appearance-none bg-transparent cursor-pointer"
        >
          <option value="">통신사를 선택하세요</option>
          {MOBILE_CARRIERS.map((carrier) => (
            <option key={carrier.value} value={carrier.value}>
              {carrier.label}
            </option>
          ))}
        </select>
        {errors.mobile_co_cd && (
          <p className="text-red-500 text-xs px-4">{errors.mobile_co_cd.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="phone"
          className="block text-[0.75rem] uppercase tracking-wider font-bold text-on-surface-variant px-4 font-login-body"
        >
          휴대전화
        </label>
        <input
          id="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          {...register('phone', {
            onChange: (e) => {
              const rawValue = e.target.value;
              if (rawValue.length < watchPhone.length) {
                setValue('phone', rawValue, { shouldValidate: true });
                return;
              }
              const formatted = formatPhone(rawValue);
              setValue('phone', formatted, { shouldValidate: true });
            },
          })}
          placeholder="010-0000-0000"
          className="custom-input w-full h-12 px-6 placeholder:text-outline-variant text-on-surface outline-none font-login-body"
        />
        {errors.phone && (
          <p className="text-red-500 text-xs px-4">{errors.phone.message}</p>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm text-center font-medium">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 h-14 bg-surface text-on-surface rounded-full font-login-headline font-bold flex items-center justify-center gap-2 hover:bg-surface-variant active:scale-[0.98] transition-all border border-outline cursor-pointer"
        >
          이전
        </button>
        <button
          type="submit"
          className="flex-1 h-14 bg-primary-container text-on-primary rounded-full font-login-headline font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary-container/25 hover:bg-[#00366b] active:scale-[0.98] transition-all border-0 cursor-pointer"
        >
          다음
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </div>
    </form>
  );
}