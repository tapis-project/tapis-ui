import { FormikInput, Collapse } from '@tapis/tapisui-common';
import { FormikSelect } from '@tapis/tapisui-common';
import { RuntimeTypeEnum } from '@tapis/tapis-typescript-systems';
import { Systems } from '@tapis/tapis-typescript';
import { useMemo, useState } from 'react';
import { SystemTypeEnum } from '@tapis/tapis-typescript-systems';
import { useFormikContext } from 'formik';
import styles from '../CreateSystemModal.module.scss';
import BatchSettings from './Batch/BatchSettings';
import ProxySettings from './ProxySettings';
import CmdSettings from './CmdSettings';
import TagsSettings from './TagsSettings';
import JobSettings from './Job/JobSettings';
import { Autocomplete, TextField } from '@mui/material';

//Array that is used in the drop-down menus
const runtimeTypes = Object.values(RuntimeTypeEnum);

type AdvancedSettingsProp = {
  canExec: boolean;
  values: Partial<Systems.ReqPostSystem>;
  onChange: (key: keyof Systems.ReqPostSystem, value: any) => void;
};

const AdvancedSettings: React.FC<AdvancedSettingsProp> = ({
  canExec,
  values,
  onChange,
}) => {
  //reading if the systemType is S3 at its current state
  const isS3 = useMemo(
    () => values.systemType === SystemTypeEnum.S3,
    [values.systemType]
  );

  const runtimeType: RuntimeTypeEnum | null =
    values.jobRuntimes && values.jobRuntimes.length > 0
      ? values.jobRuntimes[0].runtimeType
      : null;

  if (canExec) {
    return (
      <div>
        {isS3 ? (
          <TextField
            name="bucketName"
            label="Bucket Name"
            required={false}
            helperText={`Bucket name`}
            aria-label="Input"
          />
        ) : null}
        <JobSettings />
        {/* <BatchSettings /> */}
        <ProxySettings />
        <CmdSettings />
        <TagsSettings />
      </div>
    );
  } else {
    return null;
  }
};

export default AdvancedSettings;
