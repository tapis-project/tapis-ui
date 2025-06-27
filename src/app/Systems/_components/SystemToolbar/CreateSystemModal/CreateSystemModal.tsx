import { Button, Input, FormGroup, Label } from 'reactstrap';
import { GenericModal } from '@tapis/tapisui-common';
import { SubmitWrapper } from '@tapis/tapisui-common';
import { ToolbarModalProps } from '../SystemToolbar';
import { Form, Formik } from 'formik';
import { FormikInput } from '@tapis/tapisui-common';
import { FormikSelect, FormikCheck } from '@tapis/tapisui-common';
import { useEffect, useCallback, useState } from 'react';
import styles from './CreateSystemModal.module.scss';
import * as Yup from 'yup';
import {
  SystemTypeEnum,
  AuthnEnum,
  RuntimeTypeEnum,
  SchedulerTypeEnum,
  LogicalQueue,
  Capability,
  KeyValuePair,
  ReqPostSystem,
} from '@tapis/tapis-typescript-systems';
import { useQueryClient } from 'react-query';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import AdvancedSettings from './Settings/AdvancedSettings';
/* eslint-disable no-template-curly-in-string */
import { ErrorMessage } from 'formik';
import { LoadingButton } from '@mui/lab';
import { JSONEditor } from '@tapis/tapisui-common';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

import {
  RuntimeEnum,
  RuntimeOptionEnum,
  JobTypeEnum,
} from '@tapis/tapis-typescript-apps';

import {
  AppArgSpec,
  ParameterSetArchiveFilter,
  ParameterSetLogConfig,
  AppFileInput,
  AppFileInputArray,
} from '@tapis/tapis-typescript-apps';

//Arrays that are used in the drop-down menus
const systemTypes = Object.values(SystemTypeEnum);
const authnMethods = Object.values(AuthnEnum);

