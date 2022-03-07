import React from 'react';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import { useStat } from 'tapis-hooks/files';
import { DescriptionList } from 'tapis-ui/_common';

type FileStatProps = {
  systemId: string;
  path: string;
  className?: string;
};

const FileStat: React.FC<FileStatProps> = ({
  systemId,
  path,
  className = '',
}) => {
  const { data, isLoading, error } = useStat({ systemId, path });

  const stat = data?.result;

  return (
    <QueryWrapper isLoading={isLoading} error={error} className={className}>
      <h3>{systemId}</h3>
      <h5>{path}</h5>
      {stat && <DescriptionList data={stat} />}
    </QueryWrapper>
  );
};

export default FileStat;
