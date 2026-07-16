import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { TagCloud } from './utils';
import { ModelActionsBar } from './ModelActionsBar';
import * as Models from '@mlhub/models-ts-sdk';

interface ModelHeaderProps {
  model: Models.ModelMetadata;
}

export function ModelHeader({ model }: ModelHeaderProps) {
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
          src={model.image ?? undefined}
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

        {/* Title and Meta */}
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
            <TagCloud tags={model.tags} sx={{ mt: 2 }} />
          )}
        </Box>

        {/* Actions */}
        <ModelActionsBar model={model} />
      </Stack>
    </Box>
  );
}
