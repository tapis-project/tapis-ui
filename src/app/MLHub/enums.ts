/* ─── Single source of truth for all enum-like constants ────────── */
/* This file is THE canonical location for inference backend definitions,
   model/dataset/deployment status values, artifact types, and their
   associated display metadata (colors, icons, labels).
 *
 * RULE: Never define these values inline or in any other file.
 * Always import from here. */

// ════════════════════════════════════════════════════════════════
// 1. INFERENCE BACKENDS (formerly "frameworks")
// ════════════════════════════════════════════════════════════════
import * as Models from '@mlhub/models-ts-sdk';

export type InferenceBackend =
  | 'transformers'
  | 'diffusers'
  | 'ultralytics'
  | 'pytorch'
  | 'tensorflow'
  | 'xgboost'
  | 'onnx'
  | 'custom';

/** The ordered list of all valid inference backends. Import this — never re-declare. */
export const ALL_INFERENCE_BACKENDS: InferenceBackend[] = [
  'transformers',
  'diffusers',
  'pytorch',
  'tensorflow',
  'xgboost',
  'onnx',
  'custom',
  'ultralytics',
];

/** Form-select items for the backend picker in ModelFormDialog. */
export const INFERENCE_BACKEND_OPTIONS: {
  value: InferenceBackend;
  label: string;
}[] = [
  { value: 'transformers', label: '🤗 Transformers' },
  { value: 'diffusers', label: '🎨 Diffusers' },
  { value: 'pytorch', label: 'PyTorch' },
  { value: 'tensorflow', label: 'TensorFlow' },
  { value: 'xgboost', label: 'XGBoost' },
  { value: 'onnx', label: 'ONNX' },
  { value: 'custom', label: 'Custom' },
  { value: 'ultralytics', label: '🚀 Ultralytics' },
];

// ── Display metadata ─────────────────────────────────────────────

export const inferenceBackendColorMap: Record<InferenceBackend, string> = {
  pytorch: '#EE4C2C',
  tensorflow: '#FF6F00',
  xgboost: '#01793D',
  onnx: '#6B57FF',
  custom: '#8B8B8B',
  transformers: '#FFD21E',
  diffusers: '#A855F7',
  ultralytics: '#0288D1',
};

export const inferenceBackendIconMap: Record<InferenceBackend, string> = {
  pytorch: '\u{1F525}',
  tensorflow: '\u{1F9E0}',
  xgboost: '\u{1F680}',
  onnx: '\u26A1',
  custom: '\u{1F4E6}',
  transformers: '\u{1F917}',
  diffusers: '\u{1F3A8}',
  ultralytics: '\u{1F680}',
};

export const getInferenceBackendLabel = (
  backend: InferenceBackend | string
): string => {
  switch (backend) {
    case 'pytorch':
      return 'PyTorch';
    case 'tensorflow':
      return 'TensorFlow';
    case 'xgboost':
      return 'XGBoost';
    case 'onnx':
      return 'ONNX';
    case 'custom':
      return 'Custom';
    case 'transformers':
      return 'Transformers';
    case 'diffusers':
      return 'Diffusers';
    case 'ultralytics':
      return 'Ultralytics';
    default:
      return backend;
  }
};

export const inferenceBackendLabelMap: Record<InferenceBackend, string> = {
  pytorch: 'PyTorch',
  tensorflow: 'TensorFlow',
  xgboost: 'XGBoost',
  onnx: 'ONNX',
  custom: 'Custom',
  transformers: 'Transformers',
  diffusers: 'Diffusers',
  ultralytics: 'Ultralytics',
};

// ════════════════════════════════════════════════════════════════
// 2. MODEL STATUS
// ════════════════════════════════════════════════════════════════

export type ModelStatus =
  | 'draft'
  | 'pending'
  | 'ready'
  | 'deprecated'
  | 'archived';

export const ALL_MODEL_STATUSES: ModelStatus[] = [
  'draft',
  'pending',
  'ready',
  'deprecated',
  'archived',
];

export const ALL_DATASET_STATUSES: DatasetStatus[] = [
  'draft',
  'validating',
  'ready',
  'deprecated',
  'archived',
  'error',
];

export const ALL_DATASET_FORMATS: DatasetFormat[] = [
  'csv',
  'parquet',
  'json',
  'jsonl',
  'image',
  'text',
  'delta',
  'custom',
  'audio',
];

export const MODEL_STATUS_OPTIONS: {
  value: ModelStatus;
  label: string;
  color: 'default' | 'warning' | 'success' | 'error' | 'info';
}[] = [
  { value: 'draft', label: 'Draft', color: 'default' },
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'ready', label: 'Ready', color: 'success' },
  { value: 'deprecated', label: 'Deprecated', color: 'error' },
  { value: 'archived', label: 'Archived', color: 'info' },
];

export const modelStatusColorMap: Record<
  ModelStatus,
  'default' | 'warning' | 'success' | 'error' | 'info'
> = {
  draft: 'default',
  pending: 'warning',
  ready: 'success',
  deprecated: 'error',
  archived: 'info',
};

// ════════════════════════════════════════════════════════════════
// 3. DEPLOYMENT STATUS & ENVIRONMENT
// ════════════════════════════════════════════════════════════════

export type DeploymentEnvironment = 'test' | 'production';
export type DeploymentStatus =
  | 'NotDeployed'
  | 'Running'
  | 'Stopped'
  | 'Failed'
  | 'Blocked'
  | 'Unknown';

