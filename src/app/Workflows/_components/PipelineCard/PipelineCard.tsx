import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Workflows } from '@tapis/tapis-typescript';
import styles from './PipelineCard.module.scss';
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

type PipelineCardMenuProps = {
  groupId: string;
  pipeline: Workflows.Pipeline;
  onClickDelete?: () => void;
};

const PipelineCardMenu: React.FC<PipelineCardMenuProps> = ({
  pipeline,
  groupId,
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
          href={'#' + location.pathname + `/${groupId}/` + pipeline.id}
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

type PipelineCardProps = {
  pipeline: Workflows.Pipeline;
  groupId: string;
};

const PipelineCard: React.FC<PipelineCardProps> = ({ groupId, pipeline }) => {
  const [menuActive, setMenuActive] = useState(false);
  return (
    <div className={styles['card']}>
      <Link
        className={styles['card-title']}
        to={`/workflows/pipelines/${groupId}/${pipeline.id}`}
      >
        <b>{pipeline.id}</b>
      </Link>
      &nbsp;<div className={styles['card-status']}></div>
      <Link
        to={`/workflows/pipelines/${groupId}`}
        className={`${styles['group']} ${styles['link']}`}
      >
        {groupId}
      </Link>
      {pipeline.last_run ? (
        <Link
          to={`/workflows/pipelines/${groupId}/${pipeline.id}/runs/${pipeline.last_run}`}
          className={`${styles['run']} ${styles['link']}`}
        >
          {pipeline.last_run}
        </Link>
      ) : (
        <></>
      )}
      <UnfoldMore className={styles['expand']} />
      <MoreVert
        className={styles['more']}
        onClick={() => {
          setMenuActive(!menuActive);
        }}
      />
      {menuActive && <PipelineCardMenu pipeline={pipeline} groupId={groupId} />}
    </div>
  );
};

export default PipelineCard;
