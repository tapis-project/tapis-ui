import { Box, Chip, FormLabel, Stack, Typography } from '@mui/material';
import { WORKFLOW_OPTIONS } from './wizardOptions';
import type { PersonaAnswers } from './types';

interface WorkflowStepProps {
  answers: PersonaAnswers;
  onChange: (patch: Partial<PersonaAnswers>) => void;
}

function toggle(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

export default function WorkflowStep({ answers, onChange }: WorkflowStepProps) {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
          What does your work look like?
        </Typography>
        <Typography color="text.secondary">
          Pick the workflows you do regularly. Your home view will surface the
          tools that support them.
        </Typography>
      </Box>

      <Box>
        <FormLabel id="workflows-label" sx={{ mb: 1, display: 'block' }}>
          Day-to-day workflows
        </FormLabel>
        <Stack direction="row" useFlexGap spacing={1} sx={{ flexWrap: 'wrap' }}>
          {WORKFLOW_OPTIONS.map((workflow) => {
            const selected = answers.workflows.includes(workflow.value);
            return (
              <Chip
                key={workflow.value}
                label={workflow.label}
                clickable
                color={selected ? 'primary' : 'default'}
                variant={selected ? 'filled' : 'outlined'}
                onClick={() =>
                  onChange({
                    workflows: toggle(answers.workflows, workflow.value),
                  })
                }
              />
            );
          })}
        </Stack>
      </Box>

      <Typography variant="body2" color="text.secondary">
        {answers.workflows.length} workflow
        {answers.workflows.length === 1 ? '' : 's'} selected.
      </Typography>
    </Stack>
  );
}
