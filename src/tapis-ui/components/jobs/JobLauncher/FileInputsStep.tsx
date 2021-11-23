import React, { useEffect } from 'react';
import { Button, Input } from 'reactstrap';
import { useForm, FormProvider } from 'react-hook-form';
import { mapInnerRef } from 'tapis-ui/utils/forms';
import { TapisSystem } from '@tapis/tapis-typescript-systems';
import FieldWrapper from 'tapis-ui/_common/FieldWrapper';
import { JobStepProps } from '.';
import * as Jobs from '@tapis/tapis-typescript-jobs';
import * as Apps from '@tapis/tapis-typescript-apps'
import FileInputs from './FileInputs';

const FileInputsStep: React.FC<JobStepProps> = ({ 
  app, dispatch, previousStep, nextStep }) => {


  const formMethods = useForm<Jobs.ReqSubmitJob>();
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = formMethods;

    // Utility function to map an app spec's file inputs to a job's fileInput
    const mapAppInputs = (appInputs: Array<Apps.AppFileInput>) => {
      return appInputs.map((input) => {
        const { sourceUrl, targetPath, description, name } = input;
        const result: Jobs.JobFileInput = {
          sourceUrl,
          targetPath,
          description,
          name,
        };
        return result;
      });
    };
  
    const defaultValues: Partial<Jobs.ReqSubmitJob> = {
      fileInputs: mapAppInputs(app?.jobAttributes?.fileInputs ?? []),
    };


  // Populating default values needs to happen as an effect
  // after initial render of field arrays
  useEffect(() => {
    reset(defaultValues);
  }, [reset, app]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(dispatch)}>
        <FileInputs
          appInputs={app?.jobAttributes?.fileInputs ?? []}
        />
        <Button className="btn btn-secondary" onClick={previousStep}>Previous</Button>
        <Button type="submit"
              className="btn btn-primary" onClick={nextStep}>Next</Button>
      </form>
    </FormProvider>
  )
}

export default FileInputsStep;