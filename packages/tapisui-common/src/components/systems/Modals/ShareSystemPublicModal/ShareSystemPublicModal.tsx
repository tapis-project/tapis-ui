import { Button } from 'reactstrap';
import { GenericModal } from '../../../../ui';
import { SubmitWrapper } from '../../../../wrappers';
import { useEffect } from 'react';
import styles from './ShareSystemPublicModal.module.scss';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { Systems } from '@tapis/tapis-typescript';
import { Alert, AlertTitle } from '@mui/material';

const ShareSystemPublicModal: React.FC<{
  toggle: () => void;
  open: boolean;
  system: Systems.TapisSystem;
}> = ({ toggle, open, system }) => {
  if (!open) {
    return <></>;
  }
  const queryString = window.location.href;
  const systemId = queryString.substring(queryString.indexOf('systems/') + 8);

  const { shareSystemPublic, isLoading, error, isSuccess, reset } =
    Hooks.useShareSystemPublic();

  useEffect(() => {
    reset();
  }, [reset]);

  const onSubmit = () => {
    shareSystemPublic(systemId);
  };

  return (
    <GenericModal
      toggle={toggle}
      title="Make System Public"
      body={
        <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
          {!system.isDynamicEffectiveUser && (
            <Alert severity="error">
              <AlertTitle>Security Concern</AlertTitle>
              This system is using a <b>static effective user</b>. Making this
              system public will enable <b>every user</b> in this tenant to
              perform operations on this system's host as if they were user{' '}
              <b>{system.effectiveUserId}</b>. This operation <b>IS</b>{' '}
              permitted, but consider the aforementioned security concers before
              proceeding.
              <br />
              <br />
              To improve security, consider changing this systems{' '}
              <b>effectiveUserId</b> to <b>{'${apiUserId}'}</b>
              <br />
              <br />
            </Alert>
          )}
          <Alert severity="info">
            <AlertTitle>Permissions Required</AlertTitle>
            Changing the visibility of a system requires <b>MODIFY</b>{' '}
            permissions
          </Alert>
          <Alert severity="warning">
            <AlertTitle>Visibility Change</AlertTitle>
            Making a system public will grant every user in this tenant access
            to this system
          </Alert>
        </div>
      }
      footer={
        <SubmitWrapper
          className={styles['modal-footer']}
          isLoading={isLoading}
          error={error}
          success={isSuccess ? `System ${system.id} is now public` : ''}
          reverse={true}
        >
          <Button
            form="newsystem-form"
            color="primary"
            onClick={onSubmit}
            disabled={isLoading || isSuccess}
            aria-label="Submit"
            type="submit"
          >
            Make Public
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default ShareSystemPublicModal;
