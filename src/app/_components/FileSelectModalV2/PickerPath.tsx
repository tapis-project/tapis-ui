/**
 * PickerPath: where the file picker is, as a path you can walk.
 *
 * The explorer's own breadcrumbs were a row of bare names: nothing between
 * them to say one sits inside the next, nothing for a long path but running
 * off the dialog, and no way back down once you went up. This reads the way
 * the Files page's path bar does (monospace segments, dimmed slashes, a
 * hover fill rather than link blue, the middle of a long path folded into a
 * menu) and adds the two presses a picker lives on:
 *
 *   ↑  up one directory, and from the top of a system, out to Files
 *   ↓  back down the way you came, one level at a time
 *
 * The way you came is a trail. Going up keeps the deeper directories on the
 * bar, dimmed, so each is one press away; opening a different directory
 * starts a new trail, because the old one no longer leads anywhere you are.
 *
 * A location is one list, [system, ...directories]; empty is Files, the
 * list of systems.
 */
import React, { useState } from 'react';
import {
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  ArrowDownwardRounded,
  ArrowUpwardRounded,
  MoreHorizRounded,
} from '@mui/icons-material';

export type PickerLocation = Array<string>;

/** the directory a location names: `/` at the top of a system */
export const locationPath = (loc: PickerLocation) =>
  `/${loc.slice(1).join('/')}`;

/** whether `prefix` leads to (or is) `loc` */
export const leadsTo = (prefix: PickerLocation, loc: PickerLocation) =>
  prefix.length <= loc.length && prefix.every((part, i) => loc[i] === part);

const describe = (loc: PickerLocation) =>
  loc.length ? `${loc[0]} ${locationPath(loc)}` : 'Files';

// a long path keeps its two ends, which are the parts anyone reads: the
// system and its first directory, then where you are and its parent
const KEEP_HEAD = 2;
const KEEP_TAIL = 2;
const MAX_AHEAD = 2;

const CRUMB_SX = {
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  px: '5px',
  py: '1px',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '0.74rem',
  lineHeight: 1.6,
  whiteSpace: 'nowrap',
  // one long name must not push the rest off the bar
  maxWidth: '14em',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  flexShrink: 0,
  color: 'text.secondary',
  '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
} as const;

const SLASH_SX = {
  color: 'text.disabled',
  fontFamily: 'monospace',
  fontSize: '0.74rem',
  flexShrink: 0,
  userSelect: 'none',
} as const;

type Crumb = {
  loc: PickerLocation;
  label: string;
  /** a press, where you are, or below where you are (the way back down) */
  state: 'link' | 'here' | 'ahead';
};
type Slot = Crumb | { fold: Array<Crumb> };

const Press: React.FC<
  React.PropsWithChildren<{
    label: string;
    hint: string;
    disabled?: boolean;
    onClick: () => void;
  }>
> = ({ label, hint, disabled, onClick, children }) => (
  <Tooltip title={hint} describeChild disableInteractive>
    {/* a disabled button fires no events, so the hint rides a span */}
    <span>
      <IconButton
        size="small"
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
        sx={{ p: 0.4, '& svg': { fontSize: 16 } }}
      >
        {children}
      </IconButton>
    </span>
  </Tooltip>
);

