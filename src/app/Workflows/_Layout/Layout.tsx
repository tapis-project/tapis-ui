import React from 'react';
import { Router } from '../_Router';
import { Menu } from '../_components';
import styles from './Layout.module.scss';
import { PageLayout, LayoutBody } from '@tapis/tapisui-common';
import { Provider } from 'react-redux';
import store from '@redux/store';

const Layout: React.FC = () => {
  const body = (
    <LayoutBody>
      <Provider store={store}>
        <Menu />
        <Router />
      </Provider>
    </LayoutBody>
  );

  return <PageLayout right={body} />;
};

export default Layout;
