import React, {useState} from 'react';
import {
  Card,
  CardHeader,
  CardContent,
} from '@mui/material';
import { Icon } from '@tapis/tapisui-common';
import styles from './ClientCard.module.scss';
import { useLocation } from 'react-router-dom';
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

type ClientCardMenuProps = {
  client: Authenticator.Client;
  onClickDelete?: () => void;
};

const ClientCardMenu: React.FC<ClientCardMenuProps> = ({
  client,
}) => {
  const location = useLocation();
  return (
    <Paper
      sx={{
        width: 320,
        maxWidth: '100%',
        position: 'absolute',
        top: 0,
        right: 0,
      }}
    >
      <MenuList dense>
        <MenuItem
          // href={'#' + location.pathname + `/` + client.client_id!}
          component="a"
        >
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem>
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
        <MenuItem>
          <ListItemIcon>
            <Hub fontSize="small" />
          </ListItemIcon>
          <ListItemText>Dependencies</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <Input fontSize="small" />
          </ListItemIcon>
          <ListItemText>Input</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <Output fontSize="small" />
          </ListItemIcon>
          <ListItemText>Output</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            alert('delete');
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

const ClientCard: React.FC<ClientCardProps> = ({client }) => {
  const [menuActive, setMenuActive] = useState(false);
  return (
    <div className={styles['card']}>
      <Link
        className={styles['card-title']}
        to={`/authenticator/clients/${client.client_id!}`}
      >
        <b>{client.client_id!}</b>
      </Link>
      &nbsp;<div className={styles['card-status']}></div>
      <UnfoldMore className={styles['expand']} />
      <MoreVert
        className={styles['more']}
        onClick={() => {
          setMenuActive(!menuActive);
        }}
      />
      {menuActive && <ClientCardMenu client={client} />}
    </div>
  );
};

export default ClientCard;
