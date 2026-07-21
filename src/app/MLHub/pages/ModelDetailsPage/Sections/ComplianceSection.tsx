import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

import { ModelMetadata } from '@mlhub/models-ts-sdk';
import { InfoSection } from './InfoSection';
import { TagCloud } from '../utils';

interface ComplianceSectionProps {
  model: ModelMetadata;
}

export function ComplianceSection({ model }: ComplianceSectionProps) {
  const biasScore = model.bias_evaluation_score;

  let biasColor: 'success' | 'info' | 'warning' | 'error' = 'info';
  if (biasScore !== null && biasScore !== undefined) {
    if (biasScore < 0.15) {
      biasColor = 'success';
    } else if (biasScore < 0.35) {
      biasColor = 'warning';
    } else {
      biasColor = 'error';
    }
  }

  return (
    <InfoSection>
      {/* Bias Score */}
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Bias Evaluation Score
          </Typography>
          {biasScore !== null && biasScore !== undefined && (
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: `${biasColor}.main` }}
            >
              {(biasScore * 100).toFixed(1)}%
            </Typography>
          )}
        </Box>
        {biasScore !== null && biasScore !== undefined ? (
          <LinearProgress
            variant="determinate"
            value={biasScore * 100}
            sx={{
              height: 6,
              borderRadius: 3,
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
              },
            }}
            color={biasColor}
          />
        ) : (
          <LinearProgress
            variant="determinate"
            value={0}
            sx={{ height: 6, borderRadius: 3, opacity: 0.3 }}
          />
        )}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, display: 'block' }}
        >
          Lower is better · {'< 15%'} is recommended
        </Typography>
      </Box>

      {/* Regulatory Tags */}
      {model.regulatory && model.regulatory.length > 0 && (
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 0.5, display: 'block' }}
          >
            Regulatory Standards
          </Typography>
          <TagCloud tags={model.regulatory} />
        </Box>
      )}
    </InfoSection>
  );
}
