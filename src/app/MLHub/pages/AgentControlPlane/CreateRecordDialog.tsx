import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { types as mimeTypes } from 'mime-types';
import {
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Paper,
  Grid,
  Alert,
  Divider,
  FormControlLabel,
  Checkbox,
  FormHelperText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import {
  AgentRecord,
  AgentSkill,
  ArtifactLocator,
  AgentArtifactType,
  Visibility,
  Protocol,
  MessageBinding,
  RestHttpAgentInterface,
  RpcAgentInterface,
  StdioAgentInterface,
  isLowerKebabCase,
} from '../types/agent';
import { CURRENT_TENANT_ID } from '../data/mockData';

interface CreateRecordDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateRecord: (record: AgentRecord) => void;
}

interface FormInterfaceItem {
  name: string;
  description?: string;
  protocol: Protocol;
  message_binding?: MessageBinding | '';
  route?: string;
  interval_seconds?: number;
  timeout_seconds?: number;
  missed_heartbeat_threshold?: number;
  initial_delay_seconds?: number;
}

interface FormSkillItem {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  examples?: string[];
  inputModes?: string[];
  outputModes?: string[];
}

interface CreateRecordFormValues {
  name: string;
  version: string;
  owner: string;
  description: string;
  organization: string;
  providerUrl: string;
  documentationUrl: string;
  iconUrl: string;
  visibility: Visibility;
  streaming: boolean;
  pushNotifications: boolean;
  defaultInputModes: string[];
  defaultOutputModes: string[];
  tags: string[];
  artifacts: ArtifactLocator[];
  skills: FormSkillItem[];
  interfaces: FormInterfaceItem[];
}

const semverRegex = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;

const preferredMimeTypes = ['text/plain', 'application/json'];
const mimeTypeOptions = [
  ...preferredMimeTypes,
  ...Array.from(new Set(Object.values(mimeTypes)))
    .filter((mimeType) => !preferredMimeTypes.includes(mimeType))
    .sort(),
];

const createRecordSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required('Blueprint name is required')
    .min(2, 'Name must be at least 2 characters'),
  version: yup
    .string()
    .trim()
    .required('Semantic version is required')
    .matches(semverRegex, 'Must follow SemVer format (e.g. 1.0.0, 2.1.0-beta)'),
  owner: yup.string().trim().required('Responsible owner/team is required'),
  description: yup.string().default(''),
  organization: yup.string().default('Nexus AI Labs'),
  providerUrl: yup.string().default('https://nexus.ai'),
  documentationUrl: yup.string().default(''),
  iconUrl: yup
    .string()
    .default('https://placehold.co/80x80/6366f1/ffffff?text=AI'),
  visibility: yup
    .mixed<Visibility>()
    .oneOf(Object.values(Visibility))
    .required('Visibility is required'),
  streaming: yup.boolean().default(true),
  pushNotifications: yup.boolean().default(false),
  defaultInputModes: yup
    .array()
    .of(yup.string().required())
    .min(1, 'Select at least one default input MIME type')
    .required(),
  defaultOutputModes: yup
    .array()
    .of(yup.string().required())
    .min(1, 'Select at least one default output MIME type')
    .required(),
  tags: yup
    .array()
    .of(yup.string().required())
    .default(['blueprint', 'production']),
  artifacts: yup
    .array()
    .of(
      yup.object().shape({
        artifact_type: yup
          .mixed<AgentArtifactType>()
          .oneOf(Object.values(AgentArtifactType))
          .required('Artifact type is required'),
        url: yup.string().trim().required('Artifact URI is required'),
      })
    )
    .default([]),
  skills: yup
    .array()
    .of(
      yup.object().shape({
        id: yup
          .string()
          .trim()
          .required('Skill ID is required')
          .test(
            'lower-kebab-case',
            'Skill ID must be lower-kebab-case (e.g. semantic-search)',
            (val) => (val ? isLowerKebabCase(val) : false)
          ),
        name: yup.string().trim().required('Skill name is required'),
        description: yup.string().default(''),
        tags: yup.array().of(yup.string().required()).default([]),
        examples: yup.array().of(yup.string().required()).default([]),
        inputModes: yup
          .array()
          .of(yup.string().required())
          .min(1, 'Select at least one input MIME type when modes are set')
          .optional(),
        outputModes: yup
          .array()
          .of(yup.string().required())
          .min(1, 'Select at least one output MIME type when modes are set')
          .optional(),
      })
    )
    .test('unique-skill-ids', 'All Skill IDs must be unique', (skills) => {
      if (!skills) return true;
      const ids = skills.map((s) => s.id?.trim().toLowerCase()).filter(Boolean);
      const uniqueIds = new Set(ids);
      return uniqueIds.size === ids.length;
    })
    .default([]),
  interfaces: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().trim().required('Interface name is required'),
        description: yup.string().default(''),
        protocol: yup
          .mixed<Protocol>()
          .oneOf(['RestHttp', 'Rpc', 'Stdio'])
          .required('Protocol is required'),
        message_binding: yup.string().optional(),
        route: yup.string().optional(),
        interval_seconds: yup.number().min(1).optional(),
        timeout_seconds: yup.number().min(1).optional(),
        missed_heartbeat_threshold: yup.number().min(1).optional(),
        initial_delay_seconds: yup.number().min(0).optional(),
      })
    )
    .min(1, 'Agent Record must define at least one interface')
    .test(
      'unique-interface-names',
      'All interface names must be unique',
      (interfaces) => {
        if (!interfaces) return true;
        const names = interfaces
          .map((i) => i.name?.trim().toLowerCase())
          .filter(Boolean);
        const uniqueNames = new Set(names);
        return uniqueNames.size === names.length;
      }
    )
    .required(),
});

