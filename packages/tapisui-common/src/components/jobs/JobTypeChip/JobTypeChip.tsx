import React, { ComponentProps } from 'react';
import { Jobs } from '@tapis/tapis-typescript';
import { Tooltip } from '@mui/material';
import { Chip } from '@mui/material';

type JobTypeChipType = {
  jobType: Jobs.JobJobTypeEnum;
  tooltip?: string;
};

const JobTypeChip: React.FC<JobTypeChipType & ComponentProps<typeof Chip>> = ({
  jobType,
  tooltip,
  ...rest
}) => {
  return (
    <Tooltip placement="top" title={tooltip ? tooltip : jobType}>
      <Chip
        {...{
          ...rest,
          label: rest['label'] ? rest['label'] : jobType,
          style: { userSelect: 'none', ...rest['style'] },
        }}
      />
    </Tooltip>
  );
};

export default JobTypeChip;
