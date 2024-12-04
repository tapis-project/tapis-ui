import { Button } from 'reactstrap';
import { Systems } from '@tapis/tapis-typescript';
import { GenericModal } from '../../../../ui';
import { SubmitWrapper } from '../../../../wrappers';
import { Form, Formik } from 'formik';
import { FormikSelect } from '../../../../';
import { useEffect } from 'react';
import styles from './DeleteSystemModal.module.scss';
import * as Yup from 'yup';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { useTapisConfig } from '@tapis/tapisui-hooks';
import { useHistory } from 'react-router-dom';

type DeleteModalProps = {
  systemId?: string;
  toggle: () => void;
  open: boolean;
};

const DeleteSystemModal: React.FC<DeleteModalProps> = ({
  open,
  toggle,
  systemId,
}) => {
  if (!open) {
    return <></>;
  }
  const { claims } = useTapisConfig();
  const history = useHistory();
  const effectiveUserId = claims['tapis/username'];
  const { data } = Hooks.useList({ search: `owner.like.${effectiveUserId}` });
  const systems: Array<Systems.TapisSystem> = data?.result ?? [];

  const { deleteSystem, isLoading, error, isSuccess, reset, invalidate } =
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

  const onSubmit = ({ systemId: formSystemId }: { systemId: string }) => {
    let systemIdToDelete: string | undefined = formSystemId;
    if (systemId) {
      systemIdToDelete = systemId;
    }
    deleteSystem(systemIdToDelete, {
      onSuccess: () => {
        invalidate();
        history.push('/systems');
      },
    });
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
            {() => {
              if (systemId) {
                return (
                  <Form id="newsystem-form">
                    <FormikSelect
                      name="systemId"
                      description="The system id"
                      label="System ID"
                      required={true}
                      data-testid="systemId"
                      defaultValue={systemId}
                    >
                      <option disabled selected value={systemId}>
                        {systemId}
                      </option>
                    </FormikSelect>
                  </Form>
                );
              }
              return (
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
