import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { ModelIO, ModelMetadata } from '../../../types/model-metadata';
import { InfoSection } from './InfoSection';

interface IOFieldCardProps {
  field: ModelIO;
}

function IOFieldCard({ field }: IOFieldCardProps) {
  return (
    <Box
      sx={{
        p: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.default',
      }}
    >
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {field.name}
        </Typography>
        <Chip
          label={field.type}
          size="small"
          sx={{
            fontWeight: 600,
            fontSize: '0.7rem',
            height: 20,
            borderRadius: 4,
          }}
        />
        {field.required && (
          <Chip
            label="Required"
            size="small"
            color="warning"
            sx={{ height: 20, borderRadius: 4 }}
          />
        )}
      </Box>
      {field.description && (
        <Typography variant="caption" color="text.secondary">
          {field.description}
        </Typography>
      )}
    </Box>
  );
}

interface IOSectionProps {
  model: ModelMetadata;
}

export function IOSection({ model }: IOSectionProps) {
  return (
    <InfoSection>
      {/* Inputs */}
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        Inputs
      </Typography>
      {model.model_inputs && model.model_inputs.length > 0 ? (
        <Stack spacing={1}>
          {model.model_inputs.map((input) => (
            <IOFieldCard key={input.name} field={input} />
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          No input specifications defined.
        </Typography>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Outputs */}
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        Outputs
      </Typography>
      {model.model_outputs && model.model_outputs.length > 0 ? (
        <Stack spacing={1}>
          {model.model_outputs.map((output) => (
            <IOFieldCard key={output.name} field={output} />
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No output specifications defined.
        </Typography>
      )}
    </InfoSection>
  );
}
