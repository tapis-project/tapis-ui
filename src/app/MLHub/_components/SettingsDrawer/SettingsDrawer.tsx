import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DashboardCustomizeRoundedIcon from '@mui/icons-material/DashboardCustomizeRounded';

export interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  onConfigureWorkspace: () => void;
}

export default function SettingsDrawer({
  open,
  onClose,
  onConfigureWorkspace,
}: SettingsDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      aria-labelledby="mlhub-settings-title"
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 440 },
            maxWidth: '100vw',
            bgcolor: 'background.default',
          },
        },
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2.25,
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            id="mlhub-settings-title"
            variant="h6"
            sx={{ fontWeight: 750, lineHeight: 1.25 }}
          >
            Settings
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            Personalize your MLHub experience
          </Typography>
        </Box>
        <IconButton aria-label="Close settings" onClick={onClose} size="small">
          <CloseRoundedIcon />
        </IconButton>
      </Box>

      <Divider />

      <Box sx={{ p: 3, overflowY: 'auto' }}>
        <Box component="section" aria-labelledby="workspace-settings-title">
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', mb: 1.5 }}
          >
            <DashboardCustomizeRoundedIcon
              color="primary"
              sx={{ fontSize: 20 }}
            />
            <Typography
              id="workspace-settings-title"
              variant="overline"
              color="text.secondary"
              sx={{ fontWeight: 700, letterSpacing: '0.08em' }}
            >
              Workspace
            </Typography>
          </Stack>

          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Stack spacing={2.25}>
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: 'center' }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    background:
                      'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    flexShrink: 0,
                  }}
                >
                  <AutoAwesomeRoundedIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Configure your workspace
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tailor MLHub around your role, workflows, and experience.
                  </Typography>
                </Box>
              </Stack>

              <Button
                variant="contained"
                startIcon={<AutoAwesomeRoundedIcon />}
                onClick={onConfigureWorkspace}
                sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
              >
                Configure your workspace
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Drawer>
  );
}
