import React, { useMemo, useState } from 'react';
import { Badge, Button } from 'reactstrap';
import { Chip, CircularProgress } from '@mui/material';
import { PsychologyAlt, ListAlt, Security } from '@mui/icons-material';
import { GenericModal, AuthModal, GlobusAuthModal } from '@tapis/tapisui-common';
import { Systems as SystemsHooks } from '@tapis/tapisui-hooks';
import { Systems } from '@tapis/tapis-typescript';
import styles from './LocalModels.module.scss';
import {
  DeploymentStrategy,
  LocalModelMetadata,
  StrategyReadiness,
} from './localModels.data';

type DeploymentStrategyModalProps = {
  open: boolean;
  onClose: () => void;
  model: LocalModelMetadata;
  strategy: DeploymentStrategy;
  readiness?: StrategyReadiness;
};

const DeploymentStrategyModal: React.FC<DeploymentStrategyModalProps> = ({
  open,
  onClose,
  model,
  strategy,
  readiness,
}) => {
  const [credentialModal, setCredentialModal] = useState<'auth' | 'globus' | null>(
    null
  );
  const credentialQuery = SystemsHooks.useCheckCredential(
    {
      systemId: strategy.systemId ?? '',
    },
    {
      enabled: !!strategy.systemId && open,
      retry: 0,
    }
  );
  const {
    data: systemDetails,
    isLoading: systemDetailsLoading,
  } = SystemsHooks.useDetails(
    {
      systemId: strategy.systemId ?? '',
      select: 'allAttributes',
    },
    {
      enabled: !!strategy.systemId && open,
    }
  );
  const system = systemDetails?.result;

  const credentialStatus = useMemo(() => {
    if (!strategy.systemId) {
      return { status: 'notRequired', message: 'No host credentials required.' };
    }
    if (credentialQuery.isLoading) {
      return { status: 'loading', message: 'Checking credentials…' };
    }
    if (credentialQuery.error) {
      return {
        status: 'missing',
        message: 'No credentials detected for this system.',
        details: credentialQuery.error.message,
      };
    }
    if (credentialQuery.data?.status?.toLowerCase() === 'success') {
      return { status: 'ready', message: 'Credentials verified.' };
    }
    return {
      status: 'missing',
      message: 'Credentials could not be verified.',
    };
  }, [credentialQuery.data, credentialQuery.error, credentialQuery.isLoading, strategy.systemId]);

  const allocationStatus = (() => {
    if (!readiness) {
      return 'notRequired';
    }
    if (!readiness.requiresAllocation) {
      return 'ready';
    }
    return readiness.hasAllocation ? 'ready' : 'missing';
  })();
  const allocationInstructions =
    readiness && allocationStatus === 'missing'
      ? readiness.allocationSteps
      : [];
  const readinessComplete =
    (credentialStatus.status === 'ready' ||
      credentialStatus.status === 'notRequired') &&
    (allocationStatus === 'ready' || allocationStatus === 'notRequired');

  const renderRuleSets = () => {
    if (!strategy.ruleSets?.length) {
      return (
        <p className="mb-0 text-muted">
          This strategy inherits constraints from rule sets:{' '}
          <strong>{strategy.useRuleSets.join(', ') || 'n/a'}</strong>.
        </p>
      );
    }
    return strategy.ruleSets.map((ruleSet) => (
      <div key={ruleSet.name} className={styles['rule-set']}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <strong>{ruleSet.name}</strong>
          <Badge color="light" className="text-dark">
            {ruleSet.rules.length} rule{ruleSet.rules.length === 1 ? '' : 's'}
          </Badge>
        </div>
        <div className="d-flex flex-column gap-2">
          {ruleSet.rules.map((rule, idx) => (
            <div key={idx} className={styles.rule}>
              <span className="text-uppercase">{rule.field}</span>
              <span>
                {rule.operator} {rule.value as string}
              </span>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  const credentialActionDisabled =
    systemDetailsLoading || !strategy.systemId;

  const handleManageCredentials = () => {
    if (systemDetailsLoading) return;
    if (system) {
      if (system.systemType === Systems.SystemTypeEnum.Globus) {
        setCredentialModal('globus');
        return;
      }
      if (system.defaultAuthnMethod) {
        setCredentialModal('auth');
        return;
      }
    }
    if (strategy.systemId) {
      window.open(`/systems/${strategy.systemId}`, '_blank', 'noopener');
    }
  };

  const readinessCards = [
    {
      title: 'System Credentials',
      status: credentialStatus.status,
      message: credentialStatus.message,
      loading: credentialStatus.status === 'loading',
      actionLabel: 'Manage credentials',
      actionOnClick: handleManageCredentials,
      actionDisabled: credentialActionDisabled,
      details: credentialStatus.details,
    },
    {
      title: 'Allocation',
      status: allocationStatus,
      message:
        allocationStatus === 'ready' || allocationStatus === 'notRequired'
        ? 'Allocation confirmed for this strategy.'
        : 'An active allocation is required before deployment.',
      instructions: allocationInstructions,
      actionLabel:
        allocationStatus === 'missing' ? 'Request allocation' : undefined,
      actionHref: allocationStatus === 'missing' ? '/allocations' : undefined,
    },
  ];

  const footer = (
    <>
      <Button color="secondary" onClick={onClose}>
        Close
      </Button>
      <Button color="primary" disabled={!readinessComplete}>
        Continue to deployment
      </Button>
    </>
  );

  const body = (
    <div className={styles['modal-body']}>
      <div className={styles.section}>
        <div className={styles['section-title']}>
          <PsychologyAlt fontSize="small" color="action" />
          <div>
            <div>{model.annotations.$upstream.name ?? model.name}</div>
            <small className="text-muted">{model.author}</small>
          </div>
        </div>
        <div className="mt-2">
          <div className={styles['strategy-meta']}>
            <div>Strategy: {strategy.name}</div>
            <div>Parameter set: {strategy.useParameterSet}</div>
            {!!strategy.systemId && <div>System ID: {strategy.systemId}</div>}
          </div>
        </div>
        <p className="mt-3 mb-0 text-muted">{strategy.description}</p>
      </div>

      <div className={styles.section}>
        <div className={styles['section-title']}>
          <ListAlt fontSize="small" color="action" />
          <span>Applicability Rules</span>
        </div>
        <div className="mt-2">{renderRuleSets()}</div>
      </div>

      <div className={styles.section}>
        <div className={styles['section-title']}>
          <Security fontSize="small" color="action" />
          <span>Readiness Checks</span>
        </div>
        <div className={`${styles['readiness-grid']} mt-3`}>
          {readinessCards.map((card) => (
            <div key={card.title} className={styles['readiness-card']}>
              <div className="d-flex justify-content-between align-items-center">
                <strong>{card.title}</strong>
                <Chip
                  size="small"
                  label={
                    card.loading
                      ? 'Checking'
                      : card.status === 'ready'
                      ? 'Ready'
                      : card.status === 'notRequired'
                      ? 'Not required'
                      : 'Action needed'
                  }
                  color={
                    card.status === 'ready'
                      ? 'success'
                      : card.status === 'notRequired'
                      ? 'default'
                      : 'warning'
                  }
                  icon={
                    card.loading ? (
                      <CircularProgress size={12} />
                    ) : undefined
                  }
                />
              </div>
              <p className="mb-0 text-muted small">{card.message}</p>
              {card.details && (
                <p className="mb-0 text-danger small">{card.details}</p>
              )}
              {card.instructions && card.instructions.length > 0 && (
                <ol className={styles.instructions}>
                  {card.instructions.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              )}
              {card.actionLabel && (
                <Button
                  color="link"
                  className="p-0 align-self-start"
                  href={card.actionHref}
                  onClick={card.actionOnClick}
                  disabled={card.actionDisabled}
                >
                  {card.actionLabel}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (!open) {
    return null;
  }

  return (
    <>
      <GenericModal
        toggle={onClose}
        title={`Deploy ${model.annotations.$upstream.name ?? model.name}`}
        body={body}
        footer={footer}
        size="lg"
      />
      {system &&
        system.systemType !== Systems.SystemTypeEnum.Globus &&
        !!system.defaultAuthnMethod && (
          <AuthModal
            open={credentialModal === 'auth'}
            toggle={() => setCredentialModal(null)}
            systemId={system.id!}
            defaultAuthnMethod={system.defaultAuthnMethod}
            effectiveUserId={system.effectiveUserId || '${apiUserId}'}
          />
        )}
      {system && system.systemType === Systems.SystemTypeEnum.Globus && (
        <GlobusAuthModal
          open={credentialModal === 'globus'}
          toggle={() => setCredentialModal(null)}
          systemId={system.id!}
        />
      )}
    </>
  );
};

export default DeploymentStrategyModal;

