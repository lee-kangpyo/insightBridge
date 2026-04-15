import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../components/signup/ProgressBar';
import Step1Form from '../components/signup/Step1Form';
import Step2Form from '../components/signup/Step2Form';
import Step3Form from '../components/signup/Step3Form';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    verificationCode: '',
    name: '',
    phone: '',
    mobile_co_cd: '',
    dept_nm: '',
    grade_nm: '',
    pos_nm: '',
  });
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStep1Complete = (data) => {
    updateFormData('email', data.email);
    updateFormData('password', data.password);
    updateFormData('verificationCode', data.verificationCode);
    setVerified(data.verified);
    setStep(2);
  };

  const handleStep2Complete = (data) => {
    updateFormData('name', data.name);
    updateFormData('phone', data.phone);
    updateFormData('mobile_co_cd', data.mobile_co_cd);
    setStep(3);
  };

  const handleStep3Complete = async (data) => {
    updateFormData('dept_nm', data.dept_nm);
    updateFormData('grade_nm', data.grade_nm);
    updateFormData('pos_nm', data.pos_nm);
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/api/auth/register', {
        email: formData.email,
        password: formData.password,
        verification_code: formData.verificationCode,
        name: formData.name,
        phone: formData.phone,
        mobile_co_cd: formData.mobile_co_cd,
        dept_nm: data.dept_nm,
        grade_nm: data.grade_nm,
        pos_nm: data.pos_nm,
      });
      await loginWithToken(formData.email, res.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || '회원가입에 실패했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="login-root font-login-body text-on-surface flex flex-col min-h-svh">
      <div className="login-bg-pattern academic-bg" aria-hidden />
      <div className="relative z-10 flex flex-col flex-1 min-h-svh">
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="glass-panel rounded-3xl shadow-2xl shadow-primary-container/5 p-10 lg:p-14 border border-white">
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary-container/20">
                  <span
                    className="material-symbols-outlined text-white text-4xl"
                    style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                  >
                    school
                  </span>
                </div>
                <h1 className="font-login-headline text-2xl font-bold text-primary-container tracking-tight text-center">
                  회원가입
                </h1>
                <p className="text-on-surface-variant text-sm mt-3 text-center font-medium">
                  {step === 1 && '이메일 인증 + 비밀번호 설정'}
                  {step === 2 && '인적 사항'}
                  {step === 3 && '소속 정보'}
                </p>
              </div>

              <ProgressBar currentStep={step} totalSteps={3} />

              <div className="mt-16">
                {step === 1 && (
                  <Step1Form
                    initialData={{ email: formData.email, password: formData.password }}
                    verified={verified}
                    onComplete={handleStep1Complete}
                  />
                )}
                {step === 2 && (
                  <Step2Form
                    initialData={{ name: formData.name, phone: formData.phone, mobile_co_cd: formData.mobile_co_cd }}
                    onComplete={handleStep2Complete}
                    onBack={() => setStep(1)}
                  />
                )}
                {step === 3 && (
                  <Step3Form
                    initialData={{ dept_nm: formData.dept_nm, grade_nm: formData.grade_nm, pos_nm: formData.pos_nm }}
                    onComplete={handleStep3Complete}
                    onBack={() => setStep(2)}
                    loading={loading}
                  />
                )}
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center font-medium mt-4">{error}</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
