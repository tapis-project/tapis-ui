import { PropsWithChildren, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  Chip,
  Alert,
  AlertTitle,
  IconButton,
  Divider,
  Stack,
  InputAdornment,
} from '@mui/material';
import { MLHub as Hooks, useTapisConfig } from '@tapis/tapisui-hooks';
import * as Models from '@mlhub/models-ts-sdk';
import * as Deployments from '@mlhub/deployments-ts-sdk';
import { getPlatformConfig } from '../enums';
import {
  useForm,
  Controller,
  useWatch,
  useFieldArray,
  FieldErrors,
  Control,
} from 'react-hook-form';
import { Undo, Visibility, VisibilityOff } from '@mui/icons-material';
import * as yup from 'yup';

interface DeploymentDialogProps {
  model?: Models.ModelMetadata;
  strat?: Deployments.Strategy;
  open: boolean;
  onClose: () => void;
  author: string;
}

const stratId = (strat: Models.DeploymentStrategyReference) => {
  return strat.platform + ':' + strat.name;
};

const refFromStratId = (stratId: string) => {
  return stratId.split(':');
};

type DeploymentType = 'live' | 'experimental';

export default function DeploymentDialog({
  open,
  onClose,
  author,
  model = undefined,
  strat = undefined,
}: DeploymentDialogProps) {
  const { mlHubBasePath } = useTapisConfig();

  // Models hooks
  const { data: modelsData } = Hooks.Models.useListByAuthor({ author });
  const models = modelsData?.result ?? [];

  // Deployments hooks
  const { data: strategiesData, error: strategiesError } =
    Hooks.Deployments.Strategies.useList();
  const strats = strategiesData?.result ?? [];

  const {
    deploy,
    isLoading,
    error: deploymentError,
  } = Hooks.Deployments.useDeployWithStrategy();

  type FormInput = {
    name: string;
    description: string | null;
    model: Models.ModelMetadata | null;
    strategy: Deployments.Strategy | null;
    deploymentType: DeploymentType | null;
    parameters: Deployments.Parameter[];
  };

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    resetField,
  } = useForm<FormInput>({
    defaultValues: {
      model: model ?? null,
      strategy: strat ?? null,
      deploymentType: null,
      parameters: [],
    },
    mode: 'onChange',
  });

  // Field array to manage the dynamic parameter list
  const { fields: parameterFields, replace: replaceParameterFields } =
    useFieldArray({
      control,
      name: 'parameters',
    });

  // useWatch monitors specific fields in real-time without re-rendering the whole form
  const name = useWatch({ control, name: 'name' });
  const description = useWatch({ control, name: 'description' });
  const selectedModel = useWatch({ control, name: 'model' });
  const selectedDeploymentStrategy = useWatch({ control, name: 'strategy' });
  const selectedDeploymentType = useWatch({ control, name: 'deploymentType' });

  const validationSchema = yup.object({
    name: yup.string().min(1).required('Deployment name is required'),
    description: yup
      .string()
      .max(200, 'Description cannot exceed 200 characters'),
    model: yup
      .mixed<Models.ModelMetadata>()
      .nullable()
      .required('Must select a model'),
    strategy: yup
      .mixed<Deployments.Strategy>()
      .nullable()
      .required('Please select a rollout strategy'),
    deploymentType: yup
      .mixed<DeploymentType>()
      .nullable()
      .required('Deployment type is required'),
    parameters: yup.array().of(
      yup.object({
        name: yup.string().required(),
        required: yup.boolean().required(),
        _default: yup
          .string()
          .nullable()
          .when('required', {
            is: true,
            then: (schema) => schema.required('This parameter is required'),
            otherwise: (schema) => schema.notRequired(),
          }),
      })
    ),
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleDeploy = (data: FormInput) => {
    console.log([data]);

    // deploy({
    //   modelAuthor: selectedModel?.author!,
    //   modelName: selectedModel?.name!,
    //   scope: Deployments.DeployModelWithStrategyScopeEnum.Tenant,
    //   platform: selectedDeploymentStrategy?.platform!,
    //   strategyName: selectedDeploymentStrategy?.name!,
    //   params: {},
    //   deployModelWithStrategyBody: {
    //     model_author: selectedModel?.author!,
    //     model_name: selectedModel?.name!,
    //     params: {},
    //   },
    // });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      onSubmit={handleSubmit(handleDeploy)}
      component="form"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ typography: 'h6' }}>Deploy Model</DialogTitle>

      {/** Render error if no depoyable models exist */}
      {models.length === 0 && (
        <DialogContent
          dividers
          sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2.5 }}
        >
          <Alert severity="warning">
            <AlertTitle>You have no models that we can deploy!</AlertTitle>
            Search the Model Marketplace for deployable models
          </Alert>
        </DialogContent>
      )}

      {/** Form */}
      {models.length > 0 && (
        <DialogContent
          dividers
          sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2.5 }}
        >
          {/** Summary */}
          {selectedModel && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Deployment Summary
              </Typography>
              {name && selectedModel && (
                <>
                  <SummaryItem
                    onClose={() => {
                      resetField('name');
                      resetField('description');
                      resetField('model');
                      resetField('strategy');
                      resetField('deploymentType');
                      resetField('parameters');
                    }}
                  >
                    <DetailsSummaryItem
                      name={name}
                      description={description ?? undefined}
                    />
                  </SummaryItem>
                  <SummaryItem
                    onClose={() => {
                      resetField('model');
                      resetField('strategy');
                      resetField('deploymentType');
                      resetField('parameters');
                    }}
                  >
                    <ModelMenuItem model={selectedModel} />
                  </SummaryItem>
                </>
              )}
              {selectedDeploymentStrategy && (
                <SummaryItem
                  onClose={() => {
                    resetField('strategy');
                    resetField('parameters');
                  }}
                >
                  <DeploymentStrategyMenuItem
                    strat={selectedDeploymentStrategy}
                  />
                </SummaryItem>
              )}
              {selectedDeploymentType && (
                <SummaryItem
                  onClose={() => {
                    resetField('deploymentType');
                  }}
                >
                  <DeploymentTypeMenuItem
                    deploymentType={selectedDeploymentType}
                  />
                </SummaryItem>
              )}
            </Box>
          )}

          {/* 1. Name field */}
          {!selectedModel && (
            <>
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    required
                    label="Deployment Name"
                    placeholder="e.g., My Llama Deployment - Live"
                    error={!!error}
                    helperText={
                      error
                        ? error.message
                        : 'Provide a name for this deployment.'
                    }
                    slotProps={{
                      input: {
                        sx: {
                          '& input:-webkit-autofill': {
                            WebkitBoxShadow:
                              '0 0 0 100px white inset !important', // Change 'white' to match your input background
                            WebkitTextFillColor: '#000000 !important', // Change to match your input text color
                          },
                        },
                      },
                    }}
                  />
                )}
              />

              {/* 2. Description field */}
              <Controller
                name="description"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={2}
                    maxRows={6}
                    label="Description"
                    placeholder="Describe the operational scope or purpose of this deployment..."
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </>
          )}

          {/** 3. Model select field */}
          {name && !selectedModel && (
            <Controller
              name="model"
              control={control}
              rules={{ required: 'Must select a model' }}
              render={({
                field: { value, onChange, onBlur, ...rest },
                fieldState: { error },
              }) => (
                <TextField
                  select
                  fullWidth
                  required
                  label="Select Model"
                  error={!!error}
                  helperText={error?.message}
                  onBlur={onBlur}
                  value={value?.name || ''}
                  onChange={(e) => {
                    const selectedName = e.target.value;
                    const modelObject =
                      models.find((m) => m.name === selectedName) || null;
                    onChange(modelObject);
                  }}
                >
                  {models.map((m) => (
                    <MenuItem
                      key={m.name}
                      value={m.name}
                      disabled={m.deployment_strategy_refs.length === 0}
                    >
                      <ModelMenuItem model={m} />
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          )}

          {/** 4. Deployment strategy select */}
          {selectedModel && !selectedDeploymentStrategy && (
            <Controller
              name="strategy"
              control={control}
              rules={{ required: 'Must select a deployment strategy' }}
              render={({
                field: { value, onChange, onBlur },
                fieldState: { error },
              }) => (
                <TextField
                  select
                  fullWidth
                  required
                  label="Choose deployment strategy"
                  error={!!error}
                  helperText={error?.message}
                  onBlur={onBlur}
                  value={value?.name || ''}
                  onChange={(e) => {
                    const stratId = e.target.value;
                    const stratRef = refFromStratId(stratId);
                    const stratObject =
                      strats.find(
                        (s) =>
                          s.platform === stratRef[0] && s.name === stratRef[1]
                      ) || null;

                    onChange(stratObject);

                    // Inject parameters into the field array immediately on strategy choice
                    if (stratObject && stratObject.parameters) {
                      const mappedParams = stratObject.parameters.map((p) => ({
                        ...p,
                        value: p._default || '', // Set baseline tracking input value
                      }));
                      replaceParameterFields(mappedParams);
                    } else {
                      replaceParameterFields([]);
                    }
                  }}
                >
                  {selectedModel.deployment_strategy_refs.map((r) => {
                    return (
                      <MenuItem
                        key={stratId(r)}
                        value={stratId(r)}
                        sx={{ borderBottom: '1px solid #CCCCCC' }}
                      >
                        <DeploymentStrategyMenuItem strat={r} />
                      </MenuItem>
                    );
                  })}
                </TextField>
              )}
            />
          )}

          {/** 5. Deployment type select */}
          {selectedDeploymentStrategy && !selectedDeploymentType && (
            <Controller
              name="deploymentType"
              control={control}
              rules={{ required: 'Must select a deployment strategy' }}
              render={({
                field: { value, onChange, onBlur },
                fieldState: { error },
              }) => (
                <TextField
                  label="Deployment Type"
                  value={value || ''}
                  select
                  helperText={error?.message}
                  error={!!error}
                  onChange={(e) => {
                    onChange(e.target.value);
                  }}
                  onBlur={onBlur}
                  required
                  fullWidth
                >
                  {['live', 'experimental'].map((t) => (
                    <MenuItem key="type-live" value={t}>
                      <DeploymentTypeMenuItem
                        deploymentType={t as DeploymentType}
                      />
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          )}

          {/** Parameters */}
          {selectedDeploymentType && (
            <Box sx={{ mt: 1 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1.5 }}
              >
                Parameters ({parameterFields.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack spacing={2.5}>
                {parameterFields.map((item, index) => {
                  const fieldError = errors.parameters?.[index]?._default;

                  return (
                    <Controller
                      key={item.id} // useFieldArray unique row identifier
                      name={`parameters.${index}._default`}
                      control={control}
                      render={({ field }) => {
                        // Dropdown select variant if choices list is populated
                        if (item.choices && item.choices.length > 0) {
                          return (
                            <TextField
                              {...field}
                              select
                              fullWidth
                              label={item.name}
                              required={item.required}
                              error={!!fieldError}
                              helperText={
                                fieldError
                                  ? fieldError.message
                                  : item.description
                              }
                            >
                              {item.choices.map((choice) => (
                                <MenuItem key={choice} value={choice}>
                                  {choice}
                                </MenuItem>
                              ))}
                            </TextField>
                          );
                        }

                        // Standard Input / Password entry variant
                        return (
                          <TextField
                            {...field}
                            fullWidth
                            label={item.name}
                            required={item.required}
                            error={!!fieldError}
                            type={!item.secret ? 'password' : 'text'}
                            helperText={
                              fieldError ? fieldError.message : item.description
                            }
                          />
                        );
                      }}
                    />
                  );
                })}
              </Stack>
            </Box>
          )}
        </DialogContent>
      )}
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button type="button" onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={!isDirty || !isValid}
        >
          🚀 Deploy
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const SummaryItem: React.FC<PropsWithChildren<{ onClose: () => void }>> = ({
  onClose,
  children,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        borderBottom: '1px solid #CCCCCC',
        p: '8px',
      }}
    >
      <>{children}</>
      <IconButton size="small" color="error" onClick={onClose}>
        <Undo fontSize="small" />
      </IconButton>
    </Box>
  );
};

const DeploymentTypeMenuItem = ({
  deploymentType,
}: {
  deploymentType: DeploymentType;
}) => {
  switch (deploymentType) {
    case 'live':
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            🔴
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Live
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Use this deployment type for non-experimental purposes
            </Typography>
          </Box>
        </Box>
      );
    case 'experimental':
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            🧪
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Experimental
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Pre-live testing
            </Typography>
          </Box>
        </Box>
      );
  }
};

const ModelMenuItem = ({ model }: { model: Models.ModelMetadata }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
        {model.deployment_strategy_refs.length === 0 ? '🚫' : '🤖'}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {model.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {model.author}
        </Typography>
      </Box>
    </Box>
  );
};

const DeploymentStrategyMenuItem = ({
  strat,
}: {
  strat: Deployments.Strategy | Models.DeploymentStrategyReference;
}) => {
  const cfg = getPlatformConfig(strat.platform);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      🚀
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          <Chip size="small" label={cfg.label} sx={{ mr: '4px' }} />
          {strat.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {strat.description}
        </Typography>
      </Box>
    </Box>
  );
};

interface ParameterFieldProps {
  // item contains your full parameter schema plus our new live state value string
  item: Deployments.Parameter & { id: string; value: string };
  index: number;
  control: Control<any>;
  errors: FieldErrors<any>;
}

export function ParameterFieldRow({
  item,
  index,
  control,
  errors,
}: ParameterFieldProps) {
  const [showSecret, setShowSecret] = useState(false);

  const handleClickShowSecret = () => setShowSecret((prev) => !prev);
  const handleMouseDownSecret = (e: React.MouseEvent<HTMLButtonElement>) =>
    e.preventDefault();

  const fieldError = Array.isArray(errors.parameters)
    ? errors.parameters[index]?.value
    : undefined;

  return (
    <Controller
      name={`parameters.${index}.value`}
      control={control}
      render={({ field }) => {
        if (item.choices && item.choices.length > 0) {
          return (
            <TextField
              {...field}
              select
              fullWidth
              label={item.name}
              required={item.required}
              error={!!fieldError}
              helperText={fieldError ? fieldError.message : item.description}
            >
              {item.choices.map((choice) => (
                <MenuItem key={choice} value={choice}>
                  {choice}
                </MenuItem>
              ))}
            </TextField>
          );
        }

        return (
          <TextField
            {...field}
            fullWidth
            label={item.name}
            required={item.required}
            error={!!fieldError}
            helperText={fieldError ? fieldError.message : item.description}
            type={item.secret && !showSecret ? 'password' : 'text'}
            slotProps={{
              input: {
                endAdornment: item.secret ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showSecret ? `hide ${item.name}` : `show ${item.name}`
                      }
                      onClick={handleClickShowSecret}
                      onMouseDown={handleMouseDownSecret}
                      edge="end"
                    >
                      {showSecret ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
          />
        );
      }}
    />
  );
}

const DetailsSummaryItem: React.FC<{ name: string; description?: string }> = ({
  name,
  description,
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      📖
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      </Box>
    </Box>
  );
};
