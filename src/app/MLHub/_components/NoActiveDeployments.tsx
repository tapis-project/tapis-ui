import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export function NoActiveDeployments({
  onNewDeployment,
}: {
  onNewDeployment?: () => void;
}) {
  return (
    <Box sx={{ py: 3, textAlign: 'center' }}>
      <RocketLaunchIcon color="disabled" sx={{ fontSize: 30, mb: 0.5 }} />
      <Typography sx={{ fontWeight: 600 }} variant="body2">
        No active deployments
      </Typography>
      <Typography color="text.secondary" variant="caption">
        Deployments that are running or can be managed will appear here.
      </Typography>
      {onNewDeployment && (
        <Box sx={{ mt: 1.5 }}>
          <Button
            onClick={onNewDeployment}
            size="small"
            startIcon={<RocketLaunchIcon />}
            variant="outlined"
          >
            New Deployment
          </Button>
        </Box>
      )}
    </Box>
  );
}
