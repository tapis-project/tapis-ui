import { Apps } from '@tapis/tapis-typescript';
import { expect, describe, it } from '@jest/globals';
import { tapisApp } from '../fixtures/apps.fixtures';
import {
  getIncompleteAppInputsOfType,
  generateRequiredFileInputsFromApp,
  fileInputsComplete,
  getIncompleteJobInputs,
  getAppInputsIncludedByDefault,
} from './jobFileInputs';

describe('Job File Inputs utils', () => {
  it('finds incomplete inputs of a specific kind', () => {
    expect(
      getIncompleteAppInputsOfType(tapisApp, Apps.FileInputModeEnum.Required)
    ).toEqual([
      {
        name: 'required-incomplete',
        description: 'A required input that is missing a sourceUrl',
        inputMode: Apps.FileInputModeEnum.Required,
        autoMountLocal: true,
        targetPath: 'file1.txt',
      },
    ]);
  });
  it('generates required file inputs from incomplete app required file inputs', () => {
    // The supplied app fixture bsf1 has required file inputs
    expect(generateRequiredFileInputsFromApp(tapisApp)).toEqual([
      {
        name: 'required-complete',
        description: 'A required input that is completely specified',
        autoMountLocal: true,
        sourceUrl:
          'tapis://tapisv3-exec-slurm-taccprod-new/jobs/input/empty.txt',
        targetPath: 'empty.txt',
      },
      {
        name: 'required-incomplete',
        description: 'A required input that is missing a sourceUrl',
        autoMountLocal: true,
        targetPath: 'file1.txt',
      },
    ]);
  });

  it('detects a complete job request that satisfies an app with fully formed required inputs', () => {
    expect(
      fileInputsComplete(tapisApp, [
        { name: 'required-incomplete', sourceUrl: 'file2.txt' },
      ])
    ).toEqual(true);
  });

  it('detects an incomplete job request with required inputs lacking a source url', () => {
    // Remove a required sourceUrl from the app fixture
    expect(fileInputsComplete(tapisApp, [])).toEqual(false);
    expect(
      fileInputsComplete(tapisApp, [{ name: 'required-incomplete' }])
    ).toEqual(false);
  });

  it('detects an incomplete job request with optional inputs lacking a source url', () => {
    // Make a modified app that has no required inputs
    const modifiedApp = Apps.TapisAppFromJSON(
      JSON.parse(JSON.stringify(tapisApp))
    );
    modifiedApp!.jobAttributes!.fileInputs =
      modifiedApp.jobAttributes?.fileInputs?.filter(
        (input) => input.inputMode !== Apps.FileInputModeEnum.Required
      ) ?? [];
    // The default job with no specified inputs is complete, because the OPTIONAL file input is not included
    expect(fileInputsComplete(modifiedApp, [])).toEqual(true);
    // A job that includes an incomplete OPTIONAL file input but does not specify sourceUrl is not complete
    expect(
      fileInputsComplete(modifiedApp, [{ name: 'optional-incomplete' }])
    ).toEqual(false);

    // A job that includes an complete OPTIONAL file input should be fine
    expect(
      fileInputsComplete(modifiedApp, [
        { name: 'optional-incomplete', sourceUrl: 'tapis://system/file.txt' },
      ])
    ).toEqual(true);
  });

  it('detects incomplete job file inputs that are unspecified in the app', () => {
    // Make a modified app that has no pre-specified inputs
    const modifiedApp = Apps.TapisAppFromJSON(
      JSON.parse(JSON.stringify(tapisApp))
    );
    modifiedApp!.jobAttributes!.fileInputs = [];
    expect(fileInputsComplete(tapisApp, [{ name: 'Other file' }])).toEqual(
      false
    );
  });

  it('getIncompleteJobInputs', () => {
    // A job should not have to specify complete Required inputs or Optional inputs
    expect(
      getIncompleteJobInputs(
        [
          {
            name: 'Required',
            sourceUrl: 'required.txt',
            targetPath: 'required.txt',
            inputMode: Apps.FileInputModeEnum.Required,
          },
          {
            name: 'Optional',
            sourceUrl: 'optional.txt',
            targetPath: 'optional.txt',
            inputMode: Apps.FileInputModeEnum.Optional,
          },
        ],
        []
      )
    ).toEqual([]);

    // A job that partially specifies Required or Optional inputs that are fully
    // specified in the app are not considered incomplete
    expect(
      getIncompleteJobInputs(
        [
          {
            name: 'Required',
            targetPath: 'required.txt',
            inputMode: Apps.FileInputModeEnum.Required,
          },
          {
            name: 'Optional',
            targetPath: 'optional.txt',
            inputMode: Apps.FileInputModeEnum.Optional,
          },
        ],
        [
          {
            name: 'Required',
          },
          {
            name: 'Optional',
          },
        ]
      )
    ).toEqual([
      {
        name: 'Required',
      },
      {
        name: 'Optional',
      },
    ]);

    // A job that partially specifies Required or Optional inputs that are NOT fully
    // specified in the app are considered incomplete
    expect(
      getIncompleteJobInputs(
        [
          {
            name: 'Required',
            targetPath: 'required.txt',
            inputMode: Apps.FileInputModeEnum.Required,
          },
          {
            name: 'Optional',
            targetPath: 'optional.txt',
            inputMode: Apps.FileInputModeEnum.Optional,
          },
        ],
        [
          {
            name: 'Required',
          },
          {
            name: 'Optional',
          },
        ]
      )
    ).toEqual([{ name: 'Required' }, { name: 'Optional' }]);

    // A job that partially specifies user defined inputs considers those to be incomplete
    expect(
      getIncompleteJobInputs(
        [],
        [
          {
            name: 'User Defined 1',
            sourceUrl: 'userdefined1.txt',
          },
          {
            name: 'User Defined 2',
            targetPath: 'userdefined2.txt',
          },
        ]
      )
    ).toEqual([
      {
        name: 'User Defined 1',
        sourceUrl: 'userdefined1.txt',
      },
      {
        name: 'User Defined 2',
        targetPath: 'userdefined2.txt',
      },
    ]);
  });

  it('getAppInputsIncludedByDefault', () => {
    // Required app inputs that are completely specified are included by default
    expect(
      getAppInputsIncludedByDefault(
        [
          {
            name: 'Required',
            sourceUrl: 'required.txt',
            targetPath: 'required.txt',
            inputMode: Apps.FileInputModeEnum.Required,
          },
        ],
        []
      )
    ).toEqual([
      {
        name: 'Required',
        sourceUrl: 'required.txt',
        targetPath: 'required.txt',
        inputMode: Apps.FileInputModeEnum.Required,
      },
    ]);
    // Required app inputs that are completely specified but overwritten in job inputs are not
    // included by default
    expect(
      getAppInputsIncludedByDefault(
        [
          {
            name: 'Required',
            sourceUrl: 'required.txt',
            targetPath: 'required.txt',
            inputMode: Apps.FileInputModeEnum.Required,
          },
        ],
        [
          {
            name: 'Required',
            sourceUrl: 'overwritten.txt',
            targetPath: 'overwritten.txt',
          },
        ]
      )
    ).toEqual([]);
  });
});
