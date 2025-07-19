import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { MUIStepper, useStepperState } from 'app/_components';
import { QueryWrapper, FileListing } from '@tapis/tapisui-common';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  SelectChangeEvent,
  Alert,
  AlertTitle,
  Input,
  IconButton,
  Autocomplete,
  TextField,
  OutlinedInput,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import Toolbar from 'app/Files/_components/Toolbar';
import { useFilesSelect } from 'app/Files/_components/FilesContext';

type ArchiveFileListingModalProps = {
  pipeline: Workflows.Pipeline;
  groupId: string;
  archive: Workflows.TapisSystemArchive;
  open: boolean;
  toggle: () => void;
};

const ArchiveFileListingModal: React.FC<ArchiveFileListingModalProps> = ({
  open,
  toggle,
  groupId,
  pipeline,
  archive,
}) => {
  const { select, selectedFiles, unselect } = useFilesSelect();
  const formattedArchiveDir = archive.archive_dir.startsWith('/')
    ? archive.archive_dir.slice(1)
    : archive.archive_dir;
  return (
    <Dialog
      open={open}
      onClose={toggle}
      aria-labelledby="View files"
      aria-describedby="A modal for viewing files in a system archive"
      PaperProps={{
        style: {
          width: 'auto',
          maxWidth: 'none',
        },
      }}
    >
      <DialogTitle id="alert-dialog-title">
        Archive
        <IconButton
          aria-label="close"
          onClick={toggle}
          sx={{
            position: 'absolute',
            right: '16px',
            top: '8px',
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <h2>Tapis System: {archive.system_id}</h2>
        <div style={{ paddingBottom: '16px' }}>
          <Toolbar
            systemId={archive.system_id}
            currentPath={'/'}
            buttons={['view', 'download']}
          />
        </div>
        <FileListing
          systemId={archive.system_id}
          path={`/`}
          location={`/files/${archive.system_id}`}
          selectMode={{ mode: 'multi', types: ['dir', 'file'] }}
          selectedFiles={selectedFiles}
          onSelect={(files) => select(files, 'multi')}
          onUnselect={unselect}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ArchiveFileListingModal;
