import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import { PROFESSIONS } from './wizardOptions';
import type { Persona } from './types';

interface PersonaSummaryProps {
  persona: Persona;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
  onRegenerate: () => void;
}

export default function PersonaSummary({
  persona,
  onSave,
  saving,
  saved,
  onRegenerate,
}: PersonaSummaryProps) {
  const profession = PROFESSIONS.find((p) => p.value === persona.profession);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
          Your workspace is ready
        </Typography>
        <Typography color="text.secondary">
          We curated your workspace from your profession and workflows. Save to
          apply it to your account.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
            <DashboardRoundedIcon />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{ alignItems: 'center', flexWrap: 'wrap' }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {persona.archetype}
              </Typography>
              {profession && (
                <Chip
                  size="small"
                  label={profession.label}
                  variant="outlined"
                />
              )}
              {saved && (
                <Chip
                  size="small"
                  color="success"
                  icon={<CheckCircleIcon />}
                  label="Saved"
                />
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {persona.tagline}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 2.5 }} />

        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Your curated workspace
        </Typography>
        <Stack
          direction="row"
          useFlexGap
          spacing={1}
          sx={{ flexWrap: 'wrap', mb: 2.5 }}
        >
          {persona.workspace.map((mod) => (
            <Box
              key={mod.key}
              title={mod.description}
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: 1,
                borderColor: 'divider',
                bgcolor: 'action.hover',
                flex: '1 1 180px',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {mod.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {mod.description}
              </Typography>
            </Box>
          ))}
        </Stack>

        <List disablePadding>
          {persona.preferences.map((pref) => (
            <ListItem
              key={pref.key}
              disableGutters
              sx={{ py: 1 }}
              role="listitem"
            >
              <ListItemText
                primary={pref.label}
                secondary={pref.value}
                slotProps={{
                  primary: { variant: 'subtitle2', sx: { fontWeight: 600 } },
                  secondary: { variant: 'body2' },
                }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Stack
        direction={{ xs: 'column-reverse', sm: 'row' }}
        spacing={1.5}
        sx={{ justifyContent: 'flex-end' }}
      >
        <Button variant="text" onClick={onRegenerate} disabled={saving}>
          Start over
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={onSave}
          loading={saving}
        >
          {saved ? 'Save again' : 'Save my workspace'}
        </Button>
      </Stack>
    </Stack>
  );
}
