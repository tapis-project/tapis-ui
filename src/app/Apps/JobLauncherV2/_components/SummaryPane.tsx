import React, { useMemo } from 'react';
import { useFormikContext } from 'formik';
import { Jobs } from '@tapis/tapis-typescript';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import { useJobLauncher } from '@tapis/tapisui-common';
import { useLauncherNavigation } from './context';
import { useDebouncedValue } from './hooks';
import { sectionMeta } from './sections/meta';
import { computeSummaryLines } from './summaryLines';

type JobValues = Partial<Jobs.ReqSubmitJob>;

/**
 * The V1 wizard's right-hand summary, kept: every section's decisions in one
 * column with an edit link back to it. Reads a debounced snapshot, so typing in
 * a field does not re-render the whole summary on every keystroke.
 */
const SummaryPane: React.FC = () => {
  const { values } = useFormikContext<JobValues>();
  const { app, systems } = useJobLauncher();
  const { scrollTo } = useLauncherNavigation();
  const job = useDebouncedValue(values, 300);

  const lines = useMemo(
    () => computeSummaryLines({ values: job, app, systems }),
    [job, app, systems]
  );

  return (
    <Box sx={{ p: 1.25 }}>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          mb: 1,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'text.disabled',
          fontSize: 10,
        }}
      >
        Summary
      </Typography>
      {sectionMeta
        .filter((section) => lines[section.id]?.length)
        .map((section) => (
          <Box key={`summary-${section.id}`} sx={{ mb: 1.25 }}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, flex: 1 }}>
                {section.label}
              </Typography>
              <Button
                size="small"
                onClick={() => scrollTo(section.id)}
                sx={{ minWidth: 0, p: 0, fontSize: 10, textTransform: 'none' }}
              >
                edit
              </Button>
            </Stack>
            {lines[section.id].map((line, index) => (
              <Typography
                key={`summary-${section.id}-${index}`}
                sx={{
                  fontSize: 11,
                  lineHeight: 1.45,
                  wordBreak: 'break-word',
                  color: line.error ? 'error.main' : 'text.secondary',
                }}
              >
                {line.text}
              </Typography>
            ))}
            <Divider sx={{ mt: 1 }} />
          </Box>
        ))}
    </Box>
  );
};

export default SummaryPane;
