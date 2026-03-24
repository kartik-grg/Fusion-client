import { useEffect, useMemo, useState } from 'react';
import { Flex } from '@mantine/core';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import CustomBreadcrumbs from '../../../../components/Breadcrumbs';
import ModuleTabs from '../../../../components/moduleTabs';
import ToastContainer from '../ui/Toast';
import RoleRestricted from '../ui/RoleRestricted';
import { getAllowedSectionTabs, useVhAccess } from '../../utils/roleAccess';

export default function Layout() {
  const access = useVhAccess();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('0');
  const normalizedPath = pathname.replace(/\/$/, '') || '/visitor_hostel';
  const sectionTabs = useMemo(() => getAllowedSectionTabs(access), [access]);

  useEffect(() => {
    if (!access.hasAccess) {
      return;
    }

    const foundIndex = sectionTabs.findIndex(({ path }) => path === normalizedPath);
    if (foundIndex >= 0) {
      setActiveTab(String(foundIndex));
      return;
    }

    if (sectionTabs.length > 0) {
      navigate(sectionTabs[0].path, { replace: true });
    }
  }, [access.hasAccess, navigate, normalizedPath, sectionTabs]);

  const handleTabChange = (tabIndex) => {
    if (tabIndex === null) {
      return;
    }

    setActiveTab(tabIndex);
    const tabConfig = sectionTabs[parseInt(tabIndex, 10)];
    if (tabConfig && tabConfig.path !== normalizedPath) {
      navigate(tabConfig.path);
    }
  };

  return (
    <div className="vh-module">
      <div className="vh-page-shell">
        <CustomBreadcrumbs />
        <Flex justify="space-between" align="center" mt="lg">
          {sectionTabs.length > 0 && (
            <ModuleTabs
              tabs={sectionTabs}
              activeTab={activeTab}
              setActiveTab={handleTabChange}
            />
          )}
        </Flex>

        <main className="vh-content-wrap">
          {access.hasAccess ? (
            <Outlet />
          ) : (
            <RoleRestricted
              title="Visitor Hostel Access Restricted"
              message="Only VhIncharge and VhCaretaker roles can access Visitor Hostel features."
            />
          )}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
