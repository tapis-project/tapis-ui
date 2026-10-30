import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Breadcrumbs,
  Link,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FolderIcon from '@mui/icons-material/Folder';
import HomeIcon from '@mui/icons-material/Home';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewComfyIcon from '@mui/icons-material/ViewComfy';
import HelpIcon from '@mui/icons-material/Help';
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined';
import NavigationOutlinedIcon from '@mui/icons-material/NavigationOutlined';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import HistoryIcon from '@mui/icons-material/History';
import type {
  FileExplorerHistoryControls,
  ViewMode,
} from '../../types/file-system';

export interface ExplorerHeaderProps {
  breadcrumbs: { id: string | null; name: string }[];
  systemHost?: string;
  historyControls?: FileExplorerHistoryControls;
  onNavigateBreadcrumb: (folderId: string | null) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenHelp?: () => void;
  onOpenNavigateDialog?: () => void;
  loading?: boolean;
}

export function ExplorerHeader({
  breadcrumbs,
  systemHost,
  historyControls,
  onNavigateBreadcrumb,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onOpenHelp,
  onOpenNavigateDialog,
  loading = false,
}: ExplorerHeaderProps) {
  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        position: 'relative',
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        zIndex: 1,
      }}
    >
      <Toolbar sx={{ px: { xs: 1.5, sm: 2.5 }, gap: 1.5, minHeight: 64 }}>
        {historyControls && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              p: 0.25,
              borderRadius: 1.5,
              bgcolor: 'action.hover',
            }}
          >
            <Tooltip title="Back">
              <span>
                <IconButton
                  size="small"
                  aria-label="Go back in file navigation history"
                  disabled={!historyControls.canGoBack}
                  onClick={historyControls.onGoBack}
                >
                  <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Navigation history">
              <IconButton
                size="small"
                aria-label="Open file navigation history"
                onClick={historyControls.onOpenHistory}
              >
                <HistoryIcon sx={{ fontSize: 19 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Forward">
              <span>
                <IconButton
                  size="small"
                  aria-label="Go forward in file navigation history"
                  disabled={!historyControls.canGoForward}
                  onClick={historyControls.onGoForward}
                >
                  <ArrowForwardIosIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        )}

        {/* Global Breadcrumbs Navigation */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            minWidth: 0,
          }}
        >
          <Breadcrumbs
            separator="/"
            sx={{
              minWidth: 0,
              overflow: 'hidden',
              '& .MuiBreadcrumbs-separator': {
                mx: 0.75,
                color: 'text.disabled',
              },
              '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap' },
            }}
          >
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              const isRoot = index === 0;

              if (isRoot) {
                const identity = (
                  <>
                    <HomeIcon sx={{ fontSize: '1.1rem', flexShrink: 0 }} />
                    <Box
                      component="span"
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: 0,
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          color: isLast ? 'text.primary' : 'text.secondary',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          lineHeight: 1.2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {crumb.name}
                      </Box>
                      {systemHost && (
                        <Tooltip title={`System host: ${systemHost}`}>
                          <Box
                            component="span"
                            sx={{
                              alignItems: 'center',
                              color: 'text.secondary',
                              display: 'flex',
                              fontSize: '0.7rem',
                              fontWeight: 400,
                              gap: 0.4,
                              lineHeight: 1.2,
                              maxWidth: { xs: 140, sm: 220, md: 300 },
                              mt: 0.25,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <DnsOutlinedIcon
                              sx={{ fontSize: 12, flexShrink: 0 }}
                            />
                            <Box
                              component="span"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {systemHost}
                            </Box>
                          </Box>
                        </Tooltip>
                      )}
                    </Box>
                  </>
                );

                return isLast ? (
                  <Box
                    key={crumb.id || 'root'}
                    sx={{
                      alignItems: 'center',
                      color: 'text.primary',
                      display: 'flex',
                      gap: 0.75,
                      minWidth: 0,
                    }}
                  >
                    {identity}
                  </Box>
                ) : (
                  <Link
                    key={crumb.id || 'root'}
                    component="button"
                    underline="hover"
                    onClick={() => onNavigateBreadcrumb(crumb.id)}
                    sx={{
                      alignItems: 'center',
                      display: 'flex',
                      gap: 0.75,
                      minWidth: 0,
                      textAlign: 'left',
                    }}
                  >
                    {identity}
                  </Link>
                );
              }

              return isLast ? (
                <Typography
                  key={crumb.id || 'root'}
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <FolderIcon
                    fontSize="small"
                    sx={{ fontSize: '1.1rem', color: '#f59e0b' }}
                  />
                  {crumb.name}
                </Typography>
              ) : (
                <Link
                  key={crumb.id || 'root'}
                  component="button"
                  underline="hover"
                  color="text.secondary"
                  onClick={() => onNavigateBreadcrumb(crumb.id)}
                  sx={{
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {crumb.name}
                </Link>
              );
            })}
          </Breadcrumbs>
        </Box>

        {onOpenNavigateDialog && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<NavigationOutlinedIcon fontSize="small" />}
            onClick={onOpenNavigateDialog}
            sx={{
              borderColor: 'divider',
              borderRadius: 1.5,
              color: 'text.primary',
              fontWeight: 600,
              textTransform: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Navigate To
          </Button>
        )}

        {/* Global Search Bar */}
        <Box sx={{ width: { xs: 160, sm: 240, md: 320 } }}>
          <TextField
            size="small"
            placeholder="Search all files..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => onSearchChange('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
                sx: {
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  fontSize: '0.875rem',
                },
              },
            }}
          />
        </Box>

        {/* View Switcher: Grid, List/Table, Compact */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'action.hover',
            p: 0.5,
            borderRadius: 2,
          }}
        >
          <Tooltip title="Table list view">
            <IconButton
              size="small"
              color={viewMode === 'table' ? 'primary' : 'default'}
              onClick={() => onViewModeChange('table')}
              sx={{
                bgcolor:
                  viewMode === 'table' ? 'background.paper' : 'transparent',
                boxShadow: viewMode === 'table' ? 1 : 0,
              }}
            >
              <ViewListIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Grid cards view">
            <IconButton
              size="small"
              color={viewMode === 'grid' ? 'primary' : 'default'}
              onClick={() => onViewModeChange('grid')}
              sx={{
                bgcolor:
                  viewMode === 'grid' ? 'background.paper' : 'transparent',
                boxShadow: viewMode === 'grid' ? 1 : 0,
              }}
            >
              <ViewModuleIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Compact view">
            <IconButton
              size="small"
              color={viewMode === 'compact' ? 'primary' : 'default'}
              onClick={() => onViewModeChange('compact')}
              sx={{
                bgcolor:
                  viewMode === 'compact' ? 'background.paper' : 'transparent',
                boxShadow: viewMode === 'compact' ? 1 : 0,
              }}
            >
              <ViewComfyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Help & Shortcuts Button */}
        {onOpenHelp && (
          <Tooltip title="Keyboard Shortcuts">
            <IconButton size="small" onClick={onOpenHelp}>
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Toolbar>

      {/* Path loading indicator positioned absolutely to prevent layout shifts */}
      {loading && (
        <LinearProgress
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            zIndex: 1,
          }}
        />
      )}
    </AppBar>
  );
}

export default ExplorerHeader;
