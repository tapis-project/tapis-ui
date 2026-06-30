import * as React from 'react';
import {
  Box,
  Typography,
  Chip,
  Avatar,
  Tabs,
  Tab,
  Stack,
  Button,
  ButtonGroup,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
  Divider,
  Tooltip,
  SvgIcon,
  Popover,
  MenuItem,
  MenuList,
  useTheme,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Snackbar,
  Alert,
  useMediaQuery,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LanguageIcon from '@mui/icons-material/Language';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InfoIcon from '@mui/icons-material/Info';
import LabelIcon from '@mui/icons-material/Label';
import CodeIcon from '@mui/icons-material/Code';
import DeploymentStrategyIcon from '@mui/icons-material/SettingsInputComponent';
import TerminalIcon from '@mui/icons-material/Terminal';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MemoryIcon from '@mui/icons-material/Memory';
import SettingsIcon from '@mui/icons-material/Settings';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import ForkRightIcon from '@mui/icons-material/ForkRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PublicIcon from '@mui/icons-material/Public';
import VerifiedIcon from '@mui/icons-material/Verified';
import { ModelMetadata, Platform, Task } from '@mlhub/models-ts-sdk';
import { ClientStrategySet, Strategy } from '@mlhub/deployments-ts-sdk';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import * as Models from '@mlhub/models-ts-sdk';
import { QueryWrapper } from '@tapis/tapisui-common';

interface DeployFormData {
  allocation: string;
  system_id: string;
  jobParameterSet: string;
  backend: string;
  inference_server_config: Record<string, unknown>;
}

// // ─── Sample Data ─────────────────────────────────────────────────────

// const sampleModel: ModelMetadata = {
//   name: 'DeepSeek-R1',
//   author: 'mlhub',
//   tenant_id: '__GLOBAL__',
//   model_type: null,
//   libraries: ['transformers'],
//   image: null,
//   canonical: {
//     platform: Platform.HuggingFace,
//     model_id: 'deepseek-ai/DeepSeek-R1',
//     locator: {
//       url: 'https://huggingface.co/deepseek-ai/DeepSeek-R1',
//     },
//     author: 'deepseek-ai',
//     likes: 13387,
//     downloads: 5594383,
//     gated: false,
//     _private: false,
//     sha: '56d4cbbb4d29f4355bab4b9a39ccb717a14ad5ad',
//   },
//   keywords: [
//     'transformers',
//     'safetensors',
//     'deepseek_v3',
//     'text-generation',
//     'conversational',
//     'custom_code',
//     'arxiv:2501.12948',
//     'license:mit',
//     'eval-results',
//     'text-generation-inference',
//     'endpoints_compatible',
//     'fp8',
//     'region:us',
//   ],
//   annotations: {
//     deployment_strategies: [
//       {
//         platform: 'tapis-pods',
//         strategies: [
//           {
//             name: 'Pods',
//             description: 'Deploys a model as an HTTP server in Pods',
//             rule_sets: [
//               {
//                 name: 'FlexServerDeployerCompatible',
//                 rules: [
//                   {
//                     field_path: ['libraries'],
//                     operator: 'Contains',
//                     value: 'transformers',
//                   },
//                   {
//                     field_path: ['task_types'],
//                     operator: 'AnyIn',
//                     value: ['TextGeneration'],
//                   },
//                 ],
//               },
//               {
//                 name: 'VisiblePublic',
//                 rules: [
//                   {
//                     field_path: ['canonical', 'gated'],
//                     operator: 'Eq',
//                     value: false,
//                   },
//                   {
//                     field_path: ['canonical', 'private'],
//                     operator: 'Eq',
//                     value: false,
//                   },
//                 ],
//               },
//             ],
//             parameter_set: {
//               name: 'Pods',
//               parameters: [
//                 { name: 'X-Tapis-Token' },
//                 { name: 'backend' },
//                 { name: 'uid' },
//                 { name: 'modelId' },
//               ],
//             },
//           },
//         ],
//       },
//       {
//         platform: 'tapis-jobs',
//         strategies: [
//           {
//             name: 'Stampede3',
//             description:
//               'Deploys a model as a Slurm job on the Stampede3 HPC System at TACC',
//             rule_sets: [
//               {
//                 name: 'FlexServerDeployerCompatible',
//                 rules: [
//                   {
//                     field_path: ['libraries'],
//                     operator: 'Contains',
//                     value: 'transformers',
//                   },
//                   {
//                     field_path: ['task_types'],
//                     operator: 'AnyIn',
//                     value: ['TextGeneration'],
//                   },
//                 ],
//               },
//               {
//                 name: 'VisiblePublic',
//                 rules: [
//                   {
//                     field_path: ['canonical', 'gated'],
//                     operator: 'Eq',
//                     value: false,
//                   },
//                   {
//                     field_path: ['canonical', 'private'],
//                     operator: 'Eq',
//                     value: false,
//                   },
//                 ],
//               },
//             ],
//             parameter_set: {
//               name: 'TapisJobs',
//               parameters: [
//                 { name: 'X-Tapis-Token' },
//                 { name: 'allocation' },
//                 { name: 'system_id' },
//                 { name: 'jobParameterSet' },
//                 { name: 'backend' },
//                 { name: 'inference_server_config' },
//               ],
//             },
//           },
//           {
//             name: 'Frontera',
//             description:
//               'Deploys a model as a Slurm job on the Frontera HPC System at TACC',
//             rule_sets: [
//               {
//                 name: 'FlexServerDeployerCompatible',
//                 rules: [
//                   {
//                     field_path: ['libraries'],
//                     operator: 'Contains',
//                     value: 'transformers',
//                   },
//                   {
//                     field_path: ['task_types'],
//                     operator: 'AnyIn',
//                     value: ['TextGeneration'],
//                   },
//                 ],
//               },
//               {
//                 name: 'VisiblePublic',
//                 rules: [
//                   {
//                     field_path: ['canonical', 'gated'],
//                     operator: 'Eq',
//                     value: false,
//                   },
//                   {
//                     field_path: ['canonical', 'private'],
//                     operator: 'Eq',
//                     value: false,
//                   },
//                 ],
//               },
//             ],
//             parameter_set: {
//               name: 'TapisJobs',
//               parameters: [
//                 { name: 'X-Tapis-Token' },
//                 { name: 'allocation' },
//                 { name: 'system_id' },
//                 { name: 'jobParameterSet' },
//                 { name: 'backend' },
//                 { name: 'inference_server_config' },
//               ],
//             },
//           },
//           {
//             name: 'LoneStar6',
//             description:
//               'Deploys a model as a Slurm job on the LoneStar6 HPC System at TACC',
//             rule_sets: [
//               {
//                 name: 'FlexServerDeployerCompatible',
//                 rules: [
//                   {
//                     field_path: ['libraries'],
//                     operator: 'Contains',
//                     value: 'transformers',
//                   },
//                   {
//                     field_path: ['task_types'],
//                     operator: 'AnyIn',
//                     value: ['TextGeneration'],
//                   },
//                 ],
//               },
//               {
//                 name: 'VisiblePublic',
//                 rules: [
//                   {
//                     field_path: ['canonical', 'gated'],
//                     operator: 'Eq',
//                     value: false,
//                   },
//                   {
//                     field_path: ['canonical', 'private'],
//                     operator: 'Eq',
//                     value: false,
//                   },
//                 ],
//               },
//             ],
//             parameter_set: {
//               name: 'TapisJobs',
//               parameters: [
//                 { name: 'X-Tapis-Token' },
//                 { name: 'allocation' },
//                 { name: 'system_id' },
//                 { name: 'jobParameterSet' },
//                 { name: 'backend' },
//                 { name: 'inference_server_config' },
//               ],
//             },
//           },
//           {
//             name: 'Vista',
//             description:
//               'Deploys a model as a Slurm job on the Vista HPC System at TACC',
//             rule_sets: [
//               {
//                 name: 'FlexServerDeployerCompatible',
//                 rules: [
//                   {
//                     field_path: ['libraries'],
//                     operator: 'Contains',
//                     value: 'transformers',
//                   },
//                   {
//                     field_path: ['task_types'],
//                     operator: 'AnyIn',
//                     value: ['TextGeneration'],
//                   },
//                 ],
//               },
//               {
//                 name: 'VisiblePublic',
//                 rules: [
//                   {
//                     field_path: ['canonical', 'gated'],
//                     operator: 'Eq',
//                     value: false,
//                   },
//                   {
//                     field_path: ['canonical', 'private'],
//                     operator: 'Eq',
//                     value: false,
//                   },
//                 ],
//               },
//             ],
//             parameter_set: {
//               name: 'TapisJobs',
//               parameters: [
//                 { name: 'X-Tapis-Token' },
//                 { name: 'allocation' },
//                 { name: 'system_id' },
//                 { name: 'jobParameterSet' },
//                 { name: 'backend' },
//                 { name: 'inference_server_config' },
//               ],
//             },
//           },
//           {
//             name: 'HPC w/ GPUs',
//             description: 'Deploys a model to a user defined system',
//             rule_sets: [
//               {
//                 name: 'FlexServerDeployerCompatible',
//                 rules: [
//                   {
//                     field_path: ['libraries'],
//                     operator: 'Contains',
//                     value: 'transformers',
//                   },
//                   {
//                     field_path: ['task_types'],
//                     operator: 'AnyIn',
//                     value: ['TextGeneration'],
//                   },
//                 ],
//               },
//               {
//                 name: 'VisiblePublic',
//                 rules: [
//                   {
//                     field_path: ['canonical', 'gated'],
//                     operator: 'Eq',
//                     value: false,
//                   },
//                   {
//                     field_path: ['canonical', 'private'],
//                     operator: 'Eq',
//                     value: false,
//                   },
//                 ],
//               },
//             ],
//             parameter_set: {
//               name: 'TapisJobs',
//               parameters: [
//                 { name: 'X-Tapis-Token' },
//                 { name: 'allocation' },
//                 { name: 'system_id' },
//                 { name: 'jobParameterSet' },
//                 { name: 'backend' },
//                 { name: 'inference_server_config' },
//               ],
//             },
//           },
//         ],
//       },
//     ],
//   },
//   multi_modal: null,
//   model_inputs: [],
//   model_outputs: [],
//   task_types: [Task.TextGeneration],
//   inference_precision: null,
//   inference_hardware: undefined,
//   inference_software_dependencies: null,
//   inference_max_energy_consumption_watts: null,
//   inference_max_latency_ms: null,
//   inference_min_throughput: null,
//   inference_max_compute_utilization_percentage: null,
//   inference_max_memory_usage_mb: null,
//   inference_distributed: null,
//   training_time: null,
//   training_precision: null,
//   training_hardware: undefined,
//   pretraining_datasets: null,
//   finetuning_datasets: null,
//   edge_optimized: null,
//   quantization_aware: null,
//   supports_quantization: null,
//   pretrained: null,
//   pruned: null,
//   slimmed: null,
//   training_distributed: null,
//   training_max_energy_consumption_watts: null,
//   regulatory: null,
//   license: 'mit',
//   bias_evaluation_score: null,
// };

// ─── Helpers ─────────────────────────────────────────────────────────

function getPlatformName(platform: string): string {
  if (!platform) return 'Unknown';
  const nameMap: Record<string, string> = {
    'hugging-face': 'Hugging Face',
    'pytorch-hub': 'PyTorch Hub',
    'tensorflow-hub': 'TensorFlow Hub',
  };
  return (
    nameMap[platform] ||
    platform
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  );
}

function formatNumber(n: string | number): string {
  const val = typeof n === 'string' ? parseInt(n) : n;
  if (typeof val !== 'number' || isNaN(val)) return '0';
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}B`;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
  return val.toString();
}

function getInitials(name: string): string {
  return name
    .split(/[\s_-]+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getPlatformIcon(platform: string): string {
  const iconMap: Record<string, string> = {
    'hugging-face': '🤗',
    'pytorch-hub': '📦',
    'tensorflow-hub': '🧠',
  };
  return iconMap[platform] || '📄';
}

function getLicenseColor(license: string): [string, string] {
  const colors: Record<string, [string, string]> = {
    mit: ['#059669', '#d1fae5'],
    'apache-2.0': ['#2563eb', '#dbeafe'],
    'cc-by-4.0': ['#7c3aed', '#ede9fe'],
    'gpl-3.0': ['#ea580c', '#ffedd5'],
  };
  return colors[license?.toLowerCase()] || ['#374151', '#f3f4f6'];
}

// ─── Sub-components ──────────────────────────────────────────────────

function TabPanel({
  children,
  value,
  index,
}: {
  children: React.ReactNode;
  value: number;
  index: number;
}) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`model-tabpanel-${index}`}
      aria-labelledby={`model-tab-${index}`}
      sx={{ width: '100%', p: 3 }}
    >
      {value === index && <Box sx={{ width: '100%' }}>{children}</Box>}
    </Box>
  );
}

function MetricCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1.25,
        borderRadius: '4px',
        backgroundColor:
          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#fafafa',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ color: 'text.secondary', flexShrink: 0 }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.875rem' }}
        >
          {value}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {href ? (
            <Link
              href={href}
              target="_blank"
              underline="hover"
              sx={{ fontSize: '0.75rem' }}
            >
              {label}
            </Link>
          ) : (
            label
          )}
        </Typography>
      </Box>
    </Box>
  );
}

function SectionCard({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        borderRadius: '4px',
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor:
          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#fafafa',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.25,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontSize: '0.75rem',
            color: 'text.secondary',
          }}
        >
          {title}
        </Typography>
        {action}
      </Box>
      <Box sx={{ p: 2 }}>{children}</Box>
    </Box>
  );
}

function MetadataTable({
  rows,
}: {
  rows: { label: string; value: string | React.ReactNode }[];
}) {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      {rows.map((row, i) => (
        <Box
          key={row.label}
          sx={{
            display: 'flex',
            py: 0.85,
            px: 2,
            borderBottom: i < rows.length - 1 ? '1px solid' : 'none',
            borderColor: 'divider',
            backgroundColor: i % 2 === 0 ? 'transparent' : 'action.hover',
          }}
        >
          <Box sx={{ width: 200, flexShrink: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: 'text.secondary',
                fontSize: '0.8125rem',
              }}
            >
              {row.label}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{ color: 'text.primary', fontSize: '0.8125rem' }}
            >
              {row.value}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

// ─── Fork Popover (GitHub-style button group) ─────────────────────────

interface ForkPopoverProps {
  onFork: () => void;
  onForkAndIngest: () => void;
  size?: 'small' | 'medium';
}

function ForkPopover({ onFork, onForkAndIngest, size }: ForkPopoverProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
  const open = Boolean(anchorEl);
  const popoverId = open
    ? 'fork-popover-' + Math.random().toString(36).slice(2)
    : undefined;
  const btnSize = size ?? 'small';

  return (
    <>
      <Tooltip title="Fork with options">
        <Button
          variant="outlined"
          size={btnSize}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          endIcon={
            <ArrowDropDownIcon
              fontSize={btnSize === 'small' ? 'small' : 'medium'}
            />
          }
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            fontSize: btnSize === 'small' ? '0.8rem' : '0.8125rem',
            pr: 0.75,
            pl: 2,
            height: 28,
            borderRadius: btnSize === 'small' ? '4px' : '6px',
            borderColor: '#e5e7eb',
            color: 'text.primary',
            backgroundColor: '#fafafa',
            '&:hover': {
              backgroundColor: '#f0f0f0',
              borderColor: '#d1d5db',
            },
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.6,
          }}
        >
          <ForkRightIcon
            fontSize={btnSize === 'small' ? 'small' : 'medium'}
            sx={{
              color: '#9ca3af',
              mr: 0.25,
              flexShrink: 0,
            }}
          />
          Fork
        </Button>
      </Tooltip>

      {/* Popover menu */}
      <Popover
        id={popoverId}
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        PaperProps={{
          sx: {
            minWidth: 220,
            mt: 0.5,
            boxShadow: 6,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <MenuList
          sx={{
            py: 0.5,
            p: 0.25,
            gap: 0,
          }}
        >
          <MenuItem
            onClick={() => {
              onFork();
              setAnchorEl(null);
            }}
            sx={{ fontWeight: 600, fontSize: '0.8125rem', py: 1, gap: 1 }}
          >
            <ForkRightIcon fontSize="small" />
            Fork
          </MenuItem>
          <MenuItem
            onClick={() => {
              onForkAndIngest();
              setAnchorEl(null);
            }}
            sx={{ fontWeight: 600, fontSize: '0.8125rem', py: 1, gap: 1 }}
          >
            <ForkRightIcon fontSize="small" />
            Fork and Deploy
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}

// ─── Deployment Dialog ───────────────────────────────────────────────

function DeployDialog({
  open,
  onClose,
  model,
}: {
  open: boolean;
  onClose: () => void;
  model: ModelMetadata;
}) {
  const theme = useTheme();
  const [platformTab, setPlatformTab] = React.useState(0);
  const [selectedStrategy, setSelectedStrategy] = React.useState<string | null>(
    null
  );
  const [deploying, setDeploying] = React.useState(false);
  const [deployed, setDeployed] = React.useState(false);

  const clientStrategySets: Array<ClientStrategySet> =
    model.annotations?.deployment_strategies ?? [];
  const platforms = [...new Set(clientStrategySets.map((css) => css.platform))];
  const totalStrategies = clientStrategySets.reduce(
    (a, ps) => a + ps.strategies.length,
    0
  );

  const strategy = clientStrategySets[platformTab]?.strategies.find(
    (strat) => strat.name === selectedStrategy
  );

  const handleDeploy = async () => {
    // TODO
  };

  if (!strategy) return null;

  return (
    <Dialog
      open={open}
      onClose={!deploying ? onClose : undefined}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: '6px',
          minHeight: '480px',
        },
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CloudUploadIcon sx={{ color: 'primary.main' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Deploy {model.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {totalStrategies} deployment options available
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {/* Platform selector */}
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            display: 'block',
            mb: 1,
          }}
        >
          Platform
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 0.75,
            flexWrap: 'wrap',
            mb: 2,
          }}
        >
          {platforms.map((p, i) => (
            <Chip
              key={p}
              label={p}
              size="small"
              onClick={() => {
                setPlatformTab(i);
                setSelectedStrategy(null);
              }}
              variant={platformTab === i ? 'filled' : 'outlined'}
              sx={{
                borderRadius: '3px',
                fontSize: '0.7rem',
                fontWeight: platformTab === i ? 600 : 500,
                textTransform: 'none',
                height: 28,
              }}
            />
          ))}
        </Box>

        {/* Strategy list */}
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            display: 'block',
            mb: 1,
          }}
        >
          Strategy
        </Typography>
        <Box sx={{ mb: 2 }}>
          {clientStrategySets[platformTab]?.strategies.map((s) => (
            <Box
              key={s.name}
              onClick={() => setSelectedStrategy(s.name)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.25,
                pr: 2,
                borderRadius: '4px',
                border: '1px solid',
                borderColor:
                  selectedStrategy === s.name ? 'primary.main' : 'divider',
                backgroundColor:
                  selectedStrategy === s.name
                    ? theme.palette.mode === 'dark'
                      ? 'rgba(33,150,243,0.08)'
                      : 'rgba(33,150,243,0.04)'
                    : 'transparent',
                cursor: 'pointer',
                mb: 0.5,
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    fontSize: '0.8125rem',
                  }}
                >
                  {s.name}
                </Typography>
                {s.description && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.disabled',
                      fontSize: '0.6875rem',
                      display: 'block',
                      mt: 0.125,
                    }}
                  >
                    {s.description}
                  </Typography>
                )}
              </Box>
              <ChevronRightIcon
                sx={{
                  fontSize: 18,
                  color:
                    selectedStrategy === s.name
                      ? 'primary.main'
                      : 'text.disabled',
                  flexShrink: 0,
                }}
              />
            </Box>
          ))}
        </Box>

        {deployed && (
          <Box
            sx={{
              p: 2,
              borderRadius: '4px',
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? 'rgba(34,197,94,0.08)'
                  : '#f0fdf4',
              border: '1px solid',
              borderColor: '#bbf7d0',
            }}
          >
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}
            >
              <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 18 }} />
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: '#16a34a' }}
              >
                Deployment requested successfully
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Your model will be available shortly.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: '3px' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleDeploy}
          variant="contained"
          disabled={!selectedStrategy || deploying || deployed}
          startIcon={deploying ? null : <CloudUploadIcon />}
          sx={{
            borderRadius: '3px',
            fontWeight: 600,
            minWidth: 120,
            opacity: deploying ? 0.7 : 1,
          }}
        >
          {deploying ? 'Deploying...' : deployed ? 'Deployed' : 'Deploy'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Strategy Detail Dialog ──────────────────────────────────────────

const StrategyDetailDialog = ({
  open,
  onClose,
  strategy,
}: {
  open: boolean;
  onClose: () => void;
  strategy: Strategy;
}) => {
  if (!strategy) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: '6px' } }}
    >
      <DialogTitle sx={{ pb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <DeploymentStrategyIcon sx={{ color: 'primary.main' }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {strategy.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {strategy.description}
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        {/* Parameters */}
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            display: 'block',
            mb: 1,
          }}
        >
          Parameters
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 2.5 }}>
          {strategy.parameter_set!.parameters.map(
            (
              p // TODO Fix ! on .parameter_set
            ) => (
              <Chip
                key={p.name}
                label={p.name}
                size="small"
                sx={{
                  borderRadius: '3px',
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  backgroundColor: '#f1f5f9',
                }}
              />
            )
          )}
        </Box>

        {/* Rule Sets */}
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            display: 'block',
            mb: 1,
          }}
        >
          Rule Sets
        </Typography>
        {strategy.rule_sets.map((rhs) => (
          <Box key={rhs.name} sx={{ mb: 1.25 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                fontSize: '0.8125rem',
                color: 'text.primary',
                mb: 0.5,
              }}
            >
              {rhs.name}
            </Typography>
            {rhs.rules.map((rule, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  py: 0.5,
                  pl: 1.5,
                  borderLeft: '2px solid',
                  borderColor: 'divider',
                  fontFamily: 'monospace',
                  fontSize: '0.6875rem',
                  color: 'text.secondary',
                }}
              >
                <Typography
                  component="span"
                  sx={{ color: 'text.disabled', whiteSpace: 'nowrap' }}
                >
                  {rule.field_path.join('.')}
                </Typography>
                <Typography
                  component="span"
                  sx={{ color: 'primary.main', whiteSpace: 'nowrap' }}
                >
                  {rule.operator}
                </Typography>
                <Typography
                  component="span"
                  sx={{ color: 'success.main', whiteSpace: 'nowrap' }}
                >
                  {typeof rule.value === 'string'
                    ? rule.value
                    : `[${(rule.value as string[]).join(', ')}]`}
                </Typography>
              </Box>
            ))}
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  );
};

// ─── Main Component ──────────────────────────────────────────────────
type ModelDetailsProps = {
  model: Models.ModelMetadata;
  scope: 'global' | 'tenant';
};
const Model: React.FC<ModelDetailsProps> = ({ model, scope }) => {
  const [tabValue, setTabValue] = React.useState(0);
  const [deployDialogOpen, setDeployDialogOpen] = React.useState(false);
  const [openStrategiesDialog, setOpenStrategiesDialog] = React.useState(false);
  const [strategyDetailOpen, setStrategyDetailOpen] = React.useState(false);
  const [selectedStrategy, setSelectedStrategy] =
    React.useState<Strategy | null>(null);
  const [visibleKeywords, setVisibleKeywords] = React.useState(5);
  const [forkSnackbar, setForkSnackbar] = React.useState<{
    open: boolean;
    message: string;
  }>({ open: false, message: '' });
  const clientStrategySets: Array<ClientStrategySet> =
    model.annotations?.deployment_strategies || [];
  const platforms = clientStrategySets.map((ps) => ps.platform) ?? [];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <InfoIcon fontSize="small" /> },
    {
      id: 'deployment',
      label: 'Deployment',
      icon: <CloudUploadIcon fontSize="small" />,
    },
    { id: 'source', label: 'Source', icon: <LanguageIcon fontSize="small" /> },
    { id: 'keywords', label: 'Keywords', icon: <LabelIcon fontSize="small" /> },
    { id: 'metadata', label: 'Metadata', icon: <CodeIcon fontSize="small" /> },
  ];

  const keywords = model.keywords || [];
  const taskTypes = model.task_types || [];
  const libraries = model.libraries || [];
  const visibleKws = keywords.slice(0, visibleKeywords);
  const hiddenKws = keywords.slice(visibleKeywords);

  const sourceRows: { label: string; value: string | React.ReactNode }[] = [
    {
      label: 'Platform',
      value: model.canonical?.platform
        ? getPlatformName(model.canonical.platform)
        : 'N/A',
    },
    { label: 'Model ID', value: model.canonical?.model_id || 'N/A' },
    { label: 'Author', value: model.canonical?.author || 'N/A' },
    {
      label: 'SHA',
      value: model.canonical?.sha
        ? model.canonical.sha.slice(0, 12) + '...'
        : 'N/A',
    },
    {
      label: 'Gated',
      value: model.canonical?.gated ? (
        <Chip
          label="Gated"
          size="small"
          color="warning"
          variant="filled"
          sx={{ borderRadius: '3px', fontSize: '0.65rem', height: 22 }}
        />
      ) : (
        <Chip
          label="Open"
          size="small"
          color="success"
          variant="filled"
          sx={{ borderRadius: '3px', fontSize: '0.65rem', height: 22 }}
        />
      ),
    },
    { label: 'Private', value: model.canonical?._private ? 'Yes' : 'No' },
  ];

  const metadataRows: { label: string; value: string | React.ReactNode }[] = [
    { label: 'Model Type', value: model.model_type || 'N/A' },
    {
      label: 'Task Types',
      value: taskTypes.length > 0 ? taskTypes.join(', ') : 'N/A',
    },
    {
      label: 'Libraries',
      value: libraries.length > 0 ? libraries.join(', ') : 'N/A',
    },
    {
      label: 'License',
      value: model.license ? (
        <Chip
          label={model.license.toUpperCase()}
          size="small"
          sx={{
            borderRadius: '3px',
            fontSize: '0.65rem',
            height: 22,
            backgroundColor: getLicenseColor(model.license)[1],
            color: getLicenseColor(model.license)[0],
            fontWeight: 700,
          }}
        />
      ) : (
        'N/A'
      ),
    },
    { label: 'Inference Precision', value: model.inference_precision || 'N/A' },
    // { label: 'Inference Hardware', value: model.inference_hardware || 'N/A' },
    {
      label: 'Inference Max Latency (ms)',
      value:
        model.inference_max_latency_ms != null
          ? model.inference_max_latency_ms.toString()
          : 'N/A',
    },
    {
      label: 'Inference Max Memory (MB)',
      value:
        model.inference_max_memory_usage_mb != null
          ? model.inference_max_memory_usage_mb.toString()
          : 'N/A',
    },
    {
      label: 'Inference Max Energy (W)',
      value:
        model.inference_max_energy_consumption_watts != null
          ? model.inference_max_energy_consumption_watts.toString()
          : 'N/A',
    },
    {
      label: 'Inference Distributed',
      value: model.inference_distributed || 'N/A',
    },
    { label: 'Training Time', value: model.training_time || 'N/A' },
    { label: 'Training Precision', value: model.training_precision || 'N/A' },
    // { label: 'Training Hardware', value: model.training_hardware || 'N/A' },
    { label: 'Quantization Aware', value: model.quantization_aware || 'N/A' },
    { label: 'Pruned', value: model.pruned || 'N/A' },
    { label: 'Slimmed', value: model.slimmed || 'N/A' },
    {
      label: 'Bias Evaluation Score',
      value:
        model.bias_evaluation_score != null
          ? model.bias_evaluation_score.toString()
          : 'N/A',
    },
  ];

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#f5f5f7',
        }}
      >
        {/* ─── Page Header ─────────────────────────────────────── */}

        <Box
          sx={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid',
            borderColor: 'divider',
            px: 3,
          }}
        >
          <Box sx={{ maxWidth: 1120, mx: 'auto' }}>
            {/* Breadcrumb */}
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, py: 1.5 }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Models
              </Typography>
              <ChevronRightIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
              <Typography
                variant="caption"
                sx={{ fontWeight: 500, color: 'text.primary' }}
              >
                {model.name}
              </Typography>
            </Box>

            {/* Title bar */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                py: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                {/* Avatar */}
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '4px',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    color: '#2196f3',
                    fontWeight: 700,
                    fontSize: '1rem',
                    border: '1px solid',
                    borderColor: 'divider',
                    flexShrink: 0,
                  }}
                >
                  {getInitials(model.name!)}
                </Avatar>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      color: 'text.primary',
                      lineHeight: 1.3,
                      fontSize: '1.375rem',
                    }}
                  >
                    {model.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', mt: 0.25, fontWeight: 500 }}
                  >
                    by{' '}
                    <Typography
                      component="span"
                      sx={{ fontWeight: 600, color: 'text.primary' }}
                    >
                      {model.author}
                    </Typography>{' '}
                    · {taskTypes.join(', ')}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
                <ForkPopover
                  onFork={() =>
                    setForkSnackbar({
                      open: true,
                      message: `Forked ${model.name} to your workspace`,
                    })
                  }
                  onForkAndIngest={() =>
                    setForkSnackbar({
                      open: true,
                      message: `Forked and ingesting artifact for ${model.name}`,
                    })
                  }
                />
                <Tooltip title="Deploy this model">
                  <Button
                    variant="contained"
                    startIcon={<CloudUploadIcon fontSize="small" />}
                    onClick={() => setDeployDialogOpen(true)}
                    size="small"
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                      px: 2,
                      borderRadius: '4px',
                      backgroundColor: '#2563eb',
                      '&:hover': { backgroundColor: '#1d4ed8' },
                    }}
                  >
                    Deploy
                  </Button>
                </Tooltip>
                <Tooltip title="View all deployment strategies">
                  <IconButton
                    size="small"
                    onClick={() => setOpenStrategiesDialog(true)}
                    sx={{ color: 'text.secondary' }}
                  >
                    <SettingsIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share">
                  <IconButton size="small" sx={{ color: 'text.secondary' }}>
                    <ShareIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="More actions">
                  <IconButton size="small" sx={{ color: 'text.secondary' }}>
                    <MoreHorizIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* License + Keywords */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexWrap: 'wrap',
                pb: 1,
                pt: 0.5,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              {model.license && (
                <Chip
                  label={model.license.toUpperCase()}
                  size="small"
                  sx={{
                    borderRadius: '3px',
                    fontSize: '0.6rem',
                    height: 22,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    backgroundColor: getLicenseColor(model.license)[1],
                    color: getLicenseColor(model.license)[0],
                  }}
                />
              )}
              {libraries.map((lib) => (
                <Chip
                  key={lib}
                  label={lib}
                  size="small"
                  sx={{
                    borderRadius: '3px',
                    fontSize: '0.6rem',
                    height: 22,
                    backgroundColor: 'rgba(33,150,243,0.07)',
                    color: '#2563eb',
                    fontWeight: 600,
                  }}
                />
              ))}
              {visibleKws.map((kw) => (
                <Chip
                  key={kw}
                  label={kw}
                  size="small"
                  sx={{
                    borderRadius: '3px',
                    fontSize: '0.6rem',
                    height: 22,
                    backgroundColor: 'rgba(124,58,237,0.07)',
                    color: '#7c3aed',
                    fontWeight: 600,
                  }}
                />
              ))}
              {hiddenKws.length > 0 && (
                <Chip
                  label={`+${hiddenKws.length}`}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setVisibleKeywords((v) => v + 5);
                  }}
                  sx={{
                    borderRadius: '3px',
                    fontSize: '0.6rem',
                    height: 22,
                    fontWeight: 600,
                    backgroundColor: 'transparent',
                    color: 'text.disabled',
                    border: '1px dashed',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(124,58,237,0.08)',
                      borderColor: 'rgba(124,58,237,0.3)',
                      color: '#7c3aed',
                    },
                  }}
                />
              )}
            </Box>

            {/* Tab Navigation */}
            <Tabs
              value={tabValue}
              onChange={(_, v) => setTabValue(v)}
              indicatorColor="primary"
              textColor="inherit"
              sx={{
                minHeight: 38,
                '& .MuiTab-root': {
                  minHeight: 36,
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  px: 2.5,
                  py: 0.85,
                  color: 'text.secondary',
                  '&.Mui-selected': { color: 'text.primary', fontWeight: 700 },
                  '&:hover': { color: 'text.primary' },
                },
                '& .MuiTabs-indicator': { height: 2, borderRadius: 1 },
              }}
            >
              {tabs.map((tab, i) => (
                <Tab
                  key={tab.id}
                  label={tab.label}
                  sx={{ fontSize: '0.8125rem' }}
                />
              ))}
            </Tabs>
          </Box>
        </Box>

        {/* ─── Tab Content ─────────────────────────────────────── */}

        <Box sx={{ maxWidth: 1120, mx: 'auto', pb: 4 }}>
          <TabPanel value={tabValue} index={0}>
            {/* Overview Tab */}
            <Box
              sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}
            >
              {/* Model Info */}
              <SectionCard title="Model Info">
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '6px',
                        backgroundColor: 'rgba(33,150,243,0.1)',
                        color: '#2196f3',
                        fontWeight: 700,
                        fontSize: '1.25rem',
                        border: '2px solid',
                        borderColor: 'divider',
                      }}
                    >
                      {getInitials(model.name!)}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: 'text.primary',
                          fontSize: '1.125rem',
                        }}
                      >
                        {model.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary' }}
                      >
                        by {model.author}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        display: 'block',
                        mb: 0.75,
                      }}
                    >
                      Metrics
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.75,
                      }}
                    >
                      <MetricCard
                        icon={<DownloadIcon fontSize="small" />}
                        label="Downloads"
                        value={
                          model.canonical
                            ? `${formatNumber(model.canonical.downloads!)}`
                            : 'N/A'
                        }
                      />
                      <MetricCard
                        icon={<FavoriteIcon fontSize="small" />}
                        label="Likes"
                        value={
                          model.canonical
                            ? `${formatNumber(model.canonical.likes!)}`
                            : 'N/A'
                        }
                      />
                    </Box>
                  </Box>

                  <Divider />
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        display: 'block',
                        mb: 0.75,
                      }}
                    >
                      Model Details
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.6,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.8125rem',
                          }}
                        >
                          Task
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            fontSize: '0.8125rem',
                          }}
                        >
                          {taskTypes.join(', ') || 'N/A'}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.8125rem',
                          }}
                        >
                          Libraries
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            fontSize: '0.8125rem',
                          }}
                        >
                          {libraries.join(', ') || 'N/A'}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.8125rem',
                          }}
                        >
                          License
                        </Typography>
                        <Chip
                          label={
                            model.license ? model.license.toUpperCase() : 'N/A'
                          }
                          size="small"
                          sx={{
                            borderRadius: '3px',
                            fontSize: '0.6rem',
                            height: 22,
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            backgroundColor: getLicenseColor(model.license!)[1], // TODO Fix
                            color: getLicenseColor(model.license!)[0], // TODO Fix
                          }}
                        />
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.8125rem',
                          }}
                        >
                          Model SHA
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 600,
                            color: 'text.primary',
                            fontSize: '0.8125rem',
                          }}
                        >
                          {model.canonical?.sha
                            ? model.canonical.sha.slice(0, 12) + '…'
                            : 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </SectionCard>

              {/* Deployment Overview */}
              <SectionCard
                title="Deployment"
                action={
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setOpenStrategiesDialog(true)}
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    View Strategies →
                  </Button>
                }
              >
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}
                >
                  {platforms.map((p, pi) => {
                    const ps = clientStrategySets.find((x) => x.platform === p);
                    return (
                      <Box
                        key={p}
                        sx={{
                          p: 1.25,
                          borderRadius: '4px',
                          border: '1px solid',
                          borderColor: 'divider',
                          backgroundColor: 'background.paper',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 0.75,
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              color: 'primary.main',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              fontSize: '0.7rem',
                            }}
                          >
                            {p}
                          </Typography>
                          <Chip
                            label={`${ps?.strategies.length ?? 0}`}
                            size="small"
                            sx={{
                              borderRadius: '3px',
                              fontSize: '0.6rem',
                              fontWeight: 600,
                              height: 18,
                              backgroundColor: 'action.hover',
                              color: 'text.secondary',
                            }}
                          />
                        </Box>
                        {(ps?.strategies ?? []).slice(0, 3).map((s) => (
                          <Box
                            key={s.name}
                            onClick={() => {
                              setSelectedStrategy(s);
                              setStrategyDetailOpen(true);
                            }}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              py: 0.6,
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                              cursor: 'pointer',
                              '&:last-child': { borderBottom: 'none' },
                              '&:hover': {
                                backgroundColor: 'action.hover',
                                borderRadius: '3px',
                                px: 0.5,
                                mx: -0.5,
                              },
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  fontSize: '0.8125rem',
                                  color: 'text.primary',
                                }}
                              >
                                {s.name}
                              </Typography>
                              {s.description && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: 'text.disabled',
                                    fontSize: '0.6875rem',
                                    display: 'block',
                                  }}
                                >
                                  {s.description}
                                </Typography>
                              )}
                            </Box>
                            <ChevronRightIcon
                              sx={{ fontSize: 16, color: 'text.disabled' }}
                            />
                          </Box>
                        ))}
                        {(ps?.strategies?.length ?? 0) > 3 && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.disabled',
                              display: 'block',
                              mt: 0.5,
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                          >
                            +{(ps?.strategies?.length ?? 0) - 3} more strategies
                            →
                          </Typography>
                        )}
                      </Box>
                    );
                  })}

                  <Divider sx={{ my: 0.5 }} />
                  <Button
                    variant="contained"
                    onClick={() => setDeployDialogOpen(true)}
                    startIcon={<CloudUploadIcon fontSize="small" />}
                    size="small"
                    fullWidth
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: '4px',
                      py: 1,
                    }}
                  >
                    Deploy This Model
                  </Button>
                </Box>
              </SectionCard>

              {/* Key Features */}
              <SectionCard
                title="Keywords"
                action={
                  hiddenKws.length > 0 ? (
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => setVisibleKeywords((v) => v + 5)}
                      sx={{
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      Show All ({keywords.length})
                    </Button>
                  ) : null
                }
              >
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {visibleKws.map((kw) => (
                    <Chip
                      key={kw}
                      label={kw}
                      size="small"
                      sx={{
                        borderRadius: '3px',
                        fontSize: '0.6rem',
                        height: 22,
                        backgroundColor: 'rgba(124,58,237,0.07)',
                        color: '#7c3aed',
                        fontWeight: 600,
                      }}
                    />
                  ))}
                </Box>
              </SectionCard>

              {/* Libraries Used */}
              <SectionCard title="Libraries">
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {libraries.map((lib) => (
                    <Chip
                      key={lib}
                      label={lib}
                      size="small"
                      sx={{
                        borderRadius: '3px',
                        fontSize: '0.6rem',
                        height: 22,
                        backgroundColor: 'rgba(33,150,243,0.07)',
                        color: '#2563eb',
                        fontWeight: 600,
                      }}
                    />
                  ))}
                </Box>
              </SectionCard>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {/* Deployment Tab */}
            <SectionCard
              title="Available Deployment Strategies"
              action={
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => setDeployDialogOpen(true)}
                  startIcon={<CloudUploadIcon fontSize="small" />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '4px',
                    px: 2,
                  }}
                >
                  Deploy
                </Button>
              }
            >
              {platforms.length === 0 ? (
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', py: 3, textAlign: 'center' }}
                >
                  No deployment strategies available for this model.
                </Typography>
              ) : (
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
                >
                  {clientStrategySets.map((css) => (
                    <Box key={css.platform}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          color: 'primary.main',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          fontSize: '0.7rem',
                          mb: 1,
                        }}
                      >
                        {css.platform}
                        <Typography
                          component="span"
                          sx={{ fontWeight: 500, color: 'text.secondary' }}
                        >
                          {' '}
                          ({css.strategies.length}{' '}
                          {css.strategies.length === 1
                            ? 'strategy'
                            : 'strategies'}
                          )
                        </Typography>
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.5,
                        }}
                      >
                        {css.strategies.map((strat) => {
                          let parameterSet = strat.parameter_set;

                          return (
                            <Box
                              key={strat.name}
                              sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                p: 1.5,
                                borderRadius: '4px',
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                            >
                              <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    mb: 0.35,
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: 700,
                                      color: 'text.primary',
                                      fontSize: '0.875rem',
                                    }}
                                  >
                                    {strat.name}
                                  </Typography>
                                  <Typography
                                    component="span"
                                    sx={{
                                      fontSize: '0.65rem',
                                      fontWeight: 600,
                                      color: 'success.main',
                                      backgroundColor: 'rgba(22,163,74,0.1)',
                                      borderRadius: '3px',
                                      px: 0.5,
                                      py: 0.125,
                                    }}
                                  >
                                    {strat.rule_sets
                                      .map((r) => r.name)
                                      .join(' · ')}
                                  </Typography>
                                </Box>
                                {strat.description && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: 'text.secondary',
                                      fontSize: '0.75rem',
                                      display: 'block',
                                    }}
                                  >
                                    {strat.description}
                                  </Typography>
                                )}
                                {parameterSet && (
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      gap: 0.5,
                                      marginTop: 0.75,
                                      flexWrap: 'wrap',
                                    }}
                                  >
                                    {strat
                                      .parameter_set!.parameters.slice(0, 4)
                                      .map((p) => (
                                        <Chip
                                          key={p.name}
                                          label={p.name}
                                          size="small"
                                          sx={{
                                            borderRadius: '3px',
                                            fontSize: '0.6rem',
                                            height: 18,
                                            fontWeight: 500,
                                            backgroundColor: '#f8fafc',
                                            fontFamily: 'monospace',
                                          }}
                                        />
                                      ))}
                                  </Box>
                                )}
                              </Box>
                              <Box
                                sx={{
                                  display: 'flex',
                                  gap: 0.5,
                                  flexShrink: 0,
                                }}
                              >
                                <Tooltip title="View strategy details">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setSelectedStrategy(strat);
                                      setStrategyDetailOpen(true);
                                    }}
                                    sx={{ color: 'text.secondary' }}
                                  >
                                    <DeploymentStrategyIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() => setDeployDialogOpen(true)}
                                  sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    borderRadius: '3px',
                                    px: 1.5,
                                    py: 0.5,
                                    fontSize: '0.7rem',
                                  }}
                                >
                                  Deploy
                                </Button>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </SectionCard>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {/* Source Tab */}
            <SectionCard title="Source Information">
              {sourceRows.length > 0 ? (
                <MetadataTable rows={sourceRows} />
              ) : (
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}
                >
                  No source information available.
                </Typography>
              )}
            </SectionCard>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {/* Keywords Tab */}
            <SectionCard title="Keywords">
              {[
                { type: 'Task', color: '#2563eb', bg: 'rgba(33,150,243,0.08)' },
                {
                  type: 'Library',
                  color: '#7c3aed',
                  bg: 'rgba(124,58,237,0.08)',
                },
                { type: 'Other', color: '#ea580c', bg: 'rgba(234,88,12,0.08)' },
              ].map((cat) => (
                <Box key={cat.type} sx={{ mb: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: cat.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      fontSize: '0.65rem',
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    {cat.type}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {keywords.map((kw) => (
                      <Chip
                        key={kw}
                        label={kw}
                        size="small"
                        sx={{
                          borderRadius: '3px',
                          fontSize: '0.6rem',
                          height: 22,
                          fontWeight: 600,
                          backgroundColor: cat.bg,
                          color: cat.color,
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </SectionCard>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            {/* Metadata Tab */}
            <SectionCard title="Model Metadata">
              {metadataRows.length > 0 ? (
                <MetadataTable rows={metadataRows} />
              ) : (
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}
                >
                  No metadata available.
                </Typography>
              )}
            </SectionCard>
          </TabPanel>
        </Box>

        {/* ─── Modals ───────────────────────────────────────────── */}

        <DeployDialog
          open={deployDialogOpen}
          onClose={() => setDeployDialogOpen(false)}
          model={model}
        />
        <Dialog
          open={openStrategiesDialog}
          onClose={() => setOpenStrategiesDialog(false)}
          fullWidth
          maxWidth="md"
          PaperProps={{ sx: { borderRadius: '6px', minHeight: '360px' } }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                All Deployment Strategies
              </Typography>
              <IconButton
                size="small"
                onClick={() => setOpenStrategiesDialog(false)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            {platforms.map((p) => {
              const css = clientStrategySets?.find((cs) => cs.platform === p);
              return (
                <Box key={p} sx={{ mb: 2, lastChild: { mb: 0 } }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: 'primary.main',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      fontSize: '0.7rem',
                      mb: 1,
                    }}
                  >
                    {p}
                  </Typography>
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
                  >
                    {css?.strategies.map((strat) => (
                      <Box
                        key={strat.name}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1.25,
                          borderRadius: '4px',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: 'text.primary',
                              fontSize: '0.8125rem',
                            }}
                          >
                            {strat.name}
                          </Typography>
                          {strat.description && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.secondary',
                                fontSize: '0.7rem',
                                display: 'block',
                              }}
                            >
                              {strat.description}
                            </Typography>
                          )}
                        </Box>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelectedStrategy(strat);
                            setStrategyDetailOpen(true);
                            setOpenStrategiesDialog(false);
                          }}
                          sx={{
                            textTransform: 'none',
                            fontSize: '0.7rem',
                            borderRadius: '3px',
                            fontWeight: 600,
                          }}
                        >
                          Details
                        </Button>
                      </Box>
                    ))}
                  </Box>
                </Box>
              );
            })}
          </DialogContent>
        </Dialog>
        {!!selectedStrategy && (
          <StrategyDetailDialog
            open={strategyDetailOpen}
            onClose={() => setStrategyDetailOpen(false)}
            strategy={selectedStrategy}
          />
        )}
      </Box>
    </>
  );
};

export default Model;
