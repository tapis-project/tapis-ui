import React from 'react';
import AuthenticatorHelp from 'app/_components/Help/AuthenticatorHelp';
import { SectionHeader } from '@tapis/tapisui-common';
import { ClientCardList } from './ClientCardList';
import { ClientToolbar } from './AuthenticatorToolbar';

const Menu: React.FC = () => {
  return (
    <div>
      <SectionHeader>
        Authenticator
        <AuthenticatorHelp />
      </SectionHeader>
      <ClientCardList />
    </div>
  );
};

export default Menu;
