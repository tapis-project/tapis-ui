import React from 'react';
import {
  PageLayout,
  LayoutHeader,
} from 'tapis-ui/_common';
import Projects from "../Projects";

const Layout: React.FC = () => {
  const header = (
    <LayoutHeader>
      <div>TAPIS Streams</div>
    </LayoutHeader>
  );

  const body = (
    <Projects />
  );

  return (
    <>
      <PageLayout top={header} left={body} />
    </>
  );
};

export default Layout;
