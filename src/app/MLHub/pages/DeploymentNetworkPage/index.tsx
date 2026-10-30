import * as React from 'react';
import { useParams } from 'react-router-dom';
import {
  Background,
  BaseEdge,
  Controls,
  EdgeLabelRenderer,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
  type ReactFlowInstance,
  getSmoothStepPath,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { alpha, type Theme } from '@mui/material/styles';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Drawer,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined';
import DoNotDisturbOnOutlinedIcon from '@mui/icons-material/DoNotDisturbOnOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import LanOutlinedIcon from '@mui/icons-material/LanOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import SettingsEthernetOutlinedIcon from '@mui/icons-material/SettingsEthernetOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import ViewListOutlinedIcon from '@mui/icons-material/ViewListOutlined';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import * as Deployments from '@mlhub/deployments-ts-sdk';
import * as Models from '@mlhub/models-ts-sdk';
import { reconciliationStatusPresentation } from '../../_components/deploymentOperationalStatus';
import { useNavigate } from '../../_context/NavContext';
import { DeploymentDetailContent } from '../DeploymentDetailDrawer';
import { EndpointDetailDrawer } from '../EndpointsPage/EndpointDetailDrawer';
import { ModelDetailDrawer } from '../ModelDetailDrawer';

type DeploymentRouteParams = { deploymentId: string };

type NetworkNodeData = {
  copyValue?: string;
  detail: string;
  handles?: 'envoy' | 'policy' | 'router';
  label: string;
  onSelect?: () => void;
  status?: { color: string; label: string; tone: 'available' | 'unavailable' };
  tone:
    | 'traefik'
    | 'envoy'
    | 'router'
    | 'endpoint'
    | 'external'
    | 'model'
    | 'policy'
    | 'public'
    | 'publicBlocked'
    | 'user';
};

function NetworkNode({ data }: NodeProps) {
  const { copyValue, detail, handles, label, onSelect, status, tone } =
    data as NetworkNodeData;
  const [copied, setCopied] = React.useState(false);
  const copyTarget = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!copyValue) return;

    void navigator.clipboard?.writeText(copyValue);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };
  const color =
    tone === 'traefik'
      ? 'primary.main'
      : tone === 'envoy'
      ? 'secondary.main'
      : tone === 'router'
      ? 'info.main'
      : tone === 'policy'
      ? 'warning.main'
      : tone === 'endpoint'
      ? 'info.main'
      : tone === 'model'
      ? 'secondary.main'
      : tone === 'external'
      ? 'warning.main'
      : tone === 'user'
      ? 'success.main'
      : tone === 'public'
      ? 'success.main'
      : tone === 'publicBlocked'
      ? 'error.main'
      : 'success.main';
  const Icon =
    tone === 'traefik'
      ? SettingsEthernetOutlinedIcon
      : tone === 'envoy'
      ? PolicyOutlinedIcon
      : tone === 'router'
      ? RouteOutlinedIcon
      : tone === 'policy'
      ? GppGoodOutlinedIcon
      : tone === 'endpoint'
      ? LinkOutlinedIcon
      : tone === 'model'
      ? SmartToyOutlinedIcon
      : tone === 'external'
      ? DnsOutlinedIcon
      : tone === 'user'
      ? AccountCircleOutlinedIcon
      : tone === 'public' || tone === 'publicBlocked'
      ? PublicOutlinedIcon
      : RocketLaunchIcon;

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: color,
        borderLeft: '3px solid',
        borderLeftColor: color,
        borderRadius: '2px',
        cursor: onSelect ? 'pointer' : 'default',
        height: 110,
        minWidth: 230,
        transition: (theme) =>
          theme.transitions.create(['box-shadow', 'transform'], {
            duration: theme.transitions.duration.shortest,
          }),
        width: 230,
        '&:hover': onSelect
          ? {
              boxShadow: 4,
              transform: 'translateY(-3px)',
            }
          : undefined,
      }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect?.();
      }}
    >
      {handles !== 'router' && (
        <Handle id="left-target" position={Position.Left} type="target" />
      )}
      {handles === 'envoy' && (
        <>
          <Handle
            id="top-source"
            position={Position.Top}
            style={{ left: '32%' }}
            type="source"
          />
          <Handle
            id="top-target"
            position={Position.Top}
            style={{ left: '68%' }}
            type="target"
          />
        </>
      )}
      {handles === 'router' && (
        <>
          <Handle id="right-source" position={Position.Right} type="source" />
          <Handle
            id="bottom-target"
            position={Position.Bottom}
            style={{ left: '32%' }}
            type="target"
          />
          <Handle
            id="bottom-source"
            position={Position.Bottom}
            style={{ left: '68%' }}
            type="source"
          />
        </>
      )}
      {handles === 'policy' && (
        <Handle id="bottom-source" position={Position.Bottom} type="source" />
      )}
      <Box sx={{ p: 1.25 }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
          <Icon sx={{ color, fontSize: 20 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              noWrap
              sx={{ fontWeight: 700, minWidth: 0 }}
              variant="body2"
            >
              {label}
            </Typography>
          </Box>
          {status &&
            (status.tone === 'available' ? (
              <CheckCircleOutlineRoundedIcon
                sx={{ color: status.color, flexShrink: 0, fontSize: 17 }}
              />
            ) : (
              <DoNotDisturbOnOutlinedIcon
                sx={{ color: status.color, flexShrink: 0, fontSize: 17 }}
              />
            ))}
          {copyValue && (
            <Tooltip title={copied ? 'Copied target' : 'Copy endpoint target'}>
              <IconButton
                aria-label="Copy endpoint target"
                onClick={copyTarget}
                size="small"
                sx={{ flexShrink: 0, p: 0.25 }}
              >
                {copied ? (
                  <CheckCircleOutlineRoundedIcon
                    color="success"
                    sx={{ fontSize: 16 }}
                  />
                ) : (
                  <ContentCopyOutlinedIcon sx={{ fontSize: 16 }} />
                )}
              </IconButton>
            </Tooltip>
          )}
        </Stack>
        {status && (
          <Stack
            direction="row"
            spacing={0.25}
            sx={{ alignItems: 'center', color: status.color, mt: 0.25 }}
          >
            <Typography sx={{ fontWeight: 700 }} variant="caption">
              {status.label}
            </Typography>
          </Stack>
        )}
        <Typography
          color="text.secondary"
          sx={{
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            display: '-webkit-box',
            mt: status ? 0.25 : 0.5,
            overflow: 'hidden',
            overflowWrap: 'anywhere',
          }}
          variant="caption"
        >
          {detail}
        </Typography>
      </Box>
      {handles !== 'router' && handles !== 'policy' && (
        <Handle id="right-source" position={Position.Right} type="source" />
      )}
    </Card>
  );
}

function NetworkGroup({ data }: NodeProps) {
  const group = data as {
    detail: string;
    label: string;
    networkHandles?: boolean;
    onSelect?: () => void;
    tone:
      | 'cluster'
      | 'datacenter'
      | 'external'
      | 'mlhub'
      | 'private'
      | 'public'
      | 'queue'
      | 'runtime';
  };
  const color =
    group.tone === 'mlhub'
      ? 'primary.main'
      : group.tone === 'public'
      ? 'primary.main'
      : group.tone === 'private'
      ? 'secondary.main'
      : group.tone === 'datacenter'
      ? 'info.main'
      : group.tone === 'cluster'
      ? 'secondary.main'
      : group.tone === 'queue'
      ? 'success.main'
      : group.tone === 'runtime'
      ? 'secondary.main'
      : 'warning.main';
  const iconColor =
    group.tone === 'mlhub' || group.tone === 'public'
      ? 'primary'
      : group.tone === 'private'
      ? 'secondary'
      : group.tone === 'datacenter'
      ? 'info'
      : group.tone === 'cluster'
      ? 'secondary'
      : group.tone === 'queue'
      ? 'success'
      : group.tone === 'runtime'
      ? 'secondary'
      : 'warning';
  const GroupIcon =
    group.tone === 'datacenter'
      ? ApartmentOutlinedIcon
      : group.tone === 'cluster'
      ? StorageOutlinedIcon
      : group.tone === 'queue'
      ? ViewListOutlinedIcon
      : group.tone === 'runtime'
      ? MemoryOutlinedIcon
      : group.tone === 'external'
      ? LanOutlinedIcon
      : group.tone === 'private'
      ? LockOutlinedIcon
      : group.tone === 'public'
      ? PublicOutlinedIcon
      : HubOutlinedIcon;
  const groupBackground = (theme: Theme) => {
    const baseColor =
      group.tone === 'mlhub' || group.tone === 'public'
        ? theme.palette.primary.main
        : group.tone === 'private' || group.tone === 'cluster'
        ? theme.palette.secondary.main
        : group.tone === 'datacenter'
        ? theme.palette.info.main
        : group.tone === 'queue'
        ? theme.palette.success.main
        : group.tone === 'runtime'
        ? theme.palette.secondary.main
        : theme.palette.warning.main;

    return alpha(baseColor, group.tone === 'mlhub' ? 0.025 : 0.06);
  };

  return (
    <Box
      onClick={(event) => {
        event.stopPropagation();
        group.onSelect?.();
      }}
      sx={{
        bgcolor: groupBackground,
        border: '1px solid',
        borderColor: color,
        borderRadius: '2px',
        boxSizing: 'border-box',
        cursor: group.onSelect ? 'pointer' : 'default',
        height: '100%',
        p: 2.5,
        transition: (theme) =>
          theme.transitions.create(['box-shadow', 'transform'], {
            duration: theme.transitions.duration.shortest,
          }),
        width: '100%',
        '&:hover': group.onSelect
          ? { boxShadow: 3, transform: 'translateY(-2px)' }
          : undefined,
      }}
    >
      {group.networkHandles && (
        <Handle id="left-target" position={Position.Left} type="target" />
      )}
      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
        <GroupIcon color={iconColor} fontSize="small" />
        <Typography sx={{ color, fontWeight: 700 }} variant="body2">
          {group.label}
        </Typography>
      </Stack>
      <Typography
        color="text.secondary"
        sx={{ display: 'block', lineHeight: 1.25, overflowWrap: 'anywhere' }}
        variant="caption"
      >
        {group.detail}
      </Typography>
      {group.networkHandles && (
        <Handle id="right-source" position={Position.Right} type="source" />
      )}
    </Box>
  );
}

function NetworkRouteEdge({
  id,
  label,
  markerEnd,
  sourcePosition,
  sourceX,
  sourceY,
  style,
  targetPosition,
  targetX,
  targetY,
}: EdgeProps) {
  const [path, labelX, labelY] = getSmoothStepPath({
    sourcePosition,
    sourceX,
    sourceY,
    targetPosition,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge id={id} markerEnd={markerEnd} path={path} style={style} />
      <EdgeLabelRenderer>
        <Box
          className="nodrag nopan"
          sx={{
            bgcolor: '#ffffff !important',
            borderRadius: '2px',
            boxShadow: '0 1px 3px rgba(16, 24, 40, 0.2)',
            color: 'text.primary',
            fontSize: 11,
            fontWeight: 700,
            px: 0.75,
            py: 0.25,
            pointerEvents: 'none',
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            zIndex: 5,
          }}
        >
          {label}
        </Box>
      </EdgeLabelRenderer>
    </>
  );
}

type DeploymentEndpointGroupData = {
  deploymentId: string;
  modality: string;
  name: string;
  onSelect?: () => void;
  replicas: number;
  state: string;
  status: string;
  visibility: string;
};

function DeploymentEndpointGroup({ data }: NodeProps) {
  const deployment = data as DeploymentEndpointGroupData;
  const isRunning = deployment.state === Deployments.State.Running;

  return (
    <Box
      onClick={(event) => {
        event.stopPropagation();
        deployment.onSelect?.();
      }}
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'success.light',
        borderRadius: '2px',
        boxSizing: 'border-box',
        height: '100%',
        p: 1,
        cursor: deployment.onSelect ? 'pointer' : 'default',
        transition: (theme) =>
          theme.transitions.create(['box-shadow', 'transform'], {
            duration: theme.transitions.duration.shortest,
          }),
        width: '100%',
        '&:hover': deployment.onSelect
          ? {
              boxShadow: 4,
              transform: 'translateY(-3px)',
            }
          : undefined,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ alignItems: 'center', minWidth: 0 }}
        >
          <RocketLaunchIcon
            color="success"
            sx={{ flexShrink: 0, fontSize: 17 }}
          />
          <Typography
            color="success.dark"
            sx={{
              flex: 1,
              fontWeight: 700,
              lineHeight: 1.2,
              minWidth: 0,
              overflowWrap: 'anywhere',
            }}
            variant="caption"
          >
            {deployment.name}
          </Typography>
          {isRunning && (
            <AutorenewRoundedIcon
              aria-label="Deployment is running"
              color="success"
              sx={{
                animation: 'deployment-running 1.2s linear infinite',
                fontSize: 17,
                '@keyframes deployment-running': {
                  from: { transform: 'rotate(0deg)' },
                  to: { transform: 'rotate(360deg)' },
                },
              }}
            />
          )}
        </Stack>
        <Typography
          color="text.secondary"
          sx={{
            display: 'block',
            fontFamily: 'monospace',
            lineHeight: 1.25,
            mt: 0.25,
            overflowWrap: 'anywhere',
          }}
          variant="caption"
        >
          {deployment.deploymentId}
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ display: 'block', lineHeight: 1.25 }}
          variant="caption"
        >
          Status: {deployment.status}
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ display: 'block', lineHeight: 1.25 }}
          variant="caption"
        >
          State: {deployment.state}
        </Typography>
        <Typography
          color="text.secondary"
          sx={{ display: 'block', lineHeight: 1.25, overflowWrap: 'anywhere' }}
          variant="caption"
        >
          {deployment.modality} · {deployment.replicas} replica
          {deployment.replicas === 1 ? '' : 's'} · {deployment.visibility}
        </Typography>
      </Box>
    </Box>
  );
}

