import React, { useState } from 'react';
import { Position, NodeProps, useUpdateNodeInternals } from '@xyflow/react';
import styles from './ArchivesNode.module.scss';
import { HiddenHandle, StandardHandle } from '../../Handles';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { Add, DeleteOutline } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
  AddPipelineArchiveModal,
  ArchiveFileListingModal,
} from 'app/Workflows/_components/Modals';
import { QueryWrapper } from '@tapis/tapisui-common';
import { useHistory } from 'react-router-dom';

type NodeType = {
  groupId: string;
  pipeline: Workflows.Pipeline;
  showIO: boolean;
};

const archImgSrc =
  'https://www.creativefabrica.com/wp-content/uploads/2021/09/16/Database-storage-icon-Graphics-17395295-1-1-580x386.jpg';

const Archive: React.FC<{
  groupId: string;
  pipeline: Workflows.Pipeline;
  archive: Workflows.Archive;
}> = ({ groupId, pipeline, archive }) => {
  const { remove, isLoading, isSuccess, reset, invalidate } =
    Hooks.PipelineArchives.useRemove();
  const [modal, setModal] = useState<string | undefined>(undefined);
  const history = useHistory();
  let arch = archive as Workflows.TapisSystemArchive;

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
          onClick={() => {
            remove(
              {
                groupId,
                pipelineId: pipeline.id!,
                reqAddPipelineArchive: { archive_id: archive.id },
              },
              {
                onSuccess: () => {
                  reset();
                  invalidate();
                },
              }
            );
          }}
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
            // setModal('filelisting');
            history.push(`/files/${arch.system_id}`);
          }}
        >
          <div style={{ textAlign: 'right' }}>
            <Tooltip title={arch.id}>
              <span>
                {archive.id} - tapis://{arch.system_id}
              </span>
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

const ArchivesNode: React.FC<NodeProps> = ({ id, data }) => {
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
          {archives.length > 0 && (
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
          )}
        </QueryWrapper>
      </div>
      <HiddenHandle
        key={`arch-layout-source`}
        id={`arch-layout-source`}
        type="source"
        position={Position.Right}
        style={{ top: '26px' }}
      />
      <HiddenHandle
        key={`${id}-layout-bottom-target`}
        id={`${id}-layout-bottom-target`}
        type="target"
        position={Position.Bottom}
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
