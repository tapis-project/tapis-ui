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
import styles from './DeleteTemplateTagModal.module.scss';
import * as Yup from 'yup';

interface DeleteTemplateTagModalProps {
  toggle: () => void;
  templateId: string;
  tagTimestamp: string;
  tagName: string;
  dependentPods?: string[];
}

const DeleteTemplateTagModal: React.FC<DeleteTemplateTagModalProps> = ({
  toggle,
  templateId,
  tagTimestamp,
  tagName,
  dependentPods = [],
}) => {
  const history = useHistory();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const { deleteTemplateTag, isLoading, error, isSuccess, reset } =
    Hooks.useDeleteTemplateTag();

  const [confirmText, setConfirmText] = useState('');
  const [forceDelete, setForceDelete] = useState(false);

  // The full tag reference that user needs to type to confirm
  // tagTimestamp is already the full reference like "noauth@2025-05-05-18:44:44"
  const fullTagReference = tagTimestamp;

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
    // Invalidate template tags list
    queryClient.invalidateQueries(Hooks.queryKeys.listTemplateTags);
    queryClient.invalidateQueries(Hooks.queryKeys.listTemplatesAndTags);
    // Navigate back to template details tab
    dispatch(updateState({ templateTab: 'details' }));
    window.location.href = `/#/pods/templates/${templateId}`;
  };

  const onSubmit = () => {
    deleteTemplateTag(
      {
        templateId: templateId,
        tagId: tagTimestamp,
        force: forceDelete,
      },
      { onSuccess }
    );
  };

  const hasDependents = dependentPods.length > 0;
  const canDelete =
    confirmText === fullTagReference && (!hasDependents || forceDelete);

  return (
    <GenericModal
      toggle={toggle}
      title="Delete Template Tag"
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
              <Form id="delete-template-tag-form">
                <Typography variant="body1" sx={{ mb: 2 }}>
                  You are about to delete the template tag:
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
                  {templateId}:{fullTagReference}
                </Box>

                {/* Show dependent pods warning */}
                {hasDependents && (
                  <Box className={styles['dependency-warning']}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 'bold', color: 'warning.dark' }}
                    >
                      ⚠️ Warning: {dependentPods.length} pod
                      {dependentPods.length !== 1 ? 's are' : ' is'} using this
                      template tag
                    </Typography>
                    <Box className={styles['dependency-list']}>
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
                          Force delete (delete even with dependent pods)
                        </Typography>
                      }
                    />
                  </Box>
                )}

                <Typography variant="body1" sx={{ mt: 2, mb: 1 }}>
                  To confirm deletion, type the tag reference:{' '}
                  <strong>{fullTagReference}</strong>
                </Typography>

                <FMTextField
                  formik={formik}
                  name="confirmText"
                  label={`Type ${fullTagReference}`}
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  description="Tag deletion cannot be undone."
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
          success={isSuccess ? 'Successfully deleted template tag' : ''}
          reverse={true}
        >
          <Tooltip
            title={
              confirmText !== fullTagReference
                ? 'Type the tag reference to confirm deletion'
                : hasDependents && !forceDelete
                ? 'Enable force delete to remove tag with dependents'
                : ''
            }
            placement="top"
            arrow
            disableHoverListener={canDelete}
          >
            <span>
              <Button
                form="delete-template-tag-form"
                color="danger"
                disabled={isLoading || isSuccess || !canDelete}
                aria-label="Delete"
                type="submit"
              >
                Delete Tag
              </Button>
            </span>
          </Tooltip>
        </SubmitWrapper>
      }
    />
  );
};

export default DeleteTemplateTagModal;
