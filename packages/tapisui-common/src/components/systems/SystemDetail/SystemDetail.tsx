import React, { useState } from 'react';
import {
  Systems as SystemsHooks,
  Files as FilesHooks,
  useTapisConfig,
} from '@tapis/tapisui-hooks';
import { Systems } from '@tapis/tapis-typescript';
import { JSONDisplay } from '../../../ui';
import { QueryWrapper } from '../../../wrappers';
import styles from './SystemDetail.module.scss';
import {
  Public,
  PublicOff,
  LockOpen,
  Lock,
  Dns,
  Lan,
  Folder,
  Check,
  Close,
  Person,
  Work,
  Key,
  Style,
  DataObject,
  CalendarMonth,
  HourglassEmpty,
  TextSnippet,
  Login,
  Delete,
  Settings,
  ContentCopy,
  Security,
  Add,
  Link as LinkIcon,
  LinkOff,
  AccountTree,
  Share,
} from '@mui/icons-material';
import {
  Button,
  Chip,
  Divider,
  Alert,
  AlertTitle,
  IconButton,
  Menu,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import { useHistory, Link } from 'react-router-dom';
import {
  GlobusAuthModal,
  AuthModal,
  DeleteSystemModal,
  CreateChildSystemModal,
  ShareSystemPublicModal,
  UnShareSystemPublicModal,
  SharingModal,
  PermissionsModal,
} from '../Modals';

const AuthButton: React.FC<{
  toggle: () => void;
}> = ({ toggle }) => {
  return (
    <div>
      <Button
        size="small"
        variant="text"
        onClick={toggle}
        startIcon={<Login />}
      >
        Authenticate
      </Button>
    </div>
  );
};

const SystemSettingsMenu: React.FC<{ system: Systems.TapisSystem }> = ({
  system,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [modal, setModal] = useState<string | undefined>(undefined);
  const history = useHistory();
  const { username } = useTapisConfig();
  const open = Boolean(anchorEl);
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <span>
      <IconButton size="small" onClick={handleClick} aria-haspopup="true">
        <Settings />
      </IconButton>
      <Menu
        sx={{ width: 320, maxWidth: '100%', marginLeft: '-40px' }}
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuList disablePadding>
          <MenuItem
            disabled={!system.allowChildren}
            onClick={() => {
              setAnchorEl(null);
              setModal('createchildsystem');
            }}
          >
            <ListItemIcon>
              <Add fontSize="small" />
            </ListItemIcon>
            <ListItemText>Create child system</ListItemText>
          </MenuItem>
          <MenuItem
            disabled={system.owner !== username}
            onClick={() => {
              setAnchorEl(null);
              setModal('manageperms');
            }}
          >
            <ListItemIcon>
              <Security fontSize="small" />
            </ListItemIcon>
            <ListItemText>Manage Permissions</ListItemText>
          </MenuItem>
          <MenuItem
            disabled={system.owner !== username}
            onClick={() => {
              setAnchorEl(null);
              setModal('sharesystem');
            }}
          >
            <ListItemIcon>
              <Share fontSize="small" />
            </ListItemIcon>
            <ListItemText>Share</ListItemText>
          </MenuItem>
          <MenuItem>
            <ListItemIcon>
              <ContentCopy fontSize="small" />
            </ListItemIcon>
            <ListItemText>Duplicate</ListItemText>
          </MenuItem>
          <Divider />
          {system.parentId && (
            <MenuItem
              onClick={() => {
                history.push(`/systems/${system.parentId}`);
              }}
            >
              <ListItemIcon>
                <AccountTree fontSize="small" />
              </ListItemIcon>
              <ListItemText>View parent system</ListItemText>
            </MenuItem>
          )}
          {system.parentId && (
            <MenuItem>
              <ListItemIcon>
                <LinkOff fontSize="small" />
              </ListItemIcon>
              <ListItemText>Unlink from parent</ListItemText>
            </MenuItem>
          )}
          {system.allowChildren ? (
            <MenuItem>
              <ListItemIcon>
                <LinkOff fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Disallow child systems</ListItemText>
            </MenuItem>
          ) : (
            <MenuItem>
              <ListItemIcon>
                <LinkIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Allow child systems</ListItemText>
            </MenuItem>
          )}
          <Divider />
          {system.isPublic ? (
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                setModal('makeprivate');
              }}
            >
              <ListItemIcon>
                <PublicOff fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Make private</ListItemText>
            </MenuItem>
          ) : (
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                setModal('makepublic');
              }}
            >
              <ListItemIcon>
                <Public fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Make public</ListItemText>
            </MenuItem>
          )}
          <MenuItem disabled={system.owner !== username}>
            <ListItemIcon>
              <Dns fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Change owner</ListItemText>
          </MenuItem>
          {system.enabled ? (
            <MenuItem>
              <ListItemIcon>
                <Lock fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Disable</ListItemText>
            </MenuItem>
          ) : (
            <MenuItem>
              <ListItemIcon>
                <LockOpen fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Enable</ListItemText>
            </MenuItem>
          )}
          {!system.deleted && (
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                setModal('deletesystem');
              }}
            >
              <ListItemIcon>
                <Delete fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          )}
        </MenuList>
      </Menu>
      <DeleteSystemModal
        systemId={system.id}
        open={modal === 'deletesystem'}
        toggle={() => {
          setModal(undefined);
        }}
      />
      <CreateChildSystemModal
        system={system}
        open={modal === 'createchildsystem'}
        toggle={() => {
          setModal(undefined);
        }}
      />
      <ShareSystemPublicModal
        system={system}
        open={modal === 'makepublic'}
        toggle={() => {
          setModal(undefined);
        }}
      />
      <UnShareSystemPublicModal
        system={system}
        open={modal === 'makeprivate'}
        toggle={() => {
          setModal(undefined);
        }}
      />
      <SharingModal
        systemId={system.id!}
        open={modal === 'sharesystem'}
        toggle={() => {
          setModal(undefined);
        }}
      />
      <PermissionsModal
        system={system}
        open={modal === 'manageperms'}
        toggle={() => {
          setModal(undefined);
        }}
      />
    </span>
  );
};

