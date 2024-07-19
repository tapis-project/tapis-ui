import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { useTapisConfig } from '@tapis/tapisui-hooks';
import { SystemsApi } from '@tapis/tapis-typescript-systems';

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormGroup,
  Label,
  Input,
  FormFeedback,
  Alert,
} from 'reactstrap';

type CreateUserCredentialModalProps = {
  toggle: () => void;
  isOpen: boolean;
  effectiveUserId: string;
};

interface FormData {
  systemId: string;
  publicKey: string;
  privateKey: string;
  loginUser?: string;
}

// Custom transformation to ensure privateKey is a one-liner
const transformPrivateKey = (value: string) => value.replace(/\n/gm, '\\n');

const schema = yup.object().shape({
  systemId: yup.string().required('System ID is required'),
  publicKey: yup.string().required('Public key is required'),
  privateKey: yup
    .string()
    .required('Private key is required')
    .transform(transformPrivateKey),
  loginUser: yup.string().optional(),
});

const CreateUserCredentialModal: React.FC<CreateUserCredentialModalProps> = ({
  toggle,
  isOpen,
  effectiveUserId,
}) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { claims, jwt } = useTapisConfig();
  const userName = claims['tapis/username'];

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    setError,
  } = useForm<FormData>({
    resolver: async (data) => {
      try {
        const values = await schema.validate(data, {
          abortEarly: false,
        });
        return {
          values,
          errors: {},
        };
      } catch (e) {
        return {
          values: {},
          errors: e.inner.reduce(
            (allErrors, currentError) => ({
              ...allErrors,
              [currentError.path]: {
                type: currentError.type ?? 'validation',
                message: currentError.message,
              },
            }),
            {}
          ),
        };
      }
    },
    defaultValues: {
      systemId: '',
      publicKey: '',
      privateKey: '',
      loginUser: userName,
    },
  });

  const { create, isLoading, error } = Hooks.useCreateCredential();

  useEffect(() => {
    if (error) {
      setSubmitError(
        error.message || 'An error occurred while creating the credential'
      );
    }
  }, [error]);

  useEffect(() => {
    // Update loginUser based on effectiveUserId
    if (effectiveUserId === userName) {
      setValue('loginUser', userName);
    } else {
      setValue('loginUser', '');
    }
  }, [effectiveUserId, userName, setValue]);

  const validateSystemId = async (systemId: string) => {
    const systemsApi = new SystemsApi();
    try {
      await systemsApi.getSystem(systemId, jwt);
      return true;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setError('systemId', {
          type: 'manual',
          message: 'System not found. Please enter a valid System ID.',
        });
      } else {
        console.error('Error validating system:', error);
        setSubmitError(
          'An error occurred while validating the system. Please try again.'
        );
      }
      return false;
    }
  };

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    try {
      // Validate system ID before proceeding
      const isValidSystem = await validateSystemId(data.systemId);
      if (!isValidSystem) return;

      // Ensure privateKey is in the correct format before sending
      const transformedPrivateKey = transformPrivateKey(data.privateKey);

      await create({
        systemId: data.systemId,
        userName: userName,
        reqUpdateCredential: {
          publicKey: data.publicKey,
          privateKey: transformedPrivateKey,
          loginUser: data.loginUser,
        },
      });
      reset();
      toggle();
    } catch (error) {
      console.error('Error creating user credential:', error);
      if (error.response && error.response.status === 404) {
        setSubmitError(
          'System not found. Please check the System ID and try again.'
        );
      } else {
        setSubmitError('Failed to create user credential. Please try again.');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Create User Credential</ModalHeader>
      <ModalBody>
        {submitError && <Alert color="danger">{submitError}</Alert>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormGroup>
            <Label for="systemId">System ID</Label>
            <Controller
              name="systemId"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  id="systemId"
                  invalid={!!errors.systemId}
                />
              )}
            />
            {errors.systemId && (
              <FormFeedback>{errors.systemId.message}</FormFeedback>
            )}
          </FormGroup>
          <FormGroup>
            <Label for="publicKey">Public Key</Label>
            <Controller
              name="publicKey"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="textarea"
                  id="publicKey"
                  invalid={!!errors.publicKey}
                />
              )}
            />
            {errors.publicKey && (
              <FormFeedback>{errors.publicKey.message}</FormFeedback>
            )}
          </FormGroup>
          <FormGroup>
            <Label for="privateKey">Private Key</Label>
            <Controller
              name="privateKey"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="textarea"
                  id="privateKey"
                  invalid={!!errors.privateKey}
                />
              )}
            />
            {errors.privateKey && (
              <FormFeedback>{errors.privateKey.message}</FormFeedback>
            )}
          </FormGroup>
          <FormGroup>
            <Label for="loginUser">Login User (optional)</Label>
            <Controller
              name="loginUser"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  id="loginUser"
                  invalid={!!errors.loginUser}
                  placeholder={
                    effectiveUserId === userName ? userName : 'Enter login user'
                  }
                />
              )}
            />
            {errors.loginUser && (
              <FormFeedback>{errors.loginUser.message}</FormFeedback>
            )}
          </FormGroup>
          <ModalFooter>
            <Button
              type="submit"
              color="primary"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? 'Submitting...' : 'Submit'}
            </Button>
            <Button color="secondary" onClick={toggle}>
              Cancel
            </Button>
          </ModalFooter>
        </form>
      </ModalBody>
    </Modal>
  );
};

export default CreateUserCredentialModal;
