import React, { useState, useCallback } from 'react';
import { Input, Button } from 'reactstrap';
import { SubmitWrapper } from '@tapis/tapisui-common';
import { Form, Formik } from 'formik';
import { FormikInput, FieldWrapper, GenericModal } from '@tapis/tapisui-common';
import { Workflows } from '@tapis/tapis-typescript';
import * as Yup from 'yup';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import styles from './CreateIdentityModel.module.scss';
import { useQueryClient } from 'react-query';

type CreateIdentityFormProps = {
  name: string;
  description?: string;
  type: Workflows.EnumIdentityType;
  credentials: Workflows.ReqGithubCred | Workflows.ReqDockerhubCred;
};

type FormProps = {
  onSubmit: any;
};

const baseValidationSchema = {
  name: Yup.string()
    .min(1)
    .max(255)
    .required('An identity requires a name')
    .matches(
      /^[a-zA-Z0-9_.-]+$/,
      "Must contain only alphanumeric characters and the following: '.', '_', '-'"
    ),
  description: Yup.string().min(1).max(512),
  type: Yup.string()
    .oneOf(Object.values(Workflows.EnumIdentityType))
    .required('Select an identity type'),
};

const GithubIdentityForm: React.FC<FormProps> = ({ onSubmit }) => {
  const validationSchema = Yup.object({
    ...baseValidationSchema,
    credentials: Yup.object({
      username: Yup.string()
        .min(1)
        .max(128)
        .required(`Github username is required`),
      personal_access_token: Yup.string()
        .min(1)
        .max(1024)
        .required('Personal access token is required'),
    }),
  });

  return (
    <div>
      <Formik
        initialValues={{
          name: '',
          description: '',
          type: Workflows.EnumIdentityType.Github,
          credentials: {
            personal_access_token: '',
            username: '',
          },
        }}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        <Form id="newidentity-form">
          <FormikInput
            name="name"
            label="Name"
            required={true}
            description={`Display name for the identity`}
            aria-label="Input"
          />
          <FormikInput
            name="description"
            label="Description"
            required={false}
            description={''}
            aria-label="Input"
            type="textarea"
          />
          <FormikInput
            name="type"
            value={Workflows.EnumIdentityType.Github}
            label=""
            required={true}
            description={''}
            aria-label="Input"
            type="hidden"
          />
          <h2>Credentials</h2>
          <FormikInput
            name="credentials.username"
            label="Github username"
            required={true}
            description={`Username for Github`}
            aria-label="Input"
          />
          <FormikInput
            name="credentials.personal_access_token"
            label="Personal access token"
            required={true}
            description={`Personal access token for Github`}
            aria-label="Input"
          />
        </Form>
      </Formik>
    </div>
  );
};

const DockerhubIdentityForm: React.FC<FormProps> = ({ onSubmit }) => {
  const validationSchema = Yup.object({
    ...baseValidationSchema,
    credentials: Yup.object({
      username: Yup.string()
        .min(1)
        .max(128)
        .required(`Dockerhub username is required`),
      token: Yup.string().min(1).max(1024).required('Access token is required'),
    }),
  });

  return (
    <div>
      <Formik
        initialValues={{
          name: '',
          description: '',
          type: Workflows.EnumIdentityType.Dockerhub,
          credentials: {
            username: '',
            token: '',
          },
        }}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        <Form id="newidentity-form">
          <FormikInput
            name="name"
            label="Name"
            required={true}
            description={`Display name for the identity`}
            aria-label="Input"
          />
          <FormikInput
            name="description"
            label="Description"
            required={false}
            description={''}
            aria-label="Input"
            type="textarea"
          />
          <FormikInput
            name="type"
            value={Workflows.EnumIdentityType.Dockerhub}
            label=""
            required={true}
            description={''}
            aria-label="Input"
            type="hidden"
          />
          <h2>Credentials</h2>
          <FormikInput
            name="credentials.username"
            label="Dockerhub username"
            required={true}
            description={`Username for Dockerhub`}
            aria-label="Input"
          />
          <FormikInput
            name="credentials.token"
            label="Access token"
            required={true}
            description={`Access token for Dockerhub`}
            aria-label="Input"
          />
        </Form>
      </Formik>
    </div>
  );
};

const CreateIdentityModal: React.FC<{ toggle: () => void }> = ({ toggle }) => {
  const { create, isLoading, isSuccess, error } = Hooks.Identities.useCreate();
  const [selectedType, setSelectedType] = useState<string | undefined>(
    undefined
  );
  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.Identities.queryKeys.list);
  }, [queryClient]);

  const renderIdentityForm = useCallback(() => {
    const onSubmit = ({
      name,
      type,
      description,
      credentials,
    }: CreateIdentityFormProps) => {
      create({ name, type, description, credentials }, { onSuccess });
    };

    switch (selectedType) {
      case Workflows.EnumIdentityType.Dockerhub:
        return <DockerhubIdentityForm onSubmit={onSubmit} />;
      case Workflows.EnumIdentityType.Github:
        return <GithubIdentityForm onSubmit={onSubmit} />;
    }
  }, [selectedType, create, onSuccess]);

  return (
    <GenericModal
      toggle={toggle}
      title="Create Identity"
      body={
        <div className={styles['identity-form-container']}>
          <FieldWrapper
            label={'Identity type'}
            required={true}
            description={''}
          >
            <Input
              type="select"
              onChange={(e) => {
                setSelectedType(e.target.value);
              }}
            >
              <option
                disabled
                selected={selectedType === undefined}
                value={undefined}
              >
                {' '}
                -- select an option --{' '}
              </option>
              {Object.values(Workflows.EnumIdentityType).map((type) => {
                return (
                  <option selected={selectedType === type} value={type}>
                    {type}
                  </option>
                );
              })}
            </Input>
          </FieldWrapper>
          {renderIdentityForm()}
        </div>
      }
      footer={
        <SubmitWrapper
          isLoading={isLoading}
          error={error}
          success={isSuccess ? `Successfully created identity` : ''}
          reverse={true}
        >
          <Button
            form="newidentity-form"
            color="primary"
            disabled={isLoading || isSuccess}
            aria-label="Submit"
            type="submit"
          >
            Create Identity
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default CreateIdentityModal;
