import React, { useMemo, useState } from 'react';
import { Apps, Jobs } from '@tapis/tapis-typescript';
import { FieldArray, useField, useFormikContext } from 'formik';
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
import { useJobLauncher } from '@tapis/tapisui-common';
import RowInput, { ROW_INPUT_SX } from './RowInput';
import { DescriptionRow } from './ArgRows';
import Note from './Note';

// Same shape as the argument rows: one variable per line, add and remove in
// place, the description behind the same Expand toggle. Env vars carry the
// same inputMode and description an argument does — an app declaring
// DB_PASSWORD as REQUIRED writes the description precisely so the person
// filling it in can read it, and this section used to be the one place in the
// panel where it stayed invisible.

type Mode = Apps.KeyValueInputModeEnum | undefined;

const modeChip = (mode: Mode) => {
  switch (mode) {
    case Apps.KeyValueInputModeEnum.Fixed:
      return { label: 'fixed', title: 'Set by the app and not editable' };
    case Apps.KeyValueInputModeEnum.Required:
      return {
        label: 'required',
        title: 'The app requires a value for this variable',
      };
    case Apps.KeyValueInputModeEnum.IncludeOnDemand:
      return {
        label: 'optional',
        title: 'Offered by the app, off unless you include it',
      };
    case Apps.KeyValueInputModeEnum.IncludeByDefault:
      return {
        label: 'app',
        title: 'Declared by the app, exported unless you say otherwise',
      };
    default:
      return { label: 'yours', title: 'You added this one' };
  }
};

const EnvRow: React.FC<{
  name: string;
  index: number;
  remove: (index: number) => void;
  mode: Mode;
  showDescription: boolean;
}> = ({ name, index, remove, mode, showDescription }) => {
  const [keyField, , keyHelpers] = useField(`${name}.key`);
  const [valueField, , valueHelpers] = useField(`${name}.value`);
  const [descField, , descHelpers] = useField(`${name}.description`);
  const [includeField, , includeHelpers] = useField(`${name}.include`);

  const fixed = mode === Apps.KeyValueInputModeEnum.Fixed;
  const required = mode === Apps.KeyValueInputModeEnum.Required;
  const fromApp = mode !== undefined;
  const chip = modeChip(mode);
  // See ArgRow: blank means "not part of the job yet", not "wrong"
  const blank = !keyField.value?.trim() && !valueField.value?.trim();

  return (
    <Box
      title={
        blank
          ? 'Empty — this variable is not part of the job. Fill it in or remove it.'
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
          // out to both edges of the list's frame: its padding would
          // otherwise leave the tint stopping short on the right
          pl: 0.75,
          ml: -0.75,
          pr: 0.75,
          mr: -0.75,
          bgcolor: (theme: any) => alpha(theme.palette.warning.light, 0.07),
          '& input.row-input': { borderStyle: 'dashed' },
        }),
      }}
    >
      <Stack direction="row" spacing={0.75} alignItems="center">
        {/* native title rather than MUI Tooltip — see ArgRow */}
        <Checkbox
          size="small"
          sx={{ p: 0.25 }}
          title={
            fixed || required
              ? 'This variable must be exported'
              : 'Export this variable with the job'
          }
          checked={includeField.value !== false}
          disabled={fixed || required}
          onChange={(event) => includeHelpers.setValue(event.target.checked)}
        />

        {/* An app-declared key is the variable's identity — renaming it here
            would quietly mint a new variable and leave the declared one
            unset, so like an argument's name it reads rather than edits. */}
        {fromApp ? (
          <Typography
            title={chip.title}
            sx={{
              fontFamily: 'monospace',
              fontSize: 12,
              fontWeight: 500,
              minWidth: '14rem',
              maxWidth: '14rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {keyField.value || <em>unnamed</em>}
          </Typography>
        ) : (
          <Box sx={{ width: '14rem', flexShrink: 0 }}>
            <RowInput
              aria-label="key"
              placeholder="KEY"
              value={keyField.value ?? ''}
              onCommit={(next) => keyHelpers.setValue(next)}
            />
          </Box>
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <RowInput
            aria-label="value"
            placeholder="value"
            value={valueField.value ?? ''}
            disabled={fixed}
            onCommit={(next) => valueHelpers.setValue(next)}
          />
        </Box>
        <Chip
          size="small"
          variant="outlined"
          label={blank ? 'empty' : chip.label}
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
            onClick={() => remove(index)}
          >
            <CloseRounded sx={{ fontSize: 15 }} />
          </IconButton>
        )}
      </Stack>

      {showDescription && (
        <DescriptionRow
          labelWidth="14rem"
          value={descField.value ?? ''}
          disabled={fixed}
          onCommit={(next) => descHelpers.setValue(next)}
        />
      )}
    </Box>
  );
};

export const EnvSection: React.FC = () => {
  const { app } = useJobLauncher();
  const { values } = useFormikContext<Partial<Jobs.ReqSubmitJob>>();
  const [showDescriptions, setShowDescriptions] = useState(false);
  const envVariables = values.parameterSet?.envVariables ?? [];
  const declaredModes = useMemo(() => {
    const modes = new Map<string, Mode>();
    (app.jobAttributes?.parameterSet?.envVariables ?? []).forEach((variable) =>
      // Tapis's own default: a declared variable with no explicit mode is
      // exported unless the job says otherwise
      modes.set(
        variable.key,
        variable.inputMode ?? Apps.KeyValueInputModeEnum.IncludeByDefault
      )
    );
    return modes;
  }, [app]);

  const included = envVariables.filter(
    (variable) => variable.include !== false
  ).length;

  return (
    <div>
      {/* what the app already brought; with nothing, the list's own note
          below says so */}
      {!!envVariables.length && (
        <Note>
          {`${envVariables.length} environment variable${
            envVariables.length === 1 ? '' : 's'
          } carried over from ${app.id}; ${included} exported into the job.`}
        </Note>
      )}
      <FieldArray
        name="parameterSet.envVariables"
        render={(arrayHelpers) => (
          <Box>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 0.5 }}
            >
              <Typography variant="subtitle2">Environment Variables</Typography>
              <Typography
                variant="caption"
                sx={{ flex: 1, color: 'text.secondary' }}
              >
                {envVariables.length
                  ? `${included} of ${envVariables.length} included`
                  : ''}
              </Typography>
              {!!envVariables.length && (
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
            {envVariables.length ? (
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  px: 0.75,
                  ...ROW_INPUT_SX,
                }}
              >
                {envVariables.map((variable, index) => (
                  <EnvRow
                    key={`env-${index}`}
                    name={`parameterSet.envVariables.${index}`}
                    index={index}
                    remove={arrayHelpers.remove}
                    mode={
                      variable.key ? declaredModes.get(variable.key) : undefined
                    }
                    showDescription={showDescriptions}
                  />
                ))}
              </Box>
            ) : (
              <Note>
                No environment variables. Anything you add here is exported into
                the job.
              </Note>
            )}
            <Button
              size="small"
              variant="outlined"
              sx={{ mt: 0.75, fontSize: '0.7rem', py: 0.15 }}
              onClick={() => {
                arrayHelpers.push({
                  key: '',
                  value: '',
                  description: '',
                  include: true,
                });
                // see ArgRowsField: a row you add shows its description
                setShowDescriptions(true);
              }}
            >
              + Add
            </Button>
          </Box>
        )}
      />
    </div>
  );
};

export default EnvSection;
