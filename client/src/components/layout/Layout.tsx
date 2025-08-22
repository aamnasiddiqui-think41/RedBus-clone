

import { Outlet } from 'react-router-dom';
// import { Sidebar } from '../navigation/Sidebar';
import { Navbar } from '../shared/Navbar';

export const Layout = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar showNavigation={true} />
      <div className="flex">
        {/* <Sidebar /> */}
        <div className="flex-1">
          <main className="p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
