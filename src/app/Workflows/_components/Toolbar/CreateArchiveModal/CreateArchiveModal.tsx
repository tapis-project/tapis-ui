import React, { useState, useCallback } from 'react';
import { Input, Button } from 'reactstrap';
import { QueryWrapper, SubmitWrapper } from '@tapis/tapisui-common';
import { Form, Formik } from 'formik';
import { FormikInput, FieldWrapper, GenericModal } from '@tapis/tapisui-common';
import { Workflows } from '@tapis/tapis-typescript';
import * as Yup from 'yup';
import {
  Workflows as WorkflowsHooks,
  Systems as SystemsHooks,
} from '@tapis/tapisui-hooks';
import styles from './CreateArchiveModel.module.scss';
import { FormikSelect } from '@tapis/tapisui-common';
import { useQueryClient } from 'react-query';

type FormProps = {
  onSubmit: (reqArchive: Workflows.ReqArchive) => void;
};

const baseValidationSchema = {
  id: Yup.string()
    .min(1)
    .max(255)
    .required('An archive requires an id')
    .matches(
      /^[a-zA-Z0-9_.-]+$/,
      "Must contain only alphanumeric characters and the following: '.', '_', '-'"
    ),
  type: Yup.string()
    .oneOf(Object.values(Workflows.EnumArchiveType))
    .required('Select an archive type'),
};

const S3ArchiveForm: React.FC<FormProps> = ({ onSubmit }) => {
  // const validationSchema = Yup.object({
  //   ...baseValidationSchema,
  // })

  return (
    <div>
      <p>Archives of type S3 are not yet supported</p>
      {/* <Formik
        initialValues={{
          id: "",
          type: Workflows.EnumArchiveType.System,
        }}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
      <Form id="newarchive-form">
          <FormikInput
            name="type"
            value={Workflows.EnumArchiveType.S3}
            label=""
            required={true}
            description={""}
            aria-label="Input"
            type="hidden"
            />
          <FormikInput
            name="type"
            value={Workflows.EnumArchiveType.S3}
            label=""
            required={true}
            description={""}
            aria-label="Input"
            type="hidden"
          />
          <FormikInput
            name="id"
            label="Id"
            required={true}
            description={`Id for the archive`}
            aria-label="Input"
            />
          <FormikInput
          name="description"
          label="Description"
          required={false}
          description={""}
          aria-label="Input"
          type="textarea"
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
        </Formik> */}
    </div>
  );
};

const TapisSystemArchiveForm: React.FC<FormProps> = ({ onSubmit }) => {
  const { data, isLoading, error } = SystemsHooks.useList({ limit: -1 }); // Fetch the systems
  const systems = data?.result ?? [];

  const validationSchema = Yup.object({
    ...baseValidationSchema,
    system_id: Yup.string()
      .min(1)
      .max(255)
      .required('An Tapis System archive requires a system_id')
      .matches(
        /^[a-zA-Z0-9_.-]+$/,
        "Must contain only alphanumeric characters and the following: '.', '_', '-'"
      ),
    archive_dir: Yup.string().min(1).max(255),
  });

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <Formik
        initialValues={{
          id: '',
          description: '',
          type: Workflows.EnumArchiveType.System,
          system_id: '',
          archive_dir: '/',
        }}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        <Form id="newarchive-form">
          <FormikInput
            name="type"
            value={Workflows.EnumArchiveType.System}
            label=""
            required={true}
            description={''}
            aria-label="Input"
            type="hidden"
          />
          <FormikInput
            name="id"
            label="Archive id"
            required={true}
            description={``}
            aria-label="Input"
          />
          <FormikSelect
            name="system_id"
            label={'Tapis system'}
            required={true}
            description={'A Tapis system'}
          >
            <option disabled selected>
              -- select a system --
            </option>
            ;
            {Object.values(systems).map((system) => {
              return <option value={system.id}>{system.id}</option>;
            })}
          </FormikSelect>
          <FormikInput
            name="archive_dir"
            label="Archive directory"
            required={false}
            description={`Directory on the Tapis system to which pipeline run artifacts will be archived. Defaults to the "rootDir" of the system.`}
            aria-label="Input"
          />
        </Form>
      </Formik>
    </QueryWrapper>
  );
};

type CreateArchiveModalProps = {
  toggle: () => void;
  groupId: string;
};

const CreateArchiveModal: React.FC<CreateArchiveModalProps> = ({
  groupId,
  toggle,
}) => {
  const { create, isLoading, isSuccess, error } =
    WorkflowsHooks.Archives.useCreate();
  const [selectedType, setSelectedType] = useState<string | undefined>(
    undefined
  );
  const queryClient = useQueryClient();

  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(WorkflowsHooks.Archives.queryKeys.list);
  }, [queryClient]);

  const renderArchiveForm = useCallback(() => {
    const onSubmit = (reqArchive: Workflows.ReqArchive) => {
      create({ groupId: groupId!, reqArchive }, { onSuccess });
    };

    switch (selectedType) {
      case Workflows.EnumArchiveType.System:
        return <TapisSystemArchiveForm onSubmit={onSubmit} />;
      case Workflows.EnumArchiveType.S3:
        return <S3ArchiveForm onSubmit={onSubmit} />;
    }
  }, [selectedType, create, groupId, onSuccess]);

  return (
    <GenericModal
      toggle={toggle}
      title="Create Archive"
      body={
        <div className={styles['archive-form-container']}>
          <FieldWrapper label={'Archive type'} required={true} description={''}>
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
              {Object.values(Workflows.EnumArchiveType).map((type) => {
                return (
                  <option selected={selectedType === type} value={type}>
                    {type}
                  </option>
                );
              })}
            </Input>
          </FieldWrapper>
          {renderArchiveForm()}
        </div>
      }
      footer={
        <SubmitWrapper
          isLoading={isLoading}
          error={error}
          success={isSuccess ? `Successfully created archive` : ''}
          reverse={true}
        >
          <Button
            form="newarchive-form"
            color="primary"
            disabled={isLoading || isSuccess}
            aria-label="Submit"
            type="submit"
          >
            Create Archive
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default CreateArchiveModal;
