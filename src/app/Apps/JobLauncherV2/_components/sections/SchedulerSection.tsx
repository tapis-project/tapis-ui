import React, {
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  knownProjects,
  subscribeKnownProjects,
} from 'app/Jobs/_components/knownAllocations';
import { Jobs, Systems } from '@tapis/tapis-typescript';
import { useFormikContext } from 'formik';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  Divider,
  FormControlLabel,
  Link,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  ExpandLessRounded,
  ExpandMoreRounded,
  OpenInNewRounded,
} from '@mui/icons-material';
import { useJobLauncher } from '@tapis/tapisui-common';
import RowInput, { ROW_INPUT_SX } from './RowInput';
import { ArgRowsField, useArgSpecs } from './ArgRows';
import { arraySx } from '../styles';
import { findFlagIndex, hasPlaceholder, parseFlagValue } from '../utils';
import {
  ALLOCATION,
  FlagSpec,
  isPromoted,
  JOB_NAME,
  PROFILE_FLAG,
  RESERVATION,
  readFlag,
} from './schedulerFlags';

type JobValues = Partial<Jobs.ReqSubmitJob>;

// Wide enough for the longest flag ('--reservation' at 12px monospace is just
// under 6rem) and no wider — a fixed cell keeps the value boxes aligned across
// the three rows without leaving a field of white between flag and box.
const FLAG_CELL_WIDTH = '6.75rem';
// Lines the note up under the value column: checkbox + gap + flag cell + gap
const NOTE_INDENT = '9.1rem';

/**
 * One flag, one line: `--reservation [ value ]`, the same grammar as the
 * argument and environment rows. The flag itself is the label — a field
 * captioned "Reservation name" with the literal text on a line underneath read
 * as two separate things rather than one command being assembled.
 */