const nodeTypes = {
  deploymentEndpoints: DeploymentEndpointGroup,
  network: NetworkNode,
  networkGroup: NetworkGroup,
};

const edgeTypes = {
  networkRoute: NetworkRouteEdge,
};

export default function DeploymentNetworkPage() {
  const { deploymentId } = useParams<DeploymentRouteParams>();
  const { navigate } = useNavigate();
  const [selectedEndpointId, setSelectedEndpointId] = React.useState<string>();
  const [selectedModel, setSelectedModel] = React.useState<Models.Model | null>(
    null
  );
  const [isDeploymentDrawerOpen, setDeploymentDrawerOpen] =
    React.useState(false);
  const [flowInstance, setFlowInstance] =
    React.useState<ReactFlowInstance | null>(null);
  const flowContainerRef = React.useRef<HTMLDivElement>(null);
  const [isNoEndpointAlertDismissed, setNoEndpointAlertDismissed] =
    React.useState(false);
  React.useEffect(() => {
    setNoEndpointAlertDismissed(false);
  }, [deploymentId]);
  const deploymentsQuery = Hooks.Deployments.useList();
  const modelsQuery = Hooks.Models.useListByAuthor({ limit: 50 });
  const deployment = React.useMemo(
    () =>
      (deploymentsQuery.data?.result ?? []).find(
        (candidate) => candidate.id === deploymentId
      ),
    [deploymentId, deploymentsQuery.data?.result]
  );
  const deploymentUrn = deployment
    ? `urn:mlhub:v1:${deployment.tenant_id}:deployment:${deployment.id}`
    : undefined;
  const model = React.useMemo(
    () =>
      (modelsQuery.data?.result ?? []).find(
        (candidate) =>
          candidate.external_model_id === deployment?.external_model_id
      ),
    [deployment?.external_model_id, modelsQuery.data?.result]
  );
  const deploymentOptionQuery =
    Hooks.Models.useGetExternalModelDeploymentOption({
      deploymentOptionId: deployment?.deployment_option_id ?? '',
      externalModelId: deployment?.external_model_id ?? '',
    });
  const hpcTarget = deploymentOptionQuery.data?.result?.hpc_cluster_queue;
  const servingRuntime = deploymentOptionQuery.data?.result?.serving_runtime;
  const endpointsQuery = Hooks.Endpoints.useListResourceEndpoints(
    deploymentUrn
      ? { includeCount: true, limit: 50, resourceUrn: deploymentUrn }
      : undefined
  );
  const endpoints = React.useMemo(() => {
    const issuedEndpoints = endpointsQuery.data?.result ?? [];
    if (issuedEndpoints.length || !deployment?.endpoint) return issuedEndpoints;

    return [deployment.endpoint];
  }, [deployment?.endpoint, endpointsQuery.data?.result]);

  const { nodes, edges } = React.useMemo(() => {
    if (!deployment) return { edges: [] as Edge[], nodes: [] as Node[] };

    const nodeWidth = 230;
    const nodeHeight = 110;
    const stageGap = 58;
    const networkPaddingX = 36;
    const endpointRowGap = 22;
    const estimateWrappedLines = (value: string, charactersPerLine: number) =>
      Math.max(1, Math.ceil(value.length / charactersPerLine));
    const deploymentStatus = reconciliationStatusPresentation(
      deployment.reconciliation_status
    );
    const deploymentSummary = `${deployment.deployment_modality} · ${
      deployment.replicas.count
    } replica${deployment.replicas.count === 1 ? '' : 's'} · ${
      deployment.visibility
    }`;
    const deploymentGroupHeaderHeight = Math.max(
      116,
      20 +
        estimateWrappedLines(deployment.name, 31) * 17 +
        estimateWrappedLines(deployment.id, 37) * 15 +
        estimateWrappedLines(`Status: ${deploymentStatus.label}`, 38) * 15 +
        estimateWrappedLines(`State: ${deployment.state}`, 38) * 15 +
        estimateWrappedLines(deploymentSummary, 38) * 15
    );
    const infrastructureGroupHeaderHeight = 62;
    const infrastructureGroupPadding = 24;
    const runtimeNodeInset = 12;
    const deploymentGroupWidth =
      nodeWidth + (infrastructureGroupPadding + runtimeNodeInset) * 2;
    const runtimeGroupLabel = `Serving runtime: ${
      servingRuntime ?? 'Not reported'
    }`;
    const runtimeGroupDetail = 'Execution environment for this deployment';
    const runtimeGroupHeaderHeight = Math.max(
      72,
      24 +
        estimateWrappedLines(runtimeGroupLabel, 30) * 18 +
        estimateWrappedLines(runtimeGroupDetail, 30) * 15
    );
    const runtimeGroupWidth =
      deploymentGroupWidth - infrastructureGroupPadding * 2;
    const runtimeGroupHeight =
      runtimeGroupHeaderHeight + nodeHeight + infrastructureGroupPadding;
    const endpointCount = Math.max(1, endpoints.length);
    const deploymentGroupNodeId = `deployment-${deployment.id}`;
    const dataCenterGroupNodeId = `data-center-${deployment.id}`;
    const hpcClusterGroupNodeId = `hpc-cluster-${deployment.id}`;
    const schedulerQueueGroupNodeId = `scheduler-queue-${deployment.id}`;
    const runtimeGroupNodeId = `deployment-runtime-${deployment.id}`;
    const modelNodeId = `model-${deployment.external_model_id}`;
    const externalTargetNodeId = `external-target-${deployment.id}`;
    const endpointColumnHeight =
      endpointCount * nodeHeight + (endpointCount - 1) * endpointRowGap;
    const externalNetworkWidth = hpcTarget ? 520 : 400;
    const dataCenterGroupWidth =
      externalNetworkWidth - infrastructureGroupPadding * 2;
    const hpcClusterGroupWidth =
      dataCenterGroupWidth - infrastructureGroupPadding * 2;
    const queueGroupWidth =
      hpcClusterGroupWidth - infrastructureGroupPadding * 2;
    const runtimeGroupY = deploymentGroupHeaderHeight;
    const deploymentGroupHeight =
      runtimeGroupY + runtimeGroupHeight + infrastructureGroupPadding;
    const queueGroupHeight =
      infrastructureGroupHeaderHeight +
      deploymentGroupHeight +
      infrastructureGroupPadding;
    const clusterGroupHeight =
      infrastructureGroupHeaderHeight +
      queueGroupHeight +
      nodeHeight +
      infrastructureGroupPadding * 2;
    const dataCenterGroupHeight =
      infrastructureGroupHeaderHeight +
      clusterGroupHeight +
      infrastructureGroupPadding;
    const isPublic = deployment.visibility === Deployments.Visibility.Public;
    const activeNetworkHeight = Math.max(360, endpointColumnHeight + 128);
    const inactiveNetworkHeight = nodeHeight + 96;
    const publicNetworkHeight = isPublic
      ? activeNetworkHeight
      : inactiveNetworkHeight;
    const privateNetworkHeight = isPublic
      ? inactiveNetworkHeight
      : activeNetworkHeight;
    const externalNetworkHeaderHeight = 64;
    const externalNetworkHeight = Math.max(
      activeNetworkHeight,
      hpcTarget
        ? externalNetworkHeaderHeight +
            dataCenterGroupHeight +
            infrastructureGroupPadding
        : deploymentGroupHeight + 96
    );
    const routerX = networkPaddingX + nodeWidth + stageGap;
    const policyEngineX = routerX + nodeWidth + stageGap;
    const endpointColumnX = policyEngineX + nodeWidth + stageGap + 24;
    const networkWidth = endpointColumnX + nodeWidth + networkPaddingX;
    const routerY = 70;
    const stageY = Math.max(
      routerY + nodeHeight + 46,
      Math.round((activeNetworkHeight - nodeHeight) / 2)
    );
    const endpointColumnY = Math.round(
      (activeNetworkHeight - endpointColumnHeight) / 2
    );
    const deploymentGroupY = Math.round(
      (externalNetworkHeight - deploymentGroupHeight) / 2
    );
    const dataCenterGroupY = externalNetworkHeaderHeight;
    const mlHubHeaderHeight = 64;
    const mlHubPadding = 20;
    const networkGap = 40;
    const networkGroupHeaderHeight = 64;
    const mlHubNetworkWidth = networkWidth + mlHubPadding * 2;
    const publicNetworkY = mlHubHeaderHeight;
    const privateNetworkY = publicNetworkY + publicNetworkHeight + networkGap;
    const publicNetworkId = 'mlhub-public-network';
    const privateNetworkId = 'mlhub-private-network';
    const mlHubNetworkId = 'mlhub-network';
    const activeNetworkId = isPublic ? publicNetworkId : privateNetworkId;
    const publicTraefikY = isPublic
      ? stageY
      : Math.max(
          networkGroupHeaderHeight,
          Math.round((publicNetworkHeight - nodeHeight) / 2)
        );
    const envoyNodeId = `envoy-${
      isPublic ? 'public' : 'private'
    }-forward-proxy`;
    const traefikNodeId = 'traefik-public-reverse-proxy';
    const policyEngineNodeId = `network-policy-engine-${deployment.id}`;
    const userNodeId = `user-${deployment.owner}`;
    const publicNodeId = `public-${deployment.id}`;
    const endpointReportedTarget = endpoints.find(
      (endpoint) => endpoint.target_name || endpoint.target_base_url
    );
    const downstreamTarget = deployment.target_endpoint
      ? {
          baseUrl: deployment.target_endpoint.base_url,
          name: deployment.target_endpoint.name,
          protocol: deployment.target_endpoint.protocol,
        }
      : endpointReportedTarget
      ? {
          baseUrl: endpointReportedTarget.target_base_url,
          name: endpointReportedTarget.target_name,
          protocol: undefined,
        }
      : undefined;
    const hasDownstreamTarget = Boolean(
      downstreamTarget?.name || downstreamTarget?.baseUrl
    );
    const resultNodes: Node[] = [
      {
        data: {
          detail: model
            ? `Model ID: ${model.id}`
            : deployment.external_model_id,
          label: model?.name ?? deployment.external_model_id,
          onSelect: model ? () => setSelectedModel(model) : undefined,
          tone: 'model',
        } satisfies NetworkNodeData,
        extent: 'parent',
        id: modelNodeId,
        parentId: runtimeGroupNodeId,
        position: { x: runtimeNodeInset, y: runtimeGroupHeaderHeight },
        type: 'network',
      },
      {
        data: {
          detail: runtimeGroupDetail,
          label: runtimeGroupLabel,
          networkHandles: true,
          tone: 'runtime',
        },
        extent: 'parent',
        id: runtimeGroupNodeId,
        parentId: deploymentGroupNodeId,
        position: { x: infrastructureGroupPadding, y: runtimeGroupY },
        style: { height: runtimeGroupHeight, width: runtimeGroupWidth },
        type: 'networkGroup',
      },
      {
        data: {
          detail: `${deployment.owner} · tenant ${deployment.tenant_id}`,
          label: 'User',
          tone: 'user',
        } satisfies NetworkNodeData,
        id: userNodeId,
        position: { x: -nodeWidth - 60, y: publicNetworkY + publicTraefikY },
        type: 'network',
      },
      {
        data: {
          detail: isPublic
            ? 'Public access is enabled for this deployment.'
            : 'Access is blocked because this deployment is private.',
          label: 'Public',
          tone: isPublic ? 'public' : 'publicBlocked',
        } satisfies NetworkNodeData,
        id: publicNodeId,
        position: {
          x: -nodeWidth - 60,
          y: publicNetworkY + publicTraefikY + nodeHeight + 48,
        },
        type: 'network',
      },
      {
        data: {
          detail: 'MLHub network address space and gateway routing',
          label: 'MLHub Hub-and-Spoke WAN',
          tone: 'mlhub',
        },
        id: mlHubNetworkId,
        position: { x: 0, y: 0 },
        style: {
          height:
            mlHubHeaderHeight +
            publicNetworkHeight +
            networkGap +
            privateNetworkHeight +
            mlHubPadding,
          width: mlHubNetworkWidth,
        },
        type: 'networkGroup',
      },
      {
        data: {
          detail: isPublic
            ? 'This deployment is attached to this network.'
            : 'This deployment is private.',
          label: 'Public',
          tone: 'public',
        },
        extent: 'parent',
        id: publicNetworkId,
        position: { x: mlHubPadding, y: publicNetworkY },
        parentId: mlHubNetworkId,
        style: { height: publicNetworkHeight, width: networkWidth },
        type: 'networkGroup',
      },
      {
        data: {
          detail: isPublic
            ? 'This deployment is public.'
            : 'This deployment is attached to this network.',
          label: 'Private',
          tone: 'private',
        },
        extent: 'parent',
        id: privateNetworkId,
        position: {
          x: mlHubPadding,
          y: privateNetworkY,
        },
        parentId: mlHubNetworkId,
        style: { height: privateNetworkHeight, width: networkWidth },
        type: 'networkGroup',
      },
      {
        data: {
          detail: 'Downstream runtime and infrastructure',
          label: 'External network',
          tone: 'external',
        },
        id: 'external-network',
        position: { x: mlHubNetworkWidth + 60, y: 0 },
        style: { height: externalNetworkHeight, width: externalNetworkWidth },
        type: 'networkGroup',
      },
      {
        data: {
          detail: 'Platform ingress and TLS termination',
          label: 'Traefik reverse proxy',
          tone: 'traefik',
        } satisfies NetworkNodeData,
        id: traefikNodeId,
        extent: 'parent',
        parentId: publicNetworkId,
        position: { x: networkPaddingX, y: publicTraefikY },
        type: 'network',
      },
      {
        data: {
          detail: 'Resolves endpoints and applies user policies',
          handles: 'envoy',
          label: 'Envoy forward proxy',
          tone: 'envoy',
        } satisfies NetworkNodeData,
        id: envoyNodeId,
        extent: 'parent',
        parentId: activeNetworkId,
        position: {
          x: routerX,
          y: stageY,
        },
        type: 'network',
      },
      {
        data: {
          detail: 'Resolves the endpoint and network-addressable object',
          handles: 'router',
          label: 'Endpoint router',
          tone: 'router',
        } satisfies NetworkNodeData,
        id: `endpoint-router-${deployment.id}`,
        extent: 'parent',
        parentId: activeNetworkId,
        position: {
          x: routerX,
          y: routerY,
        },
        type: 'network',
      },
      {
        data: {
          detail: 'Evaluates access policies before routing downstream',
          handles: 'policy',
          label: 'Network policy engine',
          tone: 'policy',
        } satisfies NetworkNodeData,
        id: policyEngineNodeId,
        extent: 'parent',
        parentId: activeNetworkId,
        position: { x: policyEngineX, y: routerY },
        type: 'network',
      },
      {
        data: {
          deploymentId: deployment.id,
          modality: deployment.deployment_modality,
          name: deployment.name,
          onSelect: () => setDeploymentDrawerOpen(true),
          replicas: deployment.replicas.count,
          state: deployment.state,
          status: deploymentStatus.label,
          visibility: deployment.visibility,
        } satisfies DeploymentEndpointGroupData,
        id: deploymentGroupNodeId,
        extent: 'parent',
        parentId: hpcTarget ? schedulerQueueGroupNodeId : 'external-network',
        position: hpcTarget
          ? {
              x: Math.round((queueGroupWidth - deploymentGroupWidth) / 2),
              y: infrastructureGroupHeaderHeight,
            }
          : {
              x: Math.round((externalNetworkWidth - deploymentGroupWidth) / 2),
              y: deploymentGroupY,
            },
        style: { height: deploymentGroupHeight, width: deploymentGroupWidth },
        type: 'deploymentEndpoints',
      },
      {
        data: {
          detail: hasDownstreamTarget
            ? `${downstreamTarget?.protocol ?? 'Reported target'} · ${
                downstreamTarget?.baseUrl ?? 'Address unavailable'
              }`
            : 'No downstream target has been reported.',
          copyValue: downstreamTarget?.baseUrl ?? undefined,
          label:
            downstreamTarget?.name ??
            downstreamTarget?.baseUrl ??
            'Target endpoint pending',
          tone: 'external',
        } satisfies NetworkNodeData,
        extent: 'parent',
        id: externalTargetNodeId,
        parentId: hpcTarget ? hpcClusterGroupNodeId : runtimeGroupNodeId,
        position: hpcTarget
          ? {
              x: Math.round((hpcClusterGroupWidth - nodeWidth) / 2),
              y:
                infrastructureGroupHeaderHeight +
                queueGroupHeight +
                infrastructureGroupPadding,
            }
          : { x: 8, y: runtimeGroupHeaderHeight },
        type: 'network',
      },
    ];
    const deploymentNestedNodes = resultNodes.splice(0, 2);
    resultNodes.splice(
      resultNodes.findIndex((node) => node.id === deploymentGroupNodeId) + 1,
      0,
      ...deploymentNestedNodes.reverse()
    );
    if (hpcTarget) {
      resultNodes.splice(
        resultNodes.findIndex((node) => node.id === 'external-network') + 1,
        0,
        {
          data: {
            detail: 'MLHub infrastructure region',
            label: `Datacenter: ${hpcTarget.data_center}`,
            tone: 'datacenter',
          },
          extent: 'parent',
          id: dataCenterGroupNodeId,
          parentId: 'external-network',
          position: { x: infrastructureGroupPadding, y: dataCenterGroupY },
          style: {
            height: dataCenterGroupHeight,
            width: dataCenterGroupWidth,
          },
          type: 'networkGroup',
        },
        {
          data: {
            detail: hpcTarget.hpc_cluster_enabled
              ? 'HPC cluster enabled'
              : 'HPC cluster disabled',
            label: `HPC Cluster: ${hpcTarget.hpc_cluster_name}`,
            onSelect: () =>
              navigate(
                `/hpc-clusters/${encodeURIComponent(hpcTarget.hpc_cluster_id)}`
              ),
            tone: 'cluster',
          },
          extent: 'parent',
          id: hpcClusterGroupNodeId,
          parentId: dataCenterGroupNodeId,
          position: {
            x: infrastructureGroupPadding,
            y: infrastructureGroupHeaderHeight,
          },
          style: { height: clusterGroupHeight, width: hpcClusterGroupWidth },
          type: 'networkGroup',
        },
        {
          data: {
            detail: hpcTarget.batch_scheduler_queue_enabled
              ? 'Scheduler queue enabled'
              : 'Scheduler queue disabled',
            label: `Scheduler Queue: ${hpcTarget.batch_scheduler_queue_name}`,
            onSelect: () =>
              navigate(
                `/hpc-clusters/${encodeURIComponent(
                  hpcTarget.hpc_cluster_id
                )}?queue=${encodeURIComponent(
                  hpcTarget.batch_scheduler_queue_id
                )}`
              ),
            tone: 'queue',
          },
          extent: 'parent',
          id: schedulerQueueGroupNodeId,
          parentId: hpcClusterGroupNodeId,
          position: {
            x: infrastructureGroupPadding,
            y: infrastructureGroupHeaderHeight,
          },
          style: { height: queueGroupHeight, width: queueGroupWidth },
          type: 'networkGroup',
        }
      );
    }
    const resultEdges: Edge[] = [
      {
        id: `public-${deployment.id}-traefik`,
        label: isPublic ? 'Public access allowed' : 'Access denied: private',
        markerEnd: isPublic ? { type: MarkerType.ArrowClosed } : undefined,
        source: publicNodeId,
        sourceHandle: 'right-source',
        style: isPublic
          ? { stroke: '#2e7d32' }
          : { stroke: '#d32f2f', strokeDasharray: '5 5' },
        target: traefikNodeId,
        targetHandle: 'left-target',
        type: 'networkRoute',
      },
      {
        id: `user-${deployment.id}-traefik`,
        label: 'Makes request',
        markerEnd: { type: MarkerType.ArrowClosed },
        source: userNodeId,
        sourceHandle: 'right-source',
        target: traefikNodeId,
        targetHandle: 'left-target',
        type: 'networkRoute',
      },
      {
        id: `traefik-${deployment.id}-envoy`,
        label: 'Forwards request',
        markerEnd: { type: MarkerType.ArrowClosed },
        sourceHandle: 'right-source',
        source: traefikNodeId,
        targetHandle: 'left-target',
        target: envoyNodeId,
        type: 'networkRoute',
      },
      {
        id: `envoy-${deployment.id}-endpoint-router`,
        label: 'Resolves endpoint',
        markerEnd: { type: MarkerType.ArrowClosed },
        sourceHandle: 'top-source',
        source: envoyNodeId,
        targetHandle: 'bottom-target',
        target: `endpoint-router-${deployment.id}`,
        type: 'networkRoute',
      },
      {
        id: `endpoint-router-${deployment.id}-policy-engine`,
        label: 'Evaluates policy',
        markerEnd: { type: MarkerType.ArrowClosed },
        sourceHandle: 'right-source',
        source: `endpoint-router-${deployment.id}`,
        targetHandle: 'left-target',
        target: policyEngineNodeId,
        type: 'networkRoute',
      },
      {
        id: `policy-engine-${deployment.id}-envoy`,
        label: 'Applies policy',
        markerEnd: { type: MarkerType.ArrowClosed },
        sourceHandle: 'bottom-source',
        source: policyEngineNodeId,
        targetHandle: 'top-target',
        target: envoyNodeId,
        type: 'networkRoute',
      },
      ...(hpcTarget
        ? [
            {
              id: `target-${deployment.id}-runtime`,
              label: 'Routes to runtime',
              markerEnd: { type: MarkerType.ArrowClosed },
              source: externalTargetNodeId,
              sourceHandle: 'right-source',
              target: runtimeGroupNodeId,
              targetHandle: 'left-target',
              type: 'networkRoute',
            } satisfies Edge,
          ]
        : []),
    ];

    if (endpoints.length) {
      endpoints.forEach((endpoint, index) => {
        const endpointNodeId = `endpoint-${endpoint.id}`;
        resultNodes.push({
          data: {
            detail: endpoint.proxy_url,
            label: endpoint.slug,
            onSelect: () => setSelectedEndpointId(endpoint.id),
            status: endpoint.available
              ? {
                  color: 'success.dark',
                  label: 'Available',
                  tone: 'available',
                }
              : {
                  color: 'warning.dark',
                  label: 'Unavailable',
                  tone: 'unavailable',
                },
            tone: 'endpoint',
          } satisfies NetworkNodeData,
          id: endpointNodeId,
          extent: 'parent',
          parentId: activeNetworkId,
          position: {
            x: endpointColumnX,
            y: endpointColumnY + index * (nodeHeight + endpointRowGap),
          },
          type: 'network',
        });
        resultEdges.push(
          {
            id: `envoy-${endpoint.id}`,
            label: 'Routes to deployment',
            markerEnd: { type: MarkerType.ArrowClosed },
            sourceHandle: 'right-source',
            source: envoyNodeId,
            targetHandle: 'left-target',
            target: endpointNodeId,
            type: 'networkRoute',
          },
          {
            animated: !hasDownstreamTarget,
            id: `endpoint-${endpoint.id}-external-target`,
            label: hasDownstreamTarget ? 'Routes downstream' : 'Target pending',
            markerEnd: { type: MarkerType.ArrowClosed },
            sourceHandle: 'right-source',
            source: endpointNodeId,
            style: hasDownstreamTarget ? undefined : { strokeDasharray: '5 5' },
            target: externalTargetNodeId,
            targetHandle: 'left-target',
            type: 'networkRoute',
          }
        );
      });
    } else {
      const pendingEndpointNodeId = `endpoint-pending-${deployment.id}`;
      resultNodes.push({
        data: {
          detail: 'No platform endpoint has been issued yet.',
          label: 'Endpoint',
          status: {
            color: 'warning.dark',
            label: 'Unavailable',
            tone: 'unavailable',
          },
          tone: 'endpoint',
        } satisfies NetworkNodeData,
        extent: 'parent',
        id: pendingEndpointNodeId,
        parentId: activeNetworkId,
        position: { x: endpointColumnX, y: endpointColumnY },
        type: 'network',
      });
      resultEdges.push({
        animated: true,
        id: 'envoy-deployment-endpoints-pending',
        label: 'Endpoint pending',
        markerEnd: { type: MarkerType.ArrowClosed },
        sourceHandle: 'right-source',
        source: envoyNodeId,
        style: { strokeDasharray: '5 5' },
        target: pendingEndpointNodeId,
        targetHandle: 'left-target',
        type: 'networkRoute',
      });
      resultEdges.push({
        animated: true,
        id: `endpoint-pending-${deployment.id}-external-target`,
        label: 'Target pending',
        markerEnd: { type: MarkerType.ArrowClosed },
        sourceHandle: 'right-source',
        source: pendingEndpointNodeId,
        style: { strokeDasharray: '5 5' },
        target: externalTargetNodeId,
        targetHandle: 'left-target',
        type: 'networkRoute',
      });
    }

    return { edges: resultEdges, nodes: resultNodes };
  }, [deployment, endpoints, hpcTarget, model, navigate, servingRuntime]);

  React.useEffect(() => {
    const container = flowContainerRef.current;
    if (!flowInstance || !container || nodes.length === 0) return;

    let firstFrame: number | undefined;
    let secondFrame: number | undefined;
    const fitWhenMeasured = () => {
      window.cancelAnimationFrame(firstFrame ?? 0);
      window.cancelAnimationFrame(secondFrame ?? 0);
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          flowInstance.fitView({ padding: 0.25 });
        });
      });
    };
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
        fitWhenMeasured();
      }
    });

    observer.observe(container);
    fitWhenMeasured();

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(firstFrame ?? 0);
      window.cancelAnimationFrame(secondFrame ?? 0);
    };
  }, [flowInstance, nodes]);

  if (deploymentsQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (deploymentsQuery.isError || !deployment) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Alert severity={deploymentsQuery.isError ? 'error' : 'info'}>
          {deploymentsQuery.isError
            ? 'Unable to load the deployment network.'
            : 'This deployment is no longer available.'}
        </Alert>
        <Button
          onClick={() => navigate('/deployments')}
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
          variant="outlined"
        >
          Back to deployments
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          alignItems: { sm: 'center' },
          justifyContent: 'space-between',
          mb: 2.5,
        }}
      >
        <Box>
          <Button
            onClick={() => navigate(`/deployments/${deployment.id}`)}
            size="small"
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 0.75 }}
          >
            Deployment details
          </Button>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <HubOutlinedIcon color="primary" />
            <Typography sx={{ fontWeight: 800 }} variant="h4">
              Deployment network
            </Typography>
          </Stack>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Network addresses issued for {deployment.name}.
          </Typography>
        </Box>
        <Chip
          label={`${endpoints.length} endpoint${
            endpoints.length === 1 ? '' : 's'
          }`}
          size="small"
          variant="outlined"
        />
      </Stack>

      {endpointsQuery.isError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Resource endpoint data could not be refreshed. Showing the endpoint
          recorded on this deployment, when available.
        </Alert>
      )}
      {!endpointsQuery.isLoading &&
        endpoints.length === 0 &&
        !isNoEndpointAlertDismissed && (
          <Alert
            onClose={() => setNoEndpointAlertDismissed(true)}
            severity="warning"
            sx={{ mb: 2 }}
          >
            No MLHub endpoint has been issued for this deployment yet. It will
            appear in the network diagram once available.
          </Alert>
        )}

      <Card
        ref={flowContainerRef}
        variant="outlined"
        sx={{
          borderRadius: '2px',
          height: 640,
          '& .react-flow__edgelabel-renderer': { zIndex: 10 },
        }}
      >
        <ReactFlow
          edges={edges}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          nodes={nodes}
          nodeTypes={nodeTypes}
          onInit={setFlowInstance}
          nodesConnectable={false}
          nodesDraggable={false}
          nodesFocusable
          panOnDrag
        >
          <Background gap={18} size={1} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </Card>
      <EndpointDetailDrawer
        endpointId={selectedEndpointId}
        onClose={() => setSelectedEndpointId(undefined)}
      />
      <ModelDetailDrawer
        model={selectedModel}
        onClose={() => setSelectedModel(null)}
      />
      <Drawer
        anchor="right"
        ModalProps={{ keepMounted: true }}
        onClose={() => setDeploymentDrawerOpen(false)}
        open={isDeploymentDrawerOpen}
        sx={{
          '& .MuiDrawer-paper': {
            bgcolor: 'background.default',
            height: '100%',
            maxWidth: 960,
            width: '94vw',
          },
        }}
      >
        <DeploymentDetailContent
          deployment={deployment}
          model={model}
          onBack={() => setDeploymentDrawerOpen(false)}
        />
      </Drawer>
    </Box>
  );
}
