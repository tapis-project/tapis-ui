import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
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
  Switch,
  FormControlLabel,
  FormHelperText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import HubIcon from '@mui/icons-material/Hub';
import {
  Agent,
  AgentRecord,
  AgentDeploymentModality,
  AgentLiveness,
  Visibility,
  Protocol,
  MessageBinding,
  Endpoint,
  RestHttpAgentEndpoint,
  RpcAgentEndpoint,
  StdioAgentEndpoint,
  generateAgentUrn,
  getRecordInterfaces,
} from '../types/agent';
import { CURRENT_TENANT_ID } from '../data/mockData';
import { useListAgentRecords } from '../hooks/useListAgentRecords';
import { agentControlPlaneColors } from './uiTokens';

interface RegisterAgentDialogProps {
  open: boolean;
  onClose: () => void;
  onRegister: (agent: Agent) => void;
  availableRecords?: AgentRecord[];
  initialRecord?: AgentRecord | null;
}

interface FormEndpointItem {
  name: string;
  protocol: Protocol;
  message_binding?: MessageBinding | '';
  base_url?: string;
  has_probe?: boolean;
  route?: string;
  interval_seconds?: number;
  timeout_seconds?: number;
  missed_heartbeat_threshold?: number;
  initial_delay_seconds?: number;
}

interface RegisterAgentFormValues {
  selectedRecordId: string;
  name: string;
  owner: string;
  description: string;
  deploymentModality: AgentDeploymentModality;
  visibility: Visibility;
  tags: string[];
  endpoints: FormEndpointItem[];
}

const registerAgentSchema = yup.object().shape({
  selectedRecordId: yup.string().default(''),
  name: yup
    .string()
    .trim()
    .required('Agent instance name is required')
    .min(2, 'Name must be at least 2 characters'),
  owner: yup.string().trim().required('Owner / Responsible Team is required'),
  description: yup.string().default(''),
  deploymentModality: yup
    .mixed<AgentDeploymentModality>()
    .oneOf(Object.values(AgentDeploymentModality))
    .required('Deployment modality is required'),
  visibility: yup
    .mixed<Visibility>()
    .oneOf(Object.values(Visibility))
    .required('Visibility is required'),
  tags: yup
    .array()
    .of(yup.string().required())
    .test(
      'tags-required-if-no-blueprint',
      'Tags are required when registering an agent without a blueprint record',
      function (val) {
        const { selectedRecordId } = this.parent as RegisterAgentFormValues;
        if (!selectedRecordId) {
          return Boolean(val && val.length > 0);
        }
        return true;
      }
    )
    .default([]),
  endpoints: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().trim().required('Endpoint identifier is required'),
        protocol: yup
          .mixed<Protocol>()
          .oneOf(['RestHttp', 'Rpc', 'Stdio'])
          .required('Protocol is required'),
        message_binding: yup.string().optional(),
        base_url: yup.string().when('protocol', {
          is: (proto: Protocol) => proto !== 'Stdio',
          then: (schema) =>
            schema
              .trim()
              .required(
                'Base URL / Target Address is required for network protocols'
              ),
          otherwise: (schema) => schema.optional(),
        }),
        has_probe: yup.boolean().default(false),
        route: yup.string().when(['has_probe', 'protocol'], {
          is: (hasProbe: boolean, proto: Protocol) =>
            hasProbe && proto === 'RestHttp',
          then: (schema) =>
            schema
              .trim()
              .required('Health probe route is required (e.g. /healthz)'),
          otherwise: (schema) => schema.optional(),
        }),
        interval_seconds: yup.number().min(1, 'Min 1s').optional(),
        timeout_seconds: yup.number().min(1, 'Min 1s').optional(),
        missed_heartbeat_threshold: yup
          .number()
          .min(1, 'Min 1 threshold')
          .optional(),
        initial_delay_seconds: yup.number().min(0, 'Min 0s').optional(),
      })
    )
    .min(1, 'Agent must have at least one target endpoint')
    .test(
      'unique-endpoint-names',
      'All endpoint identifiers must be unique',
      (endpoints) => {
        if (!endpoints) return true;
        const names = endpoints
          .map((ep) => ep.name?.trim().toLowerCase())
          .filter(Boolean);
        const uniqueNames = new Set(names);
        return uniqueNames.size === names.length;
      }
    )
    .required(),
});

