import React, { useCallback, useEffect } from 'react';
import { useCreate } from 'tapis-hooks/files/transfers';
import { Files } from '@tapis/tapis-typescript';
import { Button, Input } from 'reactstrap';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { FieldWrapper } from 'tapis-ui/_common';
import { focusManager } from 'react-query';
import { useForm } from 'react-hook-form';

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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ tag: string }>({
    defaultValues: {
      tag: '',
    },
  });

  const { ref: tagRef, ...tagFieldProps } = register('tag');

  const { create, data, isLoading, error, isSuccess, reset } = useCreate();

  const onSubmit = useCallback(
    ({ tag }) => {
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

  return (
    <form
      id="transfercreate-form"
      onSubmit={handleSubmit(onSubmit)}
      className={className}
    >
      <FieldWrapper
        label="Tag"
        required={false}
        description="A tag name for this file transfer"
        error={errors.tag}
      >
        <Input
          bsSize="sm"
          id="argumentInput"
          {...tagFieldProps}
          innerRef={tagRef}
          aria-label="Tag"
        />
      </FieldWrapper>
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
          form="transfercreate-form"
        >
          Submit
        </Button>
      </SubmitWrapper>
    </form>
  );
};

export default TransferCreate;
