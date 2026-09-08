import { Box, FormLabel, Stack, Typography } from '@mui/material';
import { EXPERIENCE_LEVELS, PROFESSIONS } from './wizardOptions';
import type { PersonaAnswers } from './types';

interface ProfessionStepProps {
  answers: PersonaAnswers;
  onChange: (patch: Partial<PersonaAnswers>) => void;
}

export default function ProfessionStep({
  answers,
  onChange,
}: ProfessionStepProps) {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
          What do you do?
        </Typography>
        <Typography color="text.secondary">
          We&apos;ll organize your workspace around your profession and
          day-to-day work.
        </Typography>
      </Box>

      <Box>
        <FormLabel id="profession-label" sx={{ mb: 1, display: 'block' }}>
          Your profession
        </FormLabel>
        <Stack
          direction="row"
          useFlexGap
          spacing={1.5}
          sx={{ flexWrap: 'wrap' }}
        >
          {PROFESSIONS.map((profession) => {
            const selected = answers.profession === profession.value;
            return (
              <Box
                key={profession.value}
                onClick={() => onChange({ profession: profession.value })}
                role="radio"
                aria-checked={selected}
                aria-labelledby={`profession-option-${profession.value}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onChange({ profession: profession.value });
                  }
                }}
                sx={{
                  flex: '1 1 220px',
                  p: 2,
                  borderRadius: 2,
                  border: 1,
                  cursor: 'pointer',
                  borderColor: selected ? 'primary.main' : 'divider',
                  bgcolor: selected ? 'action.selected' : 'transparent',
                  transition: 'all 0.15s',
                  '&:hover': { borderColor: 'primary.light' },
                }}
              >
                <Typography
                  id={`profession-option-${profession.value}`}
                  sx={{ fontWeight: 600 }}
                >
                  {profession.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {profession.description}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Box>

      <Box>
        <FormLabel id="experience-label" sx={{ mb: 1, display: 'block' }}>
          How do you want the platform to meet you?
        </FormLabel>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          {EXPERIENCE_LEVELS.map((level) => {
            const selected = answers.experienceLevel === level.value;
            return (
              <Box
                key={level.value}
                onClick={() => onChange({ experienceLevel: level.value })}
                role="radio"
                aria-checked={selected}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onChange({ experienceLevel: level.value });
                  }
                }}
                sx={{
                  flex: 1,
                  p: 2,
                  borderRadius: 2,
                  border: 1,
                  cursor: 'pointer',
                  borderColor: selected ? 'primary.main' : 'divider',
                  bgcolor: selected ? 'action.selected' : 'transparent',
                  transition: 'all 0.15s',
                  '&:hover': { borderColor: 'primary.light' },
                }}
              >
                <Typography sx={{ fontWeight: 600 }}>{level.label}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {level.description}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Box>
    </Stack>
  );
}
