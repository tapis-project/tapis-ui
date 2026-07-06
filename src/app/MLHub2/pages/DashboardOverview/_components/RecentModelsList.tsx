import * as React from 'react';
import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
  alpha,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import type { Model } from '../../../types';
import {
  frameworkLabelMap,
  modelStatusColorMap,
} from '../../../_components/constants';

interface RecentModelsListProps {
  models: Model[];
}

export default function RecentModelsList({ models }: RecentModelsListProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (models.length === 0) {
    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          height: '100%',
          border: '1px solid',
          borderColor: 'divider',
          py: 6,
          textAlign: 'center',
        }}
      >
        <Typography color="text.secondary">
          No models registered yet.
        </Typography>
      </Card>
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <CardContent
        sx={{
          p: 2.5,
          '&:last-child': { pb: 2.5 },
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <SmartToyIcon sx={{ fontSize: 20, color: 'primary.main' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Recent Models
          </Typography>
          <Chip
            label={`${models.length}`}
            size="small"
            sx={{ ml: 'auto', fontWeight: 700 }}
          />
        </Box>

        <List disablePadding sx={{ flex: 1, overflow: 'auto' }}>
          {models.map((model) => (
            <ListItem
              key={model.id}
              disableGutters
              onMouseEnter={() => setHoveredId(model.id)}
              onMouseLeave={() => setHoveredId(null)}
              sx={{
                px: 1.25,
                py: 1,
                borderRadius: 2,
                mb: 0.5,
                cursor: 'pointer',
                transition: 'background-color 0.15s',
                bgcolor:
                  hoveredId === model.id ? 'action.hover' : 'transparent',
                borderLeft:
                  hoveredId === model.id
                    ? '3px solid primary.main'
                    : '3px solid transparent',
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: (theme) =>
                      model.status === 'ready'
                        ? alpha(theme.palette.success.main, 0.12)
                        : model.status === 'pending'
                        ? alpha(theme.palette.warning.main, 0.12)
                        : alpha(theme.palette.grey[300], 0.3),
                    fontSize: '0.85rem',
                  }}
                >
                  {model.name.charAt(0).toUpperCase()}
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, fontSize: '0.85rem' }}
                    >
                      {model.name}
                    </Typography>
                    <Chip
                      size="small"
                      label={`v${model.version}`}
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.65rem', fontWeight: 500 }}
                    />
                  </Box>
                }
                secondary={
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      mt: 0.35,
                      flexWrap: 'wrap',
                    }}
                  >
                    {model.libraries.slice(0, 2).map((lib) => (
                      <Chip
                        key={lib}
                        size="small"
                        label={frameworkLabelMap[lib] ?? lib}
                        variant="outlined"
                        sx={{
                          height: 20,
                          fontSize: '0.62rem',
                          textTransform: 'capitalize',
                          borderColor: 'divider',
                          color: 'text.secondary',
                        }}
                      />
                    ))}
                    {model.libraries.length > 2 && (
                      <Chip
                        size="small"
                        label={`+${model.libraries.length - 2}`}
                        variant="outlined"
                        sx={{
                          height: 20,
                          fontSize: '0.62rem',
                          borderColor: 'divider',
                          color: 'text.secondary',
                        }}
                      />
                    )}
                    <Chip
                      size="small"
                      label={
                        model.status.charAt(0).toUpperCase() +
                        model.status.slice(1)
                      }
                      color={modelStatusColorMap[model.status]}
                      variant="outlined"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    />
                  </Box>
                }
                sx={{ mt: 0 }}
              />
              {hoveredId === model.id && (
                <OpenInNewIcon
                  sx={{ fontSize: 16, opacity: 0.5, color: 'primary.main' }}
                />
              )}
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
