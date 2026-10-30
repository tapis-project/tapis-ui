import * as React from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { useNavigate } from '../../_context/NavContext';
import { DeploymentDetailContent } from '../DeploymentDetailDrawer';

type DeploymentRouteParams = { deploymentId: string };

export default function DeploymentDetailsPage() {
  const { deploymentId } = useParams<DeploymentRouteParams>();
  const { navigate } = useNavigate();
  const deploymentsQuery = Hooks.Deployments.useList();
  const modelsQuery = Hooks.Models.useListByAuthor({ limit: 50 });
  const deployment = React.useMemo(
    () =>
      (deploymentsQuery.data?.result ?? []).find(
        (candidate) => candidate.id === deploymentId
      ),
    [deploymentId, deploymentsQuery.data?.result]
  );
  const model = React.useMemo(
    () =>
      (modelsQuery.data?.result ?? []).find(
        (candidate) =>
          candidate.external_model_id === deployment?.external_model_id
      ),
    [deployment?.external_model_id, modelsQuery.data?.result]
  );

  if (deploymentsQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (deploymentsQuery.isError) {
    return (
      <Alert severity="error">
        {deploymentsQuery.error instanceof Error
          ? deploymentsQuery.error.message
          : 'Unable to load deployment details.'}
      </Alert>
    );
  }

  if (!deployment) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Alert
          severity="info"
          sx={{ display: 'inline-flex', textAlign: 'left' }}
        >
          This deployment is no longer available.
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button
            onClick={() => navigate('/deployments')}
            startIcon={<ArrowBackIcon />}
            variant="outlined"
          >
            Back to deployments
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <DeploymentDetailContent
      deployment={deployment}
      model={model}
      onBack={() => navigate('/deployments')}
    />
  );
}