type SystemCardProps = {
  system: Systems.TapisSystem;
};

const SystemCard: React.FC<SystemCardProps> = ({ system }) => {
  const [showJSON, setShowJSON] = useState(false);
  const history = useHistory();
  const [modal, setModal] = useState<string | undefined>(undefined);
  const { data, isLoading } = FilesHooks.useList(
    {
      systemId: system.id!,
      path: '/',
    },
    {
      retry: 0,
      refetchOnWindowFocus: false,
    }
  );

  return (
    <div className={styles['cards-container']}>
      <div className={styles['card']}>
        <div className={styles['flex-space-between']}>
          <div className={styles['card-line']}>
            <span className={styles['card-title']}>{system.id}</span>
            <span className={styles['muted']}>({system.systemType})</span>
            {system.isPublic ? (
              <Tooltip title="System is public">
                <Public />
              </Tooltip>
            ) : (
              <Tooltip title="System is private">
                <PublicOff />
              </Tooltip>
            )}
            {system.enabled ? (
              <Tooltip title="System is enabled">
                <LockOpen color="success" />
              </Tooltip>
            ) : (
              <Tooltip title="System is disabled">
                <Lock color="error" />
              </Tooltip>
            )}
            <span className={styles['muted']}>{system.uuid}</span>
          </div>
          <div></div>
          <div>
            <SystemSettingsMenu system={system} />
          </div>
        </div>
        {!system.enabled && (
          <Alert severity="warning">
            <AlertTitle>System disabled</AlertTitle>
            Jobs cannot be run on disabled systems. Press the lock icon above to
            enable the system
          </Alert>
        )}
        {system.parentId && (
          <div className={styles['card-line']}>
            <Tooltip title={`Parent system ${system.parentId}`}>
              <AccountTree />
            </Tooltip>
            <Link to={`/systems/${system.parentId}`}>
              my.system.id{system.parentId}
            </Link>
            <p className={styles['muted']}>Parent system</p>
          </div>
        )}
        {system.description ? (
          <div className={styles['card-line']}>
            <p className={styles['muted']}>{system.description}</p>
          </div>
        ) : (
          <div className={styles['card-line']}>
            <p className={styles['muted']}>add description</p>
          </div>
        )}
        <div className={styles['card-line']}>
          <p className={styles['muted']}>Authenticated</p>
          {isLoading && <i>Checking credentials...</i>}
          {!isLoading && !data && <Close color="error" />}
          {!isLoading && data && <Check color="success" />}
        </div>
        {!isLoading && !data && (
          <Alert severity="warning">
            <AlertTitle>Unauthenticated</AlertTitle>
            You must provide credentials for this host before you can perform
            file operations and run jobs with this system.
            <AuthButton
              toggle={() => {
                setModal(
                  system.systemType === Systems.SystemTypeEnum.Globus
                    ? 'globusauth'
                    : 'auth'
                );
              }}
            />
          </Alert>
        )}
        <Divider />
        <div className={styles['flex-space-between']}>
          <div className={styles['flex']}>
            <Button
              size="small"
              startIcon={<DataObject />}
              onClick={() => {
                setShowJSON(!showJSON);
              }}
              variant="text"
            >
              {!showJSON ? 'View JSON' : 'Hide JSON'}
            </Button>
          </div>
          <div></div>
          <div></div>
        </div>
        {showJSON && (
          <div>
            <Divider />
            <div style={{ marginTop: '8px' }}>
              <JSONDisplay json={system} />
            </div>
          </div>
        )}
      </div>
      <div className={styles['card']}>
        <div className={styles['card-line']}>
          <Lan />
          <span>Host & File System</span>
        </div>
        <Divider />
        <div className={styles['card-line']}>
          <Lan />
          <span>
            {system.host}
            {system.port !== -1 && `:${system.port}`}
          </span>
          <span className={styles['muted']}>host:port</span>
        </div>
        {system.useProxy && (
          <div className={styles['card-line']}>
            <Lan />
            {system.proxyHost}
            {system.proxyPort !== -1 && `:${system.proxyPort}`}
            <span className={styles['muted']}>proxy</span>
          </div>
        )}
        <div className={styles['card-line']}>
          <Person />
          <span>
            {system.isDynamicEffectiveUser ? (
              <code>{'${apiUserId}'}</code>
            ) : (
              system.effectiveUserId
            )}
          </span>
          <span className={styles['muted']}>effectiveUserId</span>
        </div>
        <div className={styles['card-line']}>
          <Folder />
          <span>{system.rootDir ? system.rootDir : '/'}</span>
          <span className={styles['muted']}>rootDir</span>
        </div>
        <div className={styles['card-line']}>
          <Key />
          <span>{system.defaultAuthnMethod}</span>
          <span className={styles['muted']}>defaultAuthnMethod</span>
        </div>
        {system.systemType === Systems.SystemTypeEnum.S3 && (
          <div className={styles['card-line']}>
            <Dns />
            bucket:
            <span>{system.bucketName}</span>
          </div>
        )}
        <Divider />
        <div className={styles['flex-space-between']}>
          <div className={styles['flex']}>
            <Button
              size="small"
              disabled={!data}
              onClick={() => {
                history.push(`/files/${system.id}`);
              }}
              startIcon={<Folder />}
            >
              View Files
            </Button>
          </div>
          <div></div>
          <div></div>
        </div>
      </div>
      <div className={styles['card']}>
        <div className={styles['card-line']}>
          <Work /> Job Execution
          {system.canExec ? <Check color="success" /> : <Close color="error" />}
        </div>
        <Divider />
        <div className={styles['card-line']}>
          <Folder />
          <span>{system.jobWorkingDir ? system.jobWorkingDir : '/'}</span>
          <span className={styles['muted']}>jobWorkingDir</span>
        </div>
        <div className={styles['card-line']}>
          <Dns /> runtimes:
          {system.canExec ? (
            <span className={styles['flex']}>
              {(system.jobRuntimes || []).map((runtime) => {
                return <Chip size="small" label={runtime.runtimeType} />;
              })}
            </span>
          ) : (
            <Close color="error" />
          )}
        </div>
        <div className={styles['card-line']}>
          <Work />
          <span>max jobs:</span>
          <span>{system.jobMaxJobs}</span>
        </div>
        <div className={styles['card-line']}>
          <Work />
          <span>max jobs per user:</span>
          <span>{system.jobMaxJobsPerUser}</span>
        </div>
        {system.jobEnvVariables!.length > 0 && (
          <div>
            <br />
            <div className={styles['card-line']}>
              <DataObject /> Environment variables
            </div>
            <Divider />
            <div className={styles['chips']}>
              {system.jobEnvVariables!.map((ev) => (
                <Chip size="small" label={`${ev.key}: "${ev.value}"`} />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className={styles['card']}>
        <div className={styles['card-line']}>
          <CalendarMonth /> Batch
          {system.canExec && system.canRunBatch ? (
            <Check color="success" />
          ) : (
            <Close color="error" />
          )}
        </div>
        <Divider />
        <div className={styles['card-line']}>
          <CalendarMonth />
          scheduler:
          {system.canRunBatch ? (
            <Chip size="small" label={system.batchScheduler} />
          ) : (
            <Close color="error" />
          )}
        </div>
      </div>
      <div className={styles['card']}>
        <div className={styles['card-line']}>
          <HourglassEmpty /> Queues
          {system.canExec && system.canRunBatch ? (
            <Check color="success" />
          ) : (
            <Close color="error" />
          )}
          {system.batchDefaultLogicalQueue}{' '}
          <span className={styles['muted']}>defaultQueue</span>
        </div>
        <Divider />
        {(system.batchLogicalQueues || []).map((queue) => {
          return (
            <div className={styles['card-line']}>
              {queue.name + ' -> ' + queue.hpcQueueName}
            </div>
          );
        })}
      </div>
      <div className={styles['card']}>
        <div className={styles['card-line']}>
          <Style /> Tags
        </div>
        <Divider />
        {system.tags!.length > 0 ? (
          <div className={styles['chips']}>
            {system.tags!.map((tag) => (
              <Chip size="small" label={tag} />
            ))}
          </div>
        ) : (
          <div>No tags</div>
        )}
      </div>
      <div className={styles['card']}>
        <div className={styles['card-line']}>
          <TextSnippet /> Notes
        </div>
        <Divider />
        <JSONDisplay json={system.notes || {}} />
      </div>
      <AuthModal
        systemId={system.id!}
        defaultAuthnMethod={system.defaultAuthnMethod!}
        open={modal === 'auth'}
        toggle={() => {
          setModal(undefined);
        }}
      />
      <DeleteSystemModal
        systemId={system.id}
        open={modal === 'deletesystem'}
        toggle={() => {
          setModal(undefined);
        }}
      />
      <GlobusAuthModal
        systemId={system.id!}
        open={modal === 'globusauth'}
        toggle={() => {
          setModal(undefined);
        }}
      />
    </div>
  );
};

const SystemDetail: React.FC<{ systemId: string }> = ({ systemId }) => {
  const { data, isLoading, error, isSuccess } = SystemsHooks.useDetails({
    systemId,
    select: 'allAttributes',
  });
  const system: Systems.TapisSystem | undefined = data?.result;
  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      {isSuccess && system && <SystemCard system={system} />}
    </QueryWrapper>
  );
};

export default SystemDetail;
