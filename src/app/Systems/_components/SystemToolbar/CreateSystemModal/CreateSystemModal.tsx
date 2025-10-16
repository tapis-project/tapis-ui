import React, { useState, useEffect, useCallback } from 'react';
import { Systems } from '@tapis/tapis-typescript';
import {
  TextField,
  FormControl,
  FormHelperText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Autocomplete,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { JSONEditor } from '@tapis/tapisui-common';
import * as Yup from 'yup';
import AdvancedSettings from './Settings/AdvancedSettings';
import styles from './CreateSystemModal.module.scss';
import {
  ReqPostSystem,
  RuntimeTypeEnum,
  SystemTypeEnum,
  AuthnEnum,
  JobRuntime,
  SchedulerTypeEnum,
} from '@tapis/tapis-typescript-systems';
import { MUIStepper, useStepperState } from 'app/_components/MUIStepper';
// import { useAppSelector } from '@redux';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { State } from 'app/_components/MUIStepper/MUIStepper';

type CreateSystemModalProps = {
  open: boolean;
  toggle: () => void;
  onCreate?: (system: ReqPostSystem) => void;
  systemTypes?: SystemTypeEnum[];
  authnMethods?: AuthnEnum[];
};

const SystemDetailStep: React.FC = () => {
  const { state, updateState } = useStepperState();
  const { makeNewSystem, data, isLoading, error } = Hooks.useMakeNewSystem();
  return (
    <FormControl fullWidth margin="dense" style={{ marginBottom: '-16px' }}>
      <TextField
        fullWidth
        size="small"
        margin="dense"
        label="System Id"
        required
        defaultValue={state.id}
        helperText={'Choose a unique name for this system'}
        FormHelperTextProps={{
          sx: { m: 0, marginTop: '4px' },
        }}
        onChange={(e) => {
          updateState({ id: e.target.value });
        }}
        style={{ marginTop: '16px' }}
      />
      <TextField
        fullWidth
        size="small"
        margin="dense"
        label="Description"
        required
        defaultValue={state.description}
        helperText={'System Description'}
        FormHelperTextProps={{
          sx: { m: 0, marginTop: '4px' },
        }}
        onChange={(e) => {
          updateState({ description: e.target.value });
        }}
        style={{ marginTop: '16px' }}
      />
    </FormControl>
  );
};

const SystemHostStep: React.FC = () => {
  const { state, updateState } = useStepperState();
  return (
    <FormControl fullWidth margin="dense" style={{ marginBottom: '-16px' }}>
      <TextField
        fullWidth
        size="small"
        margin="dense"
        label="Host"
        required
        defaultValue={state.host}
        helperText={'Host of the system'}
        FormHelperTextProps={{
          sx: { m: 0, marginTop: '4px' },
        }}
        onChange={(e) => {
          updateState({ host: e.target.value });
        }}
        style={{ marginTop: '16px' }}
      />
      <TextField
        fullWidth
        size="small"
        margin="dense"
        label="Root Directory"
        required
        defaultValue={state.rootDirectory}
        helperText={'/'}
        FormHelperTextProps={{
          sx: { m: 0, marginTop: '4px' },
        }}
        onChange={(e) => {
          updateState({ rootDir: e.target.value });
        }}
        style={{ marginTop: '16px' }}
      />
      <TextField
        fullWidth
        size="small"
        margin="dense"
        label="Effective User Id"
        required
        defaultValue={state.effectiveUserId}
        helperText={'Effective user id'}
        FormHelperTextProps={{
          sx: { m: 0, marginTop: '4px' },
        }}
        onChange={(e) => {
          updateState({ effectiveUserId: e.target.value });
        }}
        style={{ marginTop: '16px' }}
      />
    </FormControl>
  );
};

const SystemTypeStep: React.FC = () => {
  const { state, updateState } = useStepperState();
  // const { systems } = useAppSelector((state) => state.system);
  const types = Object.values(Systems.SystemTypeEnum).map((r) => r);
  const authns = Object.values(Systems.AuthnEnum).map((r) => r);

  return (
    <FormControl fullWidth margin="dense" style={{ marginBottom: '-16px' }}>
      <Autocomplete
        options={types}
        getOptionLabel={(option: SystemTypeEnum) => {
          return option;
        }}
        defaultValue={initialState.systemType}
        id="disable-close-on-select"
        disableClearable
        renderOption={(props, systems) => {
          return <li {...props}>{systems}</li>;
        }}
        onChange={(_, value) => {
          if (value !== null) {
            updateState({ systemType: value });
          }
        }}
        renderInput={(params) => (
          <TextField {...params} label="System Type" variant="standard" />
        )}
      />
      <FormHelperText> System Type </FormHelperText>

      <Autocomplete
        options={authns}
        getOptionLabel={(option: AuthnEnum): string => {
          return option;
        }}
        id="disable-close-on-select"
        disableClearable
        defaultValue={initialState.defaultAuthnMethod}
        renderOption={(props, authnMethods) => {
          return <li {...props}> {authnMethods}</li>;
        }}
        onChange={(_, value) => {
          if (value !== null) {
            updateState({ authns: value });
          }
        }}
        renderInput={(params) => (
          <TextField {...params} label="Authn Method" variant="standard" />
        )}
      />
      <FormHelperText> Default Authentication Method </FormHelperText>

      <FormControlLabel
        control={
          <Checkbox
            checked={state.canExec ?? false}
            onChange={(e) => {
              const value = e.target.checked;
              updateState({ canExec: value });
            }}
          />
        }
        label="Can Exec"
      />
      <FormHelperText>Enable execution</FormHelperText>
    </FormControl>
  );
};

const validationSchema = Yup.object({
  id: Yup.string()
    .min(1)
    .max(80)
    .matches(
      /^[a-zA-Z0-9_.-]+$/,
      "Only alphanumeric characters '.', '_', '-' allowed"
    )
    .required(),
  description: Yup.string().max(2048),
  host: Yup.string().min(1).max(256).required(),
  rootDir: Yup.string().max(4096),
  effectiveUserId: Yup.string().max(60),
});

const initialState: ReqPostSystem = {
  id: '',
  description: '',
  systemType: SystemTypeEnum.Linux,
  host: 'stampede2.tacc.utexas.edu',
  rootDir: '/',
  defaultAuthnMethod: AuthnEnum.Password,
  canExec: true,
  jobRuntimes: [{ runtimeType: RuntimeTypeEnum.Singularity }],
  effectiveUserId: ' ',
  canRunBatch: true,
  batchScheduler: SchedulerTypeEnum.Slurm,
  batchSchedulerProfile: 'tacc',
  batchDefaultLogicalQueue: 'tapisNormal',
  batchLogicalQueues: [],
  useProxy: false,
  proxyHost: undefined,
  proxyPort: 0,
  enableCmdPrefix: false,
  mpiCmd: undefined,
  jobWorkingDir: 'HOST_EVAL($SCRATCH)',
  jobMaxJobs: undefined,
  jobMaxJobsPerUser: undefined,
  jobCapabilities: [],
  jobEnvVariables: [],
  tags: [],
};

const CreateSystemModal: React.FC<CreateSystemModalProps> = ({
  open,
  toggle,
  onCreate,
  systemTypes = Object.values(SystemTypeEnum),
  authnMethods = Object.values(AuthnEnum),
}) => {
  const [state, setState] = useState<ReqPostSystem>(initialState);
  const [withJson, setWithJson] = useState(false);
  const [canExec, setCanExec] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (key: keyof ReqPostSystem, value: any) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const { makeNewSystem } = Hooks.useMakeNewSystem();

  const handleSubmit = async (finalState: ReqPostSystem) => {
    try {
      validationSchema.validateSync(finalState, { abortEarly: false });
      const jobRuntimesArray =
        finalState.jobRuntimes?.map((r) => ({
          runtimeType: r.runtimeType,
          version: r.version,
        })) || [];

      const newSystem = { ...finalState, jobRuntimes: jobRuntimesArray };

      setIsSubmitting(true);
      setSubmitError(null);

      await makeNewSystem(newSystem);
      onCreate?.(newSystem);

      setSubmitSuccess(true);
      setIsSubmitting(false);
      toggle();
    } catch (e) {
      if (e instanceof Yup.ValidationError) {
        setSubmitError(e.errors.join('\n'));
      } else {
        setSubmitError('Unknown error');
      }
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={() => {
        toggle();
      }}
      aria-labelledby="Create System"
      maxWidth="md"
    >
      <DialogTitle style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>Create System</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <LoadingButton
            onClick={() => setWithJson(false)}
            variant={!withJson ? 'contained' : 'outlined'}
            size="small"
          >
            Form
          </LoadingButton>
          <LoadingButton
            onClick={() => setWithJson(true)}
            variant={withJson ? 'contained' : 'outlined'}
            size="small"
          >
            JSON Editor
          </LoadingButton>
        </div>
      </DialogTitle>

      <DialogContent>
        {withJson ? (
          <JSONEditor<ReqPostSystem>
            obj={state}
            renderNewlinesInError
            actions={[
              {
                name: 'Cancel',
                color: 'error',
                actionFn: () => toggle(),
              },
              {
                name: 'Create System',
                disableOnError: true,
                isLoading: isSubmitting,
                isSuccess: submitSuccess,
                actionFn: (obj) => {
                  if (!obj) return;
                  handleSubmit(obj);
                },
              },
            ]}
          />
        ) : (
          <div className={styles['modal-settings']}>
            <MUIStepper
              initialState={initialState}
              backDisabled={submitSuccess}
              nextDisabled={!!submitError || isSubmitting || submitSuccess}
              nextIsLoading={isSubmitting}
              steps={[
                {
                  label: 'System Details',
                  element: <SystemDetailStep />,
                  nextCondition: (state) => state.id !== undefined,
                },
                {
                  label: 'System Host',
                  element: <SystemHostStep />,
                  nextCondition: (state) => state.host !== undefined,
                },
                {
                  label: 'System Type',
                  element: <SystemTypeStep />,
                  nextCondition: (state) => state.systemType !== undefined,
                },
                {
                  label: 'System Details',
                  element: canExec ? (
                    <AdvancedSettings
                      canExec={canExec}
                      values={state}
                      onChange={handleChange}
                    />
                  ) : (
                    <div style={{ padding: '1rem', opacity: 0.7 }}>
                      Advanced settings are disabled until “Can Exec” is
                      checked.
                    </div>
                  ),
                  nextCondition: (state) => state.id !== undefined,
                },
              ]}
              finishButtonText="Create System"
              onClickFinish={(finalState: State) =>
                handleSubmit(finalState as ReqPostSystem)
              }
            />

            {submitError && (
              <FormHelperText error>{submitError}</FormHelperText>
            )}
          </div>
        )}
      </DialogContent>

      {!withJson && (
        <DialogActions>
          <LoadingButton onClick={toggle}>
            {submitSuccess ? 'Continue' : 'Cancel'}
          </LoadingButton>
          <LoadingButton
            onClick={(finalState) =>
              handleSubmit(finalState as unknown as ReqPostSystem)
            }
            disabled={
              submitSuccess ||
              isSubmitting ||
              !validationSchema.isValidSync(state)
            }
            loading={isSubmitting}
            variant="outlined"
          >
            Create System
          </LoadingButton>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default CreateSystemModal;
