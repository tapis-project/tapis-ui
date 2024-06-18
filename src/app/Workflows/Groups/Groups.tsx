import React from 'react';
import { Link } from 'react-router-dom';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { SectionMessage, Icon } from '@tapis/tapisui-common';
import { QueryWrapper } from '@tapis/tapisui-common';
import { Toolbar } from '../_components';
import styles from './Groups.module.scss';
import { CircularProgress } from '@mui/material';


const Groups: React.FC = () => {
  const { data, isLoading, error } = Hooks.Groups.useList();
  const groups: Array<Workflows.Group> = data?.result ?? [];

  return (
    <div className={styles["container"]}>
      <h2>
        Groups {
          isLoading
          ? <CircularProgress />
          : <span className={styles['count']}>{groups.length}</span>
        }
      </h2>
      <QueryWrapper isLoading={isLoading} error={error}>
        <Toolbar buttons={['creategroup']} />
      <div className={styles['groups-container']}>
        {groups.length ? (
          groups.map((group, i) => {
            let evenodd: string = i % 2 > 0 ? styles['odd'] : styles['even'];
            let last: string = i === groups.length - 1 ? styles['last'] : '';
            return (
              <Link
                to={`/workflows/groups/${group.id}`}
                style={{ textDecoration: 'none', color: 'black' }}
              >
                <div className={`${styles['group']} ${evenodd} ${last}`}>
                  <span>
                    <Icon name="user" /> {group.id}
                  </span>
                </div>
              </Link>
            );
          })
        ) : (
          <SectionMessage type="info">No groups</SectionMessage>
        )}
      </div>
    </QueryWrapper>
    </div>
  );
};

export default Groups;
