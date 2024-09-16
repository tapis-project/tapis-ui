import React from 'react';
import { Router } from '../_Router';
import { PageLayout, LayoutBody } from '@tapis/tapisui-common';
import { Menu } from '../_components';
import { Search } from '../_components/Search';
import SearchBar from '../_components/Search/Search';

const Layout: React.FC = () => {
  const header = (
    <div>
      <Menu />
    </div>
  );

  const body = (
    <LayoutBody>
      <SearchBar/>
      <Router />
    </LayoutBody>
  );

  return <PageLayout top={header} right={body} />;
};

export default Layout;
