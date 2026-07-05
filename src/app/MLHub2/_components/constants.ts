/* ─── Shared color / icon / label maps ────────────────────────────── */
/* These are referenced by DashboardOverview, ModelsTab, DeploymentsTab,
   ModelDetailsDialog, ModelDetailsPage, and various chart components.
   Keeping them here eliminates duplication across the codebase. */

import type { Model } from '../types';
import type { Deployment } from '../types';

// ── Model ────────────────────────────────────────────────────────────

export const modelStatusColorMap: Record<
  Model['status'],
  'default' | 'warning' | 'success' | 'error' | 'info'
> = {
  draft: 'default',
  pending: 'warning',
  ready: 'success',
  deprecated: 'error',
  archived: 'info',
};

export const frameworkColorMap: Record<string, string> = {
  pytorch: '#EE4C2C',
  tensorflow: '#FF6F00',
  sklearn: '#F7931E',
  xgboost: '#01793D',
  onnx: '#6B57FF',
  custom: '#8B8B8B',
};

export const frameworkIconMap: Record<string, string> = {
  pytorch: '\u{1F525}',
  tensorflow: '\u{1F9E0}',
  sklearn: '\u{1F916}',
  xgboost: '\u{1F680}',
  onnx: '\u26A1',
  custom: '\u{1F4E6}',
};

export const frameworkLabelMap: Record<string, string> = {
  pytorch: 'PyTorch',
  tensorflow: 'TensorFlow',
  sklearn: 'Scikit-learn',
  xgboost: 'XGBoost',
  onnx: 'ONNX',
  custom: 'Custom',
};

// ── Deployment ────────────────────────────────────────────────────────

export const deploymentStatusColorMap: Record<Deployment['status'], string> = {
  NotDeployed: '#9E9E9E',
  Running: '#2E7D32',
  Stopped: '#757575',
  Failed: '#D32F2F',
  Blocked: '#ED6C02',
  Unknown: '#0288D1',
};

export const deploymentStatusChipColor: Record<
  Deployment['status'],
  'default' | 'warning' | 'success' | 'error' | 'info'
> = {
  NotDeployed: 'default',
  Running: 'success',
  Stopped: 'default',
  Failed: 'error',
  Blocked: 'warning',
  Unknown: 'info',
};

export const deploymentStatusLabelMap: Record<Deployment['status'], string> = {
  NotDeployed: '\u{1F4E6} Not Deployed',
  Running: '\u2705 Running',
  Stopped: '\u23F9\uFE0F Stopped',
  Failed: '\u274C Failed',
  Blocked: '\u{1F6AB} Blocked',
  Unknown: '\u2753 Unknown',
};

export const envColorMap: Record<
  Deployment['environment'],
  'primary' | 'secondary' | 'warning'
> = {
  staging: 'warning',
  production: 'primary',
};

// Ordered list of all deployment statuses with descriptions
export const allDeploymentStatuses: {
  key: Deployment['status'];
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

// ── Dataset ──────────────────────────────────────────────────────

import type { Dataset, DatasetFormat } from '../types';

export const datasetStatusColorMap: Record<
  Dataset['status'],
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
