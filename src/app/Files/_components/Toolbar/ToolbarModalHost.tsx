import { lazy, Suspense } from 'react';
import { Files } from '@tapis/tapis-typescript';
import CreateDirModal from './CreateDirModal';
import MoveCopyModal from './MoveCopyModal';
import RenameModal from './RenameModal';
import UploadModal from './UploadModal';
import PermissionsModal from './PermissionsModal';
import DeleteModal from './DeleteModal';
import CreatePostitModal from './CreatePostitModal';
import TransferModal from './TransferModal';
import ShareModal from './ShareModal';
import RegisterDatasetModal from './RegisterDatasetModal';

const VtkModal = lazy(() => import('./VtkModal'));

export type FileToolbarModal =
  | 'share'
  | 'postit'
  | 'visualize'
  | 'dataset'
  | 'rename'
  | 'move'
  | 'copy'
  | 'transfer'
  | 'upload'
  | 'permissions'
  | 'createdir'
  | 'delete';

export interface ToolbarModalHostProps {
  modal?: FileToolbarModal;
  toggle: () => void;
  systemId: string;
  path: string;
}

export default function ToolbarModalHost({
  modal,
  toggle,
  systemId,
  path,
}: ToolbarModalHostProps) {
  switch (modal) {
    case 'createdir':
      return <CreateDirModal toggle={toggle} systemId={systemId} path={path} />;
    case 'copy':
    case 'move':
      return (
        <MoveCopyModal
          toggle={toggle}
          systemId={systemId}
          path={path}
          operation={
            modal === 'copy'
              ? Files.MoveCopyRequestOperationEnum.Copy
              : Files.MoveCopyRequestOperationEnum.Move
          }
        />
      );
    case 'rename':
      return <RenameModal toggle={toggle} systemId={systemId} path={path} />;
    case 'transfer':
      return <TransferModal toggle={toggle} systemId={systemId} path={path} />;
    case 'upload':
      return <UploadModal toggle={toggle} systemId={systemId} path={path} />;
    case 'permissions':
      return (
        <PermissionsModal toggle={toggle} systemId={systemId} path={path} />
      );
    case 'delete':
      return <DeleteModal toggle={toggle} systemId={systemId} path={path} />;
    case 'postit':
      return (
        <CreatePostitModal toggle={toggle} systemId={systemId} path={path} />
      );
    case 'visualize':
      return (
        <Suspense fallback={null}>
          <VtkModal toggle={toggle} systemId={systemId} path={path} />
        </Suspense>
      );
    case 'share':
      return <ShareModal toggle={toggle} systemId={systemId} path={path} />;
    case 'dataset':
      return (
        <RegisterDatasetModal toggle={toggle} systemId={systemId} path={path} />
      );
    default:
      return null;
  }
}
