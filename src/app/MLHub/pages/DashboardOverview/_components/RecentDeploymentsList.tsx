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
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import type { Deployment } from '../../../types';
import {
  deploymentStatusLabelMap,
  envColorMap,
} from '../../../_components/constants';

interface RecentDeploymentsListProps {
  deployments: Deployment[];
}

export default function RecentDeploymentsList({
  deployments,
}: RecentDeploymentsListProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (deployments.length === 0) {
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
        <Typography color="text.secondary">No deployments yet.</Typography>
      </Card>
    );
  }

  const recent = [...deployments]
    .sort(
      (a, b) =>
        new Date(b.deployedAt || 0).getTime() -
        new Date(a.deployedAt || 0).getTime()
    )
    .slice(0, 5);

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
          <RocketLaunchIcon sx={{ fontSize: 20, color: 'success.main' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Recent Deployments
          </Typography>
          <Chip
            label={`${recent.length}`}
            size="small"
            sx={{ ml: 'auto', fontWeight: 700 }}
          />
        </Box>

        <List disablePadding sx={{ flex: 1, overflow: 'auto' }}>
          {recent.map((dep) => (
            <ListItem
              key={dep.id}
              disableGutters
              onMouseEnter={() => setHoveredId(dep.id)}
              onMouseLeave={() => setHoveredId(null)}
              sx={{
                px: 1.25,
                py: 1,
                borderRadius: 2,
                mb: 0.5,
                cursor: 'pointer',
                transition: 'background-color 0.15s',
                bgcolor: hoveredId === dep.id ? 'action.hover' : 'transparent',
                borderLeft:
                  hoveredId === dep.id
                    ? '3px solid success.main'
                    : '3px solid transparent',
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: (theme) =>
                      alpha(
                        theme.palette[
                          dep.environment === 'production' ? 'error' : 'warning'
                        ].main,
                        0.12
                      ),
                    fontSize: '0.85rem',
                  }}
                >
                  <RocketLaunchIcon sx={{ fontSize: 16 }} />
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, fontSize: '0.85rem' }}
                    >
                      {dep.modelName}
                    </Typography>
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
                    <Chip
                      size="small"
                      label={
                        dep.environment === 'production' ? 'Production' : 'Test'
                      }
                      color={envColorMap[dep.environment]}
                      variant="outlined"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    />
                    <Chip
                      size="small"
                      label={deploymentStatusLabelMap[dep.status] || dep.status}
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.62rem' }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: '0.7rem' }}
                    >
                      {dep.replicas}x · {dep.cpu} CPU / {dep.memory}
                    </Typography>
                  </Box>
                }
                sx={{ mt: 0 }}
              />
              {hoveredId === dep.id && (
                <OpenInNewIcon
                  sx={{ fontSize: 16, opacity: 0.5, color: 'success.main' }}
                />
              )}
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
