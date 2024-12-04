////import { Button } from 'reactstrap';
import { GenericModal } from '@tapis/tapisui-common';
import { SubmitWrapper } from '@tapis/tapisui-common';
import { ToolbarModalProps } from '../PodToolbar';
import { Form, Formik, FieldArray, useFormikContext, useFormik } from 'formik';
import { FormikInput, Collapse, Icon } from '@tapis/tapisui-common';
import { FormikSelect, FMTextField } from '@tapis/tapisui-common';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { useEffect, useCallback } from 'react'; //useState
import styles from './CreatePodModal.module.scss';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
//import { Pods } from '@tapis/tapis-typescript';
import { Button } from '@mui/material';

import { useLocation } from 'react-router-dom';

export enum PodProtocolEnum {
  http = 'http',
  tcp = 'tcp',
  postgres = 'postgres',
  local_only = 'local_only',
}

export enum PodVolumeEnum {
  tapisvolume = 'tapisvolume',
  tapissnapshot = 'tapissnapshot',
  pvc = 'pvc',
}

export type CodeEditProps = {
  sharedData: any;
  setSharedData: any;
};

//Arrays that are used in the drop-down menus
const podProtocols = Object.values(PodProtocolEnum);
const podVolumeTypes = Object.values(PodVolumeEnum);

const EnvVarValueSource: React.FC<{ formik: any; index: number }> = ({
  formik,
  index,
}) => {
  return (
    <div id={`env-value-source-${index}`} className={styles['grid-2']}>
      <div>
        <FMTextField
          formik={formik}
          name="description"
          label="Description"
          description="Pod Description"
        />

        <FormikInput
          id={`environment_variables.${index}.id`}
          name={`environment_variables.${index}.id`}
          label="key"
          required={true}
          description={`ex. _MY_VAR, var3, VAR`}
          aria-label="Input"
          value=""
        />
      </div>
      <div>
        <FormikInput
          id={`environment_variables.${index}.value`}
          name={`environment_variables.${index}.value`}
          label="value"
          required={false}
          description={`ex. 123, test, my-value`}
          aria-label="Input"
          value=""
        />
      </div>
    </div>
  );
};

const NetworkingValueSource: React.FC<{ index: number }> = ({ index }) => {
  return (
    <div id={`networking-value-source-${index}`} className={styles['grid-3']}>
      <div>
        <FormikInput
          id={`networking.${index}.id`}
          name={`networking.${index}.id`}
          label="key"
          required={true}
          description={`default sets main url`}
          aria-label="Input"
          value=""
        />
      </div>
      <div>
        <FormikSelect
          id={`networking.${index}.protocol`}
          name={`networking.${index}.protocol`}
          label="protocol"
          required={true}
          description={`network protocol`}
          aria-label="Input"
          value=""
        >
          <option disabled value={''}>
            Select a network protocol
          </option>
          {podProtocols.map((values) => {
            return <option>{values}</option>;
          })}
        </FormikSelect>
      </div>
      <div>
        <FormikInput
          id={`networking.${index}.port`}
          name={`networking.${index}.port`}
          label="port"
          required={true}
          description={`port to route`}
          aria-label="Input"
          value=""
        />
      </div>
    </div>
  );
};

const VolumeMountsValueSource: React.FC<{ index: number }> = ({ index }) => {
  return (
    <div
      id={`volume_mounts-value-source-${index}`}
      className={styles['grid-half']}
    >
      <div>
        <FormikInput
          id={`volume_mounts.${index}.id`}
          name={`volume_mounts.${index}.id`}
          label="id"
          required={true}
          description={`Name of tapisvolume/snapshot; unique name for pvc`}
          aria-label="Input"
          value=""
        />
      </div>
      <div>
        <FormikSelect
          id={`volume_mounts.${index}.type`}
          name={`volume_mounts.${index}.type`}
          label="type"
          required={true}
          description={`Volume type to use`}
          aria-label="Input"
          value=""
        >
          <option disabled value={''}>
            Select a volume type
          </option>
          {podVolumeTypes.map((values) => {
            return <option>{values}</option>;
          })}
        </FormikSelect>
      </div>
      <div>
        <FormikInput
          id={`volume_mounts.${index}.mount_path`}
          name={`volume_mounts.${index}.mount_path`}
          label="mount_path"
          required={false}
          description={`Path to mount volume in pod`}
          aria-label="Input"
          value=""
        />
      </div>
      <div>
        <FormikInput
          id={`volume_mounts.${index}.sub_path`}
          name={`volume_mounts.${index}.sub_path`}
          label="sub_path"
          required={false}
          description={`Path from volume to mount`}
          aria-label="Input"
          value=""
        />
      </div>
    </div>
  );
};

