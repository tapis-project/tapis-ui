import React from 'react';
import { PageLayout, LayoutBody } from '@tapis/tapisui-common';
import { NavPods } from '../_components';
import PodToolbar from '../_components/PodToolbar';
import { Router } from '../_Router';
import { PodsContextProvider } from '../_components/PodsContext'; // Adjust the import path as necessary

const Layout: React.FC = () => {
  const body = (
    <LayoutBody>
      <PodsContextProvider>
        <Router />
      </PodsContextProvider>
    </LayoutBody>
  );

  return <PageLayout right={body} />;
};

export default Layout;

//flex-grow:1
//flex-direction:row
// title blank buttons

// const Layout: React.FC = () => {
//   const header = (
//     <div>
//       {/* <Menu /> */}
//       <LayoutHeader>
//         <div>Pods</div>
//         <PodToolbar />
//       </LayoutHeader>
//     </div>
//   );

//   const sidebar = (
//     <LayoutNavWrapper>
//       <NavPods />
//     </LayoutNavWrapper>
//   );

//   const body = (
//     <LayoutBody>
//       <Router />
//     </LayoutBody>
//   );

//   return <PageLayout top={header} left={sidebar} right={body} />;
// };

// export default Layout;
