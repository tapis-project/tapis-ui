import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';

import { ModelMetadata } from '@mlhub/models-ts-sdk';
import { InfoSection } from './InfoSection';
import { KeyValueGrid } from '../utils';

interface ArchitectureSectionProps {
  model: ModelMetadata;
}

interface StatusChipProps {
  label: string;
  enabled?: boolean | null;
}

function StatusChip({ label, enabled }: StatusChipProps) {
  if (enabled === true) {
    return (
      <Chip
        label={label}
        size="small"
        color="success"
        variant="outlined"
        sx={{ fontWeight: 500, borderRadius: 4 }}
      />
    );
  }
  return (
    <Chip
      label={label}
      size="small"
      color="default"
      sx={{ fontWeight: 500, borderRadius: 4, opacity: 0.6 }}
    />
  );
}

export function ArchitectureSection({ model }: ArchitectureSectionProps) {
  const infoRows = [{ label: 'Model Type', value: model.model_type }].filter(
    (row) => row.value !== null && row.value !== undefined
  );

  const canonicalRef = model.canonical
    ? `${model.canonical.author ?? 'unknown'}/${
        model.canonical.name ?? 'unknown'
      }`
    : null;

  return (
    <InfoSection>
      {infoRows.length > 0 && <KeyValueGrid rows={infoRows} />}

      <Divider sx={{ my: 2 }} />

      {/* Feature Chips */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <StatusChip label="Multi-modal" enabled={model.multi_modal} />
        <StatusChip label="Pretrained" enabled={model.pretrained} />
        <StatusChip label="Pruned" enabled={model.pruned} />
        <StatusChip label="Slimmed" enabled={model.slimmed} />
        <StatusChip label="Edge Optimized" enabled={model.edge_optimized} />
        <StatusChip
          label="Quantization Aware"
          enabled={model.quantization_aware}
        />
        <StatusChip
          label="Supports Quantization"
          enabled={model.supports_quantization}
        />
      </Box>

      {model.canonical && (
        <>
          <Divider sx={{ my: 2 }} />
          <KeyValueGrid
            rows={[
              {
                label: 'Canonical Reference',
                value: canonicalRef ?? '—',
              },
            ]}
          />
        </>
      )}
    </InfoSection>
  );
}