const UpdatePodBase: React.FC<CodeEditProps> = ({
  sharedData,
  setSharedData,
}) => {
  //Allows the pod list to update without the user having to refresh the page
  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.listPods);
  }, [queryClient]);

  const podId = useLocation().pathname.split('/')[2];

  const initialValues: any = {};

  const { updatePod, isLoading, error, isSuccess, reset } =
    Hooks.useUpdatePod(podId);

  useEffect(() => {
    reset();
  }, [reset]);

  //used for the advanced checkbox
  // const [simplified, setSimplified] = useState(false);
  // const onChange = useCallback(() => {
  //   setSimplified(!simplified);
  // }, [setSimplified, simplified]);

  const validationSchema = Yup.object({
    image: Yup.string()
      .min(1)
      .max(128, 'Pod Image should not be longer than 128 characters'),
    template: Yup.string()
      .min(1)
      .max(128, 'Pod Template should not be longer than 128 characters'),
    description: Yup.string()
      .min(22)
      .max(2048, 'Description should not be longer than 2048 characters'),
    command: Yup.array()
      .of(Yup.string())
      .min(0)
      .max(128, 'Pod Template should not be longer than 128 characters'),
    environment_variables: Yup.array().of(
      Yup.object({
        id: Yup.string()
          .min(1)
          .max(128, 'Pod Template should not be longer than 128 characters')
          .required('id is a required field'),
        value: Yup.string()
          .min(1)
          .max(128, 'Pod Template should not be longer than 128 characters')
          .required('value is a required field'),
      })
    ),
    volume_mounts: Yup.array().of(
      Yup.object({
        id: Yup.string()
          .min(1)
          .max(128, 'Pod Template should not be longer than 128 characters')
          .required('id is a required field'),
        type: Yup.string()
          .min(1)
          .max(128, 'Pod Template should not be longer than 128 characters')
          .required('type is a required field'),
        mount_path: Yup.string()
          .min(1)
          .max(128, 'Pod Template should not be longer than 128 characters')
          .required('mount_path is a required field'),
        sub_path: Yup.string()
          .min(1)
          .max(128, 'Pod Template should not be longer than 128 characters'),
      })
    ),
    networking: Yup.array().of(
      Yup.object({
        id: Yup.string()
          .min(1)
          .max(128, 'Pod Template should not be longer than 128 characters'),
        protocol: Yup.string()
          .min(1)
          .max(128, 'Pod Template should not be longer than 128 characters'),
        port: Yup.number()
          .min(1000)
          .max(99999, 'Port must be between 1000 and 99999'),
      })
    ),
    resources: Yup.object({
      cpu_request: Yup.string()
        .min(1)
        .max(128, 'Pod Template should not be longer than 128 characters'),
      cpu_limit: Yup.string()
        .min(1)
        .max(128, 'Pod Template should not be longer than 128 characters'),
      mem_request: Yup.string()
        .min(1)
        .max(128, 'Pod Template should not be longer than 128 characters'),
      mem_limit: Yup.string()
        .min(1)
        .max(128, 'Pod Template should not be longer than 128 characters'),
      gpus: Yup.string()
        .min(1)
        .max(128, 'Pod Template should not be longer than 128 characters'),
    }),
  });

  /// Environment Variables area
  //////////////////////////////
  type EnvVarType = {
    id: string;
    value: string;
  };

  type EnvVarsTransformFn = (envVars: Array<EnvVarType>) => {
    [key: string]: string;
  };

  const envVarsArrayToInputObject: EnvVarsTransformFn = (envVars) => {
    if (!envVars) {
      console.warn('envVars is undefined');
      return {};
    }

    const env: { [key: string]: string } = {};
    envVars.forEach((envVar) => {
      env[envVar.id] = envVar.value;
    });
    console.log(env);
    return env;
  };
  /// Networking area
  ///////////////////
  type NetworkingType = {
    id: string;
    protocol: PodProtocolEnum;
    port: string;
  };

  type NetworkingTransformFn = (envVars: Array<NetworkingType>) => {
    [key: string]: object;
  };

  const networkingArrayToInputObject: NetworkingTransformFn = (
    networkingArray
  ) => {
    if (!networkingArray) {
      console.warn('networkingArray is undefined');
      return {};
    }

    const env: { [key: string]: object } = {};
    networkingArray.forEach((networkingArray) => {
      env[networkingArray.id] = {
        protocol: networkingArray.protocol,
        port: networkingArray.port,
      };
    });
    console.log(env);
    return env;
  };

  /// Volume Mounts area
  ///////////////////
  type VolumeMountsType = {
    id: string;
    type: PodProtocolEnum;
    mount_path: string;
    sub_path: string;
  };

  type volumeMountsTransformFn = (volumes: Array<VolumeMountsType>) => {
    [key: string]: object;
  };

  const volume_mountsArrayToInputObject: volumeMountsTransformFn = (
    volumes
  ) => {
    if (!volumes) {
      console.warn('volumes is undefined');
      return {};
    }

    const formatted_volumes: { [key: string]: object } = {};
    volumes.forEach((volume) => {
      formatted_volumes[volume.id] = {
        type: volume.type,
        mount_path: volume.mount_path,
        sub_path: volume.sub_path,
      };
    });
    console.log(formatted_volumes);
    return formatted_volumes;
  };

  type UpdatePodBaseProps = {
    description: string | undefined;
    image: string | undefined;
    command: string | undefined;
    template: string | undefined;
    time_to_stop_default: number | undefined;
    time_to_stop_instance: number | undefined;
    environment_variables: Array<EnvVarType>;
    networking: Array<NetworkingType>;
    volume_mounts: Array<VolumeMountsType>;
    resources:
      | {
          cpu_request: number;
          cpu_limit: number;
          mem_request: number;
          mem_limit: number;
          gpus: number;
        }
      | undefined;
  };

  /// onSubmit is made up of an object X properties. I destructure the object, allowing me to select properties from the object in my function, after =>.
  const onSubmit = ({
    description,
    command,
    time_to_stop_default,
    time_to_stop_instance,
    environment_variables,
    networking,
    volume_mounts,
    resources,
  }: UpdatePodBaseProps) => {
    const updatedPod = {
      description,
      command: command ? JSON.parse(command) : undefined,
      time_to_stop_default,
      time_to_stop_instance,
      environment_variables: envVarsArrayToInputObject(environment_variables),
      networking: networkingArrayToInputObject(networking),
      volume_mounts: volume_mountsArrayToInputObject(volume_mounts),
      resources,
    };

    const updatedPodFiltered = filterUndefinedValues(updatedPod);
    updatePod({ podId: podId, updatePod: updatedPodFiltered }, { onSuccess });
  };

  // Have to filter info to updatePod to remove undefined values
  const filterUndefinedValues = (obj: { [key: string]: any }) => {
    return Object.keys(obj).reduce((acc, key) => {
      const value = obj[key];
      const isEmptyArray = Array.isArray(value) && value.length === 0;
      const isEmptyObject =
        value && typeof value === 'object' && Object.keys(value).length === 0;
      if (value !== undefined && !isEmptyArray && !isEmptyObject) {
        acc[key] = value;
      }
      return acc;
    }, {} as { [key: string]: any });
  };

  const AutoPruneEmptyFields: React.FC = () => {
    const { values, setFieldValue } = useFormikContext<UpdatePodBaseProps>();

    useEffect(() => {
      const pruneEmptyFields = (
        obj: { [key: string]: any },
        parentKey = ''
      ) => {
        Object.keys(obj).forEach((key) => {
          const value = obj[key];
          const path = parentKey ? `${parentKey}.${key}` : key;
          const isEmptyString = value === '';
          const isEmptyArray = Array.isArray(value) && value.length === 0;
          const isEmptyObject =
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value) &&
            Object.keys(value).length === 0;

          if (isEmptyString || isEmptyArray || isEmptyObject) {
            setFieldValue(path, undefined);
          } else if (
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value)
          ) {
            pruneEmptyFields(value, path);
          }
        });
      };

      pruneEmptyFields(values);
    }, [values, setFieldValue]);

    return null; // This component does not render anything
  };

  function handleFormChange(values: any) {
    let transformedValues = { ...values };

    if (values.environment_variables) {
      transformedValues.environment_variables = envVarsArrayToInputObject(
        values.environment_variables
      );
    }

    if (values.networking) {
      transformedValues.networking = networkingArrayToInputObject(
        values.networking
      );
    }

    if (values.volume_mounts) {
      transformedValues.volume_mounts = volume_mountsArrayToInputObject(
        values.volume_mounts
      );
    }
    console.warn(transformedValues);
  }

  const formik = useFormik({
    initialValues: {
      description: '',
      command: '',
      time_to_stop_default: 0,
      time_to_stop_instance: 0,
      environment_variables: [],
      networking: [],
      volume_mounts: [],
      resources: {
        cpu_request: 0,
        cpu_limit: 0,
        mem_request: 0,
        mem_limit: 0,
        gpus: 0,
      },
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
  });

  return (
    <div>
      <SubmitWrapper
        className={styles['modal-footer']}
        isLoading={isLoading} // Ensure isLoading is defined and reflects the loading state
        error={error} // Ensure error is defined and reflects any error messages
        success={isSuccess ? `Successfully updated the pod` : ''} // isSuccess should reflect the success state
        reverse={true}
      >
        <Button
          form="update-pod-form" // Ensure this matches the id of the Form component
          color="primary"
          disabled={isLoading || isSuccess} // Disable the button when loading or on success
          aria-label="Submit"
          type="submit"
        >
          Update Pod
        </Button>
      </SubmitWrapper>

      {/* <form onSubmit={formik.handleSubmit}>
          <FMTextField formik={formik} name="description" label="Description" />
            <Button color="primary" variant="contained" fullWidth type="submit">
              Submit
            </Button>
          </form> */}
      <form onChange={setSharedData(formik.values)}>
        {/* <TextField
              fullWidth
              id="description"
              name="description"
              label="Description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
              size="small"
            /> */}
        {/* <TextField
              fullWidth
              id="password"
              name="password"
              label="Password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            /> */}
        {/* <AutoPruneEmptyFields /> */}

        <FMTextField
          formik={formik}
          name="description"
          label="Description"
          description="Pod Description"
        />
        <FMTextField
          formik={formik}
          name="command"
          label="Command"
          description='Pod Command - Overwrites docker image. ex. ["sleep", "5000"]'
        />

        <FMTextField
          formik={formik}
          name="time_to_stop_default"
          label="Time To Stop - Default"
          description="Default TTS - Seconds until pod is stopped, default for all instances"
        />
        <FMTextField
          formik={formik}
          name="time_to_stop_instance"
          label="Time To Stop - Instance"
          description="Instance TTS - Seconds until pod is stopped, for current instance"
        />
        {/* 
        <Button color="primary" variant="contained" fullWidth type="submit">
          Submit
        </Button> */}
      </form>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        render={({ values }) => (
          <Form id="update-pod-form">
            <AutoPruneEmptyFields />
            {/* <FormikInput
              name="description"
              label="Description"
              required={false}
              description={`Pod Description`}
              aria-label="Input"
            />
            <FormikInput
              name="command"
              label="Command"
              required={false}
              description={`Pod Command - Overwrites docker image. ex. ["sleep", "5000"]`}
              aria-label="Input"
            />
            <FormikInput
              name="time_to_stop_default"
              label="Time To Stop - Default"
              required={false}
              description={`Default TTS - Seconds until pod is stopped, set each time pod is started`}
              aria-label="Input"
            />
            <FormikInput
              name="time_to_stop_instance"
              label="Time To Stop - Instance"
              required={false}
              description={`Instance TTS - Seconds until pod is stopped, for only current "run"`}
              aria-label="Input"
            /> */}
            <Collapse title="Environment Variables">
              <FieldArray
                name="environment_variables"
                render={(arrayHelpers) => (
                  <div>
                    <div className={styles['key-val-env-vars']}>
                      {values.environment_variables &&
                        values.environment_variables.length > 0 &&
                        values.environment_variables.map((_, i) => (
                          <div key={i} className={styles['key-val-env-var']}>
                            <EnvVarValueSource formik={formik} index={i} />
                            <Button
                              variant="outlined"
                              className={styles['remove-button']}
                              type="button"
                              color="error"
                              disabled={false}
                              onClick={() => arrayHelpers.remove(i)}
                              size="medium"
                            >
                              <Icon name="trash" />
                            </Button>
                          </div>
                        ))}
                    </div>
                    <Button
                      type="button"
                      className={styles['add-button']}
                      onClick={() => {
                        arrayHelpers.push({});
                      }}
                    >
                      + Add "environment_variable" object
                    </Button>
                  </div>
                )}
              />
            </Collapse>

            <Collapse title="Networking">
              <FieldArray
                name="networking"
                render={(arrayHelpers) => (
                  <div>
                    <div className={styles['key-val-env-vars']}>
                      {values.networking &&
                        values.networking.length > 0 &&
                        values.networking.map((_, i) => (
                          <div key={i} className={styles['key-val-env-var']}>
                            <NetworkingValueSource index={i} />
                            <Button
                              className={styles['remove-button']}
                              type="button"
                              color="error"
                              disabled={false}
                              onClick={() => arrayHelpers.remove(i)}
                              size="small"
                            >
                              <Icon name="trash" />
                            </Button>
                          </div>
                        ))}
                    </div>
                    <Button
                      type="button"
                      className={styles['add-button']}
                      onClick={() => {
                        arrayHelpers.push({
                          id: 'default',
                          protocol: 'http',
                          port: '5000',
                        });
                      }}
                    >
                      + Add "networking" object
                    </Button>
                  </div>
                )}
              />
            </Collapse>

            <Collapse title="Volume Mounts">
              <FieldArray
                name="volume_mounts"
                render={(arrayHelpers) => (
                  <div>
                    <div className={styles['key-val-env-vars']}>
                      {values.volume_mounts &&
                        values.volume_mounts.length > 0 &&
                        values.volume_mounts.map((_, i) => (
                          <div key={i} className={styles['key-val-env-var']}>
                            <VolumeMountsValueSource index={i} />
                            <Button
                              className={styles['remove-button']}
                              type="button"
                              color="error"
                              disabled={false}
                              onClick={() => arrayHelpers.remove(i)}
                              size="small"
                            >
                              <Icon name="trash" />
                            </Button>
                          </div>
                        ))}
                    </div>
                    <Button
                      type="button"
                      className={styles['add-button']}
                      onClick={() => {
                        arrayHelpers.push({
                          id: '',
                          type: 'tapisvolume',
                          mount_path: '/tapis_volume_mount',
                          sub_path: '',
                        });
                      }}
                    >
                      + Add "volume" object
                    </Button>
                  </div>
                )}
              />
            </Collapse>

            <Collapse title="Compute Resources">
              <div id={`compute_resources`} className={styles['grid-5']}>
                <FormikInput
                  name="resources.cpu_limit"
                  label="cpu_limit"
                  required={false}
                  description={'millicpus'}
                  aria-label="Input"
                />
                <FormikInput
                  name="resources.cpu_request"
                  label="cpu_request"
                  required={false}
                  description={'millicpus'}
                  aria-label="Input"
                />
                <FormikInput
                  name="resources.mem_limit"
                  label="mem_limit"
                  required={false}
                  description={'megabytes'}
                  aria-label="Input"
                />
                <FormikInput
                  name="resources.mem_request"
                  label="mem_request"
                  required={false}
                  description={'megabytes'}
                  aria-label="Input"
                />
                <FormikInput
                  name="resources.gpus"
                  label="gpus"
                  required={false}
                  description={'integers'}
                  aria-label="Input"
                />
              </div>
            </Collapse>
          </Form>
        )}
      ></Formik>
    </div>
  );
};

export default UpdatePodBase;
