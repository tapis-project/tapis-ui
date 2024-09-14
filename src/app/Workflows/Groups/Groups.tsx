import React from 'react';
import { Link } from 'react-router-dom';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { SectionMessage, SectionHeader, Icon } from '@tapis/tapisui-common';
import { QueryWrapper } from '@tapis/tapisui-common';
import { Toolbar } from '../_components';
import styles from './Groups.module.scss';
import { PeopleAlt } from '@mui/icons-material';
import { GroupsHelp } from 'app/_components/Help';

const Groups: React.FC = () => {
  const { data, isLoading, error } = Hooks.Groups.useList();
  const groups: Array<Workflows.Group> = data?.result ?? [];

  return (
    <div>
      <SectionHeader>
        <span>
          <span>
            <PeopleAlt fontSize={'large'} /> Groups{' '}
            {groups && ` [${groups.length}]`}
          </span>
          <span style={{ marginLeft: '16px' }}>
            <GroupsHelp />
          </span>
        </span>
        <Toolbar buttons={['creategroup']} />
      </SectionHeader>
      <QueryWrapper isLoading={isLoading} error={error}>
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
