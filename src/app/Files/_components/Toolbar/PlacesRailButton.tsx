/**
 * PlacesRailButton: the path bar's "take me somewhere" control, for a tree
 * whose landmarks are known up front.
 *
 * The host-eval rail asks a Linux host to resolve $HOME, $WORK or $SCRATCH.
 * A pod's container has none of those to ask about: what it has is a root,
 * the volumes mounted into it and the config files the platform wrote into
 * it, and the pod's own definition already says where they all are. So this
 * is the same pill, the same caret, the same menu, with those as its entries
 * and nothing resolved on a host. There is no home beyond the container's
 * root, and the button does not pretend otherwise.
 */
import React, { useRef, useState } from 'react';
import {
  ArrowDropDown,
  DescriptionOutlined,
  FolderOutlined,
  KeyboardDoubleArrowUpRounded,
  StorageRounded,
} from '@mui/icons-material';
import {
  Box,
  ClickAwayListener,
  Divider,
  Grow,
  IconButton,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Tooltip,
  Typography,
} from '@mui/material';
import { PAPER_TOOLTIP } from './ToolbarV2';
import {
  MENU_ICON_SX,
  MENU_ITEM_SX,
  RAIL_CARET_SX,
  RAIL_PILL_SX,
  RAIL_PRIMARY_SX,
} from './HostEvalRailButton';

/** somewhere in the tree worth one press */
export type Landmark = {
  /** what the entry says: usually the path itself */
  label: string;
  /** the directory to go to */
  path: string;
  /** a second line: what is there, or which file this is */
  hint?: string;
  kind?: 'root' | 'mount' | 'config' | 'dir';
};

/** the tree's landmarks, and how to name its top */
export type Landmarks = {
  /** the top, as words: "Root of my-pod" */
  title: string;
  /** what the top is, for its tooltip, one line each */
  rootLines: string[];
  places: Landmark[];
  /** no tapis:// address exists for this tree, so the bar offers none */
  noAddress?: boolean;
};

const ICON: Record<NonNullable<Landmark['kind']>, React.ReactNode> = {
  root: <KeyboardDoubleArrowUpRounded sx={MENU_ICON_SX} />,
  mount: <StorageRounded sx={MENU_ICON_SX} />,
  config: <DescriptionOutlined sx={MENU_ICON_SX} />,
  dir: <FolderOutlined sx={MENU_ICON_SX} />,
};

const PlacesRailButton: React.FC<{
  systemId: string;
  landmarks: Landmarks;
  onNavigate: (path: string, systemId: string) => void;
  /** already at the top, so the top is not somewhere to go */
  atTop?: boolean;
}> = ({ systemId, landmarks, onNavigate, atTop }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const go = (path: string) => {
    setOpen(false);
    onNavigate(path, systemId);
  };
  // the root is the primary press; the caret has it too, with the rest
  const places = landmarks.places.filter((p) => p.kind !== 'root');
  const mounts = places.filter((p) => p.kind === 'mount');
  const configs = places.filter((p) => p.kind === 'config');
  const others = places.filter(
    (p) => p.kind !== 'mount' && p.kind !== 'config'
  );

  const section = (label: string, entries: Landmark[]) =>
    entries.length > 0 && (
      <>
        <Divider sx={{ my: 0.5 }} />
        <Typography
          sx={{
            px: 1.5,
            pt: 0.25,
            pb: 0.25,
            fontSize: '0.62rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'text.disabled',
          }}
        >
          {label}
        </Typography>
        {entries.map((place) => (
          <MenuItem
            key={`${place.kind}:${place.label}`}
            dense
            onClick={() => go(place.path)}
            sx={{ ...MENU_ITEM_SX, alignItems: 'flex-start' }}
          >
            <Box sx={{ pt: '2px' }}>{ICON[place.kind ?? 'dir']}</Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: '0.74rem',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                }}
              >
                {place.label}
              </Typography>
              {place.hint && (
                <Typography
                  sx={{ fontSize: '0.66rem', color: 'text.secondary' }}
                >
                  {place.hint}
                </Typography>
              )}
            </Box>
          </MenuItem>
        ))}
      </>
    );

  return (
    <Box ref={anchorRef} sx={RAIL_PILL_SX}>
      <Tooltip
        arrow
        disableInteractive
        componentsProps={PAPER_TOOLTIP}
        title={
          <Box sx={{ maxWidth: 230 }}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700 }}>
              {landmarks.title}
            </Typography>
            <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>
              Jumps to the root. The caret has the mounts and config files.
            </Typography>
          </Box>
        }
      >
        <span>
          <IconButton
            size="small"
            disabled={atTop}
            onClick={() => go('/')}
            aria-label={landmarks.title}
            sx={RAIL_PRIMARY_SX}
          >
            <KeyboardDoubleArrowUpRounded />
          </IconButton>
        </span>
      </Tooltip>
      <IconButton
        size="small"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Go to a mount or config file"
        aria-haspopup="menu"
        aria-expanded={open}
        sx={RAIL_CARET_SX}
      >
        <ArrowDropDown />
      </IconButton>

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        transition
        sx={{ zIndex: 1300 }}
        modifiers={[{ name: 'flip', enabled: false }]}
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper sx={{ border: '1px solid', borderColor: 'divider' }}>
              <ClickAwayListener onClickAway={() => setOpen(false)}>
                <MenuList
                  autoFocusItem
                  dense
                  sx={{ py: 0.5, minWidth: 230, maxWidth: 360 }}
                >
                  <MenuItem
                    dense
                    disabled={atTop}
                    onClick={() => go('/')}
                    sx={MENU_ITEM_SX}
                  >
                    {ICON.root}
                    {landmarks.title}
                  </MenuItem>
                  {section('Mounts', mounts)}
                  {section('Config files', configs)}
                  {section('Places', others)}
                  {places.length === 0 && (
                    <Typography
                      sx={{
                        px: 1.5,
                        py: 0.75,
                        fontSize: '0.68rem',
                        color: 'text.secondary',
                      }}
                    >
                      Nothing is mounted and no config files are written, so the
                      root is the only landmark.
                    </Typography>
                  )}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Box>
  );
};

export default PlacesRailButton;
