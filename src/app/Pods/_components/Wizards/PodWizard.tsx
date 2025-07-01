import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useQueryClient } from 'react-query';
import * as Yup from 'yup';
import { useFormik, FormikProvider, FieldArray } from 'formik';
import { useAppDispatch } from '@redux';
import {
  Button,
  MenuItem,
  Collapse,
  Switch,
  FormControlLabel,
  ButtonGroup,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  SubmitWrapper,
  FMTextField,
  FMSelect,
  JSONEditor,
  Icon,
} from '@tapis/tapisui-common';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import AutoPruneEmptyFields from './Common/AutoPruneEmptyFields';
import styles from './Common/Wizard.module.scss';
import { useAppSelector, updateState } from '@redux';
import { PodVolumeEnum } from './PodVolumeEnum';
import { handleClearForm } from './PodWizardUtils';

// export enum PodProtocolEnum {
//   http = 'http',
//   tcp = 'tcp',
//   postgres = 'postgres',
//   local_only = 'local_only',
// }

const podVolumeTypes = Object.values(PodVolumeEnum);
const protocolOptions = [
  { value: 'http', label: 'http' },
  { value: 'tcp', label: 'tcp' },
  { value: 'postgres', label: 'postgres' },
  { value: 'local_only', label: 'local_only' },
];

