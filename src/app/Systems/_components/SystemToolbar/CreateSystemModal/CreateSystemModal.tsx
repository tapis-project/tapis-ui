import React, { useState } from 'react';
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
  MenuItem,
  Select,
  Button,
  Box,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Collapse, JSONEditor } from '@tapis/tapisui-common';
import * as Yup from 'yup';
import AdvancedSettings from './Settings/AdvancedSettings';
import styles from './CreateSystemModal.module.scss';
import {
  ReqPostSystem,
  RuntimeTypeEnum,
  SystemTypeEnum,
  AuthnEnum,
  SchedulerTypeEnum,
} from '@tapis/tapis-typescript-systems';
import { MUIStepper, useStepperState } from 'app/_components/MUIStepper';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { State } from 'app/_components/MUIStepper/MUIStepper';
import BatchSettings from './Settings/Batch/BatchSettings';
import BatchLogicalQueuesSettings from './Settings/Batch/BatchLogicalQueuesSettings';

type LogicalQueue = {
  name: string;
  hpcQueueName: string;
  maxJobs?: number;
  maxJobsPerUser?: number;
  minNodeCount?: number;
  maxNodeCount?: number;
  minCoresPerNode?: number;
  maxCoresPerNode?: number;
  minMemoryMB?: number;
  maxMemoryMB?: number;
  minMinutes?: number;
  maxMinutes?: number;
};