export const CreateRecordDialog: React.FC<CreateRecordDialogProps> = ({
  open,
  onClose,
  onCreateRecord,
}) => {
  const [tagsInput, setTagsInput] = useState('');

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateRecordFormValues>({
    resolver: yupResolver(createRecordSchema) as any,
    defaultValues: {
      name: '',
      version: '1.0.0',
      owner: 'platform-engineering',
      description: '',
      organization: 'Nexus AI Labs',
      providerUrl: 'https://nexus.ai',
      documentationUrl: '',
      iconUrl: 'https://placehold.co/80x80/6366f1/ffffff?text=AI',
      visibility: Visibility.Public,
      streaming: true,
      pushNotifications: false,
      defaultInputModes: ['text/plain', 'application/json'],
      defaultOutputModes: ['application/json'],
      tags: ['blueprint', 'production'],
      artifacts: [
        {
          artifact_type: AgentArtifactType.DockerImage,
          url: 'ghcr.io/nexus-ai/custom-agent:1.0.0',
        },
      ],
      skills: [
        {
          id: 'task-reasoning',
          name: 'Task Reasoning & Execution',
          description:
            'Deconstructs user queries into actionable multi-step subtasks.',
          tags: ['reasoning', 'planning'],
          examples: [
            'Analyze quarterly financial ledger',
            'Synthesize research paper findings',
          ],
          inputModes: ['text/plain', 'application/json'],
          outputModes: ['text/plain'],
        },
      ],
      interfaces: [
        {
          name: 'http-inbound',
          description: 'Standard REST endpoint for invocation',
          protocol: 'RestHttp',
          message_binding: MessageBinding.HttpJson,
          route: '/healthz',
          interval_seconds: 15,
          timeout_seconds: 3,
          missed_heartbeat_threshold: 3,
          initial_delay_seconds: 10,
        },
      ],
    },
  });

  const {
    fields: artifactFields,
    append: appendArtifact,
    remove: removeArtifact,
  } = useFieldArray({
    control,
    name: 'artifacts',
  });

  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({
    control,
    name: 'skills',
  });

  const {
    fields: interfaceFields,
    append: appendInterface,
    remove: removeInterface,
  } = useFieldArray({
    control,
    name: 'interfaces',
  });

  const currentTags = watch('tags') || [];

  const handleAddTag = () => {
    const trimmed = tagsInput.trim().toLowerCase();
    if (trimmed && !currentTags.includes(trimmed)) {
      setValue('tags', [...currentTags, trimmed], { shouldValidate: true });
      setTagsInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      'tags',
      currentTags.filter((t) => t !== tagToRemove),
      { shouldValidate: true }
    );
  };

  const handleAddArtifactItem = () => {
    appendArtifact({
      artifact_type: AgentArtifactType.HelmChart,
      url: 'oci://registry.nexus.internal/charts/custom-agent-1.0.0.tgz',
    });
  };

  const handleAddSkillItem = () => {
    const nextIdx = skillFields.length + 1;
    appendSkill({
      id: `custom-skill-${nextIdx}`,
      name: `Custom Skill ${nextIdx}`,
      description: 'Performs specialized domain capability',
      tags: ['custom', 'v1'],
      examples: ['Example task trigger'],
    });
  };

  const handleAddInterfaceItem = () => {
    const nextIdx = interfaceFields.length + 1;
    appendInterface({
      name: `interface-${nextIdx}`,
      description: 'New agent communication interface',
      protocol: 'RestHttp',
      message_binding: MessageBinding.HttpJson,
      route: '/healthz',
      interval_seconds: 15,
      timeout_seconds: 3,
      missed_heartbeat_threshold: 3,
      initial_delay_seconds: 10,
    });
  };

  const onFormSubmit = (data: CreateRecordFormValues) => {
    const rest_http_interfaces: RestHttpAgentInterface[] = [];
    const rpc_interfaces: RpcAgentInterface[] = [];
    const stdio_interfaces: StdioAgentInterface[] = [];

    data.interfaces.forEach((iface) => {
      if (iface.protocol === 'RestHttp') {
        rest_http_interfaces.push({
          name: iface.name.trim(),
          description: iface.description?.trim() || undefined,
          message_binding:
            (iface.message_binding as MessageBinding) || undefined,
          liveness_probe_config: iface.route
            ? {
                route: iface.route.trim(),
                interval_seconds: Number(iface.interval_seconds) || 15,
                timeout_seconds: Number(iface.timeout_seconds) || 3,
                missed_heartbeat_threshold:
                  Number(iface.missed_heartbeat_threshold) || 3,
                initial_delay_seconds:
                  Number(iface.initial_delay_seconds) || 10,
              }
            : undefined,
        });
      } else if (iface.protocol === 'Rpc') {
        rpc_interfaces.push({
          name: iface.name.trim(),
          description: iface.description?.trim() || undefined,
          message_binding:
            (iface.message_binding as MessageBinding) || undefined,
        });
      } else {
        stdio_interfaces.push({
          name: iface.name.trim(),
          description: iface.description?.trim() || undefined,
          message_binding:
            (iface.message_binding as MessageBinding) || undefined,
        });
      }
    });

    const formattedSkills: AgentSkill[] = data.skills.map((s) => ({
      id: s.id.trim(),
      name: s.name.trim(),
      description: s.description?.trim() || '',
      tags: s.tags || [],
      examples: s.examples || [],
      ...(s.inputModes?.length ? { input_modes: s.inputModes } : {}),
      ...(s.outputModes?.length ? { output_modes: s.outputModes } : {}),
    }));

    const newRecord: AgentRecord = {
      id: crypto.randomUUID(),
      name: data.name.trim(),
      version: data.version.trim(),
      tenant_id: CURRENT_TENANT_ID,
      owner: data.owner.trim(),
      description: data.description.trim(),
      rest_http_interfaces,
      rpc_interfaces,
      stdio_interfaces,
      capabilities: {
        streaming: data.streaming,
        push_notifications: data.pushNotifications,
      },
      default_input_modes: data.defaultInputModes,
      default_output_modes: data.defaultOutputModes,
      provider: data.organization
        ? {
            organization: data.organization.trim(),
            url: data.providerUrl.trim(),
          }
        : undefined,
      artifact_locators: data.artifacts,
      skills: formattedSkills,
      tags: data.tags,
      icon_url: data.iconUrl || null,
      documentation_url: data.documentationUrl || null,
      visibility: data.visibility,
    };

    onCreateRecord(newRecord);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: 'background.paper',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'calc(100% - 64px)',
            overflow: 'hidden',
          },
        },
      }}
    >
      <form
        onSubmit={handleSubmit(onFormSubmit)}
        noValidate
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <DialogTitle
          sx={{ borderBottom: '1px solid', borderColor: 'divider', p: 2.5 }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <LibraryAddIcon sx={{ color: 'primary.light' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Create Agent Record Blueprint
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Define reusable catalog specification with skills, artifact
                locators & interfaces
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            p: 3,
            pt: '24px !important',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
          }}
        >
          {errors.interfaces?.root?.message && (
            <Alert severity="error" sx={{ mb: 2.5 }}>
              {errors.interfaces.root.message}
            </Alert>
          )}
          {errors.skills?.root?.message && (
            <Alert severity="error" sx={{ mb: 2.5 }}>
              {errors.skills.root.message}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mb: 2.5, pt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="Record Blueprint Name"
                    placeholder="e.g. data-analyst-agent"
                    required
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="version"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="Semantic Version"
                    placeholder="1.0.0"
                    required
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="owner"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="Owner / Responsible Team"
                    placeholder="platform-engineering"
                    required
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="visibility"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth size="small" error={!!error}>
                    <InputLabel id="record-visibility-label">
                      Visibility
                    </InputLabel>
                    <Select
                      {...field}
                      labelId="record-visibility-label"
                      label="Visibility"
                    >
                      <MenuItem value={Visibility.Public}>
                        Public (Tenant Wide)
                      </MenuItem>
                      <MenuItem value={Visibility.Private}>
                        Private (Restricted)
                      </MenuItem>
                    </Select>
                    {error && <FormHelperText>{error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="description"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={2}
                    size="small"
                    label="Blueprint Description & Role"
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="defaultInputModes"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    filterSelectedOptions
                    options={mimeTypeOptions}
                    value={field.value}
                    onChange={(_event, value) => field.onChange(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Default Input MIME Types"
                        required
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="defaultOutputModes"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    filterSelectedOptions
                    options={mimeTypeOptions}
                    value={field.value}
                    onChange={(_event, value) => field.onChange(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Default Output MIME Types"
                        required
                        error={!!error}
                        helperText={error?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            {/* Capabilities Switches */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="streaming"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value}
                        color="primary"
                      />
                    }
                    label="Supports Real-Time Token Streaming"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="pushNotifications"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value}
                        color="primary"
                      />
                    }
                    label="Supports Push Notifications & Webhooks"
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="organization"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="Provider Organization"
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="providerUrl"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="Provider Website URL"
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="documentationUrl"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="Documentation Link URL"
                    placeholder="https://docs.nexus.internal/agents/my-blueprint"
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>
          </Grid>

          {/* Tags */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                display: 'block',
                mb: 1,
              }}
            >
              BLUEPRINT TAGS
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <TextField
                size="small"
                placeholder="Add tag..."
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                sx={{ flex: 1 }}
              />
              <Button variant="outlined" onClick={handleAddTag} size="small">
                Add
              </Button>
            </Stack>
            <Stack
              direction="row"
              spacing={0.75}
              sx={{ flexWrap: 'wrap', gap: 0.5 }}
            >
              {currentTags.map((t) => (
                <Chip
                  key={t}
                  label={t}
                  onDelete={() => handleRemoveTag(t)}
                  size="small"
                />
              ))}
            </Stack>
          </Box>

          <Divider sx={{ my: 2.5 }} />

          {/* Artifact Locators */}
          <Box sx={{ mb: 3 }}>
            <Stack
              direction="row"
              sx={{
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Artifact Locators ({artifactFields.length})
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddArtifactItem}
                sx={{ fontSize: '0.75rem' }}
              >
                Add Artifact
              </Button>
            </Stack>

            <Stack spacing={1.5}>
              {artifactFields.map((field, idx) => (
                <Paper
                  key={field.id}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    bgcolor: 'rgba(255, 255, 255, 0.02)',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Controller
                        name={`artifacts.${idx}.artifact_type`}
                        control={control}
                        render={({
                          field: artTypeField,
                          fieldState: { error },
                        }) => (
                          <FormControl fullWidth size="small" error={!!error}>
                            <InputLabel>Artifact Type</InputLabel>
                            <Select {...artTypeField} label="Artifact Type">
                              <MenuItem value={AgentArtifactType.DockerImage}>
                                DockerImage
                              </MenuItem>
                              <MenuItem value={AgentArtifactType.HelmChart}>
                                HelmChart
                              </MenuItem>
                              <MenuItem value={AgentArtifactType.PythonPackage}>
                                PythonPackage
                              </MenuItem>
                              <MenuItem value={AgentArtifactType.Binary}>
                                Binary
                              </MenuItem>
                              <MenuItem value={AgentArtifactType.SourceCode}>
                                SourceCode
                              </MenuItem>
                              <MenuItem value={AgentArtifactType.Unspecified}>
                                Unspecified
                              </MenuItem>
                            </Select>
                            {error && (
                              <FormHelperText>{error.message}</FormHelperText>
                            )}
                          </FormControl>
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 10, sm: 7 }}>
                      <Controller
                        name={`artifacts.${idx}.url`}
                        control={control}
                        render={({
                          field: urlField,
                          fieldState: { error },
                        }) => (
                          <TextField
                            {...urlField}
                            fullWidth
                            size="small"
                            label="Artifact Locator URL / URI"
                            placeholder="ghcr.io/org/image:tag"
                            required
                            error={!!error}
                            helperText={error?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 2, sm: 1 }} sx={{ textAlign: 'right' }}>
                      <IconButton
                        size="small"
                        onClick={() => removeArtifact(idx)}
                        sx={{ color: 'error.light' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Stack>
          </Box>

          <Divider sx={{ my: 2.5 }} />

          {/* Skills Section */}
          <Box sx={{ mb: 3 }}>
            <Stack
              direction="row"
              sx={{
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Agent Skills & Classification ({skillFields.length})
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Skill IDs must be lower-kebab-case (e.g. "code-review",
                  "nl-to-sql")
                </Typography>
              </Box>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddSkillItem}
                sx={{ fontSize: '0.75rem' }}
              >
                Add Skill
              </Button>
            </Stack>

            <Stack spacing={2}>
              {skillFields.map((field, idx) => (
                <Paper
                  key={field.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.02)',
                    borderColor: errors.skills?.[idx]
                      ? 'error.main'
                      : 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, sm: 5 }}>
                      <Controller
                        name={`skills.${idx}.id`}
                        control={control}
                        render={({ field: idField, fieldState: { error } }) => (
                          <TextField
                            {...idField}
                            fullWidth
                            size="small"
                            label="Skill ID (lower-kebab-case)"
                            placeholder="semantic-search"
                            required
                            error={!!error}
                            helperText={error?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 10, sm: 6 }}>
                      <Controller
                        name={`skills.${idx}.name`}
                        control={control}
                        render={({
                          field: skillNameField,
                          fieldState: { error },
                        }) => (
                          <TextField
                            {...skillNameField}
                            fullWidth
                            size="small"
                            label="Human Skill Name"
                            placeholder="Semantic Vector Search"
                            required
                            error={!!error}
                            helperText={error?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 2, sm: 1 }} sx={{ textAlign: 'right' }}>
                      <IconButton
                        size="small"
                        onClick={() => removeSkill(idx)}
                        sx={{ color: 'error.light' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Controller
                        name={`skills.${idx}.description`}
                        control={control}
                        render={({ field: descField }) => (
                          <TextField
                            {...descField}
                            fullWidth
                            size="small"
                            label="Skill Description"
                            placeholder="Describe how the agent executes this skill"
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name={`skills.${idx}.inputModes`}
                        control={control}
                        render={({
                          field: modesField,
                          fieldState: { error },
                        }) => (
                          <Autocomplete
                            multiple
                            disableCloseOnSelect
                            filterSelectedOptions
                            options={mimeTypeOptions}
                            value={modesField.value ?? []}
                            onChange={(_event, value) =>
                              modesField.onChange(
                                value.length > 0 ? value : undefined
                              )
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                size="small"
                                label="Skill Input MIME Types"
                                error={!!error}
                                helperText={error?.message}
                              />
                            )}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name={`skills.${idx}.outputModes`}
                        control={control}
                        render={({
                          field: modesField,
                          fieldState: { error },
                        }) => (
                          <Autocomplete
                            multiple
                            disableCloseOnSelect
                            filterSelectedOptions
                            options={mimeTypeOptions}
                            value={modesField.value ?? []}
                            onChange={(_event, value) =>
                              modesField.onChange(
                                value.length > 0 ? value : undefined
                              )
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                size="small"
                                label="Skill Output MIME Types"
                                error={!!error}
                                helperText={error?.message}
                              />
                            )}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Stack>
          </Box>

          <Divider sx={{ my: 2.5 }} />

          {/* Interfaces */}
          <Box>
            <Stack
              direction="row"
              sx={{
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Blueprint Interfaces ({interfaceFields.length})
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddInterfaceItem}
                sx={{ fontSize: '0.75rem' }}
              >
                Add Interface
              </Button>
            </Stack>

            <Stack spacing={2}>
              {interfaceFields.map((field, idx) => (
                <Paper
                  key={field.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.02)',
                    borderColor: errors.interfaces?.[idx]
                      ? 'error.main'
                      : 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Controller
                        name={`interfaces.${idx}.name`}
                        control={control}
                        render={({
                          field: ifaceNameField,
                          fieldState: { error },
                        }) => (
                          <TextField
                            {...ifaceNameField}
                            fullWidth
                            size="small"
                            label="Interface Name"
                            placeholder="http-inbound"
                            required
                            error={!!error}
                            helperText={error?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Controller
                        name={`interfaces.${idx}.protocol`}
                        control={control}
                        render={({
                          field: protoField,
                          fieldState: { error },
                        }) => (
                          <FormControl fullWidth size="small" error={!!error}>
                            <InputLabel>Protocol</InputLabel>
                            <Select {...protoField} label="Protocol">
                              <MenuItem value="RestHttp">RestHttp</MenuItem>
                              <MenuItem value="Rpc">Rpc</MenuItem>
                              <MenuItem value="Stdio">Stdio</MenuItem>
                            </Select>
                            {error && (
                              <FormHelperText>{error.message}</FormHelperText>
                            )}
                          </FormControl>
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 10, sm: 3 }}>
                      <Controller
                        name={`interfaces.${idx}.message_binding`}
                        control={control}
                        render={({ field: mbField }) => (
                          <FormControl fullWidth size="small">
                            <InputLabel>Message Binding</InputLabel>
                            <Select
                              {...mbField}
                              label="Message Binding"
                              value={mbField.value || ''}
                            >
                              <MenuItem value="">None</MenuItem>
                              <MenuItem value={MessageBinding.HttpJson}>
                                HttpJson
                              </MenuItem>
                              <MenuItem value={MessageBinding.JsonRpc20}>
                                JsonRpc2_0
                              </MenuItem>
                              <MenuItem value={MessageBinding.Grpc}>
                                Grpc
                              </MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 2, sm: 1 }} sx={{ textAlign: 'right' }}>
                      {interfaceFields.length > 1 && (
                        <IconButton
                          size="small"
                          onClick={() => removeInterface(idx)}
                          sx={{ color: 'error.light' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Controller
                        name={`interfaces.${idx}.description`}
                        control={control}
                        render={({ field: descField }) => (
                          <TextField
                            {...descField}
                            fullWidth
                            size="small"
                            label="Interface Description"
                            placeholder="e.g. Standard REST endpoint for invocation"
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider' }}
        >
          <Button onClick={onClose} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{
              fontWeight: 600,
              px: 3,
            }}
          >
            Save Agent Record Blueprint
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateRecordDialog;