const PodWizard: React.FC<{ onChange?: (values: any) => void }> = ({
  onChange,
}) => {
  const queryClient = useQueryClient();
  // Remove createPodData from Redux as a live source of truth
  // Use only Formik for state
  // Optionally, you can load a draft from Redux on mount if you want draft persistence

  const {
    podTab,
    podRootTab,
    podEditTab,
    podDetailTab,
    podLogTab,
    createPodData,
    setDetailsDropdownOpen,
    setLogsDropdownOpen,
  } = useAppSelector((state) => state.pods);

  // Local state for add-new fields
  const [newFields, setNewFields] = useState({
    envKey: '',
    envValue: '',
    netKey: '',
    netPort: '',
    netProtocol: '',
    volKey: '',
    volType: '',
    volMountPath: '',
    volSubPath: '',
  });

  // Redux for persistent pod creation data
  const dispatch = useAppDispatch();

  const handleNewFieldChange = (field: string, value: string) => {
    setNewFields((prev) => ({ ...prev, [field]: value }));
  };
  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.getPod);
    queryClient.invalidateQueries(Hooks.queryKeys.listPods);
  }, [queryClient]);

  // Use Redux state as initial values, fallback to defaults
  // (Optional: If you want to persist drafts, load from Redux here)
  const initialValues: any = createPodData || {
    pod_id: '',
    description: '',
    command: '',
    image: '',
    template: '',
    time_to_stop_default: '',
    time_to_stop_instance: '',
    environment_variables: {},
    volume_mounts: {},
    networking: {},
    resources: {
      cpu_request: '',
      cpu_limit: '',
      mem_request: '',
      mem_limit: '',
      gpus: '',
    },
  };

  // Validation schema (adapted from CreatePodModal)
  const validationSchema = Yup.object({
    pod_id: Yup.string()
      .min(1)
      .max(80, 'Pod id should not be longer than 80 characters')
      .matches(
        /^[a-z0-9]+$/,
        'Must contain only lowercase alphanumeric characters'
      )
      .required('Pod ID is a required field'),
    image: Yup.string()
      .min(1)
      .max(128, 'Pod Image should not be longer than 128 characters'),
    template: Yup.string()
      .min(1)
      .max(128, 'Pod Template should not be longer than 128 characters'),
    description: Yup.string()
      .min(1)
      .max(2048, 'Description should not be longer than 2048 characters'),
    command: Yup.array().of(Yup.string().required('Command cannot be empty')),
    environment_variables: Yup.object().test(
      'env-vars-object',
      'All environment variable keys and values must be non-empty strings and <= 128 chars',
      (obj) => {
        if (!obj) return true;
        return Object.entries(obj).every(
          ([k, v]) =>
            typeof k === 'string' &&
            (k as string).length > 0 &&
            (k as string).length <= 128 &&
            typeof v === 'string' &&
            (v as string).length > 0 &&
            (v as string).length <= 128
        );
      }
    ),
    networking: Yup.object().test(
      'networking-object',
      'Each networking entry must have protocol (<=128 chars) and port (number)',
      (obj) => {
        if (!obj) return true;
        return Object.values(obj).every(
          (v: any) =>
            typeof v === 'object' &&
            typeof v.protocol === 'string' &&
            v.protocol.length > 0 &&
            v.protocol.length <= 128 &&
            (typeof v.port === 'number' ||
              (typeof v.port === 'string' && v.port.length > 0))
        );
      }
    ),
    volume_mounts: Yup.object().test(
      'volume-mounts-object',
      'Each volume mount must have type, mount_path, sub_path (all <=128 chars)',
      (obj) => {
        if (!obj) return true;
        return Object.values(obj).every(
          (v: any) =>
            typeof v === 'object' &&
            typeof v.type === 'string' &&
            v.type.length > 0 &&
            v.type.length <= 128 &&
            typeof v.mount_path === 'string' &&
            v.mount_path.length > 0 &&
            v.mount_path.length <= 128 &&
            (typeof v.sub_path === 'string' ? v.sub_path.length <= 128 : true)
        );
      }
    ),
    resources: Yup.object({
      cpu_request: Yup.string()
        .min(0)
        .max(128, 'CPU request should not be longer than 128 characters'),
      cpu_limit: Yup.string()
        .min(0)
        .max(128, 'CPU limit should not be longer than 128 characters'),
      mem_request: Yup.string()
        .min(0)
        .max(128, 'Memory request should not be longer than 128 characters'),
      mem_limit: Yup.string()
        .min(0)
        .max(128, 'Memory limit should not be longer than 128 characters'),
      gpus: Yup.string()
        .min(0)
        .max(128, 'GPUs should not be longer than 128 characters'),
    }),
    time_to_stop_default: Yup.string(),
    time_to_stop_instance: Yup.string(),
  });

  // Transform functions for env vars, networking, volume mounts
  type EnvVarType = { key: string; value: string };
  type NetworkingType = { id: string; protocol: string; port: string };

  type VolumeMountsType = {
    id: string;
    type: string;
    mount_path: string;
    sub_path: string;
  };

  const { createPod, isLoading, error, isSuccess, reset } =
    Hooks.useCreatePod();

  // useEffect(() => {
  //   reset();
  // }, [reset]);

  const onSubmit = (
    {
      pod_id,
      description,
      command,
      image,
      template,
      time_to_stop_default,
      time_to_stop_instance,
      environment_variables,
      networking,
      volume_mounts,
      resources,
      ...rest
    }: any,
    { setSubmitting }: any
  ) => {
    const newPod = {
      pod_id,
      description: description ? description : undefined,
      command: command && command.length > 0 ? command : undefined,
      template: template ? template : undefined,
      image: image ? image : undefined,
      time_to_stop_default: time_to_stop_default
        ? time_to_stop_default
        : undefined,
      time_to_stop_instance: time_to_stop_instance
        ? time_to_stop_instance
        : undefined,
      environment_variables:
        environment_variables && Object.keys(environment_variables).length > 0
          ? environment_variables
          : undefined,
      networking:
        networking && Object.keys(networking).length > 0
          ? networking
          : undefined,
      volume_mounts:
        volume_mounts && Object.keys(volume_mounts).length > 0
          ? volume_mounts
          : undefined,
      resources: resources ? resources : undefined,
    };
    createPod({ newPod }, { onSuccess });
    setSubmitting(false);
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
    enableReinitialize: true,
  });

  // Debounced Redux sync for createPodData (for output/preview)
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      dispatch(updateState({ createPodData: formik.values }));
    }, 250); // 250ms debounce
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [formik.values, dispatch]);

  // Only call onChange if provided, for external consumers
  useEffect(() => {
    console.log('Formik values changed');
    console.log('formy.commands', formik.values.command);
    console.log('formy.networking', JSON.stringify(formik.values.networking));

    if (onChange) onChange(formik.values);
    // Sync formik values to Redux state
  }, [formik.values, onChange]);

  useEffect(() => {
    console.log('Persisting formik values to Redux');
    return () => {
      dispatch(updateState({ createPodData: formik.values }));
    };
    // Only run on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync Formik values from Redux when switching from JSON to form
  useEffect(() => {
    if (podEditTab === 'form' && createPodData) {
      formik.setValues(createPodData);
    }
    // Only run when switching to form
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [podEditTab]);

  // Helper to clear the form to all empty strings
  const clearedValues = {
    pod_id: '',
    description: '',
    command: [],
    image: '',
    template: '',
    time_to_stop_default: '',
    time_to_stop_instance: '',
    environment_variables: {},
    volume_mounts: {},
    networking: {},
    resources: {
      cpu_request: '',
      cpu_limit: '',
      mem_request: '',
      mem_limit: '',
      gpus: '',
    },
  };
  const handleClear = useCallback(() => {
    handleClearForm({
      formik,
      dispatch,
      reset,
      reduxKey: 'createPodData',
      clearedValues,
    });
  }, [formik, dispatch, reset]);

  return (
    <div>
      {podEditTab === 'json' ? (
        <JSONEditor
          style={{ width: '100%', fontSize: 12, lineHeight: 1 }}
          renderNewlinesInError
          obj={formik.values}
          actions={[
            {
              name: 'Create Pod',
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
                    message: 'Successfully created pod',
                  }
                : undefined,
              isLoading,
              isSuccess,
              actionFn: (obj: any) => {
                if (obj !== undefined) {
                  // Sync JSON editor changes to Redux and Formik
                  dispatch(updateState({ createPodData: obj }));
                  formik.setValues(obj);
                  createPod(obj, {
                    onSuccess: (data: any) => {
                      onSuccess();
                    },
                  });
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
        <SubmitWrapper
          className={styles['modal-footer']}
          isLoading={isLoading}
          error={error}
          success={isSuccess ? `Pod created.` : ''}
          reverse={true}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '.5rem',
              marginBottom: '.5rem',
            }}
          >
            <Tooltip title="Clear form data">
              <Button
                aria-label="Clear form data"
                color="error"
                variant="outlined"
                disabled={isLoading || Object.keys(formik.values).length <= 1}
                onClick={handleClear}
                sx={{
                  maxWidth: '2rem',
                  minWidth: '2rem',
                  height: 30,
                  px: '.8rem',
                }}
              >
                <Icon name="trash" />
              </Button>
            </Tooltip>
            <Button
              color="primary"
              disabled={isLoading || Object.keys(formik.values).length <= 1}
              aria-label="Submit"
              form="create-pod-form"
              type="submit"
              variant="outlined"
              sx={{ minWidth: 30, height: 30, px: '.8rem' }}
            >
              Create Pod
            </Button>
          </div>
        </SubmitWrapper>
      )}
      {podEditTab !== 'json' && (
        <FormikProvider value={formik}>
          <form id="create-pod-form" onSubmit={formik.handleSubmit}>
            <AutoPruneEmptyFields
              validationSchema={validationSchema}
              deepCheck={false}
            />
            <FMTextField
              formik={formik}
              name="pod_id"
              label="Pod ID"
              description="ID for this pod, unique per-tenant"
            />
            <FMTextField
              formik={formik}
              name="description"
              label="Description"
              multiline={true}
              description="Description of this pod for future reference"
            />
            <FMTextField
              formik={formik}
              name="image"
              label="Image"
              description="Docker image to use, must be on allowlist. ex. mongo:6.0"
            />
            <FMTextField
              formik={formik}
              name="template"
              label="Template"
              description="Pods template to use."
            />
            <FMTextField
              formik={formik}
              name="time_to_stop_default"
              label="Time To Stop - Default"
              description="Default TTS - Seconds until pod is stopped, set each time pod is started"
            />
            <FMTextField
              formik={formik}
              name="time_to_stop_instance"
              label="Time To Stop - Instance"
              description="Instance TTS - Seconds until pod is stopped, for only current 'run'"
            />
            {/* Command Array */}
            <React.Fragment key="command-section">
              <FieldArray
                name="command"
                render={(arrayHelpers) => (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '.5rem',
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          textAlign: 'center',
                        }}
                      >
                        Command
                      </Typography>
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={() => arrayHelpers.push('')}
                        className={styles['add-button']}
                        style={{
                          height: 30,
                          fontSize: 11,
                          marginLeft: 'auto',
                          padding: '0px 8px 0px 8px',
                        }}
                      >
                        + Command Element
                      </Button>
                    </div>
                    {formik.values.command &&
                      formik.values.command.map((cmd: string, i: number) => (
                        <ButtonGroup
                          key={i}
                          variant="outlined"
                          sx={{
                            display: 'flex',
                            alignItems: 'bottom',
                            marginBottom: '.8rem',
                            height: 40,
                          }}
                        >
                          <FMTextField
                            formik={formik}
                            name={`command.${i}`}
                            label={`Element ${i}`}
                            description=""
                            value={cmd}
                            style={{
                              minWidth: 180,
                              flex: 1,
                            }}
                            InputProps={{
                              sx: {
                                borderTopRightRadius: 0,
                                borderBottomRightRadius: 0,
                                height: 40,
                                boxSizing: 'border-box',
                              },
                            }}
                          />
                          <Button
                            type="button"
                            color="error"
                            variant="outlined"
                            onClick={() => {
                              // Always remove the command at the current index from formik.values.command
                              arrayHelpers.remove(i);
                            }}
                            sx={{
                              minWidth: 36,
                              maxWidth: 36,
                              height: 40,
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderTopLeftRadius: 0,
                              borderBottomLeftRadius: 0,
                              borderLeft: 'none',
                            }}
                            aria-label="Remove command"
                          >
                            <Icon name="trash" />
                            {i}
                          </Button>
                        </ButtonGroup>
                      ))}
                  </div>
                )}
              />
            </React.Fragment>
            {/* Environment Variables Object */}
            <React.Fragment key="envs-section">
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '.5rem',
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      textAlign: 'center',
                    }}
                  >
                    Environment Variables
                  </Typography>
                  <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    style={{
                      height: 30,
                      fontSize: 11,
                      marginLeft: 'auto',
                      padding: '0px 8px 0px 8px',
                    }}
                    onClick={() => {
                      // Determine next env var key
                      let idx = 1;
                      let nextKey = `Key${idx}`;
                      const existing = Object.keys(
                        formik.values.environment_variables || {}
                      );
                      while (existing.includes(nextKey)) {
                        idx++;
                        nextKey = `Key${idx}`;
                      }
                      formik.setFieldValue(
                        `environment_variables.${nextKey}`,
                        `Value${idx}`
                      );
                    }}
                  >
                    + Environment Variable
                  </Button>
                </div>
                {/* Go through environment_variables object */}
                {formik.values.environment_variables &&
                  Object.entries(formik.values.environment_variables).length >
                    0 &&
                  Object.entries(formik.values.environment_variables).map(
                    ([key, value]: [string, any], i) => (
                      <ButtonGroup
                        key={'envVar' + i}
                        variant="outlined"
                        sx={{
                          display: 'flex',
                          alignItems: 'top',
                          marginBottom: '.8rem',
                          width: '100%',
                          height: 40,
                        }}
                      >
                        {/* Env Key Field with key renaming logic */}
                        <FMTextField
                          formik={formik}
                          name={`environment_variables.${key}.__name`}
                          label="Key"
                          description=""
                          value={key}
                          onChange={(e: any) => {
                            const newName = e.target.value;
                            if (!newName || newName === key) return;
                            if (formik.values.environment_variables[newName])
                              return;
                            // Use order-preserving key rename
                            const oldObj = formik.values.environment_variables;
                            const newObj = Object.fromEntries(
                              Object.entries(oldObj).map(([k, v]) =>
                                k === key ? [newName, v] : [k, v]
                              )
                            );
                            formik.setFieldValue(
                              'environment_variables',
                              newObj
                            );
                          }}
                          InputProps={{
                            style: { height: 40, boxSizing: 'border-box' },
                            sx: {
                              borderBottomRightRadius: 0,
                              borderTopRightRadius: 0,
                            },
                          }}
                        />
                        <FMTextField
                          formik={formik}
                          name={`environment_variables.${key}`}
                          label="Value"
                          description=""
                          value={value}
                          InputProps={{
                            style: { height: 40, boxSizing: 'border-box' },
                            sx: {
                              borderTopLeftRadius: 0,
                              borderBottomLeftRadius: 0,
                              borderBottomRightRadius: 0,
                              borderTopRightRadius: 0,
                            },
                          }}
                        />
                        <Button
                          type="button"
                          color="error"
                          variant="outlined"
                          onClick={() => {
                            const newVars = {
                              ...formik.values.environment_variables,
                            };
                            delete newVars[key];
                            formik.setFieldValue(
                              'environment_variables',
                              newVars
                            );
                          }}
                          sx={{
                            minWidth: 36,
                            maxWidth: 36,
                            borderLeft: 'none',
                            height: 40,
                            marginLeft: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          aria-label="Remove environment variable"
                        >
                          <Icon name="trash" />
                        </Button>
                      </ButtonGroup>
                    )
                  )}
              </div>
            </React.Fragment>
            {/* Networking Object */}
            <React.Fragment key="networking-section">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '.5rem',
                }}
              >
                <Typography
                  variant="subtitle1"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    textAlign: 'center',
                  }}
                >
                  Networking
                </Typography>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  style={{
                    height: 30,
                    fontSize: 11,
                    marginLeft: 'auto',
                    padding: '0px 8px 0px 8px',
                  }}
                  onClick={() => {
                    // Determine next network name
                    const existing = Object.keys(
                      formik.values.networking || {}
                    );
                    let nextName = 'default';
                    if (existing.includes('default')) {
                      let idx = 1;
                      while (
                        existing.includes(
                          `custom${String(idx).padStart(2, '0')}`
                        )
                      ) {
                        idx++;
                      }
                      nextName = `custom${String(idx).padStart(2, '0')}`;
                    }
                    formik.setFieldValue(`networking.${nextName}`, {
                      port: '5000',
                      protocol: 'http',
                    });
                  }}
                >
                  + Network Object
                </Button>
              </div>
              {/* Go through networking objects */}
              {formik.values.networking &&
                Object.entries(formik.values.networking || {}).map(
                  ([key, value]: [string, any], i) => (
                    <ButtonGroup
                      key={'networkObj' + i}
                      variant="outlined"
                      sx={{
                        display: 'flex',
                        alignItems: 'top',
                        marginBottom: '.8rem',
                        width: '100%',
                        height: 40, // Ensure consistent height
                      }}
                    >
                      {/* Network Name Field with key renaming logic */}
                      <FMTextField
                        formik={formik}
                        name={`networking.${key}.__name`}
                        label="Name"
                        description=""
                        value={key}
                        onChange={(e: any) => {
                          const newName = e.target.value;
                          if (!newName || newName === key) return;
                          if (formik.values.networking[newName]) return;
                          // Use order-preserving key rename
                          const oldObj = formik.values.networking;
                          const newObj = Object.fromEntries(
                            Object.entries(oldObj).map(([k, v]) =>
                              k === key ? [newName, v] : [k, v]
                            )
                          );
                          formik.setFieldValue('networking', newObj);
                        }}
                        style={{ minWidth: '40%', flex: 1, height: 40 }}
                        InputProps={{
                          style: { height: 40, boxSizing: 'border-box' },
                          sx: {
                            borderBottomRightRadius: 0,
                            borderTopRightRadius: 0,
                          },
                        }}
                      />
                      <FMTextField
                        formik={formik}
                        name={`networking.${key}.port`}
                        label="Port"
                        description=""
                        value={value.port}
                        style={{ minWidth: '5rem', flex: 1, height: 40 }}
                        InputProps={{
                          sx: {
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0,
                            borderBottomRightRadius: 0,
                            borderTopRightRadius: 0,
                          },
                        }}
                      />
                      <FMSelect
                        formik={formik}
                        name={`networking.${key}.protocol`}
                        label="Protocol"
                        labelId={`networking-protocol-${i}`}
                        description=""
                        value={value.protocol}
                        style={{
                          minWidth: '8rem',
                          flex: 1,
                          height: 40,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                        SelectProps={{
                          style: { height: 40, boxSizing: 'border-box' },
                          sx: {
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0,
                            borderBottomRightRadius: 0,
                            borderTopRightRadius: 0,
                          },
                        }}
                      >
                        <MenuItem value="http">http</MenuItem>
                        <MenuItem value="tcp">tcp</MenuItem>
                        <MenuItem value="postgres">postgres</MenuItem>
                        <MenuItem value="local_only">local_only</MenuItem>
                      </FMSelect>
                      <Button
                        type="button"
                        color="error"
                        variant="outlined"
                        onClick={() => {
                          const updated = { ...formik.values.networking };
                          delete updated[key];
                          formik.setFieldValue('networking', updated);
                        }}
                        sx={{
                          minWidth: 36,
                          maxWidth: 36,
                          borderLeft: 'none',
                          height: 40,
                          marginLeft: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        aria-label="Remove network"
                      >
                        <Icon name="trash" />
                      </Button>
                    </ButtonGroup>
                  )
                )}
            </React.Fragment>
            {/* Volume Mounts Object */}
            <React.Fragment key="volume-mounts-section">
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '.5rem',
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      textAlign: 'center',
                    }}
                  >
                    Volume Mounts
                  </Typography>
                  <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    style={{
                      height: 30,
                      fontSize: 11,
                      marginLeft: 'auto',
                      padding: '0px 8px 0px 8px',
                    }}
                    onClick={() => {
                      // Determine next volume name
                      let idx = 1;
                      let nextKey = `volume${idx}`;
                      const existing = Object.keys(
                        formik.values.volume_mounts || {}
                      );
                      while (existing.includes(nextKey)) {
                        idx++;
                        nextKey = `volume${idx}`;
                      }
                      formik.setFieldValue(`volume_mounts.${nextKey}`, {
                        type: 'tapisvolume',
                        mount_path: '/dir/to/mount/to',
                        sub_path: '/dir/to/mount',
                      });
                    }}
                  >
                    + Volume Mount
                  </Button>
                </div>
                {formik.values.volume_mounts &&
                  Object.entries(formik.values.volume_mounts).length > 0 &&
                  Object.entries(formik.values.volume_mounts).map(
                    ([key, value]: [string, any], i) => (
                      <div
                        key={key}
                        style={{ display: 'flex', marginBottom: '.5rem' }}
                      >
                        <div
                          style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          {/* Row 1: Name and Type */}
                          <div style={{ display: 'flex' }}>
                            <FMTextField
                              formik={formik}
                              name={`volume_mounts.${key}.__name`}
                              label="Name"
                              description=""
                              value={key}
                              onChange={(e: any) => {
                                const newName = e.target.value;
                                if (!newName || newName === key) return;
                                if (formik.values.volume_mounts[newName])
                                  return;
                                // Use order-preserving key rename
                                const oldObj = formik.values.volume_mounts;
                                const newObj = Object.fromEntries(
                                  Object.entries(oldObj).map(([k, v]) =>
                                    k === key ? [newName, v] : [k, v]
                                  )
                                );
                                formik.setFieldValue('volume_mounts', newObj);
                              }}
                              InputProps={{
                                style: {
                                  height: 40,
                                  boxSizing: 'border-box',
                                  borderRadius: 0,
                                  borderTopLeftRadius: '6px',
                                },
                                sx: { borderRight: 'none', flex: 1 },
                              }}
                            />
                            <FMSelect
                              formik={formik}
                              name={`volume_mounts.${key}.type`}
                              label="Volume Type"
                              labelId={''}
                              description=""
                              value={value.type}
                              style={{
                                minWidth: '8rem',
                                flex: 1,
                                height: 40,
                                display: 'flex',
                                alignItems: 'center',
                              }}
                              SelectProps={{
                                style: { height: 40, boxSizing: 'border-box' },
                                sx: { borderRadius: 0 },
                              }}
                            >
                              <MenuItem disabled value={''}>
                                Select a volume type
                              </MenuItem>
                              {podVolumeTypes.map((v) => (
                                <MenuItem key={v} value={v}>
                                  {v}
                                </MenuItem>
                              ))}
                            </FMSelect>
                          </div>
                          {/* Row 2: Mount Path */}
                          <div style={{ display: 'flex' }}>
                            <FMTextField
                              formik={formik}
                              name={`volume_mounts.${key}.mount_path`}
                              label="Mount Path"
                              description=""
                              value={value.mount_path}
                              InputProps={{
                                style: {
                                  height: 40,
                                  boxSizing: 'border-box',
                                  borderRadius: 0,
                                },
                                sx: { flex: 1 },
                              }}
                              style={{ flex: 1 }}
                            />
                          </div>
                          {/* Row 3: Sub Path */}
                          <div style={{ display: 'flex' }}>
                            <FMTextField
                              formik={formik}
                              name={`volume_mounts.${key}.sub_path`}
                              label="Sub Path"
                              description=""
                              value={value.sub_path}
                              InputProps={{
                                style: { height: 40, boxSizing: 'border-box' },
                                sx: {
                                  borderRadius: 0,
                                  borderBottomLeftRadius: '6px',
                                },
                              }}
                            />
                          </div>
                        </div>
                        {/* Delete button spanning all three rows */}
                        <Button
                          type="button"
                          color="error"
                          variant="outlined"
                          onClick={() => {
                            const newVol = { ...formik.values.volume_mounts };
                            delete newVol[key];
                            formik.setFieldValue('volume_mounts', newVol);
                          }}
                          sx={{
                            minWidth: 30,
                            maxWidth: 30,
                            height: '9rem',
                            marginLeft: 0,
                            alignSelf: 'stretch',
                            borderRadius: '6px',
                            borderLeft: '1px solid #ccc',
                            borderTopLeftRadius: 0,
                            borderBottomLeftRadius: 0,
                            borderTopRightRadius: '5px',
                            borderBottomRightRadius: '5px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          aria-label="Remove volume mount"
                        >
                          <Icon name="trash" />
                        </Button>
                      </div>
                    )
                  )}
              </div>
            </React.Fragment>
            {/* Compute Resources */}
            <React.Fragment key="resources-section">
              <div
                id={`compute_resources`}
                className={styles['grid-5']}
                style={{ marginTop: 16 }}
              >
                <FMTextField
                  formik={formik}
                  name="resources.cpu_limit"
                  label="CPU Limit"
                  description={'millicpus'}
                  value={formik.values.resources?.cpu_limit || ''}
                />
                <FMTextField
                  formik={formik}
                  name="resources.cpu_request"
                  label="CPU Request"
                  description={'millicpus'}
                  value={formik.values.resources?.cpu_request || ''}
                />
                <FMTextField
                  formik={formik}
                  name="resources.mem_limit"
                  label="Memory Limit"
                  description={'megabytes'}
                  value={formik.values.resources?.mem_limit || ''}
                />
                <FMTextField
                  formik={formik}
                  name="resources.mem_request"
                  label="Memory Request"
                  description={'megabytes'}
                  value={formik.values.resources?.mem_request || ''}
                />
                <FMTextField
                  formik={formik}
                  name="resources.gpus"
                  label="GPUs"
                  description={'integers'}
                  value={formik.values.resources?.gpus || ''}
                />
              </div>
            </React.Fragment>
          </form>
        </FormikProvider>
      )}
    </div>
  );
};

export default PodWizard;