const SystemDetailStep: React.FC = () => {
  const { state, updateState } = useStepperState();
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
        defaultValue={state.description}
        helperText={'Description'}
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
  const types = Object.values(Systems.SystemTypeEnum).map((r) => r);
  const authns = Object.values(Systems.AuthnEnum).map((r) => r);
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
        defaultValue={state.rootDir}
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

      <Autocomplete
        options={types}
        getOptionLabel={(option: SystemTypeEnum) => option}
        defaultValue={state.systemType ?? SystemTypeEnum.Linux}
        id="system-type-select"
        disableClearable
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
        getOptionLabel={(option: AuthnEnum): string => option}
        id="authn-method-select"
        disableClearable
        defaultValue={state.defaultAuthnMethod ?? AuthnEnum.Password}
        onChange={(_, value) => {
          if (value !== null) {
            updateState({ defaultAuthnMethod: value });
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
            checked={!!state.canExec}
            onChange={(e) => {
              const value = e.target.checked;
              updateState({ canExec: value });
            }}
          />
        }
        label="Can Exec"
      />
      <FormHelperText>Enable execution</FormHelperText>

      <FormControlLabel
        control={
          <Checkbox
            checked={!!state.canRunBatch}
            onChange={(e) => {
              const value = e.target.checked;
              updateState({ canRunBatch: value });
            }}
          />
        }
        label="Can Run Batch"
      />
      <FormHelperText>Run Batch</FormHelperText>
    </FormControl>
  );
};

const SystemRunTimeStep: React.FC<{
  values: Partial<Systems.ReqPostSystem>;
}> = ({ values }) => {
  const { state, updateState } = useStepperState();
  const runtimeTypes = Object.values(RuntimeTypeEnum);

  const runtimeType: RuntimeTypeEnum | null =
    values.jobRuntimes && values.jobRuntimes.length > 0
      ? (values.jobRuntimes[0].runtimeType as RuntimeTypeEnum)
      : null;

  return (
    <FormControl fullWidth margin="dense" style={{ marginBottom: '-16px' }}>
      {state.canExec && state.canRunBatch ? (
        <Autocomplete
          options={runtimeTypes}
          getOptionLabel={(option) => option}
          value={runtimeType}
          onChange={(_, newValue) => {
            if (!newValue) {
              updateState({ jobRuntimes: [] });
              return;
            }
            updateState({ jobRuntimes: [{ runtimeType: newValue }] });
          }}
          renderInput={(params) => (
            <TextField {...params} label="Job RunTime" variant="standard" />
          )}
          data-testid="jobRuntimes"
        />
      ) : (
        <div style={{ opacity: 0.7 }}>RunTime Unavailable</div>
      )}
    </FormControl>
  );
};

const SystemBatchStep: React.FC = () => {
  const { state, updateState } = useStepperState();
  const schedulerTypes = Object.values(SchedulerTypeEnum);
  const isLinux =
    (state.systemType ?? SystemTypeEnum.Linux) === SystemTypeEnum.Linux;

  const queues: LogicalQueue[] =
    (state.batchLogicalQueues as LogicalQueue[]) ?? [];

  const setQueues = (newQueues: LogicalQueue[]) => {
    updateState({ batchLogicalQueues: newQueues });
  };

  const addQueue = () =>
    setQueues([
      ...queues,
      {
        name: '',
        hpcQueueName: '',
      },
    ]);

  const removeQueue = (idx: number) =>
    setQueues(queues.filter((_, i) => i !== idx));

  const updateQueue = (idx: number, value: LogicalQueue) =>
    setQueues(queues.map((q, i) => (i === idx ? value : q)));

  return (
    <div>
      {isLinux && (
        <Collapse title="Batch Settings" className={styles['array']}>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!state.canRunBatch}
                onChange={(e) => updateState({ canRunBatch: e.target.checked })}
                color="primary"
              />
            }
            label="Can Run Batch"
          />
          {state.canRunBatch && (
            <div>
              <Select
                fullWidth
                size="small"
                margin="dense"
                displayEmpty
                value={state.batchScheduler ?? ''}
                onChange={(e) =>
                  updateState({ batchScheduler: e.target.value as string })
                }
              >
                <MenuItem disabled value="">
                  Select a batch scheduler
                </MenuItem>
                {schedulerTypes.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Batch scheduler for the system</FormHelperText>

              <TextField
                fullWidth
                size="small"
                margin="dense"
                label="Batch Scheduler Profile"
                value={state.batchSchedulerProfile}
                onChange={(e) =>
                  updateState({ batchSchedulerProfile: e.target.value })
                }
                helperText="Batch scheduler profile (leave blank to unset)"
                style={{ marginTop: '16px' }}
              />

              <TextField
                fullWidth
                size="small"
                margin="dense"
                label="Batch Default Logical Queue"
                value={state.batchDefaultLogicalQueue}
                onChange={(e) => {
                  updateState({ batchDefaultLogicalQueue: e.target.value });
                }}
                helperText="Batch default logical queue (must match one logical queue name)"
                style={{ marginTop: '16px' }}
              />

              <Collapse
                open={queues.length > 0}
                title="Batch Logical Queues"
                note={`${queues.length} item${queues.length !== 1 ? 's' : ''}`}
                className={styles['array']}
              >
                {queues.map((queue, idx) => (
                  <Collapse
                    key={idx}
                    open={true}
                    title={`Batch Logical Queue ${idx + 1}`}
                    className={styles['item']}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      label="Name"
                      required
                      value={queue.name || ''}
                      onChange={(e) =>
                        updateQueue(idx, { ...queue, name: e.target.value })
                      }
                      helperText="Name (used as logical queue identifier)"
                      style={{ marginBottom: '8px' }}
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="HPC Queue Name"
                      required
                      value={queue.hpcQueueName || ''}
                      onChange={(e) =>
                        updateQueue(idx, {
                          ...queue,
                          hpcQueueName: e.target.value,
                        })
                      }
                      helperText="HPC Queue Name (actual scheduler queue)"
                      style={{ marginBottom: '8px' }}
                    />

                    {[
                      ['maxJobs', 'Max Jobs'],
                      ['maxJobsPerUser', 'Max Jobs Per User'],
                      ['minNodeCount', 'Min Node Count'],
                      ['maxNodeCount', 'Max Node Count'],
                      ['minCoresPerNode', 'Min Cores Per Node'],
                      ['maxCoresPerNode', 'Max Cores Per Node'],
                      ['minMemoryMB', 'Min Memory MB'],
                      ['maxMemoryMB', 'Max Memory MB'],
                      ['minMinutes', 'Min Minutes'],
                      ['maxMinutes', 'Max Minutes'],
                    ].map(([key, label]) => (
                      <TextField
                        key={key}
                        fullWidth
                        size="small"
                        type="number"
                        label={label}
                        value={(queue as any)[key as keyof LogicalQueue] ?? ''}
                        onChange={(e) =>
                          updateQueue(idx, {
                            ...queue,
                            [key]:
                              e.target.value === ''
                                ? undefined
                                : Number(e.target.value),
                          } as LogicalQueue)
                        }
                        helperText={label}
                        style={{ marginBottom: '8px' }}
                      />
                    ))}

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        onClick={() => removeQueue(idx)}
                        size="small"
                        variant="outlined"
                      >
                        Remove
                      </Button>

                      <Button
                        onClick={() =>
                          updateQueue(idx, {
                            ...queue,
                            name: queue.name || `queue-${idx + 1}`,
                          })
                        }
                        size="small"
                        variant="contained"
                      >
                        Save
                      </Button>
                    </Box>
                  </Collapse>
                ))}

                <Button
                  onClick={addQueue}
                  size="small"
                  variant="contained"
                  sx={{ mt: 2 }}
                >
                  + Add Logical Queue
                </Button>
              </Collapse>
            </div>
          )}
        </Collapse>
      )}
    </div>
  );
};