export const RegisterAgentDialog: React.FC<RegisterAgentDialogProps> = ({
  open,
  onClose,
  onRegister,
  availableRecords: propRecords,
  initialRecord,
}) => {
  const { records: hookRecords } = useListAgentRecords();
  const availableRecords = propRecords ?? hookRecords;
  const [tagsInput, setTagsInput] = useState('');

  const defaultEndpoints: FormEndpointItem[] = [
    {
      name: 'http-inbound',
      protocol: 'RestHttp',
      message_binding: MessageBinding.HttpJson,
      base_url: 'https://agent-node-01.mesh:8443',
      has_probe: true,
      route: '/healthz',
      interval_seconds: 15,
      timeout_seconds: 3,
      missed_heartbeat_threshold: 3,
      initial_delay_seconds: 10,
    },
  ];

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterAgentFormValues>({
    resolver: yupResolver(registerAgentSchema) as any,
    defaultValues: {
      selectedRecordId: '',
      name: '',
      owner: 'mlops-platform',
      description: '',
      deploymentModality: AgentDeploymentModality.Persistent,
      visibility: Visibility.Public,
      tags: ['autonomous', 'tier-1'],
      endpoints: defaultEndpoints,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'endpoints',
  });

  const currentTags = watch('tags') || [];
  const selectedRecordId = watch('selectedRecordId');

  useEffect(() => {
    if (!open) return;

    if (initialRecord) {
      const ifaces = getRecordInterfaces(initialRecord);
      const mappedEndpoints: FormEndpointItem[] =
        ifaces.length > 0
          ? ifaces.map((iface) => ({
              name: iface.name,
              protocol: iface.protocol,
              message_binding: iface.message_binding,
              base_url:
                iface.protocol !== 'Stdio'
                  ? `https://${initialRecord.name}.mesh:8443`
                  : '',
              has_probe: !!iface.liveness_probe_config,
              route: iface.liveness_probe_config?.route || '/healthz',
              interval_seconds:
                iface.liveness_probe_config?.interval_seconds || 15,
              timeout_seconds:
                iface.liveness_probe_config?.timeout_seconds || 3,
              missed_heartbeat_threshold:
                iface.liveness_probe_config?.missed_heartbeat_threshold || 3,
              initial_delay_seconds:
                iface.liveness_probe_config?.initial_delay_seconds || 10,
            }))
          : defaultEndpoints;

      reset({
        selectedRecordId: initialRecord.id,
        name: `${initialRecord.name}-prod-instance`,
        owner: initialRecord.owner,
        description: `Deployment instance of ${initialRecord.name} (v${initialRecord.version})`,
        deploymentModality: AgentDeploymentModality.Persistent,
        visibility: initialRecord.visibility,
        tags: [...initialRecord.tags, 'live-deployment'],
        endpoints: mappedEndpoints,
      });
    } else {
      reset({
        selectedRecordId: '',
        name: '',
        owner: 'mlops-platform',
        description: '',
        deploymentModality: AgentDeploymentModality.Persistent,
        visibility: Visibility.Public,
        tags: ['autonomous', 'tier-1'],
        endpoints: defaultEndpoints,
      });
    }
    setTagsInput('');
  }, [open, initialRecord, reset]);

  const handleSelectRecord = (recordId: string) => {
    setValue('selectedRecordId', recordId);
    if (!recordId) return;

    const record = availableRecords.find((r) => r.id === recordId);
    if (record) {
      setValue('name', `${record.name}-live-01`, { shouldValidate: true });
      setValue('owner', record.owner, { shouldValidate: true });
      setValue('description', record.description);
      setValue('tags', [...record.tags, 'instance'], { shouldValidate: true });
      setValue('visibility', record.visibility);

      const ifaces = getRecordInterfaces(record);
      const mappedEndpoints: FormEndpointItem[] =
        ifaces.length > 0
          ? ifaces.map((iface) => ({
              name: iface.name,
              protocol: iface.protocol,
              message_binding: iface.message_binding,
              base_url:
                iface.protocol !== 'Stdio'
                  ? `https://${record.name}.mesh:8443`
                  : '',
              has_probe: !!iface.liveness_probe_config,
              route: iface.liveness_probe_config?.route || '/healthz',
              interval_seconds:
                iface.liveness_probe_config?.interval_seconds || 15,
              timeout_seconds:
                iface.liveness_probe_config?.timeout_seconds || 3,
              missed_heartbeat_threshold:
                iface.liveness_probe_config?.missed_heartbeat_threshold || 3,
              initial_delay_seconds:
                iface.liveness_probe_config?.initial_delay_seconds || 10,
            }))
          : defaultEndpoints;

      setValue('endpoints', mappedEndpoints, { shouldValidate: true });
    }
  };

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

  const handleAddEndpoint = () => {
    append({
      name: `endpoint-${fields.length + 1}`,
      protocol: 'RestHttp',
      message_binding: MessageBinding.HttpJson,
      base_url: 'https://agent.nexus.mesh:8443',
      has_probe: false,
      route: '/healthz',
      interval_seconds: 15,
      timeout_seconds: 3,
      missed_heartbeat_threshold: 3,
      initial_delay_seconds: 10,
    });
  };

  const onFormSubmit = (data: RegisterAgentFormValues) => {
    const rest_http_endpoints: RestHttpAgentEndpoint[] = [];
    const rpc_endpoints: RpcAgentEndpoint[] = [];
    const stdio_endpoints: StdioAgentEndpoint[] = [];

    data.endpoints.forEach((ep) => {
      if (ep.protocol === 'RestHttp') {
        rest_http_endpoints.push({
          name: ep.name.trim() || undefined,
          base_url: ep.base_url?.trim() || undefined,
          message_binding: (ep.message_binding as MessageBinding) || undefined,
          liveness_probe:
            ep.has_probe && ep.route
              ? {
                  route: ep.route.trim(),
                  interval_seconds: Number(ep.interval_seconds) || 15,
                  timeout_seconds: Number(ep.timeout_seconds) || 3,
                  missed_heartbeat_threshold:
                    Number(ep.missed_heartbeat_threshold) || 3,
                  initial_delay_seconds: Number(ep.initial_delay_seconds) || 10,
                }
              : undefined,
        });
      } else if (ep.protocol === 'Rpc') {
        rpc_endpoints.push({
          name: ep.name.trim() || undefined,
          base_url: ep.base_url?.trim() || undefined,
          message_binding: (ep.message_binding as MessageBinding) || undefined,
        });
      } else {
        stdio_endpoints.push({
          name: ep.name.trim() || undefined,
          base_url: ep.base_url?.trim() || undefined,
          message_binding: (ep.message_binding as MessageBinding) || undefined,
        });
      }
    });

    const agentId = crypto.randomUUID();
    const platformEndpoints: Endpoint[] = data.endpoints.map((ep, idx) => {
      const targetName = ep.name.trim() || `endpoint-${idx + 1}`;
      const cleanSlug = `${data.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')}-${targetName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')}`;
      return {
        id: crypto.randomUUID(),
        slug: cleanSlug,
        target_name: targetName,
        target_base_url:
          ep.base_url?.trim() ||
          (ep.protocol === 'Stdio'
            ? 'stdio://process.pipe'
            : 'https://mesh.nexus.internal'),
        target_resource_urn: generateAgentUrn(CURRENT_TENANT_ID, agentId),
        tenant_id: CURRENT_TENANT_ID,
      };
    });

    const newAgent: Agent = {
      id: agentId,
      tenant_id: CURRENT_TENANT_ID,
      name: data.name.trim(),
      owner: data.owner.trim(),
      description: data.description.trim(),
      deployment_modality: data.deploymentModality,
      liveness: AgentLiveness.Alive,
      endpoints: platformEndpoints,
      rest_http_endpoints,
      rpc_endpoints,
      stdio_endpoints,
      tags: data.tags,
      visibility: data.visibility,
      created_at: new Date().toISOString(),
      last_modified: new Date().toISOString(),
      agent_record_id: data.selectedRecordId || null,
      consecutive_missed_heartbeats: 0,
      last_missed_heartbeat: null,
    };

    onRegister(newAgent);
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
            <HubIcon sx={{ color: 'primary.light' }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Register Live Agent Instance
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Deploys an autonomous runtime instance into tenant:{' '}
                {CURRENT_TENANT_ID}
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
          {errors.endpoints?.root?.message && (
            <Alert severity="error" sx={{ mb: 2.5 }}>
              {errors.endpoints.root.message}
            </Alert>
          )}
          {errors.tags?.message && (
            <Alert severity="warning" sx={{ mb: 2.5 }}>
              {errors.tags.message}
            </Alert>
          )}

          {/* Blueprint Record Selector */}
          <Box sx={{ mb: 3, pt: 0.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="blueprint-record-select-label">
                Base on Agent Record Blueprint (Optional)
              </InputLabel>
              <Select
                labelId="blueprint-record-select-label"
                value={selectedRecordId}
                label="Base on Agent Record Blueprint (Optional)"
                onChange={(e) => handleSelectRecord(e.target.value)}
              >
                <MenuItem value="">
                  <em>-- Custom Agent (No Blueprint) --</em>
                </MenuItem>
                {availableRecords.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name} (v{r.version}) - {r.owner}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="Agent Instance Name"
                    placeholder="e.g. rag-search-orchestrator-prod-02"
                    required
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="owner"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    label="Owner / Team"
                    placeholder="mlops-platform"
                    required
                    error={!!error}
                    helperText={error?.message}
                  />
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
                    label="Description & Purpose"
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="deploymentModality"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth size="small" error={!!error}>
                    <InputLabel id="modality-select-label">
                      Deployment Modality
                    </InputLabel>
                    <Select
                      {...field}
                      labelId="modality-select-label"
                      label="Deployment Modality"
                    >
                      <MenuItem value={AgentDeploymentModality.Persistent}>
                        Persistent (Always-on Daemon)
                      </MenuItem>
                      <MenuItem value={AgentDeploymentModality.OnDemand}>
                        OnDemand (Serverless / Ephemeral)
                      </MenuItem>
                    </Select>
                    {error && <FormHelperText>{error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="visibility"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth size="small" error={!!error}>
                    <InputLabel id="visibility-select-label">
                      Visibility
                    </InputLabel>
                    <Select
                      {...field}
                      labelId="visibility-select-label"
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
          </Grid>

          {/* Tags management */}
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
              TAGS {!selectedRecordId && '(Required for custom agents)'}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <TextField
                size="small"
                placeholder="Add tag (e.g. production, k8s, us-east-1)..."
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
            {errors.tags && (
              <Typography
                variant="caption"
                sx={{ color: 'error.main', mt: 0.5, display: 'block' }}
              >
                {errors.tags.message}
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 2.5 }} />

          {/* Target Endpoints Form List */}
          <Box>
            <Stack
              direction="row"
              sx={{
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1.5,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Target Endpoints & Message Bindings ({fields.length})
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddEndpoint}
                sx={{ fontSize: '0.75rem' }}
              >
                Add Endpoint
              </Button>
            </Stack>

            <Stack spacing={2}>
              {fields.map((field, idx) => {
                const endpointProtocol = watch(`endpoints.${idx}.protocol`);
                const hasProbe = watch(`endpoints.${idx}.has_probe`);

                return (
                  <Paper
                    key={field.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: 'rgba(255, 255, 255, 0.02)',
                      borderColor: errors.endpoints?.[idx]
                        ? 'error.main'
                        : 'rgba(255, 255, 255, 0.08)',
                      borderRadius: 2,
                    }}
                  >
                    <Stack
                      direction="row"
                      sx={{
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: 'primary.light' }}
                      >
                        ENDPOINT #{idx + 1}
                      </Typography>
                      {fields.length > 1 && (
                        <IconButton
                          size="small"
                          onClick={() => remove(idx)}
                          sx={{ color: 'error.light' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>

                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Controller
                          name={`endpoints.${idx}.name`}
                          control={control}
                          render={({
                            field: epNameField,
                            fieldState: { error },
                          }) => (
                            <TextField
                              {...epNameField}
                              fullWidth
                              size="small"
                              label="Endpoint Identifier"
                              placeholder="e.g. http-inbound"
                              required
                              error={!!error}
                              helperText={error?.message}
                            />
                          )}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Controller
                          name={`endpoints.${idx}.protocol`}
                          control={control}
                          render={({
                            field: protoField,
                            fieldState: { error },
                          }) => (
                            <FormControl fullWidth size="small" error={!!error}>
                              <InputLabel>Protocol</InputLabel>
                              <Select
                                {...protoField}
                                label="Protocol"
                                onChange={(e) => {
                                  protoField.onChange(e);
                                  if (e.target.value !== 'RestHttp') {
                                    setValue(
                                      `endpoints.${idx}.has_probe`,
                                      false
                                    );
                                  }
                                }}
                              >
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

                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Controller
                          name={`endpoints.${idx}.message_binding`}
                          control={control}
                          render={({ field: mbField }) => (
                            <FormControl fullWidth size="small">
                              <InputLabel>Message Binding</InputLabel>
                              <Select
                                {...mbField}
                                label="Message Binding"
                                value={mbField.value || ''}
                              >
                                <MenuItem value="">None / Raw</MenuItem>
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

                      {endpointProtocol !== 'Stdio' && (
                        <Grid size={{ xs: 12 }}>
                          <Controller
                            name={`endpoints.${idx}.base_url`}
                            control={control}
                            render={({
                              field: urlField,
                              fieldState: { error },
                            }) => (
                              <TextField
                                {...urlField}
                                fullWidth
                                size="small"
                                label="Base URL / Target Address"
                                placeholder="https://rag-agent.nexus.mesh:8443"
                                error={!!error}
                                helperText={error?.message}
                              />
                            )}
                          />
                        </Grid>
                      )}

                      {/* Liveness Probe Switch (RestHttp only) */}
                      {endpointProtocol === 'RestHttp' && (
                        <Grid size={{ xs: 12 }}>
                          <Controller
                            name={`endpoints.${idx}.has_probe`}
                            control={control}
                            render={({ field: probeSwitchField }) => (
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={Boolean(probeSwitchField.value)}
                                    onChange={(e) =>
                                      probeSwitchField.onChange(
                                        e.target.checked
                                      )
                                    }
                                    color="primary"
                                  />
                                }
                                label={
                                  <Typography
                                    variant="body2"
                                    sx={{ fontSize: '0.825rem' }}
                                  >
                                    Enable Automated Heartbeat Liveness Probe
                                  </Typography>
                                }
                              />
                            )}
                          />

                          {hasProbe && (
                            <Paper
                              variant="outlined"
                              sx={{
                                p: 1.5,
                                mt: 1,
                                bgcolor: agentControlPlaneColors.mutedSurface,
                                borderColor: 'rgba(255, 255, 255, 0.05)',
                              }}
                            >
                              <Grid container spacing={1}>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                  <Controller
                                    name={`endpoints.${idx}.route`}
                                    control={control}
                                    render={({
                                      field: routeField,
                                      fieldState: { error },
                                    }) => (
                                      <TextField
                                        {...routeField}
                                        fullWidth
                                        size="small"
                                        label="Route"
                                        placeholder="/healthz"
                                        error={!!error}
                                        helperText={error?.message}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                  <Controller
                                    name={`endpoints.${idx}.interval_seconds`}
                                    control={control}
                                    render={({
                                      field: intField,
                                      fieldState: { error },
                                    }) => (
                                      <TextField
                                        {...intField}
                                        fullWidth
                                        size="small"
                                        type="number"
                                        label="Interval (s)"
                                        onChange={(e) =>
                                          intField.onChange(
                                            Number(e.target.value)
                                          )
                                        }
                                        error={!!error}
                                        helperText={error?.message}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                  <Controller
                                    name={`endpoints.${idx}.missed_heartbeat_threshold`}
                                    control={control}
                                    render={({
                                      field: threshField,
                                      fieldState: { error },
                                    }) => (
                                      <TextField
                                        {...threshField}
                                        fullWidth
                                        size="small"
                                        type="number"
                                        label="Threshold"
                                        onChange={(e) =>
                                          threshField.onChange(
                                            Number(e.target.value)
                                          )
                                        }
                                        error={!!error}
                                        helperText={error?.message}
                                      />
                                    )}
                                  />
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                  <Controller
                                    name={`endpoints.${idx}.initial_delay_seconds`}
                                    control={control}
                                    render={({
                                      field: delayField,
                                      fieldState: { error },
                                    }) => (
                                      <TextField
                                        {...delayField}
                                        fullWidth
                                        size="small"
                                        type="number"
                                        label="Initial Delay (s)"
                                        onChange={(e) =>
                                          delayField.onChange(
                                            Number(e.target.value)
                                          )
                                        }
                                        error={!!error}
                                        helperText={error?.message}
                                      />
                                    )}
                                  />
                                </Grid>
                              </Grid>
                            </Paper>
                          )}
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                );
              })}
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
            Register & Launch Agent
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RegisterAgentDialog;
