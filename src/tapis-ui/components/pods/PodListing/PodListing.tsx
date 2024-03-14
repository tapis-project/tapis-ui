import React, { useState, useCallback } from 'react';
import { Systems } from '@tapis/tapis-typescript';
import { useList } from 'tapis-hooks/pods';
import { Column, Row } from 'react-table';
import { Icon, InfiniteScrollTable } from 'tapis-ui/_common';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import { Button } from 'reactstrap';
import styles from './PodListing.module.scss';

type SystemListItemProps = {
  system: Systems.TapisSystem;
  onNavigate?: (system: Systems.TapisSystem) => void;
};

//////// CURRENTLY UNUSED, so it still references systems.

const PodListingItem: React.FC<SystemListItemProps> = ({
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

type PodListingProps = {
  onSelect?: (system: Systems.TapisSystem) => void;
  onNavigate?: (system: Systems.TapisSystem) => void;
  className?: string;
};

const PodListing: React.FC<PodListingProps> = ({
  onSelect,
  onNavigate,
  className,
}) => {
  const { data, isLoading, error } = useList();
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
        <PodListingItem
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

export default PodListing;