const CreateSystemModal: React.FC<ToolbarModalProps> = ({ toggle }) => {
  //Allows the system list to update without the user having to refresh the page
  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.list);
  }, [queryClient]);

  const { makeNewSystem, isLoading, error, isSuccess, reset } =
    Hooks.useMakeNewSystem();

  useEffect(() => {
    reset();
  }, [reset]);

  // used for the canExec checkbox
  const [exec, setExec] = useState(true);
  const [simplified, setSimplified] = useState(false);
  const [withJson, setWithJson] = useState(false);
  const onChange = useCallback(() => {
    setSimplified(!simplified);
  }, [setSimplified, simplified]);

  const validationSchema = Yup.object({
    id: Yup.string()
      .min(1)
      .max(80, 'System id should not be longer than 80 characters')
      .matches(
        /^[a-zA-Z0-9_.-]+$/,
        "Must contain only alphanumeric characters and the following: '.', '_', '-'"
      )
      .required('System id is a required field'),
    description: Yup.string().max(
      2048,
      'Description schould not be longer than 2048 characters'
    ),
    host: Yup.string()
      .min(1)
      .max(256, 'Host name should not be longer than 256 characters')
      .matches(
        /^[a-zA-Z0-9_.-]+$/,
        "Must contain only alphanumeric characters and the following: '.', '_', '-'"
      )
      .required('Host name is a required field'),
    rootDir: Yup.string()
      .min(1)
      .max(4096, 'Root Directory should not be longer than 4096 characters'),
    jobWorkingDir: Yup.string()
      .min(1)
      .max(
        4096,
        'Job Working Directory should not be longer than 4096 characters'
      ),
    effectiveUserId: Yup.string().max(
      60,
      'Effective User ID should not be longer than 60 characters'
    ),
    batchSchedulerProfile: Yup.string().max(
      80,
      'Batch Scheduler Profile should not be longer than 80 characters'
    ),
    batchDefaultLogicalQueue: Yup.string().max(
      128,
      'Batch Default Logical Queue should not be longer than 128 characters'
    ),
    proxyHost: Yup.string().max(
      256,
      'Proxy Host should not be longer than 256 characters'
    ),
    mpiCmd: Yup.string().max(
      126,
      'mpiCmd should not be longer than 126 characters'
    ),
  });

  const initialValues = {
    sysname: '',
    description: undefined,
    systemType: SystemTypeEnum.Linux,
    host: 'stampede2.tacc.utexas.edu',
    defaultAuthnMethod: AuthnEnum.Password,
    canExec: true,
    rootDir: '/',
    jobRuntimes: RuntimeTypeEnum.Singularity,
    version: undefined,
    effectiveUserId: undefined, //default =  ${apiUserId}
    bucketName: undefined,

    //batch
    canRunBatch: true,
    batchScheduler: SchedulerTypeEnum.Slurm,
    batchSchedulerProfile: 'tacc',
    batchDefaultLogicalQueue: 'tapisNormal',

    batchLogicalQueues: [
      {
        name: 'tapisNormal',
        hpcQueueName: 'normal',
        maxJobs: 50,
        maxJobsPerUser: 10,
        minNodeCount: 1,
        maxNodeCount: 16,
        minCoresPerNode: 1,
        maxCoresPerNode: 68,
        minMemoryMB: 1,
        maxMemoryMB: 16384,
        minMinutes: 1,
        maxMinutes: 60,
      },
    ],

    //proxy
    useProxy: false,
    proxyHost: undefined,
    proxyPort: 0,

    //cmd
    enableCmdPrefix: false,
    mpiCmd: undefined,

    jobWorkingDir: 'HOST_EVAL($SCRATCH)',
    jobMaxJobs: undefined,
    jobMaxJobsPerUser: undefined,
    jobCapabilities: [],
    jobEnvVariables: [],

    tags: [],
  };

  const onSubmit = ({
    sysname,
    description,
    systemType,
    host,
    defaultAuthnMethod,
    canExec,
    rootDir,
    jobWorkingDir,
    jobRuntimes,
    version,
    effectiveUserId,
    bucketName,

    //batch
    canRunBatch,
    batchScheduler,
    batchSchedulerProfile,
    batchDefaultLogicalQueue,
    batchLogicalQueues,

    //proxy
    useProxy,
    proxyHost,
    proxyPort,

    //cmd
    enableCmdPrefix,
    mpiCmd,

    jobMaxJobs,
    jobMaxJobsPerUser,
    jobCapabilities,
    jobEnvVariables,

    tags,
  }: {
    sysname: string;
    description: string | undefined;
    systemType: SystemTypeEnum;
    host: string;
    defaultAuthnMethod: AuthnEnum;
    canExec: boolean;
    rootDir: string;
    jobWorkingDir: string;
    jobRuntimes: RuntimeTypeEnum;
    version: string | undefined;
    effectiveUserId: string | undefined;
    bucketName: string | undefined;

    //batch
    canRunBatch: boolean;
    batchScheduler: SchedulerTypeEnum;
    batchSchedulerProfile: string;
    batchDefaultLogicalQueue: string;
    batchLogicalQueues: Array<LogicalQueue>;

    //proxy
    useProxy: boolean;
    proxyHost: string | undefined;
    proxyPort: number;

    //cmd
    enableCmdPrefix: boolean;
    mpiCmd: string | undefined;

    jobMaxJobs: number | undefined;
    jobMaxJobsPerUser: number | undefined;
    jobCapabilities: Array<Capability>;
    jobEnvVariables: Array<KeyValuePair>;

    tags: Array<string> | undefined;
  }) => {
    //Converting the string into a boolean value
    const jobRuntimesArray = [{ runtimeType: jobRuntimes, version }];

    makeNewSystem(
      {
        id: sysname,
        description,
        systemType,
        host,
        defaultAuthnMethod,
        canExec,
        rootDir,
        jobWorkingDir,
        jobRuntimes: jobRuntimesArray,
        effectiveUserId,
        bucketName,

        //batch
        canRunBatch,
        batchScheduler,
        batchSchedulerProfile,
        batchDefaultLogicalQueue,
        batchLogicalQueues,

        //proxy
        useProxy,
        proxyHost,
        proxyPort,

        //cmd
        // enableCmdPrefix,
        // mpiCmd,

        jobMaxJobs,
        jobMaxJobsPerUser,
        jobCapabilities,
        jobEnvVariables,

        tags,
      },
      true,
      { onSuccess }
    );
  };

  return (
    <Dialog
      open={true}
      onClose={toggle}
      aria-labelledby="Create System"
      aria-describedby="A modal for creating a system"
      maxWidth={false} // disables the default maxWidth constraints
      fullWidth={false} // prevents auto-stretching to 100%
      PaperProps={{
        style: { width: 'auto' }, // optional, helps content dictate width
      }}
    >
      <DialogTitle
        id="dialog-title"
        style={{ display: 'flex', justifyContent: 'space-between' }}
      >
        <div>Create System</div>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
          <LoadingButton
            onClick={() => {
              setWithJson(false);
            }}
            variant={!withJson ? 'contained' : 'outlined'}
            color="info"
            size="small"
          >
            form
          </LoadingButton>

          <LoadingButton
            onClick={() => {
              setWithJson(true);
            }}
            variant={withJson ? 'contained' : 'outlined'}
            color="info"
            size="small"
          >
            json editor
          </LoadingButton>
        </div>
      </DialogTitle>

      <DialogContent>
        {withJson ? (
          <JSONEditor
            style={{ width: '60vw', marginTop: '8px' }}
            renderNewlinesInError
            obj={{
              id: '',
              description: '',
              systemType: SystemTypeEnum.Linux,
              host: 'stampede2.tacc.utexas.edu',
              rootDir: '/',
              defaultAuthnMethod: AuthnEnum.Password,
              canExec: true,
            }}
            actions={[
              {
                color: !isSuccess ? 'error' : 'info',
                name: !isSuccess ? 'cancel' : 'continue',
                actionFn: toggle,
              },
              {
                name: 'create system',
                disableOnError: true,
                disableOnUndefined: true,
                disableOnIsLoading: true,
                disableOnSuccess: true,
                error:
                  error !== null
                    ? {
                        title: 'Error',
                        message: error.message,
                      }
                    : undefined,
                result: isSuccess
                  ? {
                      success: isSuccess,
                      message: 'Successfully created system',
                    }
                  : undefined,
                isLoading,
                isSuccess,
                validator: (obj: ReqPostSystem | undefined) => {
                  let success: boolean = false;
                  let message: string = '';
                  try {
                    validationSchema.validateSync(obj, { abortEarly: false });
                    success = true;
                  } catch (e) {
                    (e as Yup.ValidationError).errors.map(
                      (msg, i) => (message = message + `#${i + 1}: ${msg}\n`)
                    );
                  }

                  return {
                    success,
                    message,
                  };
                },
                actionFn: (obj: ReqPostSystem | undefined) => {
                  if (obj !== undefined) {
                    makeNewSystem(obj, true, { onSuccess });
                  }
                },
              },
            ]}
            onCloseError={() => {
              reset();
            }}
            onCloseSuccess={() => {
              reset();
            }}
          />
        ) : (
          <div className={styles['modal-settings']}>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={onSubmit}
            >
              {(formikProps) => (
                <Form id="newapp-form">
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="field-error"
                  />
                  <FormikInput
                    name="id"
                    label="System ID"
                    required={true}
                    description={`System ID`}
                    aria-label="Input"
                  />
                  <FormikInput
                    name="description"
                    label="Description"
                    required={false}
                    description={`System description`}
                    aria-label="Input"
                  />
                  <FormikSelect
                    name="systemType"
                    description="The system type"
                    label="System Type"
                    required={true}
                    data-testid="systemType"
                  >
                    <option disabled value={''}>
                      Select a system type
                    </option>
                    {systemTypes.map((values) => {
                      return <option>{values}</option>;
                    })}
                  </FormikSelect>
                  <FormikInput
                    name="host"
                    label="Host"
                    required={true}
                    description={`Host of the system`}
                    aria-label="Input"
                  />

                  <FormikInput
                    name="rootDir"
                    label="Root Directory"
                    required={false}
                    description={`Root directory`}
                    aria-label="Input"
                  />

                  <FormikSelect
                    name="defaultAuthnMethod"
                    description="Authentication method for the system"
                    label="Default Authentication Method"
                    required={true}
                    data-testid="defaultAuthnMethod"
                  >
                    <option disabled value="">
                      Select a default athenication method
                    </option>
                    {authnMethods.map((values) => {
                      return <option>{values}</option>;
                    })}
                  </FormikSelect>

                  <FormikInput
                    name="effectiveUserId"
                    label="Effective User ID"
                    required={false}
                    description={`Effective user id`}
                    aria-label="Input"
                  />

                  <FormikCheck
                    name="canExec"
                    required={true}
                    label="Can Execute"
                    description={'Enables system execution'}
                    type="checkbox"
                    checked={exec}
                    onClick={(e) => {
                      setExec(!exec);
                    }}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const newValue = e.target.checked;
                      setExec(newValue); // Update local state `exec`
                    }}
                  />
                  <AdvancedSettings canExec={exec} />
                </Form>
              )}
            </Formik>
          </div>
        )}
      </DialogContent>

      {!withJson && (
        <DialogActions>
          <LoadingButton onClick={toggle}>
            {isSuccess ? 'Continue' : 'Cancel'}
          </LoadingButton>
          <LoadingButton
            onClick={toggle}
            disabled={isSuccess}
            loading={isLoading}
            variant="outlined"
            autoFocus
          >
            Create System
          </LoadingButton>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default CreateSystemModal;
