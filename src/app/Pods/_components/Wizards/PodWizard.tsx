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
import {
  CommandSection,
  EnvVarsSection,
  NetworkingSection,
  VolumeMountsSection,
  ResourcesSection,
  PodWizardActionButtons,
  handleClearForm,
} from './PodWizardUtils';

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

  // Redux for persistent pod creation data
  const dispatch = useAppDispatch();

  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    //console.log('onSuccess called, invalidating queries... objId:', objId);
    queryClient.invalidateQueries(Hooks.queryKeys.getPod);
    queryClient.invalidateQueries(Hooks.queryKeys.getPodDerived);
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

            <CommandSection formik={formik} />
            <EnvVarsSection formik={formik} />
            <NetworkingSection formik={formik} />
            <VolumeMountsSection formik={formik} />
            <ResourcesSection formik={formik} />
          </form>
        </FormikProvider>
      )}
    </div>
  );
};

export default PodWizard;
