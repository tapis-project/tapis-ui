import React from 'react';
import { useJobLauncher } from '@tapis/tapisui-common';
import { useFormikContext } from 'formik';
import { Apps, Jobs } from '@tapis/tapis-typescript';
import DeclaredSummary from './DeclaredSummary';
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
  const included = [...appArgs, ...containerArgs].filter(
    (arg) => arg.include
  ).length;

  return (
    <div>
      <DeclaredSummary
        text={`${
          appArgs.length + containerArgs.length
        } arguments carried over from ${app.id} — ${appArgs.length} app, ${
          containerArgs.length
        } container, ${included} included in this job.`}
      />
      <ArgRowsField
        name="parameterSet.appArgs"
        label="App arguments"
        argSpecs={specs.appArgs}
        skip={hiddenIn(specs.appArgs)}
        emptyText="This app declares no app arguments."
      />
      <ArgRowsField
        name="parameterSet.containerArgs"
        label="Container arguments"
        argSpecs={specs.containerArgs}
        skip={hiddenIn(specs.containerArgs)}
        emptyText="This app declares no container arguments."
      />
    </div>
  );
};

export default ArgsSection;
