import React, { useCallback } from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { useList, useDelete } from 'tapis-hooks/workflows/groupusers';
import { SectionMessage, Icon } from 'tapis-ui/_common';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import { Toolbar } from '../../_components';
import { useTapisConfig } from 'tapis-hooks';
import styles from './Users.module.scss';
import { Button, Spinner } from 'reactstrap';
import { default as queryKeys } from 'tapis-hooks/workflows/groupusers/queryKeys';
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
  } = useDelete();
  const queryClient = useQueryClient();

  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(queryKeys.list);
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

const Users: React.FC<UsersProps> = ({ groupId }) => {
  const { data, isLoading, error } = useList({ groupId });
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
      <h2>
        Users <span className={styles['count']}>{users.length}</span>
      </h2>
      <Toolbar groupId={groupId} buttons={['addgroupuser']} />
      <div className={styles['container']}>
        <QueryWrapper isLoading={isLoading} error={error}>
          <div id="users">
            {users.length ? (
              users.map((user, i) => {
                let evenodd: string =
                  i % 2 > 0 ? styles['odd'] : styles['even'];
                let last: string = i === users.length - 1 ? styles['last'] : '';
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
  );
};

export default Users;
