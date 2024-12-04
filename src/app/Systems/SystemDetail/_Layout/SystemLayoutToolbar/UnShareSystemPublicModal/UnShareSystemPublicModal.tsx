import { Button } from 'reactstrap';
import { GenericModal } from '@tapis/tapisui-common';
import { SubmitWrapper } from '@tapis/tapisui-common';
import { ToolbarModalProps } from '../SystemLayoutToolbar';
import { useEffect } from 'react';
import styles from './UnShareSystemPublicModal.module.scss';
import { Systems as Hooks } from '@tapis/tapisui-hooks';

const UnShareSystemPublicModal: React.FC<ToolbarModalProps> = ({ toggle }) => {
  const queryString = window.location.href;
  const systemId = queryString.substring(queryString.indexOf('systems/') + 8);

  const { unShareSystemPublic, isLoading, error, isSuccess, reset } =
    Hooks.useUnShareSystemPublic();

  useEffect(() => {
    reset();
  }, [reset]);

  const onSubmit = () => {
    unShareSystemPublic(systemId);
  };

  return (
    <GenericModal
      toggle={toggle}
      title="UnShare System"
      body={
        <div className={styles['modal-settings']}>
          Confirm to unShare the system publicly?
        </div>
      }
      footer={
        <SubmitWrapper
          className={styles['modal-footer']}
          isLoading={isLoading}
          error={error}
          success={isSuccess ? `Successfully unshared a system` : ''}
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
            UnShare System
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default UnShareSystemPublicModal;
