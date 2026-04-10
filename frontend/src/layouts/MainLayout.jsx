import MainPageHeader from '../components/main/MainPageHeader';

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <MainPageHeader />
      <main className="w-full max-w-[1920px] mx-auto">
        {children}
      </main>
    </div>
  );
}