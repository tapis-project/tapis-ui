import { Button } from 'reactstrap';
import { Systems } from '@tapis/tapis-typescript';
import { GenericModal } from '@tapis/tapisui-common';
import { SubmitWrapper } from '@tapis/tapisui-common';
import { ToolbarModalProps } from '../SystemToolbar';
import { Form, Formik } from 'formik';
import { FormikSelect } from '@tapis/tapisui-common';
import { useEffect, useCallback } from 'react';
import styles from './DeleteSystemModal.module.scss';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { useTapisConfig } from '@tapis/tapisui-hooks';

const DeleteSystemModal: React.FC<ToolbarModalProps> = ({ toggle }) => {
  const { claims } = useTapisConfig();
  const effectiveUserId = claims['sub'].substring(
    0,
    claims['sub'].lastIndexOf('@')
  );
  const { data } = Hooks.useList({ search: `owner.like.${effectiveUserId}` }); //{search: `owner.like.${''}`,}
  const systems: Array<Systems.TapisSystem> = data?.result ?? [];

  //Allows the system list to update without the user having to refresh the page
  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(Hooks.queryKeys.list);
  }, [queryClient]);

  const { deleteSystem, isLoading, error, isSuccess, reset } =
    Hooks.useDeleteSystem();

  useEffect(() => {
    reset();
  }, [reset]);

  const validationSchema = Yup.object({
    systemId: Yup.string(),
  });

  const initialValues = {
    systemId: '',
  };

  const onSubmit = ({ systemId }: { systemId: string }) => {
    deleteSystem(systemId, { onSuccess });
  };

  return (
    <GenericModal
      toggle={toggle}
      title="Delete System"
      body={
        <div className={styles['modal-settings']}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {() => (
              <Form id="newsystem-form">
                <FormikSelect
                  name="systemId"
                  description="The system id"
                  label="System ID"
                  required={true}
                  data-testid="systemId"
                >
                  <option disabled value={''}>
                    Select a system to delete
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
            )}
          </Formik>
        </div>
      }
      footer={
        <SubmitWrapper
          className={styles['modal-footer']}
          isLoading={isLoading}
          error={error}
          success={isSuccess ? `Successfully deleted a system` : ''}
          reverse={true}
        >
          <Button
            form="newsystem-form"
            color="primary"
            disabled={isLoading || isSuccess}
            aria-label="Submit"
            type="submit"
          >
            Delete system
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default DeleteSystemModal;
