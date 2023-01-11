import React from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { useDetails } from 'tapis-hooks/workflows/archives';
import { QueryWrapper } from 'tapis-ui/_wrappers';

type S3ArchiveProps = {
  archive: Workflows.S3Archive;
};

const S3Archive: React.FC<S3ArchiveProps> = ({ archive }) => {
  return (
    <div id={`archive-${archive.id}`}>
      <p>
        <b>id: </b> {archive.id}
      </p>
      <p>
        <b>type: </b> {archive.type}
      </p>
      <p>
        <b>owner: </b>
        {archive.owner}
      </p>
      <p>
        <b>archiveDir: </b>
        {archive.archive_dir}
      </p>
      <p>
        <b>endpoint: </b>
        {archive.endpoint}
      </p>
      <p>
        <b>bucket: </b>
        {archive.bucket}
      </p>
      <p>
        <b>region: </b>
        {archive.region}
      </p>
    </div>
  );
};

type TapisSystemArchiveProps = {
  archive: Workflows.TapisSystemArchive;
};

const TapisSystemArchive: React.FC<TapisSystemArchiveProps> = ({ archive }) => {
  return (
    <div id={`archive-${archive.id}`}>
      <p>
        <b>id:</b> {archive.id}
      </p>
      <p>
        <b>type:</b> {archive.type}
      </p>
      <p>
        <b>systemId:</b> {archive.system_id}
      </p>
      <p>
        <b>archiveDir:</b> {archive.archive_dir}
      </p>
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
  const { data, isLoading, error } = useDetails({ groupId, archiveId });
  const archive: Workflows.Archive = data?.result!;

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      {archive && archiveUtil(archive)}
    </QueryWrapper>
  );
};

export default Archive;
