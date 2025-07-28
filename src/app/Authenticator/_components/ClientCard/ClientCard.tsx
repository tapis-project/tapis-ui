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
import DeleteClientModal from './ClientCardModals/DeleteClientModal';
import UpdateClientModal from './ClientCardModals/UpdateClientModal';

type ClientCardMenuProps = {
  toggleDeleteModal: () => void;
  toggleUpdateModal: () => void;
};

const ClientCardMenu: React.FC<ClientCardMenuProps> = ({
  toggleDeleteModal,
  toggleUpdateModal,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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
            toggleUpdateModal();
            setAnchorEl(null);
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
            toggleDeleteModal();
            setAnchorEl(null);
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
  const [modal, setModal] = useState<string | undefined>(undefined);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <div className={styles['card']}>
      <div className={styles['card-title']}>
        <Link to={`/authenticator/clients/${client.client_id!}`}>
          <b>{client.display_name! || client.client_id}</b>
        </Link>
        {' | '}
        <a
          href={client.callback_url!}
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit Site
        </a>
      </div>
      <p />
      <p /> Client Id: {client.client_id}
      <p /> Callback_url: {client.callback_url}
      <br />
      <p /> Description: {client.description}
      <br />
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
          <ClientCardMenu
            toggleDeleteModal={() => {
              setModal('deleteclient');
            }}
            toggleUpdateModal={() => {
              setModal('updateclient');
            }}
          />
        </div>
      )}
      {modal === 'deleteclient' && (
        <DeleteClientModal
          client={client}
          toggle={() => {
            setModal(undefined);
          }}
        />
      )}
      {modal === 'updateclient' && (
        <UpdateClientModal
          client={client}
          toggle={() => {
            setModal(undefined);
          }}
        />
      )}
    </div>
  );
};

export default ClientCard;
