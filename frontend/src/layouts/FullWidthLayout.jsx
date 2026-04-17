import { Outlet } from 'react-router-dom';
import MainPageHeader from '../components/main/MainPageHeader';

export default function FullWidthLayout() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <MainPageHeader />
      <main className="flex-1 w-full max-w-[1920px] mx-auto h-full overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}