import type { ChipProps } from '@mui/material/Chip';
import * as Deployments from '@mlhub/deployments-ts-sdk';

type StatusPresentation = {
  color: ChipProps['color'];
  label: string;
};

export const isReconciliationInProgress = (
  status?: Deployments.ReconciliationStatus
) =>
  status === Deployments.ReconciliationStatus.Pending ||
  status === Deployments.ReconciliationStatus.Starting ||
  status === Deployments.ReconciliationStatus.Stopping ||
  status === Deployments.ReconciliationStatus.Undeploying ||
  status === Deployments.ReconciliationStatus.Retrying;

const isReadyForSignal = (deployment: Deployments.ModelDeployment) =>
  !deployment.reconciliation_status ||
  deployment.reconciliation_status ===
    Deployments.ReconciliationStatus.Synchronized;

export const isDeploymentExpired = (
  deployment: Deployments.ModelDeployment
) => {
  if (!deployment.expires_at) return false;

  const expiresAt = Date.parse(deployment.expires_at);
  return !Number.isNaN(expiresAt) && expiresAt <= Date.now();
};

export const isTerminalDeployment = (deployment: Deployments.ModelDeployment) =>
  Boolean(deployment.batch_execution_outcome) ||
  isDeploymentExpired(deployment);

export const canStartDeployment = (deployment: Deployments.ModelDeployment) =>
  !isDeploymentExpired(deployment) &&
  isReadyForSignal(deployment) &&
  (deployment.state === Deployments.State.Stopped ||
    deployment.state === Deployments.State.NotDeployed);

export const canStopDeployment = (deployment: Deployments.ModelDeployment) =>
  !isDeploymentExpired(deployment) &&
  ((isReadyForSignal(deployment) &&
    deployment.state === Deployments.State.Running) ||
    (deployment.reconciliation_status ===
      Deployments.ReconciliationStatus.Starting &&
      deployment.desired_state === Deployments.DesiredState.Running));

export const canUndeployDeployment = (
  deployment: Deployments.ModelDeployment
) =>
  !isDeploymentExpired(deployment) &&
  isReadyForSignal(deployment) &&
  deployment.state !== Deployments.State.NotDeployed;

export const reconciliationStatusPresentation = (
  status?: Deployments.ReconciliationStatus
): StatusPresentation => {
  switch (status) {
    case Deployments.ReconciliationStatus.Synchronized:
      return { color: 'success', label: 'Synchronized' };
    case Deployments.ReconciliationStatus.Retrying:
      return { color: 'warning', label: 'Retrying' };
    case Deployments.ReconciliationStatus.Failed:
      return { color: 'error', label: 'Failed' };
    case Deployments.ReconciliationStatus.Pending:
    case Deployments.ReconciliationStatus.Starting:
    case Deployments.ReconciliationStatus.Stopping:
    case Deployments.ReconciliationStatus.Undeploying:
      return { color: 'info', label: status };
    default:
      return { color: 'default', label: 'Not reported' };
  }
};

export const batchOutcomePresentation = (
  outcome?: Deployments.BatchExecutionOutcome
): StatusPresentation => {
  switch (outcome) {
    case Deployments.BatchExecutionOutcome.Succeeded:
      return { color: 'success', label: 'Succeeded' };
    case Deployments.BatchExecutionOutcome.Cancelled:
      return { color: 'warning', label: 'Cancelled' };
    case Deployments.BatchExecutionOutcome.TimedOut:
      return { color: 'warning', label: 'Timed out' };
    case Deployments.BatchExecutionOutcome.Failed:
      return { color: 'error', label: 'Failed' };
    default:
      return { color: 'default', label: 'Not applicable' };
  }
};
