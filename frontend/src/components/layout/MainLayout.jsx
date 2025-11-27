import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import Toast from '../common/Toast';
import useMediaQuery from '../../hooks/useMediaQuery';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onMenuClick={toggleSidebar} />

      <div className="flex">
        <Sidebar isOpen={isSidebarOpen || isDesktop} onClose={closeSidebar} />

        <main className="flex-1 p-4 pb-20 lg:pb-4">
          <Outlet />
        </main>
      </div>

      {!isDesktop && <BottomNav />}

      <Toast />
    </div>
  );
};

export default MainLayout;
