/**
 * SchedulerProfileChip — the batchSchedulerProfile, pressable. The name
 * alone (tacc-apptainer) says nothing; the profile record says what it
 * actually does: the module loads it runs before the job and the
 * scheduler options it hides. Fetched only when the popover opens.
 */
import React, { useState } from 'react';
import { Systems as SystemsHooks } from '@tapis/tapisui-hooks';
import {
  Box,
  Chip,
  CircularProgress,
  Popover,
  Typography,
} from '@mui/material';
import ErrorDetail from 'app/_components/ErrorDetail/ErrorDetail';
import {
  LABEL_SX,
  MONO_SX,
  SMALL_CHIP_SX,
} from 'app/_components/PageShell/cardKit';

const SchedulerProfileChip: React.FC<{ name: string }> = ({ name }) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const q = SystemsHooks.useSchedulerProfiles({
    enabled: !!anchor,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });
  const profile = (q.data?.result ?? []).find((p) => p.name === name);

  return (
    <>
      <Chip
        size="small"
        label={name}
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ ...SMALL_CHIP_SX, fontFamily: 'monospace', cursor: 'pointer' }}
      />
      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 1.25, maxWidth: 340 }}>
          <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, mb: 0.5 }}>
            {name}
          </Typography>
          {q.isLoading || (q.isFetching && !q.data) ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <CircularProgress size={11} />
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                asking about the profile…
              </Typography>
            </Box>
          ) : q.isError ? (
            <ErrorDetail message={q.error?.message ?? ''} fontSize="0.68rem" />
          ) : !profile ? (
            <Typography sx={{ fontSize: '0.7rem', color: 'text.disabled' }}>
              the service lists no profile by this name — it may belong to
              another tenant
            </Typography>
          ) : (
            <Box sx={{ display: 'grid', gap: 0.75 }}>
              {profile.description && (
                <Typography
                  sx={{ fontSize: '0.72rem', color: 'text.secondary' }}
                >
                  {profile.description}
                </Typography>
              )}
              {(profile.moduleLoads ?? []).length > 0 && (
                <Box>
                  <Typography sx={{ ...LABEL_SX, mb: 0.25 }}>
                    runs before each job
                  </Typography>
                  {(profile.moduleLoads ?? []).map((load, i) => (
                    <Typography
                      key={i}
                      sx={{ ...MONO_SX, whiteSpace: 'normal' }}
                    >
                      {load.moduleLoadCommand}{' '}
                      {(load.modulesToLoad ?? []).join(' ')}
                    </Typography>
                  ))}
                </Box>
              )}
              {(profile.hiddenOptions ?? []).length > 0 && (
                <Box>
                  <Typography sx={{ ...LABEL_SX, mb: 0.25 }}>
                    hides scheduler options
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {(profile.hiddenOptions ?? []).map((opt) => (
                      <Chip
                        key={String(opt)}
                        size="small"
                        label={String(opt)}
                        sx={{ ...SMALL_CHIP_SX, fontFamily: 'monospace' }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
              <Typography sx={{ fontSize: '0.64rem', color: 'text.disabled' }}>
                profile owner: {profile.owner}
              </Typography>
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default SchedulerProfileChip;
