import React from 'react';
import { FieldArray } from 'formik';
import {
  Button,
  ButtonGroup,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { FMTextField, FMSelect, Icon } from '@tapis/tapisui-common';
import styles from './Common/Wizard.module.scss';
import { PodVolumeEnum } from './PodVolumeEnum';
import { updateState } from '@redux'; // Adjust the import path if needed

const podVolumeTypes = Object.values(PodVolumeEnum);
const protocolOptions = [
  { value: 'http', label: 'http' },
  { value: 'tcp', label: 'tcp' },
  { value: 'postgres', label: 'postgres' },
  { value: 'local_only', label: 'local_only' },
];

export const CommandSection = ({ formik }: any) => (
  <React.Fragment>
    <FieldArray
      name="command"
      render={(arrayHelpers) => (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '.5rem',
            }}
          >
            <Typography variant="subtitle1">Command</Typography>
            <Button
              type="button"
              variant="outlined"
              onClick={() => arrayHelpers.push('')}
              className={styles['add-button']}
              style={{
                height: 30,
                fontSize: 11,
                marginLeft: 'auto',
                padding: '0px 8px',
              }}
            >
              + Command Element
            </Button>
          </div>
          {formik.values.command &&
            formik.values.command.map((cmd: string, i: number) => (
              <ButtonGroup
                key={i}
                variant="outlined"
                sx={{
                  display: 'flex',
                  alignItems: 'bottom',
                  marginBottom: '.8rem',
                  height: 40,
                }}
              >
                <FMTextField
                  formik={formik}
                  name={`command.${i}`}
                  label={`Element ${i}`}
                  value={cmd}
                  style={{ minWidth: 180, flex: 1 }}
                  InputProps={{
                    sx: {
                      borderTopRightRadius: 0,
                      borderBottomRightRadius: 0,
                      height: 40,
                      boxSizing: 'border-box',
                    },
                  }}
                />
                <Button
                  type="button"
                  color="error"
                  variant="outlined"
                  onClick={() => arrayHelpers.remove(i)}
                  sx={{
                    minWidth: 36,
                    maxWidth: 36,
                    height: 40,
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    borderLeft: 'none',
                  }}
                  aria-label="Remove command"
                >
                  <Icon name="trash" />
                </Button>
              </ButtonGroup>
            ))}
        </div>
      )}
    />
  </React.Fragment>
);

