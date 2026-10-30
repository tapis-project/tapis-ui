import * as React from 'react';
import * as Endpoints from '@mlhub/endpoints-ts-sdk';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  Link,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from '../../_context/NavContext';

const resourceDetailsPath = (urn: string) => {
  const [, namespace, version, , resourceType, resourceId] = urn.split(':');
  if (namespace !== 'mlhub' || version !== 'v1' || !resourceId)
    return undefined;

  switch (resourceType) {
    case 'deployment':
    case 'model_deployment':
      return `/deployments/${encodeURIComponent(resourceId)}`;
    case 'model':
      return `/models?model=${encodeURIComponent(resourceId)}`;
    case 'dataset':
      return `/datasets/${encodeURIComponent(resourceId)}`;
    default:
      return undefined;
  }
};

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactElement;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
      <Box sx={{ color: 'text.secondary', display: 'flex', mt: 0.25 }}>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography color="text.secondary" variant="caption">
          {label}
        </Typography>
        {value}
      </Box>
    </Stack>
  );
}

function CopyableValue({
  onValueClick,
  value,
}: {
  onValueClick?: () => void;
  value: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const copy = () => {
    void navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'flex-start' }}>
      {onValueClick ? (
        <Tooltip title="Open resource details">
          <Link
            component="button"
            onClick={onValueClick}
            sx={{
              alignItems: 'center',
              display: 'inline-flex',
              fontFamily: 'monospace',
              overflowWrap: 'anywhere',
              textAlign: 'left',
            }}
            variant="body2"
          >
            {value}
            <OpenInNewIcon sx={{ flexShrink: 0, fontSize: 14, ml: 0.5 }} />
          </Link>
        </Tooltip>
      ) : (
        <Typography
          sx={{ fontFamily: 'monospace', overflowWrap: 'anywhere' }}
          variant="body2"
        >
          {value}
        </Typography>
      )}
      <Tooltip title={copied ? 'Copied' : 'Copy'}>
        <IconButton aria-label="Copy value" onClick={copy} size="small">
          <ContentCopyOutlinedIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

function EndpointDetails({
  endpoint,
  onResourceNavigate,
}: {
  endpoint: Endpoints.Endpoint;
  onResourceNavigate: (path: string) => void;
}) {
  const resourcePath = resourceDetailsPath(endpoint.target_resource_urn);

  return (
    <Stack spacing={3} sx={{ px: { xs: 2, sm: 3 }, py: 2.5 }}>
      <Box>
        <Typography sx={{ fontWeight: 700, mb: 1.5 }} variant="subtitle2">
          Platform address
        </Typography>
        <DetailRow
          icon={<LinkOutlinedIcon fontSize="small" />}
          label="Proxy URL"
          value={<CopyableValue value={endpoint.proxy_url} />}
        />
      </Box>
      <Divider />
      <Box>
        <Typography sx={{ fontWeight: 700, mb: 1.5 }} variant="subtitle2">
          Target
        </Typography>
        <Stack spacing={1.75}>
          <DetailRow
            icon={<DnsOutlinedIcon fontSize="small" />}
            label="Target name"
            value={
              <Typography variant="body2">{endpoint.target_name}</Typography>
            }
          />
          {endpoint.target_base_url && (
            <DetailRow
              icon={<LinkOutlinedIcon fontSize="small" />}
              label="Target base URL"
              value={<CopyableValue value={endpoint.target_base_url} />}
            />
          )}
          <DetailRow
            icon={<DnsOutlinedIcon fontSize="small" />}
            label="Target resource URN"
            value={
              <CopyableValue
                onValueClick={
                  resourcePath
                    ? () => onResourceNavigate(resourcePath)
                    : undefined
                }
                value={endpoint.target_resource_urn}
              />
            }
          />
        </Stack>
      </Box>
      <Divider />
      <Box>
        <Typography sx={{ fontWeight: 700, mb: 1.5 }} variant="subtitle2">
          Ownership
        </Typography>
        <Stack spacing={1.75}>
          <DetailRow
            icon={<AccountCircleOutlinedIcon fontSize="small" />}
            label="Owner"
            value={<Typography variant="body2">{endpoint.owner}</Typography>}
          />
          <DetailRow
            icon={<AccountCircleOutlinedIcon fontSize="small" />}
            label="Tenant"
            value={
              <Typography variant="body2">{endpoint.tenant_id}</Typography>
            }
          />
        </Stack>
      </Box>
    </Stack>
  );
}

export function EndpointDetailDrawer({
  endpointId,
  onClose,
}: {
  endpointId?: string;
  onClose: () => void;
}) {
  const { navigate } = useNavigate();
  const endpointQuery = Hooks.Endpoints.useGetEndpoint(
    endpointId ? { endpointId } : undefined
  );
  const endpoint = endpointQuery.data?.result;

  return (
    <Drawer
      anchor="right"
      onClose={onClose}
      open={Boolean(endpointId)}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': {
          bgcolor: 'background.default',
          height: '100%',
          maxWidth: 760,
          width: '92vw',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box
          sx={{
            alignItems: 'center',
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            px: { xs: 2, sm: 3 },
            py: 1.5,
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: 'center', minWidth: 0 }}
          >
            <Avatar
              variant="rounded"
              sx={{
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                color: 'primary.main',
                height: 42,
                width: 42,
              }}
            >
              <LinkOutlinedIcon />
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ fontWeight: 700 }} variant="h6">
                {endpoint?.target_name ?? 'Endpoint'}
              </Typography>
              {endpoint && (
                <Typography color="text.secondary" noWrap variant="caption">
                  {endpoint.slug}
                </Typography>
              )}
            </Box>
          </Stack>
          <IconButton
            aria-label="Close endpoint details"
            onClick={onClose}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {endpointQuery.isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={28} />
            </Box>
          )}
          {endpointQuery.isError && (
            <Alert severity="error" sx={{ m: 3 }}>
              {endpointQuery.error instanceof Error
                ? endpointQuery.error.message
                : 'Unable to load endpoint details.'}
            </Alert>
          )}
          {endpoint && (
            <>
              <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2.5 }}>
                <Chip
                  color={endpoint.available ? 'success' : 'default'}
                  label={endpoint.available ? 'Available' : 'Unavailable'}
                  size="small"
                  variant="outlined"
                />
              </Box>
              <EndpointDetails
                endpoint={endpoint}
                onResourceNavigate={(path) => {
                  onClose();
                  navigate(path);
                }}
              />
            </>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
