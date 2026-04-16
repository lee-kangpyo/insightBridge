import MainPageHeader from '../components/main/MainPageHeader';
import { LNBMenu } from '../components/LNBMenu';

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface text-on-surface flex">
      <MainPageHeader />
      <aside className="flex-shrink-0">
        <LNBMenu />
      </aside>
      <main className="flex-1 w-full max-w-[1920px] mx-auto">
        {children}
      </main>
    </div>
  );
}