import { Button } from 'reactstrap';
import { GenericModal } from 'tapis-ui/_common';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { ToolbarModalProps } from '../SystemLayoutToolbar';
import { useEffect } from 'react';
import styles from './ShareSystemPublicModal.module.scss';
import { useShareSystemPublic } from 'tapis-hooks/systems';

const ShareSystemPublicModal: React.FC<ToolbarModalProps> = ({ toggle }) => {
  const queryString = window.location.href;
  const systemId = queryString.substring(queryString.indexOf('systems/') + 8);

  const { shareSystemPublic, isLoading, error, isSuccess, reset } =
    useShareSystemPublic();

  useEffect(() => {
    reset();
  }, [reset]);

  const onSubmit = () => {
    shareSystemPublic(systemId);
  };

  return (
    <GenericModal
      toggle={toggle}
      title="Share System"
      body={
        <div className={styles['modal-settings']}>
          Confirm to share the system publicly?
        </div>
      }
      footer={
        <SubmitWrapper
          className={styles['modal-footer']}
          isLoading={isLoading}
          error={error}
          success={isSuccess ? `Successfully shared a system` : ''}
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
            Share System
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default ShareSystemPublicModal;
