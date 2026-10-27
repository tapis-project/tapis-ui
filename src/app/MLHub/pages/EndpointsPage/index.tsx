import * as React from 'react';
import { useParams } from 'react-router-dom';
import * as Endpoints from '@mlhub/endpoints-ts-sdk';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import {
  Alert,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import DoNotDisturbOnOutlinedIcon from '@mui/icons-material/DoNotDisturbOnOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from '../../_context/NavContext';
import { EndpointDetailDrawer } from './EndpointDetailDrawer';

type EndpointRouteParams = { endpointId?: string };
type EndpointMetadata = { count?: number };

function AvailabilityChip({ available }: { available: boolean }) {
  return (
    <Chip
      color={available ? 'success' : 'default'}
      icon={
        available ? (
          <CheckCircleOutlineRoundedIcon />
        ) : (
          <DoNotDisturbOnOutlinedIcon />
        )
      }
      label={available ? 'Available' : 'Unavailable'}
      size="small"
      variant="outlined"
    />
  );
}

function matchesQuery(endpoint: Endpoints.Endpoint, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  return [
    endpoint.id,
    endpoint.slug,
    endpoint.owner,
    endpoint.proxy_url,
    endpoint.target_base_url,
    endpoint.target_name,
    endpoint.target_resource_urn,
    endpoint.tenant_id,
    endpoint.available ? 'available' : 'unavailable',
  ].some((value) => value?.toLowerCase().includes(normalizedQuery));
}

export default function EndpointsPage() {
  const { endpointId } = useParams<EndpointRouteParams>();
  const { navigate } = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const listQuery = Hooks.Endpoints.useListEndpoints({
    includeCount: true,
    limit: 50,
  });
  const endpoints = listQuery.data?.result ?? [];
  const endpointCount =
    (listQuery.data?.metadata as EndpointMetadata | undefined)?.count ??
    endpoints.length;
  const filteredEndpoints = React.useMemo(
    () => endpoints.filter((endpoint) => matchesQuery(endpoint, searchQuery)),
    [endpoints, searchQuery]
  );

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 1.25,
            mb: 0.5,
          }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
            <LinkOutlinedIcon color="primary" sx={{ fontSize: 30 }} />
            <Typography
              sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}
              variant="h4"
            >
              Endpoints
            </Typography>
          </Stack>
          <Chip
            label={`${endpointCount.toLocaleString()} endpoint${
              endpointCount === 1 ? '' : 's'
            }`}
            size="small"
            variant="outlined"
          />
        </Stack>
        <Typography color="text.secondary">
          View platform-issued addresses for your network-accessible MLHub
          resources.
        </Typography>
      </Box>

      <TextField
        fullWidth
        size="small"
        placeholder="Search endpoints by target, URL, owner, or resource URN..."
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
      />

      {listQuery.isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : listQuery.isError ? (
        <Alert severity="error">
          {listQuery.error instanceof Error
            ? listQuery.error.message
            : 'Unable to load endpoints.'}
        </Alert>
      ) : filteredEndpoints.length === 0 ? (
        <Card variant="outlined">
          <CardContent sx={{ py: 7, textAlign: 'center' }}>
            <LinkOutlinedIcon color="disabled" sx={{ fontSize: 42, mb: 1 }} />
            <Typography variant="h6">
              {endpoints.length
                ? 'No matching endpoints'
                : 'No endpoints found'}
            </Typography>
            <Typography color="text.secondary">
              {endpoints.length
                ? 'Try a different search term.'
                : 'Endpoints are issued when a network-accessible resource is available.'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filteredEndpoints.map((endpoint) => (
            <Grid key={endpoint.id} size={{ xs: 12, md: 6, xl: 4 }}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardActionArea
                  onClick={() =>
                    navigate(`/endpoints/${encodeURIComponent(endpoint.id)}`)
                  }
                  sx={{ height: '100%' }}
                >
                  <CardContent sx={{ height: '100%' }}>
                    <Stack
                      direction="row"
                      sx={{
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 1,
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.25}
                        sx={{ minWidth: 0 }}
                      >
                        <LinkOutlinedIcon color="primary" />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            noWrap
                            sx={{ fontWeight: 700 }}
                            variant="subtitle1"
                          >
                            {endpoint.target_name}
                          </Typography>
                          <Typography
                            color="text.secondary"
                            noWrap
                            variant="caption"
                          >
                            {endpoint.slug}
                          </Typography>
                        </Box>
                      </Stack>
                      <AvailabilityChip available={endpoint.available} />
                    </Stack>
                    <Typography
                      color="text.secondary"
                      sx={{
                        fontFamily: 'monospace',
                        mt: 2,
                        overflowWrap: 'anywhere',
                      }}
                      variant="caption"
                    >
                      {endpoint.proxy_url}
                    </Typography>
                    <Stack spacing={0.5} sx={{ mt: 2 }}>
                      <Typography color="text.secondary" variant="caption">
                        Target resource
                      </Typography>
                      <Typography noWrap variant="body2">
                        {endpoint.target_resource_urn}
                      </Typography>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <EndpointDetailDrawer
        endpointId={endpointId}
        onClose={() => navigate('/endpoints')}
      />
    </Box>
  );
}
