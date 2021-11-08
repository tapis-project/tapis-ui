import React, { useCallback, useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useList } from 'tapis-hooks/files';
import { Files } from '@tapis/tapis-typescript';
import { Icon, InfiniteScrollTable } from 'tapis-ui/_common';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import { Row, Column, CellProps } from 'react-table';
import sizeFormat from 'utils/sizeFormat';
import { Button } from 'reactstrap';
import { formatDateTimeFromValue } from 'utils/timeFormat';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckSquare,
  faSquare as filledSquare,
} from '@fortawesome/free-solid-svg-icons';
import { faSquare } from '@fortawesome/free-regular-svg-icons';
import { useStat, usePermissions } from 'tapis-hooks/files';
import { useTapisConfig } from 'tapis-hooks';
import { DescriptionList } from 'tapis-ui/_common';
import styles from './FileStat.module.scss';

type FileStatProps = {
  systemId: string;
  path: string;
  className?: string;
  write?: boolean
}

const FileStat: React.FC<FileStatProps> = ({
  systemId,
  path,
  className = '',
  write = false
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
