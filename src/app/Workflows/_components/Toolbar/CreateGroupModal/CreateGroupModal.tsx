import React, { useCallback } from 'react';
import { Button } from 'reactstrap';
import { SubmitWrapper } from '@tapis/tapisui-common';
import { Form, Formik, FieldArray, Field } from 'formik';
import { FormikInput, GenericModal, Icon } from '@tapis/tapisui-common';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import styles from './CreateGroupModal.module.scss';
import { Workflows } from '@tapis/tapis-typescript';
import * as Yup from 'yup';

type CreateGroupModalProps = {
  toggle: () => void;
};

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ toggle }) => {
  const { create, isLoading, error, isSuccess, invalidate } =
    Hooks.Groups.useCreate();

  const onSuccess = useCallback(() => {
    invalidate();
  }, [invalidate]);

  const validationSchema = Yup.object({
    groupId: Yup.string()
      .min(1)
      .max(255, 'Group id cannot be longer than 255 characters')
      .matches(
        /^[a-zA-Z0-9_.-]+$/,
        "Must contain only alphanumeric characters and the following: '.', '_', '-'"
      )
      .required('groupId is a required field'),
    users: Yup.array().of(
      Yup.object().shape({
        username: Yup.string()
          .min(1)
          .max(128)
          .required('Username must be provided'),
        is_admin: Yup.bool().default(false),
      })
    ),
  });

  const initialValues = {
    groupId: '',
    users: [],
  };

  type CreateGroupFormProps = {
    groupId: string;
    users: Array<Workflows.ReqGroupUser>;
  };

  const onSubmit = ({ groupId, users }: CreateGroupFormProps) => {
    create({ id: groupId, users }, { onSuccess });
  };

  return (
    <GenericModal
      toggle={toggle}
      title="Create Group"
      body={
        <div>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            render={({ values }) => (
              <Form id="newgroup-form">
                <FormikInput
                  name="groupId"
                  label="Group Id"
                  required={true}
                  description={`Creates a new group`}
                  aria-label="Input"
                />
                <FieldArray
                  name="users"
                  render={(arrayHelpers) => (
                    <div>
                      <h2>Users</h2>
                      <i className={styles['subheader']}>
                        Note: You are automatically added as an admin to this
                        group
                      </i>
                      <div className={styles['user-inputs']}>
                        {values.users.length > 0 &&
                          values.users.map((_, index) => (
                            <div key={index} className={styles['user-input']}>
                              <FormikInput
                                name={`users.${index}.username`}
                                label="Username"
                                required={true}
                                description={`TAPIS username`}
                                aria-label="Input"
                              />
                              <label>
                                <Field
                                  type="checkbox"
                                  name={`users.${index}.is_admin`}
                                />{' '}
                                is admin?
                              </label>
                              <Button
                                className={styles['remove-button']}
                                type="button"
                                color="danger"
                                onClick={() => arrayHelpers.remove(index)}
                                size="sm"
                              >
                                <Icon name="trash" />
                              </Button>
                            </div>
                          ))}
                      </div>
                      <Button
                        type="button"
                        className={styles['add-button']}
                        onClick={() =>
                          arrayHelpers.push({ username: '', is_admin: false })
                        }
                      >
                        + Add user
                      </Button>
                    </div>
                  )}
                />
              </Form>
            )}
          ></Formik>
        </div>
      }
      footer={
        <SubmitWrapper
          isLoading={isLoading}
          error={error}
          success={isSuccess ? `Successfully created group` : ''}
          reverse={true}
        >
          <Button
            form="newgroup-form"
            color="primary"
            disabled={isLoading || isSuccess}
            aria-label="Submit"
            type="submit"
          >
            Create Group
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default CreateGroupModal;