export const EnvVarsSection = ({ formik }: any) => (
  <React.Fragment>
    <div>
      <div
        style={{ display: 'flex', alignItems: 'center', marginBottom: '.5rem' }}
      >
        <Typography variant="subtitle1">Environment Variables</Typography>
        <Button
          type="button"
          variant="outlined"
          size="small"
          style={{
            height: 30,
            fontSize: 11,
            marginLeft: 'auto',
            padding: '0px 8px',
          }}
          onClick={() => {
            let idx = 1;
            let nextKey = `Key${idx}`;
            const existing = Object.keys(
              formik.values.environment_variables || {}
            );
            while (existing.includes(nextKey)) {
              idx++;
              nextKey = `Key${idx}`;
            }
            formik.setFieldValue(
              `environment_variables.${nextKey}`,
              `Value${idx}`
            );
          }}
        >
          + Environment Variable
        </Button>
      </div>
      {formik.values.environment_variables &&
        Object.entries(formik.values.environment_variables).length > 0 &&
        Object.entries(formik.values.environment_variables).map(
          ([key, value]: [string, any], i) => (
            <ButtonGroup
              key={'envVar' + i}
              variant="outlined"
              sx={{
                display: 'flex',
                alignItems: 'top',
                marginBottom: '.8rem',
                width: '100%',
                height: 40,
              }}
            >
              <FMTextField
                formik={formik}
                name={`environment_variables.${key}.__name`}
                label="Key"
                value={key}
                onChange={(e: any) => {
                  const newName = e.target.value;
                  if (!newName || newName === key) return;
                  if (formik.values.environment_variables[newName]) return;
                  const oldObj = formik.values.environment_variables;
                  const newObj = Object.fromEntries(
                    Object.entries(oldObj).map(([k, v]) =>
                      k === key ? [newName, v] : [k, v]
                    )
                  );
                  formik.setFieldValue('environment_variables', newObj);
                }}
                InputProps={{
                  style: { height: 40, boxSizing: 'border-box' },
                  sx: { borderBottomRightRadius: 0, borderTopRightRadius: 0 },
                }}
              />
              <FMTextField
                formik={formik}
                name={`environment_variables.${key}`}
                label="Value"
                value={value}
                InputProps={{
                  style: { height: 40, boxSizing: 'border-box' },
                  sx: {
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                    borderTopRightRadius: 0,
                  },
                }}
              />
              <Button
                type="button"
                color="error"
                variant="outlined"
                onClick={() => {
                  const newVars = { ...formik.values.environment_variables };
                  delete newVars[key];
                  formik.setFieldValue('environment_variables', newVars);
                }}
                sx={{
                  minWidth: 36,
                  maxWidth: 36,
                  borderLeft: 'none',
                  height: 40,
                  marginLeft: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Remove environment variable"
              >
                <Icon name="trash" />
              </Button>
            </ButtonGroup>
          )
        )}
    </div>
  </React.Fragment>
);

export const NetworkingSection = ({ formik }: any) => (
  <React.Fragment>
    <div
      style={{ display: 'flex', alignItems: 'center', marginBottom: '.5rem' }}
    >
      <Typography variant="subtitle1">Networking</Typography>
      <Button
        type="button"
        variant="outlined"
        size="small"
        style={{
          height: 30,
          fontSize: 11,
          marginLeft: 'auto',
          padding: '0px 8px',
        }}
        onClick={() => {
          const existing = Object.keys(formik.values.networking || {});
          let nextName = 'default';
          if (existing.includes('default')) {
            let idx = 1;
            while (existing.includes(`custom${String(idx).padStart(2, '0')}`)) {
              idx++;
            }
            nextName = `custom${String(idx).padStart(2, '0')}`;
          }
          formik.setFieldValue(`networking.${nextName}`, {
            port: '5000',
            protocol: 'http',
          });
        }}
      >
        + Network Object
      </Button>
    </div>
    {formik.values.networking &&
      Object.entries(formik.values.networking || {}).map(
        ([key, value]: [string, any], i) => (
          <ButtonGroup
            key={'networkObj' + i}
            variant="outlined"
            sx={{
              display: 'flex',
              alignItems: 'top',
              marginBottom: '.8rem',
              width: '100%',
              height: 40,
            }}
          >
            <FMTextField
              formik={formik}
              name={`networking.${key}.__name`}
              label="Name"
              value={key}
              onChange={(e: any) => {
                const newName = e.target.value;
                if (!newName || newName === key) return;
                if (formik.values.networking[newName]) return;
                const oldObj = formik.values.networking;
                const newObj = Object.fromEntries(
                  Object.entries(oldObj).map(([k, v]) =>
                    k === key ? [newName, v] : [k, v]
                  )
                );
                formik.setFieldValue('networking', newObj);
              }}
              style={{ minWidth: '40%', flex: 1, height: 40 }}
              InputProps={{
                style: { height: 40, boxSizing: 'border-box' },
                sx: { borderBottomRightRadius: 0, borderTopRightRadius: 0 },
              }}
            />
            <FMTextField
              formik={formik}
              name={`networking.${key}.port`}
              label="Port"
              value={value.port}
              style={{ minWidth: '5rem', flex: 1, height: 40 }}
              InputProps={{
                sx: {
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                  borderTopRightRadius: 0,
                },
              }}
            />
            <FMSelect
              formik={formik}
              name={`networking.${key}.protocol`}
              label="Protocol"
              labelId={`networking-protocol-${i}`}
              value={value.protocol}
              style={{
                minWidth: '8rem',
                flex: 1,
                height: 40,
                display: 'flex',
                alignItems: 'center',
              }}
              SelectProps={{
                style: { height: 40, boxSizing: 'border-box' },
                sx: {
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                  borderTopRightRadius: 0,
                },
              }}
            >
              {protocolOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </FMSelect>
            <Button
              type="button"
              color="error"
              variant="outlined"
              onClick={() => {
                const updated = { ...formik.values.networking };
                delete updated[key];
                formik.setFieldValue('networking', updated);
              }}
              sx={{
                minWidth: 36,
                maxWidth: 36,
                borderLeft: 'none',
                height: 40,
                marginLeft: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Remove network"
            >
              <Icon name="trash" />
            </Button>
          </ButtonGroup>
        )
      )}
  </React.Fragment>
);

export const VolumeMountsSection = ({ formik }: any) => (
  <React.Fragment>
    <div>
      <div
        style={{ display: 'flex', alignItems: 'center', marginBottom: '.5rem' }}
      >
        <Typography variant="subtitle1">Volume Mounts</Typography>
        <Button
          type="button"
          variant="outlined"
          size="small"
          style={{
            height: 30,
            fontSize: 11,
            marginLeft: 'auto',
            padding: '0px 8px',
          }}
          onClick={() => {
            let idx = 1;
            let nextKey = `volume${idx}`;
            const existing = Object.keys(formik.values.volume_mounts || {});
            while (existing.includes(nextKey)) {
              idx++;
              nextKey = `volume${idx}`;
            }
            formik.setFieldValue(`volume_mounts.${nextKey}`, {
              type: 'tapisvolume',
              mount_path: '/dir/to/mount/to',
              sub_path: '/dir/to/mount',
            });
          }}
        >
          + Volume Mount
        </Button>
      </div>
      {formik.values.volume_mounts &&
        Object.entries(formik.values.volume_mounts).length > 0 &&
        Object.entries(formik.values.volume_mounts).map(
          ([key, value]: [string, any], i) => (
            <div key={i} style={{ display: 'flex', marginBottom: '.5rem' }}>
              <div
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ display: 'flex' }}>
                  <FMTextField
                    formik={formik}
                    name={`volume_mounts.${key}.__name`}
                    label="Name"
                    value={key}
                    onChange={(e: any) => {
                      const newName = e.target.value;
                      if (!newName || newName === key) return;
                      if (formik.values.volume_mounts[newName]) return;
                      const oldObj = formik.values.volume_mounts;
                      const newObj = Object.fromEntries(
                        Object.entries(oldObj).map(([k, v]) =>
                          k === key ? [newName, v] : [k, v]
                        )
                      );
                      formik.setFieldValue('volume_mounts', newObj);
                    }}
                    InputProps={{
                      style: {
                        height: 40,
                        boxSizing: 'border-box',
                        borderRadius: 0,
                        borderTopLeftRadius: '6px',
                      },
                      sx: { borderRight: 'none', flex: 1 },
                    }}
                  />
                  <FMSelect
                    formik={formik}
                    name={`volume_mounts.${key}.type`}
                    label="Volume Type"
                    labelId={''}
                    value={value.type}
                    style={{
                      minWidth: '8rem',
                      flex: 1,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    SelectProps={{
                      style: { height: 40, boxSizing: 'border-box' },
                      sx: { borderRadius: 0 },
                    }}
                  >
                    <MenuItem disabled value={''}>
                      Select a volume type
                    </MenuItem>
                    {podVolumeTypes.map((v) => (
                      <MenuItem key={v} value={v}>
                        {v}
                      </MenuItem>
                    ))}
                  </FMSelect>
                </div>
                <div style={{ display: 'flex' }}>
                  <FMTextField
                    formik={formik}
                    name={`volume_mounts.${key}.mount_path`}
                    label="Mount Path"
                    value={value.mount_path}
                    InputProps={{
                      style: {
                        height: 40,
                        boxSizing: 'border-box',
                        borderRadius: 0,
                      },
                      sx: { flex: 1 },
                    }}
                    style={{ flex: 1 }}
                  />
                </div>
                <div style={{ display: 'flex' }}>
                  <FMTextField
                    formik={formik}
                    name={`volume_mounts.${key}.sub_path`}
                    label="Sub Path"
                    value={value.sub_path}
                    InputProps={{
                      style: { height: 40, boxSizing: 'border-box' },
                      sx: { borderRadius: 0, borderBottomLeftRadius: '6px' },
                    }}
                  />
                </div>
              </div>
              <Button
                type="button"
                color="error"
                variant="outlined"
                onClick={() => {
                  const newVol = { ...formik.values.volume_mounts };
                  delete newVol[key];
                  formik.setFieldValue('volume_mounts', newVol);
                }}
                sx={{
                  minWidth: 30,
                  maxWidth: 30,
                  height: '9rem',
                  marginLeft: 0,
                  alignSelf: 'stretch',
                  borderRadius: '6px',
                  borderLeft: '1px solid #ccc',
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  borderTopRightRadius: '5px',
                  borderBottomRightRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Remove volume mount"
              >
                <Icon name="trash" />
              </Button>
            </div>
          )
        )}
    </div>
  </React.Fragment>
);

export const ResourcesSection = ({ formik }: any) => (
  <React.Fragment>
    <div className={styles['grid-5']} style={{ marginTop: 16 }}>
      <FMTextField
        formik={formik}
        name="resources.cpu_limit"
        label="CPU Limit"
        value={formik.values.resources?.cpu_limit || ''}
        description={'millicpus'}
      />
      <FMTextField
        formik={formik}
        name="resources.cpu_request"
        label="CPU Request"
        value={formik.values.resources?.cpu_request || ''}
        description={'millicpus'}
      />
      <FMTextField
        formik={formik}
        name="resources.mem_limit"
        label="Memory Limit"
        value={formik.values.resources?.mem_limit || ''}
        description={'megabytes'}
      />
      <FMTextField
        formik={formik}
        name="resources.mem_request"
        label="Memory Request"
        value={formik.values.resources?.mem_request || ''}
        description={'megabytes'}
      />
      <FMTextField
        formik={formik}
        name="resources.gpus"
        label="GPUs"
        value={formik.values.resources?.gpus || ''}
        description={'integers'}
      />
    </div>
  </React.Fragment>
);

/**
 * Action buttons for PodWizard and PodWizardEdit (delete + submit)
 */
export const PodWizardActionButtons = ({
  isLoading,
  isDisabled,
  onDelete,
  onSubmit,
  submitLabel = 'Submit',
  deleteLabel = 'Delete',
  deleteTooltip = 'Delete',
  submitFormId,
}: {
  isLoading: boolean;
  isDisabled: boolean;
  onDelete: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  deleteLabel?: string;
  deleteTooltip?: string;
  submitFormId?: string;
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '.5rem',
      marginBottom: '.5rem',
    }}
  >
    <Tooltip title={deleteTooltip}>
      <span>
        <Button
          aria-label={deleteLabel}
          color="error"
          variant="outlined"
          disabled={isLoading || isDisabled}
          onClick={onDelete}
          sx={{ maxWidth: '2rem', minWidth: '2rem', height: 30, px: '.8rem' }}
        >
          <Icon name="trash" />
        </Button>
      </span>
    </Tooltip>
    <Button
      color="primary"
      disabled={isLoading || isDisabled}
      aria-label={submitLabel}
      form={submitFormId}
      type="submit"
      variant="outlined"
      sx={{ minWidth: 30, height: 30, px: '.8rem' }}
      onClick={onSubmit}
    >
      {submitLabel}
    </Button>
  </div>
);

/**
 * Utility to clear a PodWizard or PodWizardEdit form, including Formik state and Redux.
 * Usage: handleClearForm({ formik, dispatch, reset, reduxKey, clearedValues })
 */
export function handleClearForm({
  formik,
  dispatch,
  reset,
  reduxKey,
  clearedValues,
}: {
  formik: any;
  dispatch: any;
  reset?: () => void;
  reduxKey: string;
  clearedValues: any;
}) {
  dispatch(updateState({ [reduxKey]: '' })); // set to '' to clear touched, etc
  formik.resetForm({ values: clearedValues, touched: {}, errors: {} });
  if (reset) reset();
}

/**
 * Sort pods by pod_id alphabetically (case-insensitive, null-safe)
 */
export function sortPodsById<T extends { pod_id?: string }>(pods: T[]): T[] {
  return [...pods].sort((a, b) =>
    (a.pod_id || '').localeCompare(b.pod_id || '', undefined, {
      sensitivity: 'base',
    })
  );
}
