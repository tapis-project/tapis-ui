import React, { useEffect } from 'react';
import { useList } from 'tapis-hooks/systems';
import { useSubmit } from 'tapis-hooks/jobs';
import { useForm, FormProvider } from 'react-hook-form';
import FieldWrapper from 'tapis-ui/_common/FieldWrapper';
import { TapisSystem } from '@tapis/tapis-typescript-systems';
import { Jobs } from '@tapis/tapis-typescript';
import { useDetail } from 'tapis-hooks/apps';
import { SubmitWrapper, QueryWrapper } from 'tapis-ui/_wrappers';
import { Button, Input } from 'reactstrap';
import { mapInnerRef } from 'tapis-ui/utils/forms';
import { FileInput } from '@tapis/tapis-typescript-apps';
import { InputSpec } from '@tapis/tapis-typescript-jobs';
import NamedFileInputs, { TestJobSpec } from './NamedFileInputs';
import FileInputs from './FileInputs';

export type OnSubmitCallback = (job: Jobs.Job) => any;

interface JobLauncherProps {
  appId: string;
  appVersion: string;
  name: string;
  execSystemId?: string;
}

const JobLauncher: React.FC<JobLauncherProps> = ({
  appId,
  appVersion,
  name,
  execSystemId,
}) => {
  const {
    data: systemsData,
    isLoading: systemsLoading,
    error: systemsError,
  } = useList();
  const systems: Array<TapisSystem> = systemsData?.result ?? [];
  const {
    data: app,
    isLoading: appLoading,
    error: appError,
  } = useDetail({
    appId,
    appVersion,
    select: 'jobAttributes',
  });

  /* eslint-disable-next-line */
  const { submit, isLoading, error, data } = useSubmit(appId, appVersion);
  const formSubmit = (values: TestJobSpec ) => {
    //submit(values);
    console.log(values);
  };

  const formMethods = useForm<TestJobSpec>();
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = formMethods;

  // Utility function to map an app spec's file inputs to a job's fileInput
  const mapAppInputs = (appInputs: Array<FileInput>) => {
    return appInputs.map((input) => {
      const { sourceUrl, targetPath, inPlace, meta } = input;
      const result: InputSpec = {
        sourceUrl,
        targetPath,
        inPlace,
      };
      if (meta) {
        const { keyValuePairs, ...rest } = meta;
        result.meta = {
          ...rest,
          kv: keyValuePairs ?? [],
        };
      }
      return result;
    });
  };

  const defaultValues: TestJobSpec = {
    namedFileInputs: {
      "key1": { sourceUrl: "source1", targetPath: "target1" },
      "key3": { sourceUrl: "source2", targetPath: "target2" }
    }
  };

  // Populating default values needs to happen as an effect
  // after initial render of field arrays
  useEffect(() => {
    reset(defaultValues);
  }, [reset, app?.result?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <QueryWrapper
      isLoading={appLoading || systemsLoading}
      error={appError ?? systemsError}
    >
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(formSubmit)}>
          <NamedFileInputs />
          {/* Submit button */}
          <SubmitWrapper
            error={error}
            isLoading={isLoading}
            success={
              data && `Successfully submitted job ${data?.result?.uuid ?? ''}`
            }
          >
            <Button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !!error}
            >
              Submit Job
            </Button>
          </SubmitWrapper>
        </form>
      </FormProvider>
    </QueryWrapper>
  );
};

export default JobLauncher;
