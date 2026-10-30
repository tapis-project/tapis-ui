import { PageLayout } from '@tapis/tapisui-common';
import { NavContextProvider } from '../_context/NavContext';
import { Router } from '../_Router';
import { ToastContainer, ToastProvider } from '../_components/toast';

const Layout: React.FC = () => {
  const body = (
    <>
      <Router />
      <ToastContainer />
    </>
  );

  return (
    <NavContextProvider>
      <ToastProvider>
        <PageLayout right={body} />;
      </ToastProvider>
    </NavContextProvider>
  );
};

export default Layout;
