import React, { useEffect, useRef, useState } from 'react';
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
import { useDeleteClients } from '@tapis/tapisui-hooks/dist/authenticator';

// type ClientCardMenuProps = {
// }

const ClientCardMenu: React.FC<{}> = () => {
  return (
      <Paper
        sx={{
          width: 100,
          maxWidth: '100%',
          position: 'absolute',
          top: 0,
          right: 0,
        }}
      >
    <MenuList dense>
            <MenuItem
              onClick={() => {
                alert('edit');
              }}
            >
              <ListItemIcon>
                <Edit fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
            <Divider />
    <MenuItem
        onClick={() => {
          // useDeleteClients();
          alert('are you sure you want to delete this client?')
        }}
      >
        <ListItemIcon>
          <Delete fontSize="small" />
        </ListItemIcon>
        <ListItemText>Delete</ListItemText>
      </MenuItem>
    </MenuList>
    </Paper>
);
};

type ClientCardProps = {
  client: Authenticator.Client;
};

const ClientCard: React.FC<ClientCardProps> = ({ client }) => {
  const [menuActive, setMenuActive] = useState(false);
  const menuRef = useRef(null);

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
      <MoreVert
        className={styles['more']}
        onClick={() => setMenuActive(!menuActive)}
      />
      {menuActive && (
        <div
          ref={menuRef}
          onMouseLeave={() => setMenuActive(false)}
          className={styles['menu-container']}
        >
          <ClientCardMenu />
        </div>
      )}
    </div>
  );
};

export default ClientCard;
