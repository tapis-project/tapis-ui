import { Apps, Jobs } from '@tapis/tapis-typescript';

export const getIncompleteAppInputArrays = (
  app: Apps.TapisApp
): Array<Apps.AppFileInputArray> => {
  return (
    app.jobAttributes?.fileInputArrays?.filter(
      (fileInput) => !fileInput.sourceUrls
    ) ?? []
  );
};

export const getIncompleteAppInputArraysOfType = (
  app: Apps.TapisApp,
  inputType: Apps.FileInputModeEnum
): Array<Apps.AppFileInputArray> => {
  return getIncompleteAppInputArrays(app).filter(
    (fileInput) => fileInput.inputMode === inputType
  );
};

export const generateFileInputArrayFromAppInput = (
  input: Apps.AppFileInputArray
): Jobs.JobFileInputArray => ({
  name: input.name,
  sourceUrls: input.sourceUrls ?? [],
  targetDir: input.targetDir,
  description: input.description,
});

export const generateRequiredFileInputArraysFromApp = (
  app: Apps.TapisApp
): Array<Jobs.JobFileInput> => {
  const requiredInputArrays: Array<Apps.AppFileInputArray> =
    app.jobAttributes?.fileInputArrays?.filter(
      (fileInput) => fileInput.inputMode === Apps.FileInputModeEnum.Required
    ) ?? [];
  const fileInputs: Array<Jobs.JobFileInput> = requiredInputArrays.map(
    (appFileInputArray) => {
      return generateFileInputArrayFromAppInput(appFileInputArray);
    }
  );
  return fileInputs;
};

export const getAppInputArraysIncludedByDefault = (
  appFileInputArrays: Array<Apps.AppFileInputArray>,
  jobFileInputArrays: Array<Jobs.JobFileInputArray>
) => {
  return appFileInputArrays.filter((appFileInputArray) => {
    const includedInJob = jobFileInputArrays.some(
      (jobFileInputArray) => jobFileInputArray.name === appFileInputArray.name
    );
    return (
      appFileInputArray.inputMode === Apps.FileInputModeEnum.Required &&
      !!appFileInputArray.sourceUrls &&
      !includedInJob
    );
  });
};

/**
 * @param appFileInputsArrays
 * @param jobFileInputsArrays
 * @returns An array of JobFileInputArrays that are underspecified
 */
export const getIncompleteJobInputArrays = (
  appFileInputArrays: Array<Apps.AppFileInputArray>,
  jobFileInputArrays: Array<Jobs.JobFileInputArray>
): Array<Jobs.JobFileInputArray> => {
  // Get job input arrays that are REQUIRED in the app but do not specify sourceUrl
  const incompleteRequiredAppInputArrays: Array<Apps.AppFileInputArray> =
    appFileInputArrays.filter(
      (appFileInputArray) =>
        appFileInputArray.inputMode === Apps.FileInputModeEnum.Required &&
        !appFileInputArray.sourceUrls
    );
  const incompleteRequiredJobInputArrays: Array<Jobs.JobFileInputArray> =
    jobFileInputArrays.filter((jobFileInputArray) => {
      // Is this jobFileInputArray part of required app input arrays?
      const requiredInApp = incompleteRequiredAppInputArrays.some(
        (appInputArray) => appInputArray.name === jobFileInputArray.name
      );
      if (requiredInApp) {
        return (
          !jobFileInputArray.sourceUrls || !jobFileInputArray.sourceUrls.length
        );
      } else {
        return false;
      }
    });

  // Get job input arrays that are OPTIONAL in the app but do not specify sourceUrl
  const incompleteOptionalAppInputArrays: Array<Apps.AppFileInputArray> =
    appFileInputArrays.filter(
      (appFileInputArray) =>
        appFileInputArray.inputMode === Apps.FileInputModeEnum.Optional &&
        !appFileInputArray.sourceUrls
    );
  const incompleteOptionalJobInputArrays: Array<Jobs.JobFileInputArray> =
    jobFileInputArrays.filter((jobFileInputArray) => {
      // Is this jobFileInputArray part of optional app input arrays?
      const optionalInApp = incompleteOptionalAppInputArrays.some(
        (appInputArray) => appInputArray.name === jobFileInputArray.name
      );
      if (optionalInApp) {
        return (
          !jobFileInputArray.sourceUrls || !jobFileInputArray.sourceUrls.length
        );
      } else {
        return false;
      }
    });

  // Get job input arrays that are neither OPTIONAL or REQUIRED, but are incomplete
  const incompleteUserInputArrays: Array<Jobs.JobFileInputArray> =
    jobFileInputArrays.filter((jobFileInputArray) => {
      // Is this jobFileInputArray neither OPTIONAL or REQUIRED?
      const userInput =
        !incompleteRequiredAppInputArrays.some(
          (appInputArray) => appInputArray.name === jobFileInputArray.name
        ) &&
        !incompleteOptionalAppInputArrays.some(
          (appInputArray) => appInputArray.name === jobFileInputArray.name
        );
      if (userInput) {
        return (
          !jobFileInputArray.sourceUrls ||
          !jobFileInputArray.sourceUrls.length ||
          !jobFileInputArray.targetDir
        );
      } else {
        return false;
      }
    });

  return incompleteRequiredJobInputArrays
    .concat(incompleteOptionalJobInputArrays)
    .concat(incompleteUserInputArrays);
};

