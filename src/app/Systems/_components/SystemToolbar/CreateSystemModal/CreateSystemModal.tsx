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
} from '@tapis/tapis-typescript-systems';
import { useQueryClient } from 'react-query';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import AdvancedSettings from './Settings/AdvancedSettings';

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

  //used for the advanced checkbox
  const [simplified, setSimplified] = useState(false);
  const onChange = useCallback(() => {
    setSimplified(!simplified);
  }, [setSimplified, simplified]);

  const validationSchema = Yup.object({
    sysname: Yup.string()
      .min(1)
      .max(80, 'System name should not be longer than 80 characters')
      .matches(
        /^[a-zA-Z0-9_.-]+$/,
        "Must contain only alphanumeric characters and the following: '.', '_', '-'"
      )
      .required('System name is a required field'),
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
    // dtnSystemId: Yup.string().max(
    //   80,
    //   'DTN System ID should not be longer than 80 characters'
    // ),
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

    //dtn
    // isDtn: false,
    // dtnSystemId: undefined,
    // dtnMountPoint: undefined,
    // dtnMountSourcePath: undefined,

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

    // //dtn
    // isDtn,
    // dtnSystemId,
    // dtnMountPoint,
    // dtnMountSourcePath,

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

    //dtn
    // isDtn: boolean;
    // dtnSystemId: string | undefined;
    // dtnMountPoint: string | undefined;
    // dtnMountSourcePath: string | undefined;

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

        //dtn
        // isDtn,
        // dtnSystemId,
        // dtnMountPoint,
        // dtnMountSourcePath,

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
    <GenericModal
      toggle={toggle}
      title="Create New System"
      body={
        <div className={styles['modal-settings']}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {() => (
              <Form id="newsystem-form">
                <FormGroup check>
                  <Label check size="sm" className={`form-field__label`}>
                    <Input type="checkbox" onChange={onChange} />
                    Advanced Settings
                  </Label>
                </FormGroup>
                <FormikInput
                  name="sysname"
                  label="System Name"
                  required={true}
                  description={`System name`}
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
                {true ? (
                  <FormikCheck
                    name="canExec"
                    required={true}
                    label="Can Execute"
                    description={'Decides if the system can execute'}
                  />
                ) : null}

                <AdvancedSettings simplified={simplified} />
              </Form>
            )}
          </Formik>
        </div>
      }
      footer={
        <SubmitWrapper
          className={styles['modal-footer']}
          isLoading={isLoading}
          error={error}
          success={isSuccess ? `Successfully created a new system` : ''}
          reverse={true}
        >
          <Button
            form="newsystem-form"
            color="primary"
            disabled={isLoading || isSuccess}
            aria-label="Submit"
            type="submit"
          >
            Create
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default CreateSystemModal;
