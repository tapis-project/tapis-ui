import React, { useEffect, useState } from 'react';
import { Button } from 'reactstrap';
import {
  GenericModal,
  SubmitWrapper,
  FMTextField,
} from '@tapis/tapisui-common';
import { Form, Formik } from 'formik';
import { useQueryClient } from 'react-query';
import { Pods as Hooks } from '@tapis/tapisui-hooks';
import { useHistory } from 'react-router-dom';
import { updateState, useAppDispatch } from '@redux';
import {
  Tooltip,
  Typography,
  Box,
  Chip,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import styles from '../DeleteTemplateTagModal/DeleteTemplateTagModal.module.scss';
import * as Yup from 'yup';

interface DeleteTemplateModalProps {
  toggle: () => void;
  templateId: string;
  dependentPods?: string[];
  dependentTags?: string[];
}

const DeleteTemplateModal: React.FC<DeleteTemplateModalProps> = ({
  toggle,
  templateId,
  dependentPods = [],
  dependentTags = [],
}) => {
  const history = useHistory();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { deleteTemplate, isLoading, error, isSuccess, reset } =
    Hooks.useDeleteTemplate();

  const [confirmText, setConfirmText] = useState('');
  const [forceDelete, setForceDelete] = useState(false);

  useEffect(() => {
    reset();
  }, [reset]);

  const validationSchema = Yup.object({
    confirmText: Yup.string(),
  });

  const initialValues = {
    confirmText: '',
  };

  const onSuccess = () => {
    // Invalidate template lists
    queryClient.invalidateQueries(Hooks.queryKeys.listTemplates);
    queryClient.invalidateQueries(Hooks.queryKeys.listTemplatesAndTags);
    // Navigate back to templates root
    dispatch(updateState({ templateRootTab: 'dashboard' }));
    window.location.href = `/#/pods/templates`;
  };

  const onSubmit = () => {
    deleteTemplate(
      {
        templateId: templateId,
        force: forceDelete,
      },
      { onSuccess }
    );
  };

  const hasDependents = dependentPods.length > 0 || dependentTags.length > 0;
  const canDelete =
    confirmText === templateId && (!hasDependents || forceDelete);

  return (
    <GenericModal
      toggle={toggle}
      title="Delete Template"
      backdrop={true}
      body={
        <div className={styles['modal-settings']}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            enableReinitialize={true}
          >
            {(formik) => (
              <Form id="delete-template-form">
                <Typography variant="body1" sx={{ mb: 2 }}>
                  You are about to delete the template:
                </Typography>
                <Box
                  sx={{
                    p: 1.5,
                    mb: 2,
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    border: '1px solid rgba(112, 112, 112, 0.2)',
                    borderRadius: 1,
                    fontFamily: 'monospace',
                  }}
                >
                  {templateId}
                </Box>

                {/* Show dependent pods warning */}
                {hasDependents && (
                  <Box className={styles['dependency-warning']}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 'bold', color: 'warning.dark', mb: 1 }}
                    >
                      ⚠️ Warning: This template has dependencies
                    </Typography>

                    {dependentPods.length > 0 && (
                      <>
                        <Typography
                          variant="body2"
                          sx={{ color: 'warning.dark', mb: 0.5 }}
                        >
                          {dependentPods.length} pod
                          {dependentPods.length !== 1 ? 's are' : ' is'} using
                          this template
                        </Typography>
                        <Box
                          className={styles['dependency-list']}
                          sx={{ mb: 1 }}
                        >
                          {dependentPods.slice(0, 10).map((podId, index) => (
                            <Chip
                              key={index}
                              label={podId}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                          {dependentPods.length > 10 && (
                            <Chip
                              label={`+${dependentPods.length - 10} more`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </>
                    )}

                    {dependentTags.length > 0 && (
                      <>
                        <Typography
                          variant="body2"
                          sx={{ color: 'warning.dark', mb: 0.5 }}
                        >
                          {dependentTags.length} tag
                          {dependentTags.length !== 1 ? 's' : ''} will be
                          deleted
                        </Typography>
                        <Box
                          className={styles['dependency-list']}
                          sx={{ mb: 1 }}
                        >
                          {dependentTags.slice(0, 10).map((tagRef, index) => (
                            <Chip
                              key={index}
                              label={tagRef}
                              size="small"
                              variant="outlined"
                              color="secondary"
                            />
                          ))}
                          {dependentTags.length > 10 && (
                            <Chip
                              label={`+${dependentTags.length - 10} more`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </>
                    )}

                    <FormControlLabel
                      sx={{ mt: 1 }}
                      control={
                        <Checkbox
                          checked={forceDelete}
                          onChange={(e) => setForceDelete(e.target.checked)}
                          size="small"
                          color="warning"
                        />
                      }
                      label={
                        <Typography variant="body2" color="warning.dark">
                          Force delete (delete template and all its tags)
                        </Typography>
                      }
                    />
                  </Box>
                )}

                <Typography variant="body1" sx={{ mt: 2, mb: 1 }}>
                  To confirm deletion, type the template ID:{' '}
                  <strong>{templateId}</strong>
                </Typography>

                <FMTextField
                  formik={formik}
                  name="confirmText"
                  label={`Type ${templateId}`}
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  description="Template deletion cannot be undone."
                  variant="filled"
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
          success={isSuccess ? 'Successfully deleted template' : ''}
          reverse={true}
        >
          <Tooltip
            title={
              confirmText !== templateId
                ? 'Type the template ID to confirm deletion'
                : hasDependents && !forceDelete
                ? 'Enable force delete to remove template with dependencies'
                : ''
            }
            placement="top"
            arrow
            disableHoverListener={canDelete}
          >
            <span>
              <Button
                form="delete-template-form"
                color="danger"
                disabled={isLoading || isSuccess || !canDelete}
                aria-label="Delete"
                type="submit"
              >
                Delete Template
              </Button>
            </span>
          </Tooltip>
        </SubmitWrapper>
      }
    />
  );
};

export default DeleteTemplateModal;
