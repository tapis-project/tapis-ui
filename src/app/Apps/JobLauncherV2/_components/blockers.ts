import { Apps, Jobs, Systems } from '@tapis/tapis-typescript';
import { fileInputsComplete } from '@tapis/tapisui-common';
import { fileInputArraysComplete } from '@tapis/tapisui-common';
import { jobRequiredFieldsComplete } from '@tapis/tapisui-common';
import { flattenErrors } from './utils';
import { sectionForField } from './sections/meta';

export type Blocker = {
  /** Section the user should be sent to */
  sectionId: string;
  label: string;
  message: string;
};

/**
 * Everything standing between the current form state and a submittable job,
 * in one list. The V1 wizard scattered these across per-step summaries; here
 * they are gathered so "why is Submit disabled?" is answerable at a glance.
 */
export const computeBlockers = ({
  values,
  errors,
  app,
}: {
  values: Partial<Jobs.ReqSubmitJob>;
  errors: any;
  app: Apps.TapisApp;
  systems: Array<Systems.TapisSystem>;
}): Array<Blocker> => {
  const blockers: Array<Blocker> = flattenErrors(errors).map((entry) => ({
    sectionId: sectionForField(entry.path)?.id ?? 'review',
    label: entry.path,
    message: entry.message,
  }));

  if (!jobRequiredFieldsComplete(values)) {
    blockers.push({
      sectionId: 'basics',
      label: 'name',
      message: 'A job name is required',
    });
  }

  if (!fileInputsComplete(app, values.fileInputs ?? [])) {
    blockers.push({
      sectionId: 'inputs',
      label: 'fileInputs',
      message:
        'This app has required file inputs that are not present on the job',
    });
  }

  if (!fileInputArraysComplete(app, values.fileInputArrays ?? [])) {
    blockers.push({
      sectionId: 'inputs',
      label: 'fileInputArrays',
      message:
        'This app has required file input arrays that are not present on the job',
    });
  }

  // Dedupe: a missing name shows up both as a schema error and as a
  // required-field check
  const seen = new Set<string>();
  return blockers.filter((blocker) => {
    const key = `${blocker.sectionId}:${blocker.label}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};
