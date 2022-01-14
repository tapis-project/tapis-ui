import { Apps, Jobs } from '@tapis/tapis-typescript';
import '@testing-library/jest-dom/extend-expect';
import { tapisApp } from 'fixtures/apps.fixtures';
import { getIncompleteAppInputsOfType, generateRequiredFileInputsFromApp, fileInputsComplete } from './jobFileInputs';

const job: Jobs.ReqSubmitJob = {
  name: "Test job",
  appId: "bsf",
  appVersion: "1",
  execSystemId: "testuser2.execution"
}

describe('Job File Inputs utils', () => {
  it('finds incomplete inputs of a specific kind', () => {
    const incompleteApp: Apps.TapisApp = JSON.parse(JSON.stringify(tapisApp));
    incompleteApp.jobAttributes!.fileInputs![0].sourceUrl = undefined;
    expect(getIncompleteAppInputsOfType(incompleteApp, Apps.FileInputModeEnum.Required)).toEqual([
      {
        name: 'Data file',
        description: undefined,
        inputMode: Apps.FileInputModeEnum.Required,
        autoMountLocal: true,
        targetPath: 'data.txt',
      },
    ])
  });
  it('generates required file inputs from incomplete app required file inputs', () => {
    // The supplied app fixture bsf1 has no incomplete required file inputs
    expect(generateRequiredFileInputsFromApp(tapisApp)).toEqual([]);

    // Remove a required sourceUrl from the app fixture
    const modifiedApp: Apps.TapisApp = JSON.parse(JSON.stringify(tapisApp));
    modifiedApp.jobAttributes!.fileInputs![0].sourceUrl = undefined;
    expect(generateRequiredFileInputsFromApp(modifiedApp)).toEqual([{ name: "Data file" }]);

    // An app with optional inputs should not generate required file inputs
    modifiedApp.jobAttributes!.fileInputs![0].inputMode = Apps.FileInputModeEnum.Optional;
    expect(generateRequiredFileInputsFromApp(modifiedApp)).toEqual([]);
  });

  it('detects a complete job request that satisfies an app with fully formed required inputs', () => {
    expect(fileInputsComplete(tapisApp, [])).toEqual(true);
  });

  it('detects an incomplete job request with required inputs lacking a source url', () => {
    // Remove a required sourceUrl from the app fixture
    const modifiedApp: Apps.TapisApp = JSON.parse(JSON.stringify(tapisApp));;
    modifiedApp.jobAttributes!.fileInputs![0].sourceUrl = undefined;

    expect(fileInputsComplete(modifiedApp, [])).toEqual(false);
    expect(fileInputsComplete(modifiedApp, [ { name: "Data file" } ])).toEqual(false);
  });

  it('detects an incomplete job request with optional inputs lacking a source url', () => {
    // Remove a required sourceUrl from the app fixture
    const modifiedApp: Apps.TapisApp = JSON.parse(JSON.stringify(tapisApp));;
    modifiedApp.jobAttributes!.fileInputs![0].sourceUrl = undefined;
    modifiedApp.jobAttributes!.fileInputs![0].inputMode = Apps.FileInputModeEnum.Optional;

    // The default job with no specified inputs is complete, because the OPTIONAL file input is not included
    expect(fileInputsComplete(modifiedApp, [])).toEqual(true);

    // A job that includes an incomplete OPTIONAL file input but does not specify sourceUrl is not complete
    expect(fileInputsComplete(modifiedApp, [ { name: "Data file" } ])).toEqual(false);

    // A job that includes an complete OPTIONAL file input should be fine
    expect(fileInputsComplete(
      modifiedApp, 
      [{ name: "Data file", sourceUrl: "tapis://system/file.txt" }]
    )).toEqual(true);;
  });

  it('detects incomplete job file inputs that are unspecified in the app', () => {
    expect(fileInputsComplete(tapisApp, [ { name: "Other file" } ])).toEqual(false);
  });
});
