import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { ModelMetadata } from '@mlhub/models-ts-sdk';
import { InfoSection } from './InfoSection';
import { KeyValueGrid, TagCloud, formatDuration } from '../utils';

interface GeneralSectionProps {
  model: ModelMetadata;
}

export function GeneralSection({ model }: GeneralSectionProps) {
  const infoRows = [
    { label: 'Author', value: model.author },
    { label: 'Tenant', value: model.tenant_id },
    { label: 'Model Type', value: model.model_type },
    { label: 'License', value: model.license },
  ];

  return (
    <InfoSection>
      <KeyValueGrid rows={infoRows} />

      {model.task_types && model.task_types.length > 0 && (
        <Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary">
            Task Types
          </Typography>
          <TagCloud tags={model.task_types} sx={{ mt: 0.5 }} />
        </Box>
      )}
    </InfoSection>
  );
}
