import { useState, type ComponentType, type MouseEvent } from 'react';
import AppsIcon from '@mui/icons-material/Apps';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  AppBar,
  Box,
  ButtonBase,
  IconButton,
  InputAdornment,
  Popover,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import type { SvgIconProps } from '@mui/material/SvgIcon';

export type Service = {
  id: string;
  title: string;
  caption: string;
  icon: ComponentType<SvgIconProps>;
  onClick: () => void;
  tags: string[];
  color?: string;
};

export type ServiceCategory = {
  id: string;
  title: string;
  tags: string[];
  services: Service[];
};

type CategoryProps = {
  category: ServiceCategory;
  searchQuery: string;
  onClose: () => void;
};

const matchesSearch = (query: string, values: string[]) => {
  const normalizedQuery = query.trim().toLowerCase();
  return (
    normalizedQuery.length === 0 ||
    values.some((value) => value.toLowerCase().includes(normalizedQuery))
  );
};

export function Category({ category, searchQuery, onClose }: CategoryProps) {
  const categoryMatches = matchesSearch(searchQuery, [
    category.title,
    ...category.tags,
  ]);
  const visibleServices = categoryMatches
    ? category.services
    : category.services.filter((service) =>
        matchesSearch(searchQuery, [
          service.title,
          service.caption,
          ...service.tags,
        ])
      );

  if (visibleServices.length === 0) {
    return null;
  }

  const handleServiceClick = (service: Service) => {
    try {
      service.onClick();
    } finally {
      onClose();
    }
  };
  return (
    <Box component="section" aria-labelledby={`category-${category.id}`}>
      <Typography
        id={`category-${category.id}`}
        variant="overline"
        sx={{
          display: 'block',
          mb: 1,
          color: 'text.secondary',
          fontSize: '0.68rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
        }}
      >
        {category.title}
      </Typography>
      <Box sx={{ display: 'grid', gap: 0.5 }}>
        {visibleServices.map((service) => {
          const ServiceIcon = service.icon;
          return (
            <ButtonBase
              key={service.id}
              component="button"
              onClick={() => handleServiceClick(service)}
              sx={{
                width: '100%',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                borderRadius: 1.5,
                px: 1,
                py: 0.75,
                textAlign: 'left',
                '&:hover': { bgcolor: 'action.hover' },
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: 1,
                },
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                  width: 34,
                  height: 34,
                  mt: 0.15,
                  mr: 1.25,
                  borderRadius: 1.25,
                  color: service.color ?? 'primary.main',
                  bgcolor: service.color
                    ? `${service.color}16`
                    : 'action.selected',
                }}
              >
                <ServiceIcon sx={{ fontSize: 19 }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.primary',
                    fontWeight: 650,
                    lineHeight: 1.3,
                  }}
                >
                  {service.title}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 0.2, lineHeight: 1.35 }}
                >
                  {service.caption}
                </Typography>
              </Box>
              <ArrowOutwardRoundedIcon
                sx={{
                  ml: 'auto',
                  mt: 0.35,
                  fontSize: 15,
                  color: 'text.disabled',
                  opacity: 0.7,
                }}
              />
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
}

type ServiceMenuProps = {
  categories: ServiceCategory[];
  barTitle: string;
  barDescription?: string;
  popoverTitle: string;
  popoverDescription?: string;
};

export default function ServiceMenu({
  categories,
  barTitle,
  barDescription,
  popoverTitle,
  popoverDescription,
}: ServiceMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const open = Boolean(anchorEl);
  const popoverId = open ? 'service-directory-popover' : undefined;

  const handleToggle = (event: MouseEvent<HTMLElement>) => {
    if (anchorEl) {
      handleClose();
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearchQuery('');
  };

  const matchingCategories = categories.filter((category) => {
    const categoryMatches = matchesSearch(searchQuery, [
      category.title,
      ...category.tags,
    ]);
    return (
      categoryMatches ||
      category.services.some((service) =>
        matchesSearch(searchQuery, [
          service.title,
          service.caption,
          ...service.tags,
        ])
      )
    );
  });

  return (
    <>
      <AppBar
        position="static"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: '#ffffff',
          color: '#0f172a',
        }}
      >
        <Toolbar sx={{ minHeight: 64, px: { xs: 2, sm: 3 } }}>
          <IconButton
            aria-label="Open services"
            aria-controls={popoverId}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleToggle}
            sx={{
              width: 42,
              height: 42,
              color: '#000000',
              bgcolor: open ? 'action.selected' : 'transparent',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            {open ? <CloseRoundedIcon /> : <AppsIcon />}
          </IconButton>
          <Typography
            sx={{ ml: 1.5, fontWeight: 750, letterSpacing: '-0.02em' }}
          >
            {barTitle}
          </Typography>
          {barDescription && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ ml: 1.5, display: { xs: 'none', sm: 'block' } }}
            >
              {barDescription}
            </Typography>
          )}
        </Toolbar>
      </AppBar>

      <Popover
        id={popoverId}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1.25,
              width: { xs: 'calc(100vw - 24px)', sm: 760, md: 920 },
              maxWidth: 'calc(100vw - 24px)',
              maxHeight: 'min(720px, calc(100vh - 100px))',
              overflowY: 'auto',
              border: 1,
              borderColor: 'divider',
              boxShadow: '0 18px 50px rgba(15, 23, 42, 0.16)',
              borderRadius: 2.5,
            },
          },
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.paper' }}>
          <Box sx={{ mb: 2.5 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 750, letterSpacing: '-0.02em' }}
            >
              {popoverTitle}
            </Typography>
            {popoverDescription && (
              <Typography variant="body2" color="text.secondary">
                {popoverDescription}
              </Typography>
            )}
          </Box>
          <TextField
            fullWidth
            autoFocus
            size="small"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search services"
            slotProps={{
              htmlInput: { 'aria-label': 'Search services' },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ mb: 3 }}
          />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
              },
              gap: { xs: 3, sm: 3, md: 4 },
            }}
          >
            {matchingCategories.length > 0 ? (
              matchingCategories.map((category) => (
                <Category
                  key={category.id}
                  category={category}
                  searchQuery={searchQuery}
                  onClose={handleClose}
                />
              ))
            ) : (
              <Box
                role="status"
                sx={{
                  gridColumn: '1 / -1',
                  py: 6,
                  textAlign: 'center',
                  color: 'text.secondary',
                }}
              >
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 650, color: 'text.primary' }}
                >
                  No services match “{searchQuery}”
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  Try a different search term or tag.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Popover>
    </>
  );
}

export type { SvgIconProps };
