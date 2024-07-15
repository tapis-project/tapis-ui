import React from 'react';
import { Router } from '../_Router';
import { PageLayout, LayoutBody, LayoutHeader } from '@tapis/tapisui-common';
import { useLocation } from 'react-router';
import { breadcrumbsFromPathname } from '@tapis/tapisui-common';
import { Menu } from '../_components';

const Layout: React.FC = () => {
  const { pathname } = useLocation();
  console.log(pathname);
  console.log(breadcrumbsFromPathname(pathname).splice(1));
  var crumbs =
    breadcrumbsFromPathname(pathname).splice(1).length > 0
      ? breadcrumbsFromPathname(pathname).splice(1)[0]['text']
      : 'ML Hub';
  crumbs = crumbs.charAt(0).toUpperCase() + crumbs.slice(1);
  if (breadcrumbsFromPathname(pathname).splice(1).length > 1) {
    crumbs += ' Details';
  }

  const header = (
    <div>
      <LayoutHeader>
        <div>{crumbs}</div>
      </LayoutHeader>
      <Menu />
    </div>
  );

  const body = (
    <LayoutBody>
      <Router />
    </LayoutBody>
  );

  return <PageLayout top={header} right={body} />;
};

export default Layout;