const MiscellaneousStep: React.FC = () => {
  const { state } = useStepperState();
  const advancedSetting = Object.values(AdvancedSettings);

  return (
    <FormControl fullWidth margin="dense" style={{ marginBottom: '-16px' }}>
      {state.canExec ? (
        <Autocomplete
          options={advancedSetting}
          getOptionLabel={(option) => option}
          value={advancedSetting as any}
          onChange={(_, newValue) => {
            /* noop for now */
          }}
          renderInput={(params) => (
            <TextField {...params} label="Miscellaeous" variant="standard" />
          )}
          data-testid="Miscellaneous"
        />
      ) : (
        <div style={{ opacity: 0.7 }}> Miscellaneous Unavailable </div>
      )}
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

const initialState: Partial<ReqPostSystem> = {
  id: undefined,
  description: undefined,
  systemType: SystemTypeEnum.Linux,
  host: 'stampede2.tacc.utexas.edu',
  rootDir: '/',
  defaultAuthnMethod: AuthnEnum.Password,
  canExec: true,
  jobRuntimes: [{ runtimeType: RuntimeTypeEnum.Singularity }],
  effectiveUserId: undefined,
  canRunBatch: true,
  batchScheduler: SchedulerTypeEnum.Slurm,
  batchSchedulerProfile: 'tacc',
  batchDefaultLogicalQueue: undefined,
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

const CreateSystemModal: React.FC<{
  open: boolean;
  toggle: () => void;
  onCreate?: (system: ReqPostSystem) => void;
  systemTypes?: SystemTypeEnum[];
  authnMethods?: AuthnEnum[];
}> = ({
  open,
  toggle,
  onCreate,
  systemTypes = Object.values(SystemTypeEnum),
  authnMethods = Object.values(AuthnEnum),
}) => {
  const [state, setState] = useState<Partial<ReqPostSystem>>(initialState);
  const [withJson, setWithJson] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (key: keyof ReqPostSystem, value: any) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const { makeNewSystem } = Hooks.useMakeNewSystem();

  const handleSubmit = async (finalStateRaw: ReqPostSystem) => {
    try {
      const finalState = { ...finalStateRaw } as any;

      ['batchDefaultLogicalQueue'].forEach((k) => {
        if (finalState[k] === '') finalState[k] = undefined;
      });

      const jobRuntimesArray =
        (finalState.jobRuntimes || []).map((r: any) => ({
          runtimeType: r.runtimeType,
          version: r.version,
        })) || [];

      finalState.jobRuntimes = jobRuntimesArray;

      validationSchema.validateSync(finalState, { abortEarly: false });

      setIsSubmitting(true);
      setSubmitError(null);

      await makeNewSystem(finalState);
      onCreate?.(finalState);

      setSubmitSuccess(true);
      setIsSubmitting(false);
      toggle();
    } catch (e) {
      if (e instanceof Yup.ValidationError) {
        setSubmitError(e.errors.join('\n'));
      } else {
        setSubmitError((e as any)?.message ?? 'Unknown error');
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
          <JSONEditor<Partial<ReqPostSystem>>
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
                  handleSubmit(obj as ReqPostSystem);
                },
              },
            ]}
          />
        ) : (
          <div className={styles['modal-settings']}>
            <MUIStepper
              initialState={state as State}
              backDisabled={submitSuccess}
              nextDisabled={!!submitError || isSubmitting || submitSuccess}
              nextIsLoading={isSubmitting}
              steps={[
                {
                  label: 'Details',
                  element: <SystemDetailStep />,
                  nextCondition: (state) => state.id !== undefined,
                },
                {
                  label: 'Host',
                  element: <SystemHostStep />,
                  nextCondition: (state) => state.host !== undefined,
                },
                {
                  label: 'Runtime',
                  element:
                    state.canRunBatch && state.canExec ? (
                      <SystemRunTimeStep values={state} />
                    ) : (
                      <div> Runtime Unavailable </div>
                    ),
                  nextCondition: (state) => state.systemType !== undefined,
                },
                {
                  label: 'Miscellaneous',
                  element: state.canExec ? (
                    <AdvancedSettings
                      canExec={!!state.canExec}
                      values={state}
                      onChange={handleChange}
                    />
                  ) : (
                    <div style={{ padding: '1rem', opacity: 0.7 }}>
                      Unavailable
                    </div>
                  ),
                },
                {
                  label: 'Batch',
                  element:
                    state.canRunBatch && state.canExec ? (
                      <SystemBatchStep />
                    ) : (
                      <div> Batch Unvailable</div>
                    ),
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
        </DialogActions>
      )}
    </Dialog>
  );
};

export default CreateSystemModal;
