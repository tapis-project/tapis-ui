import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { Model } from '@mlhub/models-ts-sdk';
import { InfoSection } from './InfoSection';
import {
  ExpandableTagCloud,
  KeyValueGrid,
  TagCloud,
  formatDuration,
} from '../utils';
import { derivedMetadataFor, modelAuthorFor } from '../../../modelMetadata';

interface GeneralSectionProps {
  model: Model;
}

export function GeneralSection({ model }: GeneralSectionProps) {
  const derived = derivedMetadataFor(model);
  const infoRows = [
    { label: 'Author', value: modelAuthorFor(model) },
    { label: 'Tenant', value: model.tenant_id },
    { label: 'Provider', value: model.external_model.provider },
    { label: 'License', value: derived.license },
  ];

  return (
    <InfoSection>
      <KeyValueGrid rows={infoRows} />

      {derived.tags.length > 0 && (
        <Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary">
            Tags
          </Typography>
          <ExpandableTagCloud
            tags={derived.tags}
            showCount={5}
            sx={{ mt: 0.5 }}
          />
        </Box>
      )}

      {derived.task_types.length > 0 && (
        <Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary">
            Task Types
          </Typography>
          <TagCloud tags={derived.task_types} sx={{ mt: 0.5 }} />
        </Box>
      )}
    </InfoSection>
  );
}
