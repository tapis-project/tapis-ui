import React from 'react';
import { Link } from 'react-router-dom';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { Workflows } from '@tapis/tapis-typescript';
import { QueryWrapper } from '@tapis/tapisui-common';
import styles from './ArchiveList.module.scss';
import { SectionMessage, Icon, SectionHeader } from '@tapis/tapisui-common';
import { Toolbar } from '../../../_components';
import { Storage } from '@mui/icons-material';
import { ArchivesHelp } from 'app/_components/Help';

type ArchiveListParams = {
  groupId: string;
};

const ArchiveList: React.FC<ArchiveListParams> = ({ groupId }) => {
  const { data, isLoading, error } = Hooks.Archives.useList({ groupId });
  const archives: Array<Workflows.Archive> = data?.result ?? [];

  return (
    <div>
      <SectionHeader>
        <span>
          <span>
            <Storage fontSize={'large'} /> Archives{' '}
            {archives && ` [${archives.length}]`}
          </span>
          <span style={{ marginLeft: '16px' }}>
            <ArchivesHelp />
          </span>
        </span>
        <Toolbar buttons={['createarchive']} groupId={groupId} />
      </SectionHeader>
      <QueryWrapper isLoading={isLoading} error={error}>
        <div id="-archives-list">
          <div className={styles['container']}>
            {archives.length ? (
              archives.map((archive, i) => {
                let evenodd: string =
                  i % 2 > 0 ? styles['odd'] : styles['even'];
                let last: string =
                  i === archives.length - 1 ? styles['last'] : '';
                return (
                  <Link
                    to={`/workflows/archives/${groupId}/${archive.id}`}
                    style={{ textDecoration: 'none', color: 'black' }}
                  >
                    <div className={`${styles['archive']} ${evenodd} ${last}`}>
                      <span>
                        <Icon name="folder" /> {archive.id}
                      </span>
                    </div>
                  </Link>
                );
              })
            ) : (
              <SectionMessage type="info">No archives</SectionMessage>
            )}
          </div>
        </div>
      </QueryWrapper>
    </div>
  );
};

export default ArchiveList;
