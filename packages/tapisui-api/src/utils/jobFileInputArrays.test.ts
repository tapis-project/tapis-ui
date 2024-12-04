import { Apps } from '@tapis/tapis-typescript';
import { describe, it, expect } from 'vitest';
import { tapisApp } from 'fixtures/apps.fixtures';
import {
  getIncompleteAppInputArraysOfType,
  generateRequiredFileInputArraysFromApp,
  fileInputArraysComplete,
  getIncompleteJobInputArrays,
  getAppInputArraysIncludedByDefault,
} from './jobFileInputArrays';

describe('Job File Input Arrays utils', () => {
  it('finds incomplete input arrays of a specific kind', () => {
    expect(
      getIncompleteAppInputArraysOfType(
        tapisApp,
        Apps.FileInputModeEnum.Required
      )
    ).toEqual([
      {
        name: 'required-incomplete',
        description: 'A required input array that is missing sourceUrls',
        inputMode: Apps.FileInputModeEnum.Required,
        targetDir: '/jobs/input/arrays/required/',
      },
    ]);
  });
  it('generates required file inputs from incomplete app required file input arrays', () => {
    // The supplied app fixture bsf1 has required file inputs
    expect(generateRequiredFileInputArraysFromApp(tapisApp)).toEqual([
      {
        name: 'required-complete',
        description: 'A required input array that is completely specified',
        sourceUrls: [
          'tapis://tapisv3-exec-slurm-taccprod-new/jobs/input/empty.txt',
          'tapis://tapisv3-exec-slurm-taccprod-new/jobs/input/file1.txt',
        ],
        targetDir: '/jobs/input/arrays/required/',
      },
      {
        name: 'required-incomplete',
        description: 'A required input array that is missing sourceUrls',
        sourceUrls: [],
        targetDir: '/jobs/input/arrays/required/',
      },
    ]);
  });

  it('detects a complete job request that satisfies an app with fully formed required input arrays', () => {
    expect(
      fileInputArraysComplete(tapisApp, [
        { name: 'required-incomplete', sourceUrls: ['file2.txt'] },
      ])
    ).toEqual(true);
  });

  it('detects an incomplete job request with required inputs lacking sourceUrls', () => {
    // Remove a required sourceUrl from the app fixture
    expect(fileInputArraysComplete(tapisApp, [])).toEqual(false);
    expect(
      fileInputArraysComplete(tapisApp, [{ name: 'required-incomplete' }])
    ).toEqual(false);
    expect(
      fileInputArraysComplete(tapisApp, [
        { name: 'required-incomplete', sourceUrls: [] },
      ])
    ).toEqual(false);
  });

  it('detects an incomplete job request with optional inputs lacking a source url', () => {
    // Make a modified app that has no required inputs
    const modifiedApp = Apps.TapisAppFromJSON(
      JSON.parse(JSON.stringify(tapisApp))
    );
    modifiedApp!.jobAttributes!.fileInputArrays =
      modifiedApp.jobAttributes?.fileInputArrays?.filter(
        (input) => input.inputMode !== Apps.FileInputModeEnum.Required
      ) ?? [];
    // The default job with no specified inputs is complete, because the OPTIONAL file input array is not included
    expect(fileInputArraysComplete(modifiedApp, [])).toEqual(true);
    // A job that includes an incomplete OPTIONAL file input but does not specify sourceUrl is not complete
    expect(
      fileInputArraysComplete(modifiedApp, [{ name: 'optional-incomplete' }])
    ).toEqual(false);

    // A job that includes an complete OPTIONAL file input should be fine
    expect(
      fileInputArraysComplete(modifiedApp, [
        {
          name: 'optional-incomplete',
          sourceUrls: ['tapis://system/file.txt'],
        },
      ])
    ).toEqual(true);
  });

  it('detects incomplete job file inputs that are unspecified in the app', () => {
    // Make a modified app that has no pre-specified inputs
    const modifiedApp = Apps.TapisAppFromJSON(
      JSON.parse(JSON.stringify(tapisApp))
    );
    modifiedApp!.jobAttributes!.fileInputs = [];
    expect(fileInputArraysComplete(tapisApp, [{ name: 'Other file' }])).toEqual(
      false
    );
  });

  it('getIncompleteJobInputs', () => {
    // A job should not have to specify complete Required inputs or Optional inputs
    expect(
      getIncompleteJobInputArrays(
        [
          {
            name: 'Required',
            sourceUrls: ['required.txt'],
            targetDir: 'required',
            inputMode: Apps.FileInputModeEnum.Required,
          },
          {
            name: 'Optional',
            sourceUrls: ['optional.txt'],
            targetDir: 'optional',
            inputMode: Apps.FileInputModeEnum.Optional,
          },
        ],
        []
      )
    ).toEqual([]);

    // A job that partially specifies Required or Optional inputs that are fully
    // specified in the app are not considered incomplete
    expect(
      getIncompleteJobInputArrays(
        [
          {
            name: 'Required',
            targetDir: 'required',
            inputMode: Apps.FileInputModeEnum.Required,
          },
          {
            name: 'Optional',
            targetDir: 'optional',
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
      getIncompleteJobInputArrays(
        [
          {
            name: 'Required',
            targetDir: 'required',
            inputMode: Apps.FileInputModeEnum.Required,
          },
          {
            name: 'Optional',
            targetDir: 'optional',
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
      getIncompleteJobInputArrays(
        [],
        [
          {
            name: 'User Defined 1',
            sourceUrls: ['userdefined1.txt'],
          },
          {
            name: 'User Defined 2',
            targetDir: 'userdefined2',
          },
        ]
      )
    ).toEqual([
      {
        name: 'User Defined 1',
        sourceUrls: ['userdefined1.txt'],
      },
      {
        name: 'User Defined 2',
        targetDir: 'userdefined2',
      },
    ]);
  });

  it('getAppInputsIncludedByDefault', () => {
    // Required app inputs that are completely specified are included by default
    expect(
      getAppInputArraysIncludedByDefault(
        [
          {
            name: 'Required',
            sourceUrls: ['required.txt'],
            targetDir: 'required',
            inputMode: Apps.FileInputModeEnum.Required,
          },
        ],
        []
      )
    ).toEqual([
      {
        name: 'Required',
        sourceUrls: ['required.txt'],
        targetDir: 'required',
        inputMode: Apps.FileInputModeEnum.Required,
      },
    ]);
    // Required app inputs that are completely specified but overwritten in job inputs are not
    // included by default
    expect(
      getAppInputArraysIncludedByDefault(
        [
          {
            name: 'Required',
            sourceUrls: ['required.txt'],
            targetDir: 'required',
            inputMode: Apps.FileInputModeEnum.Required,
          },
        ],
        [
          {
            name: 'Required',
            sourceUrls: ['overwritten.txt'],
            targetDir: 'overwritten',
          },
        ]
      )
    ).toEqual([]);
  });
});
