/* ─── Shared constants (thin re-exports from enums.ts) ─────────── */
/* Legacy import path for backward compatibility.
 * New code should import directly from '../enums'. */

export {
  // Inference backends
  inferenceBackendColorMap as frameworkColorMap,
  inferenceBackendIconMap as frameworkIconMap,
  inferenceBackendLabelMap as frameworkLabelMap,
  // Model status
  modelStatusColorMap,
  // Deployment
  deploymentStatusColorMap,
  deploymentStatusChipColor,
  deploymentStatusLabelMap,
  envColorMap,
  allDeploymentStatuses,
  // Dataset
  datasetStatusColorMap,
  datasetFormatColorMap,
  datasetFormatIconMap,
  datasetFormatLabelMap,
} from '../enums';
