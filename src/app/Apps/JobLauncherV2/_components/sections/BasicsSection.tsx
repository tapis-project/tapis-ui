import React from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { FormikInput } from '@tapis/tapisui-common';
import { useJobLauncher } from '@tapis/tapisui-common';
import ContainerImageChip from 'app/Apps/_components/ContainerImageChip';

export const BasicsSection: React.FC = () => {
  const { app } = useJobLauncher();
  const containerImage = app.containerImage;

  return (
    <div>
      <Stack
        direction="row"
        spacing={0.75}
        sx={{ mb: 1.5, flexWrap: 'wrap', rowGap: 0.75 }}
      >
        <Chip
          size="small"
          variant="outlined"
          label={`${app.id} v${app.version}`}
        />
        {app.owner && (
          <Chip size="small" variant="outlined" label={`owner ${app.owner}`} />
        )}
        {app.jobType && (
          <Chip size="small" variant="outlined" label={app.jobType} />
        )}
        <ContainerImageChip value={containerImage} maxWidth="28rem" />
      </Stack>
      {app.description && (
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {app.description}
          </Typography>
        </Box>
      )}
      <FormikInput
        name="name"
        required={true}
        label="Name"
        description="A name for this job. It shows up in the jobs list, so make it something you will recognise later."
      />
      <FormikInput
        name="description"
        required={false}
        label="Description"
        description="A description of this job"
      />
    </div>
  );
};

export default BasicsSection;
