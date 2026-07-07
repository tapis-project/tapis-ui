import { useState } from 'react';
import { Router } from '../_Router';
import { PageLayout, LayoutBody } from '@tapis/tapisui-common';
import { TopNavbar } from '../_components';
import { Sidebar } from '../_components/Sidebar';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const header = (
    <div>
      <TopNavbar />
    </div>
  );

  const body = (
    <LayoutBody>
      <Router />
    </LayoutBody>
  );

  return (
    <PageLayout
      left={
        <Sidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen((v) => !v)}
        />
      }
      top={header}
      right={body}
    />
  );
};

export default Layout;
