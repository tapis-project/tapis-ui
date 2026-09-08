import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import HomeIcon from '@mui/icons-material/Home';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { Files as FilesHooks } from '@tapis/tapisui-hooks';
import { Files } from '@tapis/tapis-typescript';
import {
  formatFileExplorerBytes,
  getFileExplorerIcon,
} from '@tapis/tapisui-common';
import { fileInfoPath } from './utils';

interface TreeDirectoryProps {
  systemId: string;
  path: string;
  name: string;
  level: number;
  currentPath: string;
  initiallyExpanded?: boolean;
  collapsible?: boolean;
  onNavigate: (path: string) => void;
  onOpenFile: (file: Files.FileInfo) => void;
}

function TreeDirectory({
  systemId,
  path,
  name,
  level,
  currentPath,
  initiallyExpanded = false,
  collapsible = true,
  onNavigate,
  onOpenFile,
}: TreeDirectoryProps) {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  useEffect(() => {
    if (
      currentPath === path ||
      currentPath.startsWith(`${path.replace(/\/$/, '')}/`)
    ) {
      setExpanded(true);
    }
  }, [currentPath, path]);
  const listing = FilesHooks.useList(
    { systemId, path },
    { enabled: expanded || !collapsible }
  );
  const children = useMemo(
    () =>
      [...(listing.concatenatedResults || [])].sort((left, right) => {
        const leftIsDirectory = left.type === Files.FileTypeEnum.Dir;
        const rightIsDirectory = right.type === Files.FileTypeEnum.Dir;

        if (leftIsDirectory === rightIsDirectory) return 0;
        return leftIsDirectory ? -1 : 1;
      }),
    [listing.concatenatedResults]
  );

  return (
    <>
      {collapsible ? (
        <ListItemButton
          selected={currentPath === path}
          onClick={() => {
            setExpanded((value) => !value);
            onNavigate(path);
          }}
          sx={{
            mx: 0.5,
            pl: 1 + level * 1.5,
            py: 0.45,
            borderRadius: 1.5,
          }}
        >
          <ListItemIcon sx={{ minWidth: 24, color: 'text.secondary' }}>
            {expanded ? (
              <ExpandMoreIcon sx={{ fontSize: 16 }} />
            ) : (
              <ChevronRightIcon sx={{ fontSize: 16 }} />
            )}
          </ListItemIcon>
          {expanded ? (
            <FolderOpenOutlinedIcon
              sx={{ mr: 1, color: '#f59e0b', fontSize: 19 }}
            />
          ) : (
            <FolderIcon sx={{ mr: 1, color: '#f59e0b', fontSize: 19 }} />
          )}
          <ListItemText
            primary={name}
            primaryTypographyProps={{
              noWrap: true,
              fontSize: 13,
              fontWeight: currentPath === path ? 600 : 400,
            }}
          />
        </ListItemButton>
      ) : (
        <ListItemButton
          onClick={() => onNavigate(path)}
          sx={{ px: 1.5, py: 0.75, borderRadius: 1.5 }}
        >
          <HomeIcon sx={{ mr: 1.25, color: '#6b7280', fontSize: 20 }} />
          <ListItemText
            primary={name}
            primaryTypographyProps={{ noWrap: true, fontSize: 14 }}
          />
        </ListItemButton>
      )}
      <Collapse in={!collapsible || expanded} unmountOnExit={collapsible}>
        {listing.isLoading && (
          <Box sx={{ pl: 3 + level * 1.5, py: 1 }}>
            <CircularProgress size={16} />
          </Box>
        )}
        {listing.error && (
          <Typography
            color="error"
            variant="caption"
            sx={{ pl: 3 + level * 1.5 }}
          >
            Unable to load folder
          </Typography>
        )}
        {children.map((child) => {
          const childPath = fileInfoPath(child, path);
          const childName = child.name || childPath;
          const extension = childName.includes('.')
            ? childName.split('.').pop()
            : undefined;
          return child.type === Files.FileTypeEnum.Dir ? (
            <TreeDirectory
              key={childPath}
              systemId={systemId}
              path={childPath}
              name={childName}
              level={level + 1}
              currentPath={currentPath}
              initiallyExpanded={
                currentPath === childPath ||
                currentPath.startsWith(`${childPath}/`)
              }
              onNavigate={onNavigate}
              onOpenFile={onOpenFile}
            />
          ) : (
            <ListItemButton
              key={childPath}
              onClick={() => onOpenFile(child)}
              sx={{
                mx: 0.5,
                pl: 4 + level * 1.5,
                pr: 1,
                py: 0.4,
                borderRadius: 1.5,
                gap: 1,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexShrink: 0,
                }}
              >
                {getFileExplorerIcon('file', extension, child.mimeType, 18)}
              </Box>
              <ListItemText
                primary={childName}
                primaryTypographyProps={{ noWrap: true, fontSize: 12.5 }}
                sx={{ minWidth: 0, my: 0 }}
              />
              {child.size != null && (
                <Typography
                  variant="caption"
                  color="text.disabled"
                  noWrap
                  sx={{ ml: 'auto', flexShrink: 0 }}
                >
                  {formatFileExplorerBytes(child.size * 1024)}
                </Typography>
              )}
            </ListItemButton>
          );
        })}
        {listing.hasNextPage && (
          <Button
            size="small"
            disabled={listing.isFetchingNextPage}
            onClick={() => listing.fetchNextPage()}
            sx={{ ml: 3 + level * 1.5 }}
          >
            {listing.isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        )}
      </Collapse>
    </>
  );
}

export interface LazyFilesTreeProps {
  systemId: string;
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenFile: (file: Files.FileInfo) => void;
  onNewRootFolder?: () => void;
  onNewRootFile?: () => void;
}

export default function LazyFilesTree({
  onNewRootFolder,
  onNewRootFile,
  ...treeProps
}: LazyFilesTreeProps) {
  return (
    <Box
      sx={{
        width: 280,
        flexShrink: 0,
        height: '100%',
        overflowY: 'auto',
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider',
        p: 1,
      }}
    >
      {(onNewRootFolder || onNewRootFile) && (
        <ButtonGroup
          fullWidth
          size="small"
          variant="outlined"
          aria-label="Create an item in the root directory"
          sx={{ mb: 1, '& .MuiButton-root': { textTransform: 'none' } }}
        >
          {onNewRootFolder && (
            <Button
              startIcon={<CreateNewFolderIcon sx={{ fontSize: 16 }} />}
              onClick={onNewRootFolder}
            >
              New Folder
            </Button>
          )}
          {onNewRootFile && (
            <Button
              startIcon={<NoteAddIcon sx={{ fontSize: 16 }} />}
              onClick={onNewRootFile}
            >
              New File
            </Button>
          )}
        </ButtonGroup>
      )}
      <Typography
        component="div"
        variant="overline"
        color="text.secondary"
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          fontWeight: 700,
          mb: 0.5,
          px: 1,
          pb: 0.5,
        }}
      >
        Files & folders
      </Typography>
      <List dense disablePadding>
        <TreeDirectory
          {...treeProps}
          path="/"
          name="Root Directory"
          level={0}
          initiallyExpanded
          collapsible={false}
        />
      </List>
    </Box>
  );
}