export const deploymentStatusColorMap: Record<DeploymentStatus, string> = {
  NotDeployed: '#9E9E9E',
  Running: '#2E7D32',
  Stopped: '#757575',
  Failed: '#D32F2F',
  Blocked: '#ED6C02',
  Unknown: '#0288D1',
};

export const deploymentStatusChipColor: Record<
  DeploymentStatus,
  'default' | 'warning' | 'success' | 'error' | 'info'
> = {
  NotDeployed: 'default',
  Running: 'success',
  Stopped: 'default',
  Failed: 'error',
  Blocked: 'warning',
  Unknown: 'info',
};

export const deploymentStatusLabelMap: Record<DeploymentStatus, string> = {
  NotDeployed: '\u{1F4E6} Not Deployed',
  Running: '\u2705 Running',
  Stopped: '\u23F9\uFE0F Stopped',
  Failed: '\u274C Failed',
  Blocked: '\u{1F6AB} Blocked',
  Unknown: '\u2753 Unknown',
};

export const envColorMap: Record<
  DeploymentEnvironment,
  'primary' | 'secondary' | 'warning'
> = {
  test: 'warning',
  production: 'primary',
};

export const allDeploymentStatuses: {
  key: DeploymentStatus;
  label: string;
  description: string;
}[] = [
  {
    key: 'NotDeployed',
    label: 'Not Deployed',
    description: 'Infrastructure does not exist',
  },
  {
    key: 'Running',
    label: 'Running',
    description: 'Infrastructure is running',
  },
  { key: 'Stopped', label: 'Stopped', description: 'Stopped by client' },
  { key: 'Failed', label: 'Failed', description: 'Never started or crashed' },
  { key: 'Blocked', label: 'Blocked', description: 'Cannot be acted upon' },
  { key: 'Unknown', label: 'Unknown', description: 'Observability gap' },
];

// ════════════════════════════════════════════════════════════════
// 4. DATASET FORMAT & STATUS
// ════════════════════════════════════════════════════════════════

export type DatasetFormat =
  | 'csv'
  | 'parquet'
  | 'json'
  | 'jsonl'
  | 'image'
  | 'text'
  | 'delta'
  | 'custom'
  | 'audio';

export type DatasetStatus =
  | 'draft'
  | 'validating'
  | 'ready'
  | 'deprecated'
  | 'archived'
  | 'error';

export const datasetStatusColorMap: Record<
  DatasetStatus,
  'default' | 'warning' | 'success' | 'error' | 'info'
> = {
  draft: 'default',
  validating: 'warning',
  ready: 'success',
  deprecated: 'error',
  archived: 'info',
  error: 'error',
};

export const datasetFormatColorMap: Record<DatasetFormat, string> = {
  csv: '#217346',
  parquet: '#00A4EF',
  json: '#F7DF1E',
  jsonl: '#F0DB4F',
  image: '#E91E63',
  text: '#9C27B0',
  delta: '#FF6600',
  audio: '#dc2626',
  custom: '#8B8B8B',
};

export const datasetFormatIconMap: Record<DatasetFormat, string> = {
  csv: '\u{1F4C3}',
  parquet: '\u{1F5C4}',
  json: '\u{1F4E6}',
  jsonl: '\u{1F4D1}',
  image: '\u{1F5BC}',
  text: '\u{1F4DD}',
  delta: '\u26A1',
  audio: '\u{1F3B5}',
  custom: '\u{1F4E6}',
};

export const datasetFormatLabelMap: Record<DatasetFormat, string> = {
  csv: 'CSV',
  parquet: 'Parquet',
  json: 'JSON',
  jsonl: 'JSONL',
  image: 'Image',
  text: 'Text',
  delta: 'Delta Lake',
  audio: 'Audio',
  custom: 'Custom',
};

// ════════════════════════════════════════════════════════════════
// 5. ARTIFACT TYPES
// ════════════════════════════════════════════════════════════════

export type ArtifactStorageType = 'platform' | 's3' | 'gcs' | 'azure' | 'url';
export type ArtifactStatus = 'available' | 'uploading' | 'error' | 'archived';
export type ArtifactType = 'model' | 'dataset';

// ════════════════════════════════════════════════════════════════
// 6. MARKETPLACE PLATFORMS
// ════════════════════════════════════════════════════════════════

export type MarketplacePlatform = Models.Platform;

export const ALL_MARKETPLACE_PLATFORMS: MarketplacePlatform[] = [
  Models.Platform.HuggingFace,
];

export const getPlatformConfig = (platform?: Models.Platform) => {
  switch (platform) {
    case Models.Platform.HuggingFace:
      return {
        label: 'Hugging Face',
        color: '#FFD21E',
        icon: '🤗',
      };
    default:
      return {
        label: 'Unknown',
        color: '#AAAAAA',
        icon: '?',
      };
  }
};

export const platformConfig = {
  [Models.Platform.HuggingFace]: {
    label: 'Hugging Face',
    color: '#FFD21E',
    icon: '🤗',
  },
  // 'tensorflow-hub': { label: 'TensorFlow Hub', color: '#FF6F00', icon: '🧠' },
  // 'pytorch-hub': { label: 'PyTorch Hub', color: '#EE4C2C', icon: '🔥' },
  // 'onnx-model-zoo': { label: 'ONNX Model Zoo', color: '#808080', icon: '⚡' },
  // kaggle: { label: 'Kaggle', color: '#20BEFF', icon: '📊' },
};
