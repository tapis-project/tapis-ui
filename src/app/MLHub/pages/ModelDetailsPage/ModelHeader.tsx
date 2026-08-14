import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import DescriptionIcon from '@mui/icons-material/Description';

import * as Models from '@mlhub/models-ts-sdk';
import { ModelActionsBar } from './ModelActionsBar';
import { ExpandableTagCloud } from './utils';

interface ModelHeaderProps {
  model: Models.ModelMetadata;
}

export function ModelHeader({ model }: ModelHeaderProps) {
  const annotationCount = [].length; // TODO

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        pb: { xs: 1.5, md: 2 },
      }}
    >
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          underline="hover"
          color="inherit"
          sx={{ cursor: 'pointer', color: 'text.secondary' }}
        >
          Models
        </Link>
        <Link
          underline="hover"
          color="inherit"
          sx={{ cursor: 'pointer', color: 'text.secondary' }}
        >
          {model.author}
        </Link>
        <Typography color="text.primary" sx={{ fontWeight: 600 }}>
          {model.name}
        </Typography>
      </Breadcrumbs>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        sx={{ alignItems: { xs: 'flex-start', md: 'center' } }}
      >
        {/* Model Image / Avatar */}
        <Avatar
          alt={model.name}
          sx={{
            width: { xs: 56, md: 72 },
            height: { xs: 56, md: 72 },
            borderRadius: 2,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontSize: { xs: 16, md: 20 },
          }}
        >
          {model.name.charAt(0).toUpperCase()}
        </Avatar>

        {/* Title, Description, Tags, and Actions */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 0.5 }}>
            {model.name}
          </Typography>

          {model.description && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mt: 1, maxWidth: 800 }}
            >
              {model.description}
            </Typography>
          )}

          {model.tags && model.tags.length > 0 && (
            <ExpandableTagCloud
              tags={model.tags}
              showCount={1}
              sx={{ mt: 2 }}
            />
          )}

          {/* Bottom bar: Annotations (left) + Actions (right) */}
          <Box
            sx={{
              mt: 2,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
            {/* Annotations — left */}
            <Tooltip
              title={`View and manage ${annotationCount} annotation${
                annotationCount === 1 ? '' : 's'
              }`}
            >
              <Button
                startIcon={<DescriptionIcon />}
                onClick={() =>
                  alert(
                    `Manage ${annotationCount} annotation${
                      annotationCount === 1 ? '' : 's'
                    } for ${model.name}`
                  )
                }
                variant="text"
                size="small"
                sx={{ textTransform: 'none', fontWeight: 500 }}
              >
                Annotations
                {annotationCount > 0 && (
                  <Box
                    component="span"
                    sx={{
                      ml: 0.5,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 18,
                      height: 18,
                      px: 0.5,
                      borderRadius: '50%',
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                    }}
                  >
                    {annotationCount}
                  </Box>
                )}
              </Button>
            </Tooltip>

            {/* Actions — right */}
            <ModelActionsBar model={model} />
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}
