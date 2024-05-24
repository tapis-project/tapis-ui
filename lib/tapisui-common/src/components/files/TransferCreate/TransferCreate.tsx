import React, { useCallback, useEffect } from 'react';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { Files } from '@tapis/tapis-typescript';
import { Button } from 'reactstrap';
import { SubmitWrapper } from '../../../wrappers';
import { focusManager } from 'react-query';
import { Form, Formik } from 'formik';
import { FormikInput } from '../../../ui-formik/FieldWrapperFormik';
import * as Yup from 'yup';

type TransferCreateProps = {
  files: Array<Files.FileInfo>;
  sourceSystemId: string;
  destinationSystemId: string;
  destinationPath: string;
  className?: string;
};

const TransferCreate: React.FC<TransferCreateProps> = ({
  files,
  sourceSystemId,
  destinationSystemId,
  destinationPath,
  className = '',
}) => {
  const { create, data, isLoading, error, isSuccess, reset } =
    Hooks.Transfers.useCreate();

  const onSubmit = useCallback(
    ({ tag }: { tag: string }) => {
      const destinationURI = `tapis://${destinationSystemId}${destinationPath}`;
      const elements: Array<Files.TransferTaskRequestElement> = files.map(
        (file) => ({
          destinationURI,
          sourceURI: `tapis://${sourceSystemId}${file.path}`,
        })
      );
      const tagName = tag.length > 0 ? tag : undefined;
      create(
        { elements, tag: tagName },
        { onSuccess: () => focusManager.setFocused(true) }
      );
    },
    [sourceSystemId, destinationSystemId, destinationPath, files, create]
  );

  useEffect(() => {
    reset();
  }, [reset]);

  const validationSchema = Yup.object({
    tag: Yup.string().required('a tag for this transfer is required'),
  });

  const initialValues = {
    tag: '',
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      <Form>
        <FormikInput
          name="tag"
          label="Tag"
          required={false}
          description="A tag name for this file transfer"
        />
        <SubmitWrapper
          isLoading={isLoading}
          error={error}
          success={
            isSuccess
              ? `Successfully submitted transfer ${
                  data?.result?.tag ?? data?.result?.uuid ?? ''
                }`
              : ''
          }
          reverse
        >
          <Button
            color="primary"
            disabled={isLoading || isSuccess}
            aria-label="Submit"
            type="submit"
          >
            Submit
          </Button>
        </SubmitWrapper>
      </Form>
    </Formik>
  );
};

export default TransferCreate;
