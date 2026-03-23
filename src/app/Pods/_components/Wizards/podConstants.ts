import * as Yup from 'yup';
import type { FieldTemplate } from './Common/ResourceEditor';

// ── Shared Yup field validators ──────────────────────────────────────────────

const envVarsValidator = Yup.object().test(
  'env-vars-object',
  'All environment variable keys and values must be non-empty strings and <= 128 chars',
  (obj) => {
    if (!obj) return true;
    return Object.entries(obj).every(
      ([k, v]) =>
        typeof k === 'string' &&
        k.length > 0 &&
        k.length <= 128 &&
        typeof v === 'string' &&
        (v as string).length > 0 &&
        (v as string).length <= 128
    );
  }
);

const networkingValidator = Yup.object().test(
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
);

const volumeMountsValidator = Yup.object().test(
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
);

const resourcesValidator = Yup.object({
  cpu_request: Yup.string().min(0).max(128),
  cpu_limit: Yup.string().min(0).max(128),
  mem_request: Yup.string().min(0).max(128),
  mem_limit: Yup.string().min(0).max(128),
  gpus: Yup.string().min(0).max(128),
});

// ── Validation schemas ───────────────────────────────────────────────────────

export const podEditValidation = Yup.object({
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
  environment_variables: envVarsValidator,
  networking: networkingValidator,
  volume_mounts: volumeMountsValidator,
  arguments: Yup.array().of(Yup.string()).nullable(),
  secret_map: Yup.object().nullable(),
  template_overrides: Yup.object().nullable(),
  time_to_stop_ts: Yup.string().nullable(),
  resources: resourcesValidator,
  time_to_stop_default: Yup.string(),
  time_to_stop_instance: Yup.string(),
});

export const podCreateValidation = Yup.object({
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
  environment_variables: envVarsValidator,
  networking: networkingValidator,
  volume_mounts: volumeMountsValidator,
  template_overrides: Yup.object().nullable(),
  resources: resourcesValidator,
  time_to_stop_default: Yup.string(),
  time_to_stop_instance: Yup.string(),
});

// ── Defaults & read-only fields ──────────────────────────────────────────────

export const POD_READ_ONLY_FIELDS = ['pod_id', 'image', 'template'];

export const POD_DEFAULT_VALUES = {
  pod_id: '',
  description: '',
  command: [],
  image: '',
  template: '',
  time_to_stop_default: '',
  time_to_stop_instance: '',
  environment_variables: {},
  volume_mounts: {},
  template_overrides: {},
  networking: {},
  resources: {
    cpu_request: '',
    cpu_limit: '',
    mem_request: '',
    mem_limit: '',
    gpus: '',
  },
};

// ── Field templates (shared between create & edit) ───────────────────────────

export const POD_FIELD_TEMPLATES: FieldTemplate[] = [
  {
    label: 'Description',
    field: 'description',
    defaultValue: '',
    description: 'Text description of this pod',
  },
  {
    label: 'Command',
    field: 'command',
    defaultValue: ['/bin/bash', '-c', 'echo hello'],
    description: 'Container entrypoint command',
  },
  {
    label: 'Arguments',
    field: 'arguments',
    defaultValue: ['--help'],
    description: 'Arguments passed to command',
  },
  {
    label: 'Environment Variables',
    field: 'environment_variables',
    defaultValue: { MY_VAR: 'value' },
    description: 'Key-value env vars for the container',
  },
  {
    label: 'Networking',
    field: 'networking',
    defaultValue: { default: { protocol: 'http', port: 8080 } },
    description: 'Network ports and protocols',
  },
  {
    label: 'Volume Mounts',
    field: 'volume_mounts',
    defaultValue: {
      my_volume: { type: 'tapisvolume', mount_path: '/data', sub_path: '' },
    },
    description: 'Attach storage volumes',
  },
  {
    label: 'Resources',
    field: 'resources',
    defaultValue: {
      cpu_request: '250m',
      cpu_limit: '1000m',
      mem_request: '256Mi',
      mem_limit: '1Gi',
      gpus: '0',
    },
    description: 'CPU, memory, and GPU limits',
  },
  {
    label: 'Secret Map',
    field: 'secret_map',
    defaultValue: { MY_SECRET: 'secret_value' },
    description: 'Map secrets into the container',
  },
  {
    label: 'Template Overrides',
    field: 'template_overrides',
    defaultValue: {},
    description: 'Override template settings',
  },
  {
    label: 'Time To Stop - Default',
    field: 'time_to_stop_default',
    defaultValue: '3600',
    description: 'Seconds until pod stops (each start)',
  },
  {
    label: 'Time To Stop - Instance',
    field: 'time_to_stop_instance',
    defaultValue: '7200',
    description: 'Seconds until pod stops (this run)',
  },
];
