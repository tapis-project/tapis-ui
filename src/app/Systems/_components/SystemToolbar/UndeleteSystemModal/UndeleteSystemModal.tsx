import { Button } from 'reactstrap';
import { Systems } from '@tapis/tapis-typescript';
import { GenericModal } from '@tapis/tapisui-common';
import { SubmitWrapper } from '@tapis/tapisui-common';
import { ToolbarModalProps } from '../SystemToolbar';
import { Form, Formik } from 'formik';
import { FormikSelect } from '@tapis/tapisui-common';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { useEffect, useCallback } from 'react';
import styles from './UndeleteSystemModal.module.scss';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';

const UndeleteSystemModal: React.FC<
  ToolbarModalProps & { systemId?: string }
> = ({ systemId, toggle }) => {
  const { data } = Hooks.useDeletedList();
  const systems: Array<Systems.TapisSystem> = data?.result ?? [];
  const history = useHistory();

  //Allows the system list to update without the user having to refresh the page
  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.list);
  }, [queryClient]);

  const {
    undeleteSystem: undelete,
    isLoading,
    error,
    isSuccess,
    reset,
  } = Hooks.useUndeleteSystem();

  useEffect(() => {
    reset();
  }, [reset]);

  const validationSchema = Yup.object({
    systemId: Yup.string(),
  });

  const initialValues = {
    systemId: '',
  };

  const onSubmit = ({ systemId: systemToSubmit }: { systemId: string }) => {
    undelete(systemToSubmit ? systemToSubmit : systemId!, {
      onSuccess: () => {
        onSuccess();
        history.push(`/systems/${systemId}`);
      },
    });
  };

  return (
    <GenericModal
      toggle={toggle}
      title="Restore System"
      body={
        <div className={styles['modal-settings']}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {() => {
              if (systemId) {
                return (
                  <Form id="undelete-form">
                    <FormikSelect
                      name="systemId"
                      description=""
                      label="System Id"
                      required={true}
                      data-testid="systemId"
                      value={systemId}
                    >
                      <option disabled selected value={systemId}>
                        {systemId}
                      </option>
                    </FormikSelect>
                  </Form>
                );
              }
              return (
                <Form id="undelete-form">
                  <FormikSelect
                    name="systemId"
                    description="The system id"
                    label="System ID"
                    required={true}
                    data-testid="systemId"
                  >
                    <option disabled value={''}>
                      Select a system to restore
                    </option>
                    {systems.length ? (
                      systems.map((system) => {
                        return <option>{system.id}</option>;
                      })
                    ) : (
                      <i style={{ padding: '16px' }}>No systems found</i>
                    )}
                  </FormikSelect>
                </Form>
              );
            }}
          </Formik>
        </div>
      }
      footer={
        <SubmitWrapper
          className={styles['modal-footer']}
          isLoading={isLoading}
          error={error}
          success={isSuccess ? `Successfully restored system` : ''}
          reverse={true}
        >
          <Button
            form="undelete-form"
            color="primary"
            disabled={isLoading || isSuccess}
            aria-label="Submit"
            type="submit"
          >
            Restore
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default UndeleteSystemModal;
