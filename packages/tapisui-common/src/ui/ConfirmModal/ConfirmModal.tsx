import React from 'react';
import { Button } from 'reactstrap';
import { GenericModal } from '../../ui';
import { SubmitWrapper } from '../../wrappers';

type ConfirmModalProps = {
  toggle: () => void;
  title?: string;
  message?: string;
  onConfirm: () => void;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  toggle,
  title,
  message,
  onConfirm,
  isLoading,
  isSuccess,
  isError,
  error,
}) => {
  return (
    <GenericModal
      toggle={toggle}
      title={title || 'Confirm'}
      body={message || 'Are you sure you want to continue?'}
      footer={
        <SubmitWrapper
          className={''}
          isLoading={isLoading}
          error={error}
          success={isSuccess ? `Success` : ''}
          reverse={true}
        >
          <Button
            form="newsystem-form"
            color="primary"
            aria-label="Submit"
            type="submit"
            onClick={toggle}
          >
            Cancel
          </Button>
          <Button
            form="newsystem-form"
            color="primary"
            aria-label="Submit"
            type="submit"
            onClick={onConfirm}
          >
            Confirm
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default ConfirmModal;
