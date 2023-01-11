import React from 'react';
import { Link } from 'react-router-dom';
import { Workflows } from '@tapis/tapis-typescript';
import { useList } from 'tapis-hooks/workflows/groups';
import { SectionMessage, Icon } from 'tapis-ui/_common';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import { Toolbar } from '../_components';
import styles from './Groups.module.scss';

const Groups: React.FC = () => {
  const { data, isLoading, error } = useList();
  const groups: Array<Workflows.Group> = data?.result ?? [];

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <h2>
        Groups <span className={styles['count']}>{groups.length}</span>
      </h2>
      <Toolbar buttons={['creategroup']} />
      <div className={styles['container']}>
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
  );
};

export default Groups;
