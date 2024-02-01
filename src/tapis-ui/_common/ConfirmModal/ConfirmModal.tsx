import React from 'react';
import { Button } from 'reactstrap';
import { GenericModal } from 'tapis-ui/_common';
import { SubmitWrapper } from 'tapis-ui/_wrappers';

type ConfirmModalProps = {
  toggle: () => void;
  message?: string;
  onConfirm: () => void;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  toggle,
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
      title="Confirm"
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