const FlagField: React.FC<{
  spec: FlagSpec;
  /** values the cluster itself has named — offered as one-press chips */
  suggestions?: string[];
}> = ({ spec, suggestions }) => {
  const { values, setFieldValue } = useFormikContext<JobValues>();
  const { app } = useJobLauncher();
  const options = useMemo(
    () => values.parameterSet?.schedulerOptions ?? [],
    [values]
  );
  const { index, value, include, unresolved, setNotIncluded } = useMemo(
    () => readFlag(values, app, spec),
    [values, app, spec]
  );

  const writeValue = useCallback(
    (next: string) => {
      const flag = spec.flags[0];
      const arg = `${flag} ${next}`.trim();
      if (index >= 0) {
        setFieldValue(`parameterSet.schedulerOptions.${index}.arg`, arg);
        // A bare flag with no value would be rejected by the scheduler, so
        // emptying the field drops it from the command rather than sending it
        if (!next.trim()) {
          setFieldValue(
            `parameterSet.schedulerOptions.${index}.include`,
            false
          );
        }
        return;
      }
      if (!next.trim()) {
        return;
      }
      setFieldValue('parameterSet.schedulerOptions', [
        ...options,
        {
          name: spec.defaultName,
          description: spec.defaultDescription,
          include: true,
          arg,
        },
      ]);
    },
    [index, options, setFieldValue, spec]
  );

  const toggleInclude = useCallback(
    (checked: boolean) => {
      if (index >= 0) {
        setFieldValue(
          `parameterSet.schedulerOptions.${index}.include`,
          checked
        );
      }
    },
    [index, setFieldValue]
  );

  const note =
    include && unresolved ? (
      'still a placeholder: replace it, or uncheck Include'
    ) : setNotIncluded ? (
      <>
        set, but not included, so this will not be sent.{' '}
        <Link
          component="button"
          type="button"
          onClick={() => toggleInclude(true)}
          sx={{ fontSize: 'inherit', verticalAlign: 'baseline' }}
        >
          Include it
        </Link>
      </>
    ) : (
      spec.helper
    );

  return (
    <Box sx={{ py: 0.35 }}>
      <Stack direction="row" spacing={0.75} alignItems="center">
        <Checkbox
          size="small"
          sx={{ p: 0.25 }}
          title={`Include ${spec.flags[0]} in the job`}
          checked={include}
          disabled={!value.trim()}
          onChange={(event) => toggleInclude(event.target.checked)}
        />
        <Stack
          direction="row"
          spacing={0.6}
          alignItems="baseline"
          title={spec.label}
          sx={{ width: FLAG_CELL_WIDTH, flexShrink: 0, overflow: 'hidden' }}
        >
          <Typography
            sx={{
              fontFamily: 'monospace',
              fontSize: 12,
              flexShrink: 0,
              color: include ? 'text.primary' : 'text.disabled',
            }}
          >
            {spec.flags[0]}
          </Typography>
          {spec.gloss && (
            <Typography
              sx={{
                fontSize: 11,
                color: 'text.disabled',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {spec.gloss}
            </Typography>
          )}
        </Stack>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <RowInput
            aria-label={spec.label}
            placeholder={spec.placeholder}
            value={value}
            onCommit={writeValue}
          />
        </Box>
      </Stack>
      <Typography
        sx={{
          pl: NOTE_INDENT,
          fontSize: 11,
          lineHeight: 1.5,
          color:
            include && unresolved
              ? 'error.main'
              : setNotIncluded
              ? 'warning.main'
              : 'text.secondary',
        }}
      >
        {note}
      </Typography>
      {!!suggestions?.length && (
        <Box
          sx={{
            pl: NOTE_INDENT,
            mt: 0.25,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            flexWrap: 'wrap',
          }}
        >
          <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
            the cluster has listed yours:
          </Typography>
          {suggestions.map((suggestion) => (
            <Chip
              key={suggestion}
              size="small"
              variant="outlined"
              label={suggestion}
              onClick={() => writeValue(suggestion)}
              sx={{
                height: 18,
                fontSize: '0.65rem',
                borderRadius: '4px',
                fontFamily: 'monospace',
                cursor: 'pointer',
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export const findSchedulerProfile = (values: JobValues) => {
  const profile = (values.parameterSet?.schedulerOptions ?? []).find((option) =>
    option.arg?.includes(PROFILE_FLAG)
  );
  const args = profile?.arg?.split(' ');
  return args && args.length >= 2 ? args[1] : undefined;
};

/**
 * The site's scheduler profiles as a picker rather than a wall of cards: the
 * selected one explains itself underneath, and nothing else takes up room.
 */
const ProfileFacts: React.FC<{ profile: Systems.SchedulerProfile }> = ({
  profile,
}) => {
  const facts: Array<[string, string | undefined]> = [
    [
      'module loads',
      (profile.moduleLoads ?? [])
        .map((load) =>
          [load.moduleLoadCommand, ...(load.modulesToLoad ?? [])]
            .filter(Boolean)
            .join(' ')
        )
        .join(' · '),
    ],
    ['hidden options', (profile.hiddenOptions ?? []).join(', ')],
    ['owner', profile.owner],
    ['tenant', profile.tenant],
  ];
  return (
    <Box sx={{ display: 'grid', gap: 0.4 }}>
      {facts
        .filter(([, value]) => !!value)
        .map(([label, value]) => (
          <Stack key={`fact-${label}`} direction="row" spacing={1}>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', minWidth: '6.5rem' }}
            >
              {label}
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontFamily: 'monospace', wordBreak: 'break-word' }}
            >
              {value}
            </Typography>
          </Stack>
        ))}
    </Box>
  );
};

const ProfileField: React.FC = () => {
  const [showDetail, setShowDetail] = useState(false);
  const { schedulerProfiles } = useJobLauncher();
  const { values, setFieldValue } = useFormikContext<JobValues>();
  const options = useMemo(
    () => values.parameterSet?.schedulerOptions ?? [],
    [values]
  );
  const current = findSchedulerProfile(values) ?? '';
  const selected = schedulerProfiles.find(
    (profile) => profile.name === current
  );

  const setProfile = useCallback(
    (name: string) => {
      const rest = options.filter(
        (option) => !option.arg?.includes(PROFILE_FLAG)
      );
      setFieldValue(
        'parameterSet.schedulerOptions',
        name
          ? [
              {
                name: 'TACC Scheduler Profile',
                description:
                  'Site module loads and hidden scheduler options for this system',
                include: true,
                arg: `${PROFILE_FLAG} ${name}`,
              },
              ...rest,
            ]
          : rest
      );
    },
    [options, setFieldValue]
  );

  // Nothing to choose from and nothing chosen — do not show an empty picker
  if (!schedulerProfiles.length && !current) {
    return null;
  }

  return (
    <Box sx={{ mb: 1.5 }}>
      <TextField
        select
        size="small"
        fullWidth
        label="TACC scheduler profile"
        value={current}
        onChange={(event) => setProfile(event.target.value)}
        helperText="A profile bundles the module loads and hidden scheduler options the site defines for this system."
        InputProps={{ sx: { fontSize: '0.85rem' } }}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {schedulerProfiles.map((profile) => (
          <MenuItem key={`profile-${profile.name}`} value={profile.name}>
            {profile.name}
          </MenuItem>
        ))}
        {!!current && !selected && (
          <MenuItem value={current}>{current} (not on this site)</MenuItem>
        )}
      </TextField>
      {!!current && (
        <Typography
          sx={{
            fontFamily: 'monospace',
            fontSize: 11,
            mt: 0.25,
            color: 'text.secondary',
          }}
        >
          {`${PROFILE_FLAG} ${current}`}
        </Typography>
      )}
      {selected && (
        <Box sx={{ mt: 0.5 }}>
          {/* Reference material, not something you read every launch — so it
              stays folded until asked for. */}
          <Button
            size="small"
            onClick={() => setShowDetail((open) => !open)}
            endIcon={
              showDetail ? (
                <ExpandLessRounded fontSize="small" />
              ) : (
                <ExpandMoreRounded fontSize="small" />
              )
            }
            sx={{ textTransform: 'none', fontSize: 11, py: 0 }}
          >
            {showDetail ? 'Hide' : 'What this profile does'}
          </Button>
          <Collapse in={showDetail} unmountOnExit>
            <Box
              sx={{
                mt: 0.5,
                p: 1,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'action.hover',
              }}
            >
              {selected.description && (
                <Typography
                  variant="caption"
                  sx={{ display: 'block', mb: 0.75 }}
                >
                  {selected.description}
                </Typography>
              )}
              <ProfileFacts profile={selected} />
            </Box>
          </Collapse>
        </Box>
      )}
    </Box>
  );
};

/**
 * Anything the fields above do not cover. An app that only ships the usual TACC
 * flags leaves this empty, which is the point — the raw editor used to repeat
 * every value that already had a field.
 */
const OtherSchedulerArgs: React.FC = () => {
  const specs = useArgSpecs();
  return (
    <ArgRowsField
      name="parameterSet.schedulerOptions"
      label="Other scheduler flags"
      argSpecs={specs.schedulerOptions}
      skip={isPromoted}
      emptyText="None. The fields above cover every scheduler option this app defines. Add one for anything else your site expects."
    />
  );
};

export const SchedulerSection: React.FC = () => {
  const { values } = useFormikContext<JobValues>();
  const { app } = useJobLauncher();
  // projects a refused submission has already named for this system — see
  // knownAllocations.ts; there is no API to ask, only refusals to remember
  const targetSystem =
    values.execSystemId ?? app.jobAttributes?.execSystemId ?? undefined;
  const projects = useSyncExternalStore(subscribeKnownProjects, () =>
    knownProjects(targetSystem)
  );
  const options = values.parameterSet?.schedulerOptions ?? [];
  // Only warn about templates the fields above cannot show — those carry their
  // own inline error, and saying it twice was the noisiest part of this section
  const unresolved = options.filter(
    (option) =>
      option.include && hasPlaceholder(option.arg) && !isPromoted(option)
  );

  return (
    <div>
      <Box sx={arraySx}>
        <Typography variant="subtitle2" sx={{ mb: 0.25 }}>
          TACC Resource Allocation
        </Typography>
        <Typography
          variant="caption"
          sx={{ display: 'block', mb: 0.75, color: 'text.secondary' }}
        >
          These are what most batch submissions on TACC systems need. Each one
          is stored as an ordinary scheduler option.
        </Typography>
        {/* There is no API to ask which allocations you hold, so the only
            way to find out is the portal. Saying so here beats finding out
            from a refused submission which project name it wanted. */}
        <Typography
          component="a"
          href="https://tacc.utexas.edu/portal/projects"
          target="_blank"
          rel="noopener noreferrer"
          variant="caption"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.4,
            mb: 1.5,
            color: '#1565c0',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          View your allocations on TACC resources
          <OpenInNewRounded sx={{ fontSize: 12 }} />
        </Typography>

        <ProfileField />
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            px: 0.75,
            mb: 1.5,
            ...ROW_INPUT_SX,
          }}
        >
          <FlagField spec={JOB_NAME} />
          <FlagField spec={ALLOCATION} suggestions={projects} />
          <FlagField spec={RESERVATION} />
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        {!!unresolved.length && (
          <Alert severity="warning" sx={{ mb: 1.5 }}>
            {unresolved.length} scheduler option
            {unresolved.length > 1 ? 's are' : ' is'} still a template:{' '}
            {unresolved.map((option) => (
              <Chip
                key={`unresolved-${option.name}-${option.arg}`}
                size="small"
                label={option.arg}
                sx={{ fontFamily: 'monospace', mr: 0.5, fontSize: '0.7rem' }}
              />
            ))}
            <br />
            The scheduler will reject the job with the placeholder text in it.
          </Alert>
        )}

        <OtherSchedulerArgs />
      </Box>
    </div>
  );
};

export default SchedulerSection;
