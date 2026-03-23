import { useEffect, useState } from 'react';
import { Flex } from '@mantine/core';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import CustomBreadcrumbs from '../../../../components/Breadcrumbs';
import ModuleTabs from '../../../../components/moduleTabs';
import ToastContainer from '../ui/Toast';

const SECTION_TABS = [
  { title: 'Dashboard', path: '/visitor_hostel' },
  { title: 'Bookings', path: '/visitor_hostel/bookings' },
  { title: 'Rooms', path: '/visitor_hostel/rooms' },
  { title: 'Check-In / Check-Out', path: '/visitor_hostel/checkin' },
  { title: 'Billing', path: '/visitor_hostel/billing' },
  { title: 'Meals', path: '/visitor_hostel/meals' },
  { title: 'Inventory', path: '/visitor_hostel/inventory' },
  { title: 'Reports', path: '/visitor_hostel/reports' },
];

export default function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('0');
  const normalizedPath = pathname.replace(/\/$/, '') || '/visitor_hostel';

  useEffect(() => {
    const foundIndex = SECTION_TABS.findIndex(({ path }) => path === normalizedPath);
    setActiveTab(foundIndex >= 0 ? String(foundIndex) : '0');
  }, [normalizedPath]);

  const handleTabChange = (tabIndex) => {
    if (tabIndex === null) {
      return;
    }

    setActiveTab(tabIndex);
    const tabConfig = SECTION_TABS[parseInt(tabIndex, 10)];
    if (tabConfig && tabConfig.path !== normalizedPath) {
      navigate(tabConfig.path);
    }
  };

  return (
    <div className="vh-module">
      <div className="vh-page-shell">
        <CustomBreadcrumbs />
        <Flex justify="space-between" align="center" mt="lg">
          <ModuleTabs
            tabs={SECTION_TABS}
            activeTab={activeTab}
            setActiveTab={handleTabChange}
          />
        </Flex>

        <main className="vh-content-wrap">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
