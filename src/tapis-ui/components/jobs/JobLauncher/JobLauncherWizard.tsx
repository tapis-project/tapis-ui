import React from "react";
import { WizardStep, useWizard } from "tapis-ui/_common/Wizard";
import { Wizard } from "tapis-ui/_common";
import { FieldWrapper } from "tapis-ui/_common";
import { Input, Button } from "reactstrap";
import { useForm, useFormContext, FormProvider } from "react-hook-form";
import { mapInnerRef } from "tapis-ui/utils/forms";
import * as Jobs from "@tapis/tapis-typescript-jobs";

type JobLauncherWizardProps = {
  appId: string;
  appVersion: string;
  execSystemId: string;
  name: string;
};



const JobWizardNavigation: React.FC = () => {
  const props = useWizard();
  return (
    <div>
      <Button type="submit" onClick={props.nextStep}>Next</Button>
    </div>
  )
}

type JobBasicsProps = {
  name: string;
  appId: string;
  appVersion: string;
  execSystemId: string;
};

const JobBasics: React.FC<JobBasicsProps> = ({
  name,
  appId,
  appVersion,
  execSystemId,
}) => {
  const { nextStep } = useWizard();
  const { register, formState, handleSubmit } = useForm<Jobs.ReqSubmitJob>();
  const { errors } = formState;

  const formSubmit = (values: Jobs.ReqSubmitJob) => {
    console.log(values);
    nextStep && nextStep();
  }
  
  return (
    <form onSubmit={handleSubmit(formSubmit)}>
      <FieldWrapper
        description="A name for this job"
        label="Name"
        required={true}
        error={errors["name"]}
      >
        <Input
          bsSize="sm"
          defaultValue={name}
          {...mapInnerRef(register("name", { required: "Name is required" }))}
        />
      </FieldWrapper>
      <FieldWrapper
        description="The ID of the TAPIS application to run"
        label="App ID"
        required={true}
        error={errors["appId"]}
      >
        <Input
          bsSize="sm"
          data-testid="appId"
          defaultValue={appId}
          {...mapInnerRef(
            register("appId", { required: "App ID is required" })
          )}
        />
      </FieldWrapper>
      <FieldWrapper
        description="The version of the application to run"
        label="App Version"
        required={true}
        error={errors["appVersion"]}
      >
        <Input
          bsSize="sm"
          defaultValue={appVersion}
          {...mapInnerRef(
            register("appVersion", { required: "App version is required " })
          )}
        />
      </FieldWrapper>
      <Button type="submit">Next</Button>
    </form>
  );
};

const JobLauncherWizard: React.FC<JobLauncherWizardProps> = ({
  name,
  appId,
  appVersion,
  execSystemId
}) => {
  const steps: Array<WizardStep> = [
    {
      id: "step1",
      name: "Job Stuff",
      render: <JobBasics name={name} appId={appId} appVersion={appVersion} execSystemId={execSystemId} />,
    },
    {
      id: "step2",
      name: "File Stuff",
      render: <div>File Stuff</div>,
    },
  ];

  return (
    <Wizard steps={steps} />
  );
};

export default JobLauncherWizard;
