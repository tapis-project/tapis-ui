import { useState, type ComponentType, type MouseEvent } from 'react';
import AppsIcon from '@mui/icons-material/Apps';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  AppBar,
  Avatar,
  Box,
  ButtonBase,
  Divider,
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
  /** Featured placement; lower values appear first. */
  featured?: number;
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
  settingsService?: Service;
  barTitle: string;
  barDescription?: string;
  popoverTitle: string;
  popoverDescription?: string;
};

export default function ServiceMenu({
  categories,
  settingsService,
  barTitle,
  barDescription,
  popoverTitle,
  popoverDescription,
}: ServiceMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [avatarAnchorEl, setAvatarAnchorEl] = useState<HTMLElement | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const open = Boolean(anchorEl);
  const avatarMenuOpen = Boolean(avatarAnchorEl);
  const popoverId = open ? 'service-directory-popover' : undefined;
  const avatarMenuId = avatarMenuOpen ? 'user-menu-popover' : undefined;

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

  const handleAvatarMenuClose = () => {
    setAvatarAnchorEl(null);
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
  const visibleFeaturedServices = categories
    .flatMap((category) => category.services)
    .filter((service) => Number.isInteger(service.featured))
    .sort((a, b) => (a.featured ?? 0) - (b.featured ?? 0))
    .slice(0, 3);
  const SettingsServiceIcon = settingsService?.icon;

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
          <Box sx={{ ml: 1.5, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 750, letterSpacing: '-0.02em' }}>
              {barTitle}
            </Typography>
            {barDescription && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', lineHeight: 1.2 }}
              >
                {barDescription}
              </Typography>
            )}
          </Box>
          {settingsService && (
            <IconButton
              aria-label="Open user menu"
              aria-controls={avatarMenuId}
              aria-haspopup="true"
              aria-expanded={avatarMenuOpen ? 'true' : undefined}
              onClick={(event) => {
                handleClose();
                setAvatarAnchorEl(event.currentTarget);
              }}
              sx={{ ml: 'auto', p: 0.25 }}
            >
              <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main' }}>
                <PersonRoundedIcon />
              </Avatar>
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {settingsService && (
        <Popover
          id={avatarMenuId}
          open={avatarMenuOpen}
          anchorEl={avatarAnchorEl}
          onClose={handleAvatarMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                minWidth: 200,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1.5,
                boxShadow: '0 12px 32px rgba(15, 23, 42, 0.14)',
              },
            },
          }}
        >
          <ButtonBase
            component="button"
            onClick={() => {
              try {
                settingsService.onClick();
              } finally {
                handleAvatarMenuClose();
              }
            }}
            sx={{
              width: '100%',
              justifyContent: 'flex-start',
              px: 1.5,
              py: 1.25,
              textAlign: 'left',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            {SettingsServiceIcon && (
              <SettingsServiceIcon
                sx={{
                  mr: 1.25,
                  color: settingsService.color ?? 'primary.main',
                }}
              />
            )}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 650 }}>
                {settingsService.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {settingsService.caption}
              </Typography>
            </Box>
          </ButtonBase>
        </Popover>
      )}

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
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              border: 1,
              borderColor: 'divider',
              boxShadow: '0 18px 50px rgba(15, 23, 42, 0.16)',
              borderRadius: 2.5,
            },
          },
        }}
      >
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
          }}
        >
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
            sx={{ mb: visibleFeaturedServices.length > 0 ? 2 : 3 }}
          />
          <Box
            sx={{
              flex: '1 1 auto',
              minHeight: 0,
              overflowY: 'auto',
              pr: 1,
            }}
          >
            {visibleFeaturedServices.length > 0 && (
              <>
                <Box component="section" aria-labelledby="featured-services">
                  <Typography
                    id="featured-services"
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
                    Featured
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(3, minmax(0, 1fr))',
                      },
                      gap: 1,
                    }}
                  >
                    {visibleFeaturedServices.map((service) => {
                      const ServiceIcon = service.icon;
                      return (
                        <ButtonBase
                          key={service.id}
                          component="button"
                          onClick={() => {
                            try {
                              service.onClick();
                            } finally {
                              handleClose();
                            }
                          }}
                          sx={{
                            minWidth: 0,
                            justifyContent: 'flex-start',
                            alignItems: 'flex-start',
                            border: 1,
                            borderColor: service.color ?? 'primary.light',
                            borderRadius: 1.5,
                            px: 1,
                            py: 0.75,
                            textAlign: 'left',
                            bgcolor: 'background.paper',
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
                              width: 32,
                              height: 32,
                              mt: 0.15,
                              mr: 1,
                              borderRadius: 1.25,
                              color: service.color ?? 'primary.main',
                              bgcolor: service.color
                                ? `${service.color}16`
                                : 'action.selected',
                            }}
                          >
                            <ServiceIcon sx={{ fontSize: 18 }} />
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
                              sx={{
                                display: 'block',
                                mt: 0.2,
                                lineHeight: 1.35,
                              }}
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
                <Divider sx={{ my: 3 }} />
              </>
            )}
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
        </Box>
      </Popover>
    </>
  );
}

export type { SvgIconProps };
