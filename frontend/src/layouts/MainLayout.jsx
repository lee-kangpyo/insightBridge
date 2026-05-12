import { Outlet, useLocation } from 'react-router-dom';
import MainPageHeader from '../components/main/MainPageHeader';
import { LNBMenu } from '../components/LNBMenu';

export default function MainLayout({ children }) {
  const { pathname } = useLocation();
  const isAdminArea = pathname.startsWith('/admin');

  const mainClassName = [
    'flex-1 w-full max-w-[1920px] mx-auto h-full',
    isAdminArea ? 'overflow-y-scroll px-8 pt-8 pb-12 lg:px-12 box-border' : 'overflow-y-auto',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <MainPageHeader />
      <div className="flex" style={{ height: 'calc(100vh - 4rem)' }}>
        <aside className="flex-shrink-0 h-full overflow-y-auto" style={{ width: '224px', minWidth: '224px' }}>
          <LNBMenu />
        </aside>
        <main className={mainClassName}>
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}