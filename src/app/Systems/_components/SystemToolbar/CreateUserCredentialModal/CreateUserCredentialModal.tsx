import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
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
  effectiveUserId?: string;
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
  systemId: yup
    .string()
    .required('System ID is required')
    .min(3, 'System ID must be at least 3 characters')
    .max(50, 'System ID must not exceed 50 characters')
    .matches(
      /^[a-zA-Z0-9-_.]+$/,
      'System ID can only contain letters, numbers, hyphens, underscores, and periods'
    ),
  publicKey: yup
    .string()
    .required('Public key is required')
    .min(20, 'Public key must be at least 20 characters')
    .max(4096, 'Public key must not exceed 4096 characters')
    .test('is-valid-public-key', 'Invalid SSH public key format', (value) => {
      return /^(ssh-rsa|ssh-dss|ecdsa-sha2-nistp256|ecdsa-sha2-nistp384|ecdsa-sha2-nistp521|ssh-ed25519)\s+[A-Za-z0-9+/]+[=]{0,3}(\s+.*)?$/.test(
        value!
      );
    }),
  privateKey: yup
    .string()
    .required('Private key is required')
    .min(20, 'Private key must be at least 20 characters')
    .max(4096, 'Private key must not exceed 4096 characters')
    .transform(transformPrivateKey),
  loginUser: yup
    .string()
    .optional()
    .max(32, 'Login user must not exceed 32 characters')
    .matches(
      /^[a-z_]([a-z0-9_-]{0,31}|[a-z0-9_-]{0,30}\$)$/,
      'Invalid login user format'
    ),
});

const CreateUserCredentialModal: React.FC<CreateUserCredentialModalProps> = ({
  toggle,
  isOpen,
  effectiveUserId,
}) => {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { claims } = useTapisConfig();
  const userName = claims['tapis/username'];

  const { create, isLoading, isSuccess, error } = Hooks.useCreateCredential();

  useEffect(() => {
    if (error) {
      setSubmitError(
        error.message || 'An error occurred while creating the credential'
      );
    }
  }, [error]);

  const formik = useFormik({
    initialValues: {
      systemId: '',
      publicKey: '',
      privateKey: '',
      loginUser: '',
    },
    validationSchema: schema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSubmitError(null);

      console.log('Submitting form with values:', values);

      try {
        create({
          systemId: values.systemId,
          userName: userName,
          reqUpdateCredential: {
            publicKey: values.publicKey,
            privateKey: transformPrivateKey(values.privateKey),
            loginUser: values.loginUser,
          },
        });
        console.log('Credential created successfully');
        resetForm();
      } catch (error) {
        console.error('Error creating user credential:', error);
        setSubmitError('Failed to create user credential. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (effectiveUserId === userName) {
      formik.setFieldValue('loginUser', userName);
    } else {
      formik.setFieldValue('loginUser', '');
    }
  }, [effectiveUserId, userName]);

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Create User Credential</ModalHeader>
      <ModalBody>
        {submitError && <Alert color="danger">{submitError}</Alert>}
        <form onSubmit={formik.handleSubmit}>
          <FormGroup>
            <Label for="systemId">System ID</Label>
            <Input
              type="text"
              id="systemId"
              {...formik.getFieldProps('systemId')}
              invalid={!!formik.errors.systemId && formik.touched.systemId}
              maxLength={50}
            />
            {formik.errors.systemId && formik.touched.systemId && (
              <FormFeedback>{formik.errors.systemId}</FormFeedback>
            )}
          </FormGroup>
          <FormGroup>
            <Label for="publicKey">Public Key</Label>
            <Input
              type="textarea"
              id="publicKey"
              {...formik.getFieldProps('publicKey')}
              invalid={!!formik.errors.publicKey && formik.touched.publicKey}
              maxLength={4096}
            />
            {formik.errors.publicKey && formik.touched.publicKey && (
              <FormFeedback>{formik.errors.publicKey}</FormFeedback>
            )}
          </FormGroup>
          <FormGroup>
            <Label for="privateKey">Private Key</Label>
            <Input
              type="textarea"
              id="privateKey"
              {...formik.getFieldProps('privateKey')}
              invalid={!!formik.errors.privateKey && formik.touched.privateKey}
              maxLength={4096}
            />
            {formik.errors.privateKey && formik.touched.privateKey && (
              <FormFeedback>{formik.errors.privateKey}</FormFeedback>
            )}
          </FormGroup>
          <FormGroup>
            <Label for="loginUser">Login User (optional)</Label>
            <Input
              type="text"
              id="loginUser"
              {...formik.getFieldProps('loginUser')}
              invalid={!!formik.errors.loginUser && formik.touched.loginUser}
              placeholder={
                effectiveUserId === userName ? userName : 'Enter login user'
              }
              maxLength={32}
            />
            {formik.errors.loginUser && formik.touched.loginUser && (
              <FormFeedback>{formik.errors.loginUser}</FormFeedback>
            )}
          </FormGroup>
          <ModalFooter>
            <Button
              type="submit"
              color="primary"
              disabled={formik.isSubmitting || isLoading || isSuccess}
            >
              {formik.isSubmitting || isLoading ? 'Submitting...' : 'Submit'}
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
