import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';

const step3Schema = z.object({
  role: z.string().min(1, '역할을 선택해주세요.'),
  dept_nm: z.string().min(1, '부서명을 입력해주세요.'),
  grade_nm: z.string().min(1, '구분을 선택해주세요.'),
  pos_nm: z.string().optional(),
});

export default function Step3Form({ initialData, onComplete, onBack, loading }) {
  const [groups, setGroups] = useState([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      role: initialData?.role || '',
      dept_nm: initialData?.dept_nm || '',
      grade_nm: initialData?.grade_nm || '',
      pos_nm: initialData?.pos_nm || '',
    },
  });

  useEffect(() => {
    if (initialData?.role) register('role');
    if (initialData?.dept_nm) register('dept_nm');
    if (initialData?.grade_nm) register('grade_nm');
    if (initialData?.pos_nm) register('pos_nm');
  }, [initialData, register]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get('/api/auth/groups');
        setGroups(res.data);
      } catch (err) {
        console.error('Failed to fetch groups:', err);
      }
    };
    fetchGroups();
  }, []);

  const onSubmit = (data) => {
    onComplete(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full max-w-sm mx-auto" noValidate>
      <div className="space-y-2">
        <label
          htmlFor="role"
          className="block text-[0.75rem] uppercase tracking-wider font-bold text-on-surface-variant px-4 font-login-body"
        >
          역할
        </label>
        <div className="relative">
          <select
            id="role"
            {...register('role')}
            className="custom-input w-full h-12 px-6 placeholder:text-outline-variant text-on-surface outline-none font-login-body appearance-none bg-transparent"
          >
            <option value="">역할을 선택하세요</option>
            <option value="STDNT">학생</option>
            <option value="EMP">교직원</option>
            <option value="PROF">교수</option>
          </select>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
            <span className="material-symbols-outlined text-[22px]">expand_more</span>
          </div>
        </div>
        {errors.role && (
          <p className="text-red-500 text-xs px-4 mt-1">{errors.role.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="dept_nm"
          className="block text-[0.75rem] uppercase tracking-wider font-bold text-on-surface-variant px-4 font-login-body"
        >
          부서명
        </label>
        <div className="relative">
          <input
            id="dept_nm"
            type="text"
            {...register('dept_nm')}
            placeholder="부서명을 입력하세요"
            className="custom-input w-full h-12 px-6 placeholder:text-outline-variant text-on-surface outline-none font-login-body"
          />
        </div>
        {errors.dept_nm && (
          <p className="text-red-500 text-xs px-4 mt-1">{errors.dept_nm.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="grade_nm"
          className="block text-[0.75rem] uppercase tracking-wider font-bold text-on-surface-variant px-4 font-login-body"
        >
          구분
        </label>
        <div className="relative">
          <select
            id="grade_nm"
            {...register('grade_nm')}
            className="custom-input w-full h-12 px-6 placeholder:text-outline-variant text-on-surface outline-none font-login-body appearance-none bg-transparent"
          >
            <option value="">구분을 선택하세요</option>
            {groups.map((group) => (
              <option key={group.grp_cd} value={group.grp_nm}>
                {group.grp_nm}
              </option>
            ))}
          </select>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
            <span className="material-symbols-outlined text-[22px]">expand_more</span>
          </div>
        </div>
        {errors.grade_nm && (
          <p className="text-red-500 text-xs px-4 mt-1">{errors.grade_nm.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="pos_nm"
          className="block text-[0.75rem] uppercase tracking-wider font-bold text-on-surface-variant px-4 font-login-body"
        >
          직책 (선택)
        </label>
        <div className="relative">
          <input
            id="pos_nm"
            type="text"
            {...register('pos_nm')}
            placeholder="직책을 입력하세요"
            className="custom-input w-full h-12 px-6 placeholder:text-outline-variant text-on-surface outline-none font-login-body"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex-1 h-12 border-2 border-outline-variant text-on-surface-variant rounded-full font-login-body font-bold flex items-center justify-center gap-2 hover:bg-surface-variant-hover active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
        >
          이전
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 h-12 bg-primary-container text-on-primary rounded-full font-login-headline font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary-container/25 hover:bg-[#00366b] active:scale-[0.98] transition-all border-0 cursor-pointer disabled:opacity-50"
        >
          {loading ? '처리 중...' : '가입 완료'}
          {!loading && <span className="material-symbols-outlined text-[20px]">check</span>}
        </button>
      </div>
    </form>
  );
}