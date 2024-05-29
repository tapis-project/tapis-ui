import React, { useCallback } from 'react';
import { Button } from 'reactstrap';
import { SubmitWrapper } from '@tapis/tapisui-common';
import { Form, Formik, FieldArray, Field } from 'formik';
import { FormikInput, GenericModal, Icon } from '@tapis/tapisui-common';
import { useQueryClient } from 'react-query';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import styles from './AddGroupUsersModal.module.scss';
import { Workflows } from '@tapis/tapis-typescript';
import * as Yup from 'yup';

type AddGroupUserModalProps = {
  toggle: () => void;
  groupId: string;
};

const AddGroupUsersModal: React.FC<AddGroupUserModalProps> = ({
  toggle,
  groupId,
}) => {
  const { create, isLoading, error, isSuccess } = Hooks.GroupUsers.useCreate();
  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.GroupUsers.queryKeys.list);
  }, [queryClient]);

  const validationSchema = Yup.object({
    users: Yup.array()
      .of(
        Yup.object().shape({
          username: Yup.string()
            .min(1)
            .max(128)
            .required('Username must be provided'),
          is_admin: Yup.bool().default(false),
        })
      )
      .min(1, 'Must provide at least 1 user'),
  });

  const initialValues = {
    users: [{ username: '', is_admin: false }],
  };

  type AddGroupUserFormProps = {
    users: Array<Workflows.ReqGroupUser>;
  };

  const onSubmit = ({ users }: AddGroupUserFormProps) => {
    create({ groupId: groupId!, user: users[0] }, { onSuccess });
  };

  return (
    <GenericModal
      toggle={toggle}
      title="Add User"
      body={
        <div>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            render={({ values }) => (
              <Form id="newgroup-form">
                <h2>Group: {groupId}</h2>
                <FieldArray
                  name="users"
                  render={(arrayHelpers) => (
                    <div>
                      <div className={styles['user-inputs']}>
                        {values.users.length > 0 &&
                          values.users.map((user, index) => (
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
                                  checked={user.is_admin}
                                />{' '}
                                is admin?
                              </label>
                              {index !== 0 && (
                                <Button
                                  className={styles['remove-button']}
                                  type="button"
                                  color="danger"
                                  onClick={() => arrayHelpers.remove(index)}
                                  size="sm"
                                >
                                  <Icon name="trash" />
                                </Button>
                              )}
                            </div>
                          ))}
                      </div>
                      {/* TODO Support for adding multiple users
                    <Button
                      type="button"
                      className={styles["add-button"]}
                      onClick={() => arrayHelpers.push({username: "", is_admin: false})}>
                        +
                    </Button> */}
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
          success={isSuccess ? `Successfully added user` : ''}
          reverse={true}
        >
          <Button
            form="newgroup-form"
            color="primary"
            disabled={isSuccess || isSuccess}
            aria-label="Submit"
            type="submit"
          >
            Add
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default AddGroupUsersModal;
