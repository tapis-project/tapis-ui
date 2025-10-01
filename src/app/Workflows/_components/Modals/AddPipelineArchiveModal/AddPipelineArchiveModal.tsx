import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { MUIStepper, useStepperState } from 'app/_components';
import { QueryWrapper } from '@tapis/tapisui-common';
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

const ChooseArchiveStep: React.FC<{ groupId: string }> = ({ groupId }) => {
  const { state, updateState } = useStepperState();
  const { data, isLoading, error } = Hooks.Archives.useList({ groupId });
  const archives = data?.result || [];

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <FormControl fullWidth margin="dense" style={{ marginBottom: '-16px' }}>
        <Autocomplete
          options={archives}
          getOptionLabel={(archive: Workflows.Archive) => archive.id}
          defaultValue={state.archiveId}
          id="archive-autocomplete"
          disableClearable
          onChange={(_, value) => {
            if (value !== null) {
              updateState({
                archiveId: value.id,
              });
            }
          }}
          renderInput={(params) => (
            <TextField {...params} label="Archive" variant="standard" />
          )}
        />
        <FormHelperText sx={{ m: 0, marginTop: '4px' }}>
          Choose a task runtime
        </FormHelperText>
      </FormControl>
    </QueryWrapper>
  );
};

type AddPipelineArchiveModalProps = {
  pipeline: Workflows.Pipeline;
  groupId: string;
  open: boolean;
  toggle: () => void;
};

const AddPipelineArchiveModal: React.FC<AddPipelineArchiveModalProps> = ({
  open,
  toggle,
  groupId,
  pipeline,
}) => {
  const { create, isError, error, reset, isLoading, isSuccess, invalidate } =
    Hooks.PipelineArchives.useCreate();

  const addArchive = ({ archiveId }: { archiveId: string }) => {
    create(
      {
        groupId,
        pipelineId: pipeline.id!,
        reqAddPipelineArchive: { archive_id: archiveId },
      },
      {
        onSuccess: () => {
          invalidate();
          reset();
          toggle();
        },
      }
    );
  };

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={toggle}
      aria-labelledby="Update pipeline environment"
      aria-describedby="A modal for creating and updating env vars"
    >
      <DialogTitle id="alert-dialog-title">
        Add archive to pipeline
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
        {isError && error && (
          <Alert
            style={{ marginBottom: '8px' }}
            severity="error"
            onClose={() => {
              reset();
            }}
          >
            <AlertTitle>Error</AlertTitle>
            {error.message}
          </Alert>
        )}
        <MUIStepper
          initialState={{
            archiveId: undefined,
          }}
          backDisabled={isSuccess}
          nextIsLoading={isLoading}
          nextDisabled={isError || isLoading || isSuccess}
          onClickFinish={(state) => {
            if (state.archiveId) {
              addArchive({
                archiveId: state.archiveId,
              });
            }
          }}
          finishButtonText="finish"
          steps={[
            {
              label: 'Choose archive',
              element: <ChooseArchiveStep groupId={groupId} />,
              nextCondition: (state) => state.archiveId !== undefined,
            },
          ]}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddPipelineArchiveModal;
