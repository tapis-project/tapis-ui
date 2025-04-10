import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '@mui/material';
import { Icon } from '@tapis/tapisui-common';
import styles from './ClientCard.module.scss';
import { useHistory, useLocation } from 'react-router-dom';
import { Authenticator } from '@tapis/tapis-typescript';
import { UnfoldMore, MoreVert } from '@mui/icons-material';
import {
  MenuList,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
} from '@mui/material';
import {
  Delete,
  Edit,
  Hub,
  Input,
  Output,
  Visibility,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

type ClientCardProps = {
  client: Authenticator.Client;
};

const ClientCard: React.FC<ClientCardProps> = ({ client }) => {
  const [menuActive, setMenuActive] = useState(false);
  return (
    <div className={styles['card']}>
      <Link
        className={styles['card-title']}
        to={{
          pathname: `/authenticator/clients/${client.client_id!}`,
          state: { callbackUrl: client.callback_url },
        }}
      >
        <b>{client.client_id!}</b>
      </Link>
      <p />
      {client.description}
    </div>
  );
};

export default ClientCard;
