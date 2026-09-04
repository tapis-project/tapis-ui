import { useEffect, useMemo } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { useHistory } from 'react-router-dom';
import {
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { FormikInput, FormikSelect } from '@tapis/tapisui-common';
import { Files } from '@tapis/tapis-typescript';
import {
  Files as FilesHooks,
  MLHub,
  useTapisConfig,
} from '@tapis/tapisui-hooks';
import * as Datasets from '@mlhub/datasets-ts-sdk';
import { useFilesSelect } from '../../FilesContext';
import { ToolbarModalProps } from '../Toolbar';

type DatasetFormValues = {
  name: string;
  description: string;
  tags: string;
  visibility: Datasets.Visibility;
};

const bytesFromKilobytes = (size?: number) => (size ?? 0) * 1024;

const registrationSchema = Yup.object({
  name: Yup.string().trim().required('A dataset name is required'),
  description: Yup.string(),
  tags: Yup.string(),
  visibility: Yup.mixed<Datasets.Visibility>()
    .oneOf(Object.values(Datasets.Visibility))
    .required(),
});

const RegisterDatasetModal: React.FC<ToolbarModalProps> = ({
  toggle,
  systemId = '',
}) => {
  const history = useHistory();
  const { selectedFiles, unselect } = useFilesSelect();
  const selectedFile = selectedFiles[0];
  const isDirectory = selectedFile?.type === Files.FileTypeEnum.Dir;
  const { pathSiteId, tokenTenantId } = useTapisConfig();
  const { registerDataset, isLoading, isError, error, reset } =
    MLHub.Datasets.useRegisterDataset();
  const directoryListing = FilesHooks.useList(
    { systemId, path: selectedFile?.path ?? '/' },
    { enabled: isDirectory }
  );

  const {
    concatenatedResults: directoryEntries,
    hasNextPage,
    isLoading: isLoadingDirectory,
    isFetchingNextPage,
    fetchNextPage,
    isError: isDirectoryError,
    error: directoryError,
  } = directoryListing;

  useEffect(() => {
    if (
      isDirectory &&
      hasNextPage &&
      !isFetchingNextPage &&
      !isDirectoryError
    ) {
      fetchNextPage();
    }
  }, [
    fetchNextPage,
    hasNextPage,
    isDirectory,
    isDirectoryError,
    isFetchingNextPage,
  ]);

  useEffect(() => {
    reset();
  }, [reset]);

  const items = useMemo(() => {
    if (!isDirectory) return [];

    return (directoryEntries ?? []).flatMap((entry) => {
      if (!entry.path) return [];
      return [{ path: entry.path, size: bytesFromKilobytes(entry.size) }];
    });
  }, [directoryEntries, isDirectory]);
  const directoryIsLoading =
    isDirectory && (isLoadingDirectory || isFetchingNextPage || hasNextPage);
  const totalSize = isDirectory
    ? items.reduce((total, item) => total + item.size, 0)
    : bytesFromKilobytes(selectedFile?.size);

  const initialValues: DatasetFormValues = {
    name: selectedFile?.name ?? '',
    description: '',
    tags: '',
    visibility: Datasets.Visibility.Private,
  };

  const close = () => {
    reset();
    toggle();
  };

  const onSubmit = (values: DatasetFormValues) => {
    if (!selectedFile || directoryIsLoading || isDirectoryError) return;

    const tags = values.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    // TODO: Remove this fallback once the Datasets API derives site_id itself.
    const siteId = pathSiteId ?? tokenTenantId;

    registerDataset(
      {
        registerDatasetBody: {
          name: values.name.trim(),
          description: values.description.trim() || undefined,
          tags: [...new Set(tags)],
          visibility: values.visibility,
          provider: Datasets.DatasetProvider.Tapis,
          size: totalSize,
          items,
          tapis_system_locator: {
            path: selectedFile.path ?? '/',
            site_id: siteId,
            system_id: systemId,
            tenant_id: tokenTenantId,
          },
        },
      },
      {
        onSuccess: () => {
          unselect(selectedFiles);
          toggle();
          history.push('/mlhub/datasets');
        },
      }
    );
  };

  return (
    <Dialog
      open
      onClose={isLoading ? undefined : close}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Register as Dataset</DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
        <div>
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>Dataset source</AlertTitle>
            {systemId}:{selectedFile?.path ?? '/'}
          </Alert>
          {isDirectory && directoryIsLoading && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Loading the directory&apos;s direct contents…
            </Alert>
          )}
          {isDirectoryError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <AlertTitle>Unable to list directory contents</AlertTitle>
              {directoryError?.message ?? 'Please try again.'}
            </Alert>
          )}
          {isError && error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <AlertTitle>Unable to register dataset</AlertTitle>
              {error.message}
            </Alert>
          )}
          {isDirectory && !directoryIsLoading && !isDirectoryError && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {items.length} direct item{items.length === 1 ? '' : 's'} will be
              registered. Nested directories are not traversed.
            </Alert>
          )}
          <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={registrationSchema}
            onSubmit={onSubmit}
          >
            <Form id="register-dataset-form">
              <FormikInput
                name="name"
                label="Dataset name"
                description=""
                required
              />
              <FormikInput
                name="description"
                label="Description"
                description=""
                required={false}
                type="textarea"
                rows={3}
              />
              <FormikInput
                name="tags"
                label="Tags"
                description="Comma-separated tags"
                required={false}
              />
              <FormikSelect
                name="visibility"
                label="Visibility"
                description=""
                required
              >
                <option value={Datasets.Visibility.Private}>Private</option>
                <option value={Datasets.Visibility.Public}>Public</option>
              </FormikSelect>
            </Form>
          </Formik>
        </div>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={close} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          form="register-dataset-form"
          variant="contained"
          disabled={
            !selectedFile || isLoading || directoryIsLoading || isDirectoryError
          }
          type="submit"
        >
          {isLoading ? 'Registering…' : 'Register Dataset'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegisterDatasetModal;
