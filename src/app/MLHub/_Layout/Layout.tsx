import { PageLayout } from '@tapis/tapisui-common';
import { NavContextProvider } from '../_context/NavContext';
import { Router } from '../_Router';

const Layout: React.FC = () => {
  const body = <Router />;

  return (
    <NavContextProvider>
      <PageLayout right={body} />;
    </NavContextProvider>
  );
};

export default Layout;
