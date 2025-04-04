import React from 'react';
import AuthenticatorHelp from 'app/_components/Help/AuthenticatorHelp';
import ClientCard from './ClientCard';
import { SectionHeader } from '@tapis/tapisui-common';
import { useTapisConfig } from '@tapis/tapisui-hooks';
import { useListClients } from '@tapis/tapisui-hooks/dist/authenticator';
import { Authenticator } from '@tapis/tapisui-hooks';
import { Authenticator as AuthAPI } from '@tapis/tapisui-api';
import { Authenticator as AuthTapi } from '@tapis/tapis-typescript';
import { List } from '@mui/material';

const Menu: React.FC = () => {
  const { accessToken, basePath, username } = useTapisConfig();
  const { data, isLoading, error} = useListClients(username, basePath, accessToken)

  return (
    <div>
      <SectionHeader>
        Authenticator
        <AuthenticatorHelp />
      </SectionHeader>
      {data?.result && data.result.length > 0 ? (
        data.result.map((client) => (
          <List>
      <ClientCard
        client_id={client.client_id!}
        description={client.description!} 
        callback_url={client.callback_url!}
        version={data.version!}
        display_name=''
      />
        </List>
        ))
        ): (
    <div> No Clients Found. </div>
        )}

        </div>
  );
};

export default Menu;
