import React, { useEffect, useCallback, useRef } from 'react';
import { Button, MenuItem, Tooltip } from '@mui/material';
import { useLocation } from 'react-router-dom';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
import {
  GenericModal,
  SubmitWrapper,
  FMTextField,
  FMSelect,
  JSONEditor,
  Icon,
} from '@tapis/tapisui-common';
import { Pods } from '@tapis/tapis-typescript';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import AutoPruneEmptyFields from './Common/AutoPruneEmptyFields';
import { useFormik, FormikProvider, FieldArray } from 'formik';
import styles from './Common/Wizard.module.scss';
import { useAppDispatch, useAppSelector, updateState } from '@redux';
import {
  CommandSection,
  EnvVarsSection,
  NetworkingSection,
  VolumeMountsSection,
  ResourcesSection,
  PodWizardActionButtons,
  handleClearForm,
} from './PodWizardUtils';

export type PodWizardProps = {
  // sharedData: any;
  // setSharedData: any;
  editMode?: 'none' | 'form' | 'json';
  pod: any;
  onChange?: (values: any) => void;
};

const PodWizardEdit: React.FC<{
  pod: any;
  onChange?: (values: any) => void;
}> = ({ pod, onChange }) => {
  const dispatch = useAppDispatch();
  const { podEditTab, updatePodData } = useAppSelector(
    (state: any) => state.pods
  );
  const objId = pod?.pod_id;

  // Set initialValues to empty object for patch update
  const initialValues: any = {};

  const validationSchema = Yup.object({
    pod_id: Yup.string()
      .min(1)
      .max(80, 'Pod id should not be longer than 80 characters')
      .matches(
        /^[a-z0-9]+$/,
        'Must contain only lowercase alphanumeric characters'
      ),
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

  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    //console.log('onSuccess called, invalidating queries... objId:', objId);
    queryClient.invalidateQueries(Hooks.queryKeys.getPod);
    queryClient.invalidateQueries(Hooks.queryKeys.getPodDerived);
    queryClient.invalidateQueries(Hooks.queryKeys.listPods);
  }, [queryClient]);

  const { updatePod, isLoading, error, isSuccess, reset } =
    Hooks.useUpdatePod(objId);

  const onSubmit = (values: any, { setSubmitting }: any) => {
    console.log('onSubmit called with:', JSON.stringify(values));
    // Build sparse updatePod object
    const newPod: any = {};
    Object.entries(values).forEach(([key, val]) => {
      if (
        val === undefined ||
        val === null ||
        (typeof val === 'string' && val.trim() === '') ||
        (Array.isArray(val) && val.length === 0) ||
        (typeof val === 'object' &&
          !Array.isArray(val) &&
          Object.keys(val).length === 0)
      ) {
        // skip empty
        return;
      }
      newPod[key] = val;
    });
    console.log('Updating pod with (sparse):', newPod);
    updatePod({ podId: objId, updatePod: newPod }, { onSuccess });
    setSubmitting(false);
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit,
    enableReinitialize: true,
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      dispatch(updateState({ updatePodData: formik.values }));
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [formik.values, dispatch]);

  // Remove all Redux sync and onChange effects for updatePodData
  // Only call onChange if provided
  useEffect(() => {
    if (onChange) onChange(formik.values);
  }, [formik.values, onChange]);

  useEffect(() => {
    return () => {
      dispatch(updateState({ updatePodData: formik.values }));
    };
  }, []);

  useEffect(() => {
    if (podEditTab === 'form' && updatePodData) {
      formik.setValues(updatePodData);
    }
  }, [podEditTab]);

  // Helper to clear the form to all empty strings
  const clearedValues = {
    description: '',
    command: [],
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
      reduxKey: 'updatePodData',
      clearedValues,
    });
  }, [formik, dispatch]);

  return (
    <div>
      {podEditTab === 'json' ? (
        <JSONEditor
          style={{
            width: '100%',
            fontSize: 12,
            lineHeight: 1,
          }}
          renderNewlinesInError
          obj={formik.values}
          actions={[
            {
              name: 'Update Pod',
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
                    message: 'Successfully updated pod',
                  }
                : undefined,
              isLoading,
              isSuccess,
              actionFn: (obj: any) => {
                if (obj !== undefined) {
                  const filtered = { ...obj };
                  delete filtered.image;
                  delete filtered.template;
                  // console.log('Updating pod: {objId} with (filtered):', objId, filtered);
                  updatePod(
                    { podId: objId, updatePod: filtered },
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
        <SubmitWrapper
          className={styles['modal-footer']}
          isLoading={isLoading}
          error={error}
          success={isSuccess ? `Pod updated.` : ''}
          reverse={true}
        >
          <PodWizardActionButtons
            isLoading={isLoading}
            isDisabled={isLoading || Object.keys(formik.values).length === 0}
            onDelete={handleClear}
            submitLabel="Update Pod"
            deleteLabel="Clear form"
            deleteTooltip="Clear form data"
            submitFormId="edit-pod-form"
          />
        </SubmitWrapper>
      )}
      {podEditTab !== 'json' && (
        <FormikProvider value={formik}>
          <form
            id="edit-pod-form"
            onSubmit={(e) => {
              console.log(
                'FORM onSubmit event! formik.errors:',
                formik.errors,
                'formik.values:',
                formik.values
              );
              formik.handleSubmit(e);
            }}
          >
            <AutoPruneEmptyFields
              validationSchema={validationSchema}
              deepCheck={false}
            />
            <FMTextField
              formik={formik}
              name="pod_id"
              label="Pod ID"
              description="ID for this pod, unique per-tenant"
              disabled
            />
            <FMTextField
              formik={formik}
              name="image"
              label="Image"
              description="Docker image to use, must be on allowlist. ex. mongo:6.0"
              disabled
            />
            <FMTextField
              formik={formik}
              name="template"
              label="Template"
              description="Pods template to use."
              disabled
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

export default PodWizardEdit;
