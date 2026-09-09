import React, { useMemo, useState } from 'react';
import { Apps, Jobs } from '@tapis/tapis-typescript';
import { FieldArray, FieldArrayRenderProps, useField } from 'formik';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { CloseRounded, InfoOutlined, LockOutlined } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { getArgMode, useJobLauncher } from '@tapis/tapisui-common';
import RowInput, { ROW_INPUT_SX } from './RowInput';

// One arg per LINE. The V1 editor gave each argument its own accordion with
// four labelled fields inside, so a dozen app arguments ran to several screens
// and you could not see the command you were assembling. Here the row is the
// argument: include, name, value, where it came from — with the description
// tucked behind a toggle because it is reference material, not something you
// edit often.

type Mode = Apps.ArgInputModeEnum | undefined;

const modeChip = (mode: Mode) => {
  switch (mode) {
    case Apps.ArgInputModeEnum.Fixed:
      return { label: 'fixed', title: 'Defined by the app and not editable' };
    case Apps.ArgInputModeEnum.Required:
      return { label: 'required', title: 'The app requires this argument' };
    case Apps.ArgInputModeEnum.IncludeByDefault:
      return {
        label: 'app',
        title: 'Defined by the app, included unless you say otherwise',
      };
    case Apps.ArgInputModeEnum.IncludeOnDemand:
      return {
        label: 'optional',
        title: 'Offered by the app, off unless you include it',
      };
    default:
      return { label: 'yours', title: 'You added this one' };
  }
};

