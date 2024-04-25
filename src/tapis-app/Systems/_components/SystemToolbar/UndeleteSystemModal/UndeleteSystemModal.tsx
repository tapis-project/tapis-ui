import { Button } from 'reactstrap';
import { Systems } from '@tapis/tapis-typescript';
import { GenericModal } from 'tapis-ui/_common';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { ToolbarModalProps } from '../SystemToolbar';
import { Form, Formik } from 'formik';
import { FormikSelect } from 'tapis-ui/_common/FieldWrapperFormik';
import { useUndeleteSystem, useDeletedList } from 'tapis-hooks/systems';
import { useEffect, useCallback } from 'react';
import styles from './UndeleteSystemModal.module.scss';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
import { default as queryKeys } from 'tapis-hooks/systems/queryKeys';

const UndeleteSystemModal: React.FC<ToolbarModalProps> = ({ toggle }) => {
  const { data } = useDeletedList();
  const systems: Array<Systems.TapisSystem> = data?.result ?? [];

  //Allows the system list to update without the user having to refresh the page
  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    queryClient.invalidateQueries(queryKeys.list);
  }, [queryClient]);

  const { undeleteSystem, isLoading, error, isSuccess, reset } =
    useUndeleteSystem();

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
    undeleteSystem(systemId, { onSuccess });
  };

  return (
    <GenericModal
      toggle={toggle}
      title="Re-add a System"
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
                    Select a system to re-add
                  </option>
                  {systems.length ? (
                    systems.map((system) => {
                      return <option>{system.id}</option>;
                    })
                  ) : (
                    <i>No systems found</i>
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
          success={isSuccess ? `Successfully re-added a system` : ''}
          reverse={true}
        >
          <Button
            form="newsystem-form"
            color="primary"
            disabled={isLoading || isSuccess}
            aria-label="Submit"
            type="submit"
          >
            Re-add system
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default UndeleteSystemModal;
