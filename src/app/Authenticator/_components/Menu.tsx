import React from 'react';
import AuthenticatorHelp from 'app/_components/Help/AuthenticatorHelp';
import ClientCard from './ClientCard';
import { SectionHeader } from '@tapis/tapisui-common';
import { useTapisConfig } from '@tapis/tapisui-hooks';
import { useListClients } from '@tapis/tapisui-hooks/dist/authenticator';
import { Authenticator } from '@tapis/tapisui-hooks';
import { Authenticator as AuthAPI } from '@tapis/tapisui-api';
import { Authenticator as AuthTapi } from '@tapis/tapis-typescript';
import { ClientCardList } from './ClientCardList';

const Menu: React.FC = () => {
  return (
    <div>
      <SectionHeader>
        Authenticator
        <AuthenticatorHelp />
      </SectionHeader>
      <ClientCardList/>
    </div>
  );
};

export default Menu;
