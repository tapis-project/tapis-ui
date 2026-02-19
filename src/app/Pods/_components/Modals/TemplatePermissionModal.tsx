import { Button } from 'reactstrap';
import { Pods } from '@tapis/tapis-typescript';
import { GenericModal } from '@tapis/tapisui-common';
import { SubmitWrapper } from '@tapis/tapisui-common';
import { ToolbarModalProps } from './ToolbarModalProps';
import { Form, Formik } from 'formik';
import { FormikInput } from '@tapis/tapisui-common';
import { useEffect, useCallback } from 'react';
import styles from './PodModals.module.scss';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { useLocation, useHistory } from 'react-router-dom';

import { useDispatch } from 'react-redux';

interface TemplatePermissionModalProps {
  toggle: () => void;
  templateId: string;
}

const TemplatePermissionModal: React.FC<TemplatePermissionModalProps> = ({
  toggle,
  templateId,
}) => {
  const queryClient = useQueryClient();
  const history = useHistory();
  const dispatch = useDispatch();

  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.getTemplatePermissions);
  }, [queryClient]);

  const { setTemplatePermission, isLoading, error, isSuccess, reset } =
    Hooks.useSetTemplatePermission(templateId);

  useEffect(() => {
    reset();
  }, [reset]);

  const validationSchema = Yup.object({
    username: Yup.string().required('Username is required'),
    permissionLevel: Yup.string().required('Permission level is required'),
  });

  const initialValues = {
    username: '',
    permissionLevel: '',
  };

  const onSubmit = (
    {
      username,
      permissionLevel,
    }: { username: string; permissionLevel: string },
    {
      setFieldValue,
      resetForm,
      setTouched,
    }: {
      setFieldValue: (field: string, value: any) => void;
      resetForm: () => void;
      setTouched: (touched: { [field: string]: boolean }) => void;
    }
  ) => {
    setTemplatePermission(
      {
        templateId,
        setPermission: { user: username, level: permissionLevel },
      },
      { onSuccess }
    );
    resetForm();
    setFieldValue('permissionLevel', permissionLevel);
    setTouched({
      username: false,
      permissionLevel: false,
    });
  };

  return (
    <GenericModal
      toggle={toggle}
      title={`Set Template Permission - ${templateId}`}
      backdrop={true}
      body={
        <div className={styles['modal-settings']}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {() => (
              <Form id="setTemplatePermission-form">
                <FormikInput
                  name="username"
                  label="Username"
                  description="Enter the username (e.g. jsmith, **, or tenant.<tenant_id>)"
                  required={true}
                  data-testid="username"
                />
                <FormikInput
                  name="permissionLevel"
                  label="Permission Level"
                  description="Enter the permission level (READ, USER, or ADMIN)"
                  required={true}
                  data-testid="permissionLevel"
                />
              </Form>
            )}
          </Formik>
        </div>
      }
      footer={
        <SubmitWrapper
          className={styles['modal-footer']}
          isLoading={isLoading}
          error={error}
          success={isSuccess ? `Successfully set template permission` : ''}
          reverse={true}
        >
          <Button
            form="setTemplatePermission-form"
            color="primary"
            disabled={isLoading}
            aria-label="Submit"
            type="submit"
          >
            Set Permission
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default TemplatePermissionModal;
