import React, { useCallback } from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import {
  SectionMessage,
  Icon,
  SectionHeader,
  QueryWrapper,
} from '@tapis/tapisui-common';
import { PipelineCardList, GroupSecretList, Toolbar } from '../../_components';
import { useTapisConfig } from '@tapis/tapisui-hooks';
import styles from './Group.module.scss';
import { Button, Spinner } from 'reactstrap';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { useQueryClient } from 'react-query';

type RemoveGroupUserButtonProps = {
  user: Workflows.GroupUser;
  groupId: string;
};

const RemoveUserButton: React.FC<RemoveGroupUserButtonProps> = ({
  user,
  groupId,
}) => {
  const {
    removeAsync,
    isError,
    isSuccess,
    error: removeError,
    isLoading: removeInProgress,
    reset,
  } = Hooks.GroupUsers.useDelete();
  const queryClient = useQueryClient();

  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.GroupUsers.queryKeys.list);
    reset();
  }, [reset, queryClient]);

  return !removeInProgress && (!isSuccess || isError) ? (
    <Button
      color="danger"
      type="button"
      disabled={removeInProgress || isSuccess || isError}
      onClick={() => {
        removeAsync({ groupId, username: user.username! }, { onSuccess });
      }}
    >
      <Icon name="trash" />
      {isError && removeError?.message}
    </Button>
  ) : (
    <Spinner />
  );
};

type UsersProps = {
  groupId: string;
};

const Group: React.FC<UsersProps> = ({ groupId }) => {
  const { data, isLoading, error } = Hooks.GroupUsers.useList({ groupId });
  const { claims } = useTapisConfig();
  const users: Array<Workflows.GroupUser> = data?.result ?? [];

  const isCurrentUser = (username: string) =>
    username === claims['tapis/username'];
  const canDeleteUser = (user: Workflows.GroupUser) => {
    return (
      users.filter((user) => isCurrentUser(user.username!) && user.is_admin)
        .length > 0 && !isCurrentUser(user.username!)
    );
  };

  return (
    <div>
      <PipelineCardList groupId={groupId} />
      <div className={styles['container']}>
        <GroupSecretList groupId={groupId} />
      </div>
      <div className={styles['container']}>
        <SectionHeader>
          <span>
            Users <span className={styles['count']}>{users.length}</span>
          </span>
          <Toolbar groupId={groupId} buttons={['addgroupuser']} />
        </SectionHeader>
        <div className={styles['objects-container']}>
          <QueryWrapper isLoading={isLoading} error={error}>
            <div id="users">
              {users.length ? (
                users.map((user, i) => {
                  let evenodd: string =
                    i % 2 > 0 ? styles['odd'] : styles['even'];
                  let last: string =
                    i === users.length - 1 ? styles['last'] : '';
                  return (
                    <div className={`${styles['user']} ${evenodd} ${last}`}>
                      <div>
                        <Icon name="user" className={styles['icon']} />
                        <span>
                          {user.username}
                          {user.is_admin && (
                            <i className={styles['admin']}>admin</i>
                          )}
                        </span>
                      </div>
                      <div className={styles['flex']}>
                        <div className={styles['flex-grow']}></div>
                        <div>
                          {canDeleteUser(user) && (
                            <RemoveUserButton user={user} groupId={groupId} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <SectionMessage type="info">No users</SectionMessage>
              )}
            </div>
          </QueryWrapper>
        </div>
      </div>
    </div>
  );
};

export default Group;
