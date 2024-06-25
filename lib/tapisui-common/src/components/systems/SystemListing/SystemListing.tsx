import React, { useState, useCallback } from 'react';
import { Systems } from '@tapis/tapis-typescript';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { Column, Row } from 'react-table';
import { Icon, InfiniteScrollTable } from '../../../ui';
import { QueryWrapper } from '../../../wrappers';
import { Button } from 'reactstrap';
import styles from './SystemListing.module.scss';

type SystemListItemProps = {
  system: Systems.TapisSystem;
  onNavigate?: (system: Systems.TapisSystem) => void;
};

const SystemListingItem: React.FC<SystemListItemProps> = ({
  system,
  onNavigate,
}) => {
  if (onNavigate) {
    return (
      <Button
        color="link"
        className={styles.link}
        onClick={(e) => {
          e.preventDefault();
          onNavigate(system);
        }}
        data-testid={`href-${system.id}`}
      >
        {system.id}
      </Button>
    );
  }
  return <span>{system.id}</span>;
};

type SystemListingProps = {
  onSelect?: (system: Systems.TapisSystem) => void;
  onNavigate?: (system: Systems.TapisSystem) => void;
  className?: string;
};

const SystemListing: React.FC<SystemListingProps> = ({
  onSelect,
  onNavigate,
  className,
}) => {
  const { data, isLoading, error } = Hooks.useList();
  const [selectedSystem, setSelectedSystem] =
    useState<Systems.TapisSystem | null>(null);
  const selectWrapper = useCallback(
    (system: Systems.TapisSystem) => {
      if (onSelect) {
        setSelectedSystem(system);
        onSelect(system);
      }
    },
    [setSelectedSystem, onSelect]
  );
  const systems: Array<Systems.TapisSystem> = data?.result ?? [];

  const tableColumns: Array<Column> = [
    {
      Header: '',
      id: 'icon',
      Cell: (el) => <Icon name="data-files" />,
    },
    {
      Header: 'System',
      id: 'name',
      Cell: (el) => (
        <SystemListingItem
          system={el.row.original as Systems.TapisSystem}
          onNavigate={onNavigate}
        />
      ),
    },
  ];

  // Maps rows to row properties, such as classNames
  const getRowProps = (row: Row) => {
    const system = row.original as Systems.TapisSystem;
    return {
      className: selectedSystem?.id === system.id ? styles.selected : '',
      onClick: () => selectWrapper(system),
      'data-testid': system.id,
    };
  };

  return (
    <QueryWrapper isLoading={isLoading} error={error} className={className}>
      <InfiniteScrollTable
        className={styles['system-list']}
        tableColumns={tableColumns}
        tableData={systems}
        isLoading={isLoading}
        noDataText="No systems found"
        getRowProps={getRowProps}
      />
    </QueryWrapper>
  );
};

export default SystemListing;
