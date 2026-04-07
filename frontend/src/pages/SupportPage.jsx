import { Link } from 'react-router-dom';

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-surface px-6 py-16 text-on-surface">
      <div className="mx-auto max-w-lg text-center font-body">
        <h1 className="font-headline text-2xl font-bold text-primary">지원</h1>
        <p className="mt-4 text-slate-600">
          지원 페이지는 준비 중입니다. 문의는 조직 담당자에게 연락해 주세요.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}
