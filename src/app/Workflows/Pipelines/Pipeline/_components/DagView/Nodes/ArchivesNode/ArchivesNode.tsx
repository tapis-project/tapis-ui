import React, { useState } from 'react';
import { Position, NodeProps, useUpdateNodeInternals } from '@xyflow/react';
import styles from './ArchivesNode.module.scss';
import { HiddenHandle, StandardHandle } from '../../Handles';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { ErrorOutline, Add, DeleteOutline } from '@mui/icons-material';
import { Box, Tooltip } from '@mui/material';
import { AddPipelineEnvVarModal } from '../../../../../../_components/Modals/AddPipelineEnvVarModal';
import { LoadingButton } from '@mui/lab';
import { FaBeer } from 'react-icons/fa';
import {
  AddPipelineArchiveModal,
  ArchiveFileListingModal,
} from 'app/Workflows/_components/Modals';
import { QueryWrapper } from '@tapis/tapisui-common';

type NodeType = {
  groupId: string;
  pipeline: Workflows.Pipeline;
  showIO: boolean;
  // Env vars that are referenced in other tasks either correctly or erroneously
  referencedKeys: Array<string>;
  onClickAdd: () => void;
};

const archImgSrc =
  'https://www.creativefabrica.com/wp-content/uploads/2021/09/16/Database-storage-icon-Graphics-17395295-1-1-580x386.jpg';

const Archive: React.FC<{
  groupId: string;
  pipeline: Workflows.Pipeline;
  archive: Workflows.Archive;
}> = ({ groupId, pipeline, archive }) => {
  const { isLoading, isSuccess, isError, error, reset } =
    Hooks.PipelineArchives.useCreate();
  const [modal, setModal] = useState<string | undefined>(undefined);

  return (
    <div
      className={styles['io-item']}
      style={{
        display: isSuccess ? 'none' : 'inherit',
        position: 'relative',
      }}
    >
      <StandardHandle
        id={`arch-${archive.id}`}
        type="source"
        position={Position.Right}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <LoadingButton
          loading={isLoading}
          onClick={() => {}}
          sx={{
            color: '#666666',
            cursor: 'pointer',
            '&:hover': {
              color: 'red',
            },
          }}
        >
          <DeleteOutline />
        </LoadingButton>
        <div />
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => {
            setModal('filelisting');
          }}
        >
          <div style={{ textAlign: 'right' }}>
            <Tooltip title={archive.id}>
              <span>{archive.id}</span>
            </Tooltip>
          </div>
          <div
            className={styles['io-item-type']}
            style={{ textAlign: 'right' }}
          >
            {archive.type}
          </div>
        </div>
      </div>
      <ArchiveFileListingModal
        groupId={groupId}
        pipeline={pipeline}
        archive={archive as Workflows.TapisSystemArchive}
        open={modal === 'filelisting'}
        toggle={() => {
          setModal(undefined);
        }}
      />
    </div>
  );
};

const ArchivesNode: React.FC<NodeProps> = ({ data }) => {
  const [modal, setModal] = useState<string | undefined>(undefined);
  const { pipeline, showIO, groupId } = data as NodeType;
  const {
    data: archivesData,
    isLoading,
    error,
  } = Hooks.PipelineArchives.useList({ groupId, pipelineId: pipeline.id! });
  const archives = archivesData?.result || [];

  return (
    <>
      <HiddenHandle
        key={`arch-layout-target`}
        id={`arch-layout-target`}
        type="target"
        position={Position.Left}
        style={{ top: '26px' }}
      />
      <div key="arch-node" className={styles['node']}>
        <div className={styles['body']}>
          <div
            className={styles['header']}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                width: '300px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <img src={archImgSrc} className={styles['header-img']} />
              <Tooltip title="Static data accessible to all tasks in this pipeline">
                <span className={styles['title']}>Archives</span>
              </Tooltip>
            </div>
            <div />
            <div style={{ marginTop: '3px' }}>
              <Add
                sx={{
                  color: '#666666',
                  '&:hover': {
                    cursor: 'pointer',
                    color: '#999999',
                  },
                }}
                fontSize="large"
                onClick={() => {
                  setModal('addarchive');
                }}
              />
            </div>
          </div>
        </div>
        <QueryWrapper isLoading={isLoading} error={error}>
          <div className={styles['io']}>
            {archives.map((archive) => {
              return (
                <Archive
                  groupId={groupId}
                  pipeline={pipeline}
                  archive={archive}
                />
              );
            })}
          </div>
        </QueryWrapper>
      </div>
      <HiddenHandle
        key={`arch-layout-source`}
        id={`arch-layout-source`}
        type="source"
        position={Position.Right}
        style={{ top: '26px' }}
      />
      <AddPipelineArchiveModal
        pipeline={pipeline}
        groupId={groupId}
        open={modal === 'addarchive'}
        toggle={() => {
          setModal(undefined);
        }}
      />
    </>
  );
};

export default ArchivesNode;
