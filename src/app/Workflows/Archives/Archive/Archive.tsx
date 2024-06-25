import React from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { QueryWrapper } from '@tapis/tapisui-common';
import styles from './Archive.module.scss';
import { JSONDisplay } from '@tapis/tapisui-common';

type S3ArchiveProps = {
  archive: Workflows.S3Archive;
};

const S3Archive: React.FC<S3ArchiveProps> = ({ archive }) => {
  return (
    <div id={`archive-${archive.id}`} className={styles['container']}>
      <JSONDisplay json={archive} />
    </div>
  );
};

type TapisSystemArchiveProps = {
  archive: Workflows.TapisSystemArchive;
};

const TapisSystemArchive: React.FC<TapisSystemArchiveProps> = ({ archive }) => {
  return (
    <div id={`archive-${archive.id}`} className={styles['container']}>
      <JSONDisplay json={archive} />
    </div>
  );
};

const archiveUtil = (archive: Workflows.Archive) => {
  switch (archive.type) {
    case Workflows.EnumArchiveType.S3:
      return <S3Archive archive={archive} />;
    case Workflows.EnumArchiveType.System:
      return <TapisSystemArchive archive={archive} />;
  }
};

type ArchivesProps = {
  groupId: string;
  archiveId: string;
};

const Archive: React.FC<ArchivesProps> = ({ groupId, archiveId }) => {
  const { data, isLoading, error } = Hooks.Archives.useDetails({
    groupId,
    archiveId,
  });
  const archive: Workflows.Archive = data?.result!;

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      {archive && archiveUtil(archive)}
    </QueryWrapper>
  );
};

export default Archive;
