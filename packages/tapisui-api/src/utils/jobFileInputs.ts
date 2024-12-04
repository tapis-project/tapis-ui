import { Apps, Jobs } from '@tapis/tapis-typescript';

export const getIncompleteAppInputs = (
  app: Apps.TapisApp
): Array<Apps.AppFileInput> => {
  return (
    app.jobAttributes?.fileInputs?.filter(
      (fileInput) => !fileInput.sourceUrl
    ) ?? []
  );
};

export const getIncompleteAppInputsOfType = (
  app: Apps.TapisApp,
  inputType: Apps.FileInputModeEnum
): Array<Apps.AppFileInput> => {
  return getIncompleteAppInputs(app).filter(
    (fileInput) => fileInput.inputMode === inputType
  );
};

export const generateFileInputFromAppInput = (
  input: Apps.AppFileInput
): Jobs.JobFileInput => ({
  name: input.name,
  sourceUrl: input.sourceUrl,
  targetPath: input.targetPath,
  description: input.description,
  autoMountLocal: input.autoMountLocal,
});

export const generateRequiredFileInputsFromApp = (
  app: Apps.TapisApp
): Array<Jobs.JobFileInput> => {
  const requiredInputs: Array<Apps.AppFileInput> =
    app.jobAttributes?.fileInputs?.filter(
      (fileInput) => fileInput.inputMode === Apps.FileInputModeEnum.Required
    ) ?? [];
  const fileInputs: Array<Jobs.JobFileInput> = requiredInputs.map(
    (appFileInput) => {
      return generateFileInputFromAppInput(appFileInput);
    }
  );
  return fileInputs;
};

export const getAppInputsIncludedByDefault = (
  appFileInputs: Array<Apps.AppFileInput>,
  jobFileInputs: Array<Jobs.JobFileInput>
) => {
  return appFileInputs.filter((appFileInput) => {
    const includedInJob = jobFileInputs.some(
      (jobFileInput) => jobFileInput.name === appFileInput.name
    );
    return (
      appFileInput.inputMode === Apps.FileInputModeEnum.Required &&
      !!appFileInput.sourceUrl &&
      !includedInJob
    );
  });
};

/**
 * @param appFileInputs
 * @param jobFileInputs
 * @returns An array of jobFileInputs that are underspecified
 */
export const getIncompleteJobInputs = (
  appFileInputs: Array<Apps.AppFileInput>,
  jobFileInputs: Array<Jobs.JobFileInput>
) => {
  // Get job inputs that are REQUIRED in the app but do not specify sourceUrl
  const incompleteRequiredAppInputs: Array<Apps.AppFileInput> =
    appFileInputs.filter(
      (appFileInput) =>
        appFileInput.inputMode === Apps.FileInputModeEnum.Required &&
        !appFileInput.sourceUrl
    );
  const incompleteRequiredJobInputs: Array<Jobs.JobFileInput> =
    jobFileInputs.filter((jobFileInput) => {
      // Is this jobFileInput part of required app inputs?
      const requiredInApp = incompleteRequiredAppInputs.some(
        (appInput) => appInput.name === jobFileInput.name
      );
      if (requiredInApp) {
        return !jobFileInput.sourceUrl;
      } else {
        return false;
      }
    });

  // Get job inputs that are OPTIONAL in the app but do not specify sourceUrl
  const incompleteOptionalAppInputs: Array<Apps.AppFileInput> =
    appFileInputs.filter(
      (appFileInput) =>
        appFileInput.inputMode === Apps.FileInputModeEnum.Optional &&
        !appFileInput.sourceUrl
    );
  const incompleteOptionalJobInputs: Array<Jobs.JobFileInput> =
    jobFileInputs.filter((jobFileInput) => {
      // Is this jobFileInput part of optional app inputs?
      const optionalInApp = incompleteOptionalAppInputs.some(
        (appInput) => appInput.name === jobFileInput.name
      );
      if (optionalInApp) {
        return !jobFileInput.sourceUrl;
      } else {
        return false;
      }
    });

  // Get job inputs that are neither OPTIONAL or REQUIRED, but are incomplete
  const incompleteUserInputs: Array<Jobs.JobFileInput> = jobFileInputs.filter(
    (jobFileInput) => {
      // Is this jobFileInput neither OPTIONAL or REQUIRED?
      const userInput =
        !incompleteRequiredAppInputs.some(
          (appInput) => appInput.name === jobFileInput.name
        ) &&
        !incompleteOptionalAppInputs.some(
          (appInput) => appInput.name === jobFileInput.name
        );
      if (userInput) {
        return !jobFileInput.sourceUrl || !jobFileInput.targetPath;
      } else {
        return false;
      }
    }
  );

  return incompleteRequiredJobInputs
    .concat(incompleteOptionalJobInputs)
    .concat(incompleteUserInputs);
};

export const fileInputsComplete = (
  app: Apps.TapisApp,
  fileInputs: Array<Jobs.JobFileInput>
) => {
  // Check to make sure job has filled in all REQUIRED app inputs that are missing sourceUrl
  const incompleteRequiredInputs: Array<Apps.AppFileInput> =
    getIncompleteAppInputsOfType(app, Apps.FileInputModeEnum.Required);
  const hasIncompleteRequiredInput: boolean = incompleteRequiredInputs.some(
    (requiredInput) => {
      // Find JobFileInput with name matching the required input
      const jobFileInput: Jobs.JobFileInput | undefined = fileInputs.find(
        (jobFileInput) => jobFileInput.name === requiredInput.name
      );
      if (!jobFileInput) {
        // Matching jobFileInput not found, therefore there is an incomplete required input
        return true;
      } else {
        // Verify that this input has a sourceUrl specified
        return !jobFileInput.sourceUrl;
      }
    }
  );
  if (hasIncompleteRequiredInput) {
    return false;
  }

  // Check to see if an OPTIONAL input was included but not fully specified
  const optionalAppInputs: Array<Apps.AppFileInput> = getIncompleteAppInputs(
    app
  ).filter((appFileInput) => !appFileInput.sourceUrl);
  // get any optional app file input that was included in the job.
  const optionalJobInputs: Array<Jobs.JobFileInput> =
    fileInputs.filter((jobFileInput) =>
      optionalAppInputs.some(
        (optionalAppInput) => jobFileInput.name === optionalAppInput.name
      )
    ) ?? [];
  const hasIncompleteOptionalInput: boolean =
    !!optionalJobInputs.length &&
    optionalJobInputs.some((jobInput) => !jobInput.sourceUrl);
  if (hasIncompleteOptionalInput) {
    return false;
  }

  // Check to see if any app inputs that did not exist
  const namedInputs =
    app.jobAttributes?.fileInputs?.map((input) => input.name) ?? [];
  const otherInputs: Array<Jobs.JobFileInput> =
    fileInputs.filter(
      (jobInput) => !namedInputs.some((name) => name === jobInput.name)
    ) ?? [];
  if (
    otherInputs.some(
      (otherInput) => !otherInput.sourceUrl || !otherInput.targetPath
    )
  ) {
    return false;
  }

  return true;
};
