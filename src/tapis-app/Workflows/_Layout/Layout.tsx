import React from 'react';
import {
  PageLayout,
  LayoutBody,
  LayoutHeader,
  LayoutNavWrapper,
} from 'tapis-ui/_common';

import { Router } from '../_Router';

const Layout: React.FC = () => {
  return (
    <>
      <Router />
    </>
  );
};

export default Layout;
