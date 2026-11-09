import React from 'react';
import { useJobLauncher } from '@tapis/tapisui-common';
import { useFormikContext } from 'formik';
import { Apps, Jobs } from '@tapis/tapis-typescript';
import Note from './Note';
import { ArgRowsField, useArgSpecs } from './ArgRows';

/**
 * Rows the app author explicitly hid — TAP apps mark plumbing like a fixed
 * `--nv` with notes.isHidden so portals keep it out of the form. It still
 * runs (the service injects fixed args from the app definition); there is
 * just nothing for a person to do with it here.
 */
const hiddenIn = (specs: Array<Apps.AppArgSpec>) => {
  const hidden = new Set(
    specs
      .filter((spec) => (spec.notes as { isHidden?: boolean })?.isHidden)
      .map((spec) => spec.name)
  );
  return (arg: Jobs.JobArgSpec) => !!arg.name && hidden.has(arg.name);
};

export const ArgsSection: React.FC = () => {
  const { app } = useJobLauncher();
  const { values } = useFormikContext<Partial<Jobs.ReqSubmitJob>>();
  const specs = useArgSpecs();
  const appArgs = values.parameterSet?.appArgs ?? [];
  const containerArgs = values.parameterSet?.containerArgs ?? [];
  const carried = appArgs.length + containerArgs.length;
  const included = [...appArgs, ...containerArgs].filter(
    (arg) => arg.include
  ).length;

  return (
    <div>
      {/* What the app already brought, so a long list of pre-filled rows
          reads as "the app declared these" rather than "why is all this
          here". With nothing carried over, each list's own note says so. */}
      {!!carried && (
        <Note>
          {`${carried} argument${carried === 1 ? '' : 's'} carried over from ${
            app.id
          }: ${appArgs.length} app, ${
            containerArgs.length
          } container, ${included} included in this job.`}
        </Note>
      )}
      <ArgRowsField
        name="parameterSet.appArgs"
        label="App Arguments"
        argSpecs={specs.appArgs}
        skip={hiddenIn(specs.appArgs)}
        emptyText="This app declares no app arguments."
      />
      <ArgRowsField
        name="parameterSet.containerArgs"
        label="Container Arguments"
        argSpecs={specs.containerArgs}
        skip={hiddenIn(specs.containerArgs)}
        emptyText="This app declares no container arguments."
      />
    </div>
  );
};

export default ArgsSection;