const PickerPath: React.FC<{
  here: PickerLocation;
  /** the rest of the trail, below where you are */
  ahead: PickerLocation;
  allowSystemChange?: boolean;
  onGo: (loc: PickerLocation) => void;
}> = ({ here, ahead, allowSystemChange, onGo }) => {
  const [menu, setMenu] = useState<{
    anchor: HTMLElement;
    items: Array<Crumb>;
  } | null>(null);

  // without a system change, the top of this system is as far up as it goes
  const canUp = here.length > (allowSystemChange ? 0 : 1);
  const up = here.slice(0, -1);
  const down = ahead.length ? [...here, ahead[0]] : undefined;

  const hereCrumbs: Array<Crumb> = here.map((part, i) => ({
    loc: here.slice(0, i + 1),
    label: part,
    state: i === here.length - 1 ? 'here' : 'link',
  }));
  const aheadCrumbs: Array<Crumb> = ahead.map((part, i) => ({
    loc: [...here, ...ahead.slice(0, i + 1)],
    label: part,
    state: 'ahead',
  }));

  const slots: Array<Slot> = [];
  if (allowSystemChange)
    slots.push({
      loc: [],
      label: 'Files',
      state: here.length ? 'link' : 'here',
    });
  if (hereCrumbs.length > KEEP_HEAD + KEEP_TAIL + 1)
    slots.push(
      ...hereCrumbs.slice(0, KEEP_HEAD),
      { fold: hereCrumbs.slice(KEEP_HEAD, -KEEP_TAIL) },
      ...hereCrumbs.slice(-KEEP_TAIL)
    );
  else slots.push(...hereCrumbs);
  if (aheadCrumbs.length > MAX_AHEAD)
    slots.push(aheadCrumbs[0], { fold: aheadCrumbs.slice(1) });
  else slots.push(...aheadCrumbs);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.25,
        minWidth: 0,
        mt: 0.75,
      }}
    >
      <Press
        label="Up one directory"
        hint={canUp ? `Up to ${describe(up)}` : 'Already at the top'}
        disabled={!canUp}
        onClick={() => onGo(up)}
      >
        <ArrowUpwardRounded />
      </Press>
      <Press
        label="Back down"
        hint={
          down
            ? `Back down to ${describe(down)}`
            : 'Nothing below to go back down to'
        }
        disabled={!down}
        onClick={() => down && onGo(down)}
      >
        <ArrowDownwardRounded />
      </Press>
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.4 }} />

      <Box
        component="nav"
        aria-label="Path"
        sx={{
          display: 'flex',
          alignItems: 'center',
          minWidth: 0,
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {slots.map((slot, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <Box component="span" aria-hidden sx={SLASH_SX}>
                /
              </Box>
            )}
            {'fold' in slot ? (
              <Box
                component="button"
                type="button"
                aria-label={`Show ${slot.fold.length} more directories`}
                title={slot.fold.map((crumb) => crumb.label).join(' / ')}
                onClick={(event: React.MouseEvent<HTMLElement>) =>
                  setMenu({ anchor: event.currentTarget, items: slot.fold })
                }
                sx={{ ...CRUMB_SX, lineHeight: 0, py: '3px' }}
              >
                <MoreHorizRounded sx={{ fontSize: 14 }} />
              </Box>
            ) : slot.state === 'here' ? (
              <Box
                component="span"
                aria-current="location"
                title={describe(slot.loc)}
                sx={{
                  ...CRUMB_SX,
                  cursor: 'default',
                  color: 'text.primary',
                  fontWeight: 600,
                  '&:hover': {},
                  ...(slot.loc.length === 0 && { fontFamily: 'inherit' }),
                }}
              >
                {slot.label}
              </Box>
            ) : (
              <Box
                component="button"
                type="button"
                title={
                  slot.state === 'ahead'
                    ? `Back down to ${describe(slot.loc)}`
                    : describe(slot.loc)
                }
                onClick={() => onGo(slot.loc)}
                sx={{
                  ...CRUMB_SX,
                  // Files is a place, not a path segment
                  ...(slot.loc.length === 0 && { fontFamily: 'inherit' }),
                  // below where you are: there, but not where you are
                  ...(slot.state === 'ahead' && { color: 'text.disabled' }),
                }}
              >
                {slot.label}
              </Box>
            )}
          </React.Fragment>
        ))}
      </Box>

      <Menu
        anchorEl={menu?.anchor}
        open={Boolean(menu)}
        onClose={() => setMenu(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        {menu?.items.map((item) => (
          <MenuItem
            key={item.loc.join('/')}
            dense
            onClick={() => {
              setMenu(null);
              onGo(item.loc);
            }}
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.74rem',
              ...(item.state === 'ahead' && { color: 'text.secondary' }),
            }}
          >
            {locationPath(item.loc)}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default PickerPath;
