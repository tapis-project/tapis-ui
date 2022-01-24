import { Apps } from '@tapis/tapis-typescript';
import '@testing-library/jest-dom/extend-expect';
import { tapisApp } from 'fixtures/apps.fixtures';
import {
  getIncompleteAppInputsOfType,
  generateRequiredFileInputsFromApp,
  fileInputsComplete,
  getIncompleteJobInputs
} from './jobFileInputs';

describe('Job File Inputs utils', () => {
  it('finds incomplete inputs of a specific kind', () => {
    const incompleteApp: Apps.TapisApp = JSON.parse(JSON.stringify(tapisApp));
    incompleteApp.jobAttributes!.fileInputs![0].sourceUrl = undefined;
    expect(
      getIncompleteAppInputsOfType(
        incompleteApp,
        Apps.FileInputModeEnum.Required
      )
    ).toEqual([
      {
        name: 'Data file',
        description: undefined,
        inputMode: Apps.FileInputModeEnum.Required,
        autoMountLocal: true,
        targetPath: 'data.txt',
      },
    ]);
  });
  it('generates required file inputs from incomplete app required file inputs', () => {
    // The supplied app fixture bsf1 has required file inputs
    expect(generateRequiredFileInputsFromApp(tapisApp)).toEqual([
      {
        name: 'Data file',
        description: undefined,
        autoMountLocal: true,
        targetPath: 'data.txt',
        sourceUrl: 'tapis://testuser2.execution/data.txt',
      },
    ]);

    // An app with optional inputs should not generate required file inputs
    const modifiedApp: Apps.TapisApp = JSON.parse(JSON.stringify(tapisApp));
    modifiedApp.jobAttributes!.fileInputs![0].inputMode =
      Apps.FileInputModeEnum.Optional;
    expect(generateRequiredFileInputsFromApp(modifiedApp)).toEqual([]);
  });

  it('detects a complete job request that satisfies an app with fully formed required inputs', () => {
    expect(fileInputsComplete(tapisApp, [])).toEqual(true);
  });

  it('detects an incomplete job request with required inputs lacking a source url', () => {
    // Remove a required sourceUrl from the app fixture
    const modifiedApp: Apps.TapisApp = JSON.parse(JSON.stringify(tapisApp));
    modifiedApp.jobAttributes!.fileInputs![0].sourceUrl = undefined;

    expect(fileInputsComplete(modifiedApp, [])).toEqual(false);
    expect(fileInputsComplete(modifiedApp, [{ name: 'Data file' }])).toEqual(
      false
    );
  });

  it('detects an incomplete job request with optional inputs lacking a source url', () => {
    // Remove a required sourceUrl from the app fixture
    const modifiedApp: Apps.TapisApp = JSON.parse(JSON.stringify(tapisApp));
    modifiedApp.jobAttributes!.fileInputs![0].sourceUrl = undefined;
    modifiedApp.jobAttributes!.fileInputs![0].inputMode =
      Apps.FileInputModeEnum.Optional;

    // The default job with no specified inputs is complete, because the OPTIONAL file input is not included
    expect(fileInputsComplete(modifiedApp, [])).toEqual(true);

    // A job that includes an incomplete OPTIONAL file input but does not specify sourceUrl is not complete
    expect(fileInputsComplete(modifiedApp, [{ name: 'Data file' }])).toEqual(
      false
    );

    // A job that includes an complete OPTIONAL file input should be fine
    expect(
      fileInputsComplete(modifiedApp, [
        { name: 'Data file', sourceUrl: 'tapis://system/file.txt' },
      ])
    ).toEqual(true);
  });

  it('detects incomplete job file inputs that are unspecified in the app', () => {
    expect(fileInputsComplete(tapisApp, [{ name: 'Other file' }])).toEqual(
      false
    );
  });

  it('finds incomplete job inputs', () => {
    // A job should not have to specify complete Required inputs or Optional inputs
    expect(getIncompleteJobInputs(
      [
        {
          name: 'Required',
          sourceUrl: 'required.txt',
          targetPath: 'required.txt',
          inputMode: Apps.FileInputModeEnum.Required
        },
        {
          name: 'Optional',
          sourceUrl: 'optional.txt',
          targetPath: 'optional.txt',
          inputMode: Apps.FileInputModeEnum.Optional
        }
      ],
      []
    )).toEqual([]);

    // A job that partially specifies Required or Optional inputs that are fully
    // specified in the app are not considered incomplete
    expect(getIncompleteJobInputs(
      [
        {
          name: 'Required',
          targetPath: 'required.txt',
          inputMode: Apps.FileInputModeEnum.Required
        },
        {
          name: 'Optional',
          targetPath: 'optional.txt',
          inputMode: Apps.FileInputModeEnum.Optional
        }
      ],
      [
        {
          name: 'Required'
        },
        {
          name: 'Optional'
        }
      ]
    )).toEqual([
      {
        name: 'Required'
      },
      {
        name: 'Optional'
      }
    ]);

    // A job that partially specifies Required or Optional inputs that are NOT fully
    // specified in the app are considered incomplete
    expect(getIncompleteJobInputs(
      [
        {
          name: 'Required',
          targetPath: 'required.txt',
          inputMode: Apps.FileInputModeEnum.Required
        },
        {
          name: 'Optional',
          targetPath: 'optional.txt',
          inputMode: Apps.FileInputModeEnum.Optional
        }
      ],
      [
        {
          name: 'Required'
        },
        {
          name: 'Optional'
        }
      ]
    )).toEqual([{ name: 'Required' }, { name: 'Optional' }]);
    
    // A job that partially specifies user defined inputs considers those to be incomplete 
    expect(getIncompleteJobInputs(
      [],
      [
        {
          name: 'User Defined 1',
          sourceUrl: 'userdefined1.txt',
        },
        {
          name: 'User Defined 2',
          targetPath: 'userdefined2.txt'
        }
      ]
    )).toEqual([
      {
        name: 'User Defined 1',
        sourceUrl: 'userdefined1.txt',
      },
      {
        name: 'User Defined 2',
        targetPath: 'userdefined2.txt'
      }
    ]);
  });
});
