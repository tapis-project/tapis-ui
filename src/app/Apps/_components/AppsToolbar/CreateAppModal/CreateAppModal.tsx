/* eslint-disable no-template-curly-in-string */
import { Input, FormGroup, Label } from 'reactstrap';
import { ToolbarModalProps } from '../AppsToolbar';
import { ErrorMessage, Form, Formik } from 'formik';
import { FormikInput } from '@tapis/tapisui-common';
import { FormikSelect } from '@tapis/tapisui-common';
import { useEffect, useCallback, useState } from 'react';
import styles from './CreateAppModal.module.scss';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
import { Apps as Hooks } from '@tapis/tapisui-hooks';
import AdvancedSettings from './Settings/AdvancedSettings';
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
  KeyValuePair,
  ParameterSetArchiveFilter,
  ParameterSetLogConfig,
  AppFileInput,
  AppFileInputArray,
  ReqPostApp,
} from '@tapis/tapis-typescript-apps';

const CreateAppModal: React.FC<ToolbarModalProps> = ({ toggle }) => {
  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.list);
  }, [queryClient]);

  const { isLoading, isSuccess, error, reset, createApp } =
    Hooks.useCreateApp();

  useEffect(() => {
    reset();
  }, [reset]);

  const [simplified, setSimplified] = useState(false);
  const [withJson, setWithJson] = useState(false);
  const onChange = useCallback(() => {
    setSimplified(!simplified);
  }, [setSimplified, simplified]);

  const runtimeValues = Object.values(RuntimeEnum);
  const runtimeOptionsValues = Object.values(RuntimeOptionEnum); // as RuntimeOptionEnum[];

  const validationSchema = Yup.object({
    id: Yup.string()
      .min(1, 'ID must be at least 1 character long')
      .max(80, 'ID should not be longer than 80 characters')
      .matches(
        /^[a-zA-Z0-9_.-]+$/,
        "ID must contain only alphanumeric characters, '.', '_', or '-'"
      )
      .required('ID is a required field'),
    version: Yup.string()
      .min(1, 'Version must be at least 1 character long')
      .max(80, 'Version should not be longer than 80 characters')
      .matches(
        /^[a-zA-Z0-9_.-]+$/,
        "Version must contain only alphanumeric characters, '.', '_', or '-'"
      )
      .required('Version is a required field'),
    containerImage: Yup.string()
      .min(1, 'Container Image must be at least 1 character long')
      .max(256, 'Container Image should not be longer than 256 characters')
      .matches(
        /^[a-zA-Z0-9_.\-/:]+$/,
        "Container Image must contain only alphanumeric characters, '.', '_', '-', '/', ':'"
      )
      .required('Container Image is a required field'),
    description: Yup.string().max(
      2048,
      'Description should not be longer than 2048 characters'
    ),
    enabled: Yup.boolean(),
    locked: Yup.boolean(),
    runtimeVersion: Yup.string(),
    // runtime: Yup.string()
    //   .oneOf(runtimeValues)
    //   .required(),
    // runtimeOptions: Yup.string()
    //   .nullable(true)
    //   .oneOf([...runtimeOptionsValues, ''], 'Invalid runtime option')
    //   .when('runtime', {
    //     is: (val: string) => val !== 'DOCKER',
    //     then: (schema) => schema.required('runtimeOptions is required for SINGULARITY runtimes'),
    //     otherwise: (schema) => schema.notRequired(),
    //   }),
    maxJobs: Yup.number().integer('Max Jobs must be an integer').nullable(),
    maxJobsPerUser: Yup.number()
      .integer('Max Jobs Per User must be an integer')
      .nullable(),
    strictFileInputs: Yup.boolean(),
    tags: Yup.array().of(
      Yup.string().max(50, 'Tags should not be longer than 50 characters')
    ),
    jobAttributes: Yup.object({
      dynamicExecSystem: Yup.boolean(),
      execSystemId: Yup.string(),
      execSystemExecDir: Yup.string(),
      execSystemInputDir: Yup.string(),
      execSystemOutputDir: Yup.string(),
      execSystemLogicalQueue: Yup.string(),
      archiveSystemId: Yup.string(),
      archiveSystemDir: Yup.string(),
      archiveOnAppError: Yup.boolean(),
      isMpi: Yup.boolean(),
      mpiCmd: Yup.string(),
      cmdPrefix: Yup.string(),
      nodeCount: Yup.number()
        .integer()
        .min(1, 'Node count must be at least 1')
        .nullable(),
      coresPerNode: Yup.number()
        .integer()
        .min(1, 'Cores per node must be at least 1')
        .nullable(),
      memoryMB: Yup.number()
        .integer()
        .min(1, 'Memory in MB must be at least 1')
        .nullable(),
      maxMinutes: Yup.number()
        .integer()
        .min(1, 'Max minutes must be at least 1')
        .nullable(),
      parameterSet: Yup.object({
        envVariables: Yup.array(
          Yup.object({
            key: Yup.string()
              .min(1)
              .required('A key name is required for this environment variable'),
            value: Yup.string().required(
              'A value is required for this environment variable'
            ),
          })
        ),
        archiveFilter: Yup.object({
          includes: Yup.array(
            Yup.string()
              .min(1)
              .required('A pattern must be specified for this include')
          ),
          excludes: Yup.array(
            Yup.string()
              .min(1)
              .required('A pattern must be specified for this exclude')
          ),
          includeLaunchFiles: Yup.boolean(),
        }),
        fileInputs: Yup.array().of(
          Yup.object().shape({
            name: Yup.string().min(1).required('A fileInput name is required'),
            targetPath: Yup.string()
              .min(1)
              .required('A targetPath is required'),
            autoMountLocal: Yup.boolean(),
          })
        ),
        fileInputArrays: Yup.array().of(
          Yup.object().shape({
            name: Yup.string()
              .min(1)
              .required('A fileInputArray name is required'),
            targetDir: Yup.string().min(1).required('A targetDir is required'),
          })
        ),
      }),
    }),
  });

  const initialValues = {
    // Top Level Attributes
    id: '',
    version: '1.0',
    containerImage: '',
    description: undefined,
    runtime: undefined,
    runtimeOptions: undefined,
    jobType: undefined,

    // Advanced Attributes
    // eslint-disable-next-line no-template-curly-in-string
    owner: '${apiUserId}',
    enabled: true,
    locked: false,
    runtimeVersion: undefined,
    maxJobs: -1,
    maxJobsPerUser: -1,
    strictFileInputs: false,
    tags: [],

    jobAttributes: {
      description: '',
      dynamicExecSystem: false,
      execSystemConstraints: undefined,
      execSystemId: undefined,
      execSystemExecDir: undefined,
      execSystemInputDir: undefined,
      execSystemOutputDir: undefined,
      execSystemLogicalQueue: undefined,

      archiveSystemId: undefined,
      archiveSystemDir: undefined,
      archiveOnAppError: true,
      isMpi: undefined,
      mpiCmd: undefined,
      cmdPrefix: undefined,

      parameterSet: {
        appArgs: undefined,
        containerArgs: undefined,
        schedulerOptions: undefined,
        envVariables: undefined,
        archiveFilter: undefined,
        logConfig: undefined,
      },
      fileInputs: undefined,
      fileInputArrays: undefined,
      nodeCount: undefined,
      coresPerNode: undefined,
      memoryMB: undefined,
      maxMinutes: undefined,
    },
  };

  const onSubmit = ({
    id,
    version,
    containerImage,
    description,
    runtime,
    runtimeOptions,
    jobType,
    owner,
    enabled,
    locked,
    runtimeVersion,
    maxJobs,
    maxJobsPerUser,
    strictFileInputs,
    tags,
    jobAttributes: {
      // eslint-disable-next-line @typescript-eslint/no-redeclare
      // description,
      dynamicExecSystem,
      execSystemConstraints,
      execSystemId,
      execSystemExecDir,
      execSystemInputDir,
      execSystemOutputDir,
      execSystemLogicalQueue,
      archiveSystemId,
      archiveSystemDir,
      archiveOnAppError,
      isMpi,
      mpiCmd,
      cmdPrefix,
      parameterSet: {
        appArgs,
        containerArgs,
        schedulerOptions,
        envVariables,
        archiveFilter,
        logConfig,
      },
      fileInputs,
      fileInputArrays,
      nodeCount,
      coresPerNode,
      memoryMB,
      maxMinutes,
    },
  }: {
    id: string;
    version: string;
    containerImage: string;
    description: string | undefined;
    runtime: RuntimeEnum | undefined;
    runtimeOptions: RuntimeOptionEnum | undefined;
    jobType: JobTypeEnum | undefined;
    owner: string | undefined;
    enabled: boolean | undefined;
    locked: boolean | undefined;
    runtimeVersion: string | undefined;
    maxJobs: number | undefined;
    maxJobsPerUser: number | undefined;
    strictFileInputs: boolean | undefined;
    tags: string[] | undefined;

    // jobAttributes: JobAttributes;
    jobAttributes: {
      // jobDescription: string | undefined;
      dynamicExecSystem: boolean | undefined;
      execSystemConstraints: string[] | undefined;
      execSystemId: string | undefined;
      execSystemExecDir: string | undefined;
      execSystemInputDir: string | undefined;
      execSystemOutputDir: string | undefined;
      execSystemLogicalQueue: string | undefined;
      archiveSystemId: string | undefined;
      archiveSystemDir: string | undefined;
      archiveOnAppError: boolean | undefined;
      isMpi: boolean | undefined;
      mpiCmd: string | undefined;
      cmdPrefix: string | undefined;
      // parameterSet: ParameterSet;
      parameterSet: {
        appArgs: Array<AppArgSpec> | undefined;
        containerArgs: Array<AppArgSpec> | undefined;
        schedulerOptions: Array<AppArgSpec> | undefined;
        envVariables: Array<KeyValuePair> | undefined;
        archiveFilter: ParameterSetArchiveFilter | undefined;
        logConfig: ParameterSetLogConfig | undefined;
      };
      fileInputs: Array<AppFileInput> | undefined;
      fileInputArrays: AppFileInputArray[] | undefined;
      nodeCount: number | undefined;
      coresPerNode: number | undefined;
      memoryMB: number | undefined;
      maxMinutes: number | undefined;
    };
  }) => {
    const runtimeOptionsArray = runtimeOptions ? [runtimeOptions] : undefined;

    createApp(
      {
        reqPostApp: {
          id,
          version,
          containerImage,
          description,
          runtime,
          runtimeOptions: runtimeOptionsArray,
          jobType,
          owner,
          enabled,
          locked,
          runtimeVersion,
          maxJobs,
          maxJobsPerUser,
          strictFileInputs,

          tags,
          jobAttributes: {
            // eslint-disable-next-line @typescript-eslint/no-redeclare
            // jobDescription,
            dynamicExecSystem,
            execSystemConstraints,
            execSystemId,
            execSystemExecDir,
            execSystemInputDir,
            execSystemOutputDir,
            execSystemLogicalQueue,
            archiveSystemId,
            archiveSystemDir,
            archiveOnAppError,
            isMpi,
            mpiCmd,
            cmdPrefix,
            parameterSet: {
              appArgs,
              containerArgs,
              schedulerOptions,
              envVariables,
              archiveFilter,
              logConfig,
            },
            fileInputs,
            fileInputArrays,
            nodeCount,
            coresPerNode,
            memoryMB,
            maxMinutes,
          },
        },
      },
      true,
      { onSuccess }
    );
  };

  return (
    <Dialog
      open={true}
      onClose={toggle}
      aria-labelledby="Create App"
      aria-describedby="A modal for creating an app"
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
        <div>Create App</div>
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
              version: '',
              containerImage: '',
            }}
            actions={[
              {
                color: !isSuccess ? 'error' : 'info',
                name: !isSuccess ? 'cancel' : 'continue',
                actionFn: toggle,
              },
              {
                name: 'create app',
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
                      message: 'Successfully created app',
                    }
                  : undefined,
                isLoading,
                isSuccess,
                validator: (obj: ReqPostApp | undefined) => {
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
                actionFn: (obj: ReqPostApp | undefined) => {
                  if (obj !== undefined) {
                    createApp(
                      {
                        reqPostApp: obj,
                      },
                      true,
                      { onSuccess }
                    );
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
                    label="Application ID"
                    required={true}
                    description={`App ID`}
                    aria-label="Input"
                  />
                  <FormikInput
                    name="version"
                    label="Application Version"
                    required={true}
                    description={`App Version`}
                    aria-label="Input"
                  />
                  <FormikInput
                    name="containerImage"
                    description="Container Image"
                    label="Container Image"
                    required={true}
                    aria-label="Input"
                  />
                  <FormikInput
                    name="description"
                    label="Description"
                    required={false}
                    description={`App Description`}
                    aria-label="Input"
                  />
                  <FormikSelect
                    name="runtime"
                    description="The application runtime"
                    label="Runtime Type"
                    required={false}
                    data-testid="runtime"
                  >
                    <option defaultValue={''}>Please select a runtime</option>
                    {runtimeValues.map((values) => {
                      return <option>{values}</option>;
                    })}
                  </FormikSelect>

                  {formikProps.values.runtime !== RuntimeEnum.Docker && (
                    <FormikSelect
                      name="runtimeOptions"
                      description="The runtime command for the application"
                      label="Runtime Options"
                      required={false}
                      data-testid="runtimeOptions"
                    >
                      <option defaultValue={''}>
                        Please select a runtime option
                      </option>
                      {runtimeOptionsValues.map((values) => {
                        return <option>{values}</option>;
                      })}
                    </FormikSelect>
                  )}

                  <FormGroup check>
                    <Label check size="sm" className={`form-field__label`}>
                      <Input type="checkbox" onChange={onChange} />
                      Advanced Settings
                    </Label>
                  </FormGroup>
                  <AdvancedSettings simplified={simplified} />
                  {/* <AdvancedSettings simplified/> */}
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
            Create App
          </LoadingButton>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default CreateAppModal;