export const ArgRow: React.FC<{
  name: string;
  index: number;
  arrayHelpers: FieldArrayRenderProps;
  mode: Mode;
  showDescription: boolean;
}> = ({ name, index, arrayHelpers, mode, showDescription }) => {
  const [nameField, , nameHelpers] = useField(`${name}.name`);
  const [argField, , argHelpers] = useField(`${name}.arg`);
  const [descField, , descHelpers] = useField(`${name}.description`);
  const [includeField, , includeHelpers] = useField(`${name}.include`);

  const fixed = mode === Apps.ArgInputModeEnum.Fixed;
  const required = mode === Apps.ArgInputModeEnum.Required;
  const fromApp = mode !== undefined;
  const chip = modeChip(mode);
  // Nothing in it yet: allowed, but it is not part of the job and will be
  // dropped on submit. Say that quietly rather than counting it as an error.
  const blank = !nameField.value?.trim() && !argField.value?.trim();

  return (
    <Box
      title={
        blank
          ? 'Empty — this row is not part of the job. Fill it in or remove it.'
          : undefined
      }
      sx={{
        py: 0.35,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-of-type': { borderBottom: 'none' },
        ...(blank && {
          borderLeft: '2px solid',
          borderLeftColor: 'warning.light',
          pl: 0.75,
          ml: -0.75,
          bgcolor: (theme: any) => alpha(theme.palette.warning.light, 0.07),
          '& input.row-input': { borderStyle: 'dashed' },
        }),
      }}
    >
      <Stack direction="row" spacing={0.75} alignItems="center">
        {/* native title rather than MUI Tooltip: there are four of these per
            row, and the tooltips cost more to render than everything else in
            the row put together. */}
        <Checkbox
          size="small"
          sx={{ p: 0.25 }}
          title={
            fixed || required
              ? 'This argument must be included'
              : 'Include this argument in the job'
          }
          checked={!!includeField.value}
          disabled={fixed || required}
          onChange={(event) => includeHelpers.setValue(event.target.checked)}
        />

        {fromApp ? (
          <Typography
            title={chip.title}
            sx={{
              fontSize: 12,
              fontWeight: 500,
              minWidth: '8rem',
              maxWidth: '8rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {nameField.value || <em>unnamed</em>}
          </Typography>
        ) : (
          <Box sx={{ width: '8rem', flexShrink: 0 }}>
            <RowInput
              aria-label="name"
              placeholder="name"
              value={nameField.value ?? ''}
              onCommit={(next) => nameHelpers.setValue(next)}
              style={{ fontFamily: 'inherit' }}
            />
          </Box>
        )}

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <RowInput
            aria-label="value"
            placeholder="value"
            value={argField.value ?? ''}
            disabled={fixed}
            onCommit={(next) => argHelpers.setValue(next)}
          />
        </Box>

        <Chip
          size="small"
          label={blank ? 'empty' : chip.label}
          variant="outlined"
          sx={{
            height: 16,
            fontSize: 10,
            flexShrink: 0,
            ...(blank && {
              color: 'warning.dark',
              borderColor: 'warning.light',
            }),
          }}
        />

        {fixed ? (
          <LockOutlined
            titleAccess="Fixed by the app — cannot be removed"
            sx={{ fontSize: 15, color: 'text.disabled' }}
          />
        ) : (
          <IconButton
            size="small"
            sx={{ p: 0.25 }}
            title="Remove"
            onClick={() => arrayHelpers.remove(index)}
          >
            <CloseRounded sx={{ fontSize: 15 }} />
          </IconButton>
        )}
      </Stack>

      {showDescription && (
        // Indented to start under the value column, borderless until you go
        // near it: a caption you can edit, not a second form field.
        <Box
          sx={{
            pl: '11.2rem',
            pr: 3.5,
            pb: 0.25,
            color: 'text.secondary',
          }}
        >
          <RowInput
            variant="quiet"
            aria-label="description"
            placeholder="no description"
            value={descField.value ?? ''}
            disabled={fixed}
            onCommit={(next) => descHelpers.setValue(next)}
          />
        </Box>
      )}
    </Box>
  );
};

/** The whole assembled command line, so you can see what you are building. */
export const AssembledArgs: React.FC<{ args: Array<Jobs.JobArgSpec> }> = ({
  args,
}) => {
  const assembled = args
    .filter((arg) => arg.include)
    .map((arg) => arg.arg)
    .join(' ')
    .trim();
  return (
    <Box
      sx={{
        px: 1,
        py: 0.5,
        mb: 0.75,
        borderRadius: 1,
        bgcolor: 'action.hover',
        border: '1px solid',
        borderColor: 'divider',
        overflowX: 'auto',
      }}
    >
      <Typography
        sx={{
          fontFamily: 'monospace',
          fontSize: 11,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          color: assembled ? 'text.primary' : 'text.disabled',
        }}
      >
        {assembled || 'nothing included'}
      </Typography>
    </Box>
  );
};

export const ArgRowsField: React.FC<{
  name: string;
  label: string;
  argSpecs: Array<Apps.AppArgSpec>;
  /** Rows whose flag already has a dedicated editor elsewhere */
  skip?: (arg: Jobs.JobArgSpec) => boolean;
  emptyText?: string;
}> = ({ name, label, argSpecs, skip, emptyText }) => {
  const [showDescriptions, setShowDescriptions] = useState(false);
  const [field] = useField(name);
  const args = useMemo(
    () => (field.value as Array<Jobs.JobArgSpec>) ?? [],
    [field]
  );
  // Indexes are formik field paths, so they must survive any filtering
  const rows = args
    .map((arg, index) => ({ arg, index }))
    .filter(({ arg }) => !skip?.(arg));

  return (
    <FieldArray
      name={name}
      render={(arrayHelpers) => (
        <Box sx={{ mb: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ mb: 0.5 }}
          >
            <Typography variant="subtitle2">{label}</Typography>
            <Typography
              variant="caption"
              sx={{ flex: 1, color: 'text.secondary' }}
            >
              {rows.length
                ? `${rows.filter(({ arg }) => arg.include).length} of ${
                    rows.length
                  } included`
                : ''}
            </Typography>
            {!!rows.length && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => setShowDescriptions((open) => !open)}
                startIcon={<InfoOutlined sx={{ fontSize: 14 }} />}
                sx={{ textTransform: 'none', fontSize: 11, py: 0 }}
              >
                {showDescriptions ? 'Collapse' : 'Expand'} descriptions
              </Button>
            )}
          </Stack>

          {!!rows.length && <AssembledArgs args={rows.map(({ arg }) => arg)} />}

          {rows.length ? (
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                px: 0.75,
                ...ROW_INPUT_SX,
              }}
            >
              {rows.map(({ arg, index }) => (
                <ArgRow
                  key={`${name}-${index}`}
                  name={`${name}.${index}`}
                  index={index}
                  arrayHelpers={arrayHelpers}
                  mode={arg.name ? getArgMode(arg.name, argSpecs) : undefined}
                  showDescription={showDescriptions}
                />
              ))}
            </Box>
          ) : (
            <Typography
              variant="caption"
              sx={{ display: 'block', mb: 0.5, color: 'text.secondary' }}
            >
              {emptyText ?? 'None.'}
            </Typography>
          )}

          <Button
            size="small"
            variant="outlined"
            sx={{ mt: 0.75, fontSize: '0.7rem', py: 0.15 }}
            onClick={() =>
              arrayHelpers.push({
                name: '',
                description: '',
                include: true,
                arg: '',
              })
            }
          >
            + Add
          </Button>
        </Box>
      )}
    />
  );
};

export const useArgSpecs = () => {
  const { app } = useJobLauncher();
  return useMemo(
    () => ({
      appArgs: app.jobAttributes?.parameterSet?.appArgs ?? [],
      containerArgs: app.jobAttributes?.parameterSet?.containerArgs ?? [],
      schedulerOptions: app.jobAttributes?.parameterSet?.schedulerOptions ?? [],
    }),
    [app]
  );
};
