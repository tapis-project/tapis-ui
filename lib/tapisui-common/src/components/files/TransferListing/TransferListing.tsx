import React, { useState, useCallback } from 'react';
import { Files } from '@tapis/tapis-typescript';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { Column, Row } from 'react-table';
import { Icon, InfiniteScrollTable } from '../../../ui';
import { QueryWrapper } from '../../../wrappers';
import styles from './TransferListing.module.scss';

type TransferListingProps = {
  onSelect?: (transfer: Files.TransferTask) => void;
  className?: string;
};

const TransferListing: React.FC<TransferListingProps> = ({
  onSelect,
  className,
}) => {
  const { concatenatedResults, isLoading, error, hasNextPage, fetchNextPage } =
    Hooks.Transfers.useList({});

  const infiniteScrollCallback = useCallback(() => {
    if (hasNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage]);

  const [selectedTransfer, setSelectedTransfer] =
    useState<Files.TransferTask | null>(null);

  const selectWrapper = useCallback(
    (transfer: Files.TransferTask) => {
      if (onSelect) {
        setSelectedTransfer(transfer);
        onSelect(transfer);
      }
    },
    [setSelectedTransfer, onSelect]
  );
  const systems: Array<Files.TransferTask> = concatenatedResults ?? [];

  const tableColumns: Array<Column> = [
    {
      Header: '',
      id: 'icon',
      Cell: (el) => <Icon name="globe" />,
    },
    {
      Header: 'Transfer',
      id: 'name',
      Cell: (el) => {
        const transfer: Files.TransferTask = el.row
          .original as Files.TransferTask;
        return (
          <span>
            {transfer.tag ?? transfer.uuid ?? 'Unidentified transfer'}
          </span>
        );
      },
    },
    {
      Header: 'Status',
      id: 'status',
      accessor: 'status',
      Cell: (el) => <span>{el.value}</span>,
    },
  ];

  // Maps rows to row properties, such as classNames
  const getRowProps = (row: Row) => {
    const transfer = row.original as Files.TransferTask;
    return {
      className: `${
        selectedTransfer?.id === transfer.id ? styles.selected : ''
      } ${onSelect ? styles.selectable : ''}`,
      onClick: () => selectWrapper(transfer),
      'data-testid': transfer.id,
    };
  };

  return (
    <QueryWrapper isLoading={isLoading} error={error} className={className}>
      <InfiniteScrollTable
        className={styles['transfer-list']}
        tableColumns={tableColumns}
        tableData={systems}
        isLoading={isLoading}
        noDataText="No transfers found"
        getRowProps={getRowProps}
        onInfiniteScroll={infiniteScrollCallback}
      />
    </QueryWrapper>
  );
};

export default TransferListing;