export const fileInputArraysComplete = (
  app: Apps.TapisApp,
  fileInputArrays: Array<Jobs.JobFileInputArray>
): boolean => {
  // Check to make sure job has filled in all REQUIRED app inputs that are missing sourceUrl
  const incompleteRequiredInputs: Array<Apps.AppFileInputArray> =
    getIncompleteAppInputArraysOfType(app, Apps.FileInputModeEnum.Required);
  const hasIncompleteRequiredInput: boolean = incompleteRequiredInputs.some(
    (requiredInputArray) => {
      // Find JobFileInputArray with name matching the required input
      const jobFileInputArray: Jobs.JobFileInputArray | undefined =
        fileInputArrays.find(
          (jobFileInputArray) =>
            jobFileInputArray.name === requiredInputArray.name
        );
      if (!jobFileInputArray) {
        // Matching jobFileInput not found, therefore there is an incomplete required input
        return true;
      } else {
        // Verify that this input has a sourceUrl specified
        return (
          !jobFileInputArray.sourceUrls || !jobFileInputArray.sourceUrls.length
        );
      }
    }
  );
  if (hasIncompleteRequiredInput) {
    return false;
  }

  // Check to see if an OPTIONAL input was included but not fully specified
  const optionalAppInputArrays: Array<Apps.AppFileInputArray> =
    getIncompleteAppInputArrays(app).filter(
      (appFileInput) => !appFileInput.sourceUrls
    );
  // get any optional app file input that was included in the job.
  const optionalJobInputArrays: Array<Jobs.JobFileInputArray> =
    fileInputArrays.filter((jobFileInputArray) =>
      optionalAppInputArrays.some(
        (optionalAppInputArray) =>
          jobFileInputArray.name === optionalAppInputArray.name
      )
    ) ?? [];
  const hasIncompleteOptionalInputArray: boolean =
    !!optionalJobInputArrays.length &&
    optionalJobInputArrays.some((jobInput) => !jobInput.sourceUrls);
  if (hasIncompleteOptionalInputArray) {
    return false;
  }

  // Check to see if any app inputs that did not exist
  const namedInputs =
    app.jobAttributes?.fileInputArrays?.map((input) => input.name) ?? [];
  const otherInputArrays: Array<Jobs.JobFileInputArray> =
    fileInputArrays.filter(
      (jobInputArray) =>
        !namedInputs.some((name) => name === jobInputArray.name)
    ) ?? [];
  if (
    otherInputArrays.some(
      (otherInputArray) =>
        !otherInputArray.sourceUrls || !otherInputArray.targetDir
    )
  ) {
    return false;
  }

  return true;
};
