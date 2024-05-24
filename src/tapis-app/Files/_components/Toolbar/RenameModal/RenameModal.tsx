import { useCallback, useState } from 'react';
import { Button } from 'reactstrap';
import { GenericModal } from '@tapis/tapisui-common';
import { SubmitWrapper } from '@tapis/tapisui-common';
import { ToolbarModalProps } from '../Toolbar';
import { Form, Formik } from 'formik';
import { FormikInput } from '@tapis/tapisui-common';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { focusManager } from 'react-query';
import { useEffect } from 'react';
import { useFilesSelect } from '../../FilesContext';
import * as Yup from 'yup';

const RenameModal: React.FC<ToolbarModalProps> = ({
  toggle,
  systemId,
  path,
}) => {
  const { selectedFiles, clear } = useFilesSelect();
  const [inputName, setInputName] = useState<string>();
  const file = selectedFiles ? selectedFiles[0] : undefined;

  const onSuccess = useCallback(() => {
    // Calling the focus manager triggers react-query's
    // automatic refetch on window focus
    clear();
    focusManager.setFocused(true);
  }, [clear]);

  const { move, isLoading, error, isSuccess, reset } = Hooks.useMove();

  useEffect(() => {
    reset();
  }, [reset]);

  const validationSchema = Yup.object({
    newname: Yup.string()
      .min(1)
      .max(255, 'The new filename cannot be longer than 255 characters')
      .matches(
        /[a-zA-Z0-9_.-]+/,
        "Filename must contain only alphanumeric characters and the following: '.', '_', '-'"
      )
      .required('The new filename is required'),
  });

  const initialValues = {
    newname: file?.name ?? inputName ?? '',
  };

  const onSubmit = useCallback(
    ({ newname }: { newname: string }) => {
      setInputName(newname);
      if (!file?.name) {
        return;
      }
      move(
        {
          systemId: systemId!,
          path: `${path}${file!.name}`,
          newPath: `${path}${newname}`,
        },
        { onSuccess }
      );
    },
    [setInputName, file, move, onSuccess, systemId, path]
  );

  const dirOrFile = (type: string | undefined) => {
    return type === 'dir' ? 'directory' : 'file';
  };

  return (
    <GenericModal
      toggle={toggle}
      title={`Rename ${dirOrFile(file?.type)}`}
      body={
        <div>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            <Form id="rename-form">
              <FormikInput
                name="newname"
                label={`${
                  dirOrFile(file?.type).charAt(0).toUpperCase() +
                  dirOrFile(file?.type).slice(1)
                } Name`}
                required={true}
                description="Rename File"
              />
            </Form>
          </Formik>
        </div>
      }
      footer={
        <SubmitWrapper
          isLoading={false}
          error={error}
          success={isSuccess ? `Successfully renamed` : ''}
          reverse={true}
        >
          <Button
            form="rename-form"
            color="primary"
            disabled={isLoading || isSuccess}
            aria-label="Submit"
            type="submit"
          >
            Rename
          </Button>
        </SubmitWrapper>
      }
    />
  );
};

export default RenameModal;
