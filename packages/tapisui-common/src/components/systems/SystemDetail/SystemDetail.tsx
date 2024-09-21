import React, { useState } from 'react';
import {
  Systems as SystemsHooks,
  Files as FilesHooks,
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
} from '@mui/icons-material';
import { Button, Chip, Divider } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { GlobusAuthModal, AuthModal } from '../Modals';

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
    }
  );

  return (
    <div className={styles['cards-container']}>
      <div className={styles['card']}>
        <div className={styles['flex-space-between']}>
          <div className={styles['card-line']}>
            <Dns />
            <span className={styles['card-title']}>{system.id}</span>
            <span className={styles['muted']}>({system.systemType})</span>
            <span className={styles['muted']}>{system.uuid}</span>
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
          <div className={styles['card-line']}>
            {system.enabled ? (
              <LockOpen color="success" />
            ) : (
              <Lock color="error" />
            )}
            {system.isPublic ? <Public /> : <PublicOff />}
          </div>
        </div>
        <div className={styles['card-line']}>
          <p className={styles['muted']}>Authenticated</p>
          {isLoading && <i>Checking credentials...</i>}
          {!isLoading && !data && <Close color="error" />}
          {!isLoading && !data && (
            <AuthButton
              toggle={() => {
                setModal(
                  system.systemType === Systems.SystemTypeEnum.Globus
                    ? 'globusauth'
                    : 'auth'
                );
              }}
            />
          )}
          {!isLoading && data && <Check color="success" />}
        </div>
        <div className={styles['card-line']}>
          <p className={styles['muted']}>{system.description}</p>
        </div>
        <Divider />
        <div className={styles['flex-space-between']}>
          <div className={styles['flex']}>
            <Button
              size="small"
              disabled={!data}
              onClick={() => {
                history.push(`/files/${system.id}`);
              }}
              variant="outlined"
              startIcon={<Folder />}
            >
              Files
            </Button>
          </div>
          <div></div>
          <div>
            <Button
              size="small"
              startIcon={<Delete />}
              color="error"
              onClick={() => {
                setShowJSON(!showJSON);
              }}
            >
              Delete
            </Button>
          </div>
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
          <Lan /> Host & File System
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
            {system.effectiveUserId}
            {system.isDynamicEffectiveUser && ' (dynamic)'}
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
