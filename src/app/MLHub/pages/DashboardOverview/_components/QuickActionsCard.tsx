import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DataExplorationIcon from '@mui/icons-material/DataExploration';
import ModelFormDialog from '../../../_components/ModelFormDialog';
import DeploymentDialog from '../../../_components/DeploymentDialog';
import { useTapisConfig } from '@tapis/tapisui-hooks';
import { useNavigate } from '../../../_context/NavContext';

export default function QuickActionsCard() {
  const [modal, setModal] = useState<string | undefined>(undefined);
  const { username } = useTapisConfig();
  const { navigate } = useNavigate();

  const actions = [
    {
      label: 'Discover Models',
      icon: <SmartToyIcon />,
      color: 'primary' as const,
      onClick: () => {
        navigate('/marketplaces/models');
      },
    },
    {
      label: 'New Deployment',
      icon: <RocketLaunchIcon />,
      color: 'success' as const,
      onClick: () => {
        setModal('deploymodel');
      },
    },
    // {
    //   label: 'Upload Artifact',
    //   icon: <UploadFileIcon />,
    //   color: 'warning' as const,
    //   onClick: () => {
    //     setModal('createmodel');
    //   },
    // },
    // {
    //   label: 'View Reports',
    //   icon: <AssessmentIcon />,
    //   color: 'info' as const,
    //   onClick: () => {},
    // },
    // {
    //   label: 'Explore Datasets',
    //   icon: <DataExplorationIcon />,
    //   color: 'secondary' as const,
    //   onClick: () => {},
    // },
  ];

  return (
    <>
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          height: '100%',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={1.5}>
            {actions.map((action) => (
              <Grid size={{ xs: 12 }} key={action.label}>
                <Button
                  fullWidth
                  startIcon={action.icon}
                  variant="outlined"
                  color={action.color}
                  onClick={action.onClick}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontWeight: 500,
                    py: 1,
                    borderRadius: 2,
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: `${action.color}.main`,
                      bgcolor: (theme) =>
                        alpha(theme.palette[action.color].main, 0.04),
                    },
                  }}
                >
                  {action.label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/** Modals */}
      <ModelFormDialog
        open={modal === 'createmodel'}
        model={null}
        onClose={() => {
          setModal(undefined);
        }}
      />

      {/* ─── New Deployment Dialog (from Quick Actions) ─── */}
      <DeploymentDialog
        open={modal === 'deploymodel'}
        onClose={() => {
          setModal(undefined);
        }}
        author={username}
      />
    </>
  );
}
