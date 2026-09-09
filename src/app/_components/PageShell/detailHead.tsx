/**
 * The detail page's head — one shape for /systems/<id>, /jobs/<uuid> and
 * /apps/<id>/<version>.
 *
 * The three pages arrived at three different arrangements of the same
 * facts: the uuid was on the title line here, on the second line there and
 * missing entirely on apps; the owner was a chip on two of them and a fact
 * panel on all three; public-or-not was an icon on one page and a chip on
 * another. They are one component now, so a fact has ONE home:
 *
 *   line 1   [status] title  [what it is]  ······  [acts] [JSON] [cog]
 *   line 2   the description — always, never behind the page's ? switch
 *   line 3   uuid · created · updated
 *
 * The record's tags used to sit between the description and the uuid.
 * They live in the Notes and Labels box now, with the record's own prose:
 * eight of them on one line pushed the id off the fold, and a label is a
 * fact about the thing rather than part of its name.
 *
 * What deliberately is NOT here: the owner. Every page carries a Sharing &
 * access box that answers "whose is this, and who else can reach it", and
 * an `owner x` chip beside the title is the same fact said worse.
 */
import React, { useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  DataObject,
  Lock,
  Public,
  PublicOff,
  Settings,
  VisibilityOffRounded,
} from '@mui/icons-material';
import { HeadAction } from './overviewKit';
import { CopyText, SMALL_CHIP_SX } from './cardKit';
import { actionBar } from './viewPrefs';
import { timeAgo } from 'app/_components/NavV2Kit/navKit';

/**
 * Public or not, said the same way on every page.
 *
 * Both sides are shown, because "who can see this" is a real question in
 * both directions — the bare icon this replaced on the systems card could
 * only answer it on hover.
 */
export const VisibilityChip: React.FC<{ isPublic?: boolean }> = ({
  isPublic,
}) => (
  <Tooltip
    title={
      isPublic
        ? 'Public: visible to the whole tenant'
        : 'Private: yours, and whoever it is shared with'
    }
  >
    <Chip
      size="small"
      icon={
        isPublic ? (
          <Public sx={{ fontSize: 12 }} />
        ) : (
          <PublicOff sx={{ fontSize: 12 }} />
        )
      }
      label={isPublic ? 'public' : 'private'}
      sx={{
        ...SMALL_CHIP_SX,
        // MUI paints a chip's icon a fixed grey regardless of the label's
        // colour, so the public globe was reading as disabled next to blue
        // text. Blue is what this app means by public and by a link, and
        // the glyph is the part you recognise before you read the word.
        '& .MuiChip-icon': { color: 'inherit' },
        ...(isPublic ? { bgcolor: '#e3f2fd', color: '#1565c0' } : {}),
      }}
    />
  </Tooltip>
);

/**
 * Disabled and locked are the two states worth interrupting for; enabled
 * and unlocked are the resting state of nearly everything and a chip for
 * them is noise on every page forever. The lifecycle box says both sides.
 */
export const DisabledChip: React.FC<{ enabled?: boolean; what?: string }> = ({
  enabled,
  what = 'It cannot run while disabled',
}) =>
  enabled === false ? (
    <Tooltip title={what}>
      <Chip
        size="small"
        icon={<Lock sx={{ fontSize: 12 }} />}
        label="disabled"
        sx={{
          ...SMALL_CHIP_SX,
          bgcolor: '#fbe9e7',
          color: '#c62828',
          fontWeight: 600,
        }}
      />
    </Tooltip>
  ) : null;

export const LockedChip: React.FC<{ locked?: boolean; what?: string }> = ({
  locked,
  what = 'Locked: its definition cannot be changed',
}) =>
  locked ? (
    <Tooltip title={what}>
      <Chip
        size="small"
        icon={<Lock sx={{ fontSize: 12 }} />}
        label="locked"
        sx={{ ...SMALL_CHIP_SX, bgcolor: '#fff4e5', color: '#8a6d00' }}
      />
    </Tooltip>
  ) : null;

/**
 * Hidden from the listings — the run is untouched, it just stops being
 * listed. On the head line because the act that sets it is a cog entry, and
 * a state you can only read by reopening the menu that set it is a state
 * nobody can see: hiding a job looked like it did nothing at all.
 */
export const HiddenChip: React.FC<{ visible?: boolean; what?: string }> = ({
  visible,
  what = 'Hidden from the job listings. The job and its output are untouched',
}) =>
  visible === false ? (
    <Tooltip title={what}>
      <Chip
        size="small"
        icon={<VisibilityOffRounded sx={{ fontSize: 12 }} />}
        label="hidden"
        sx={{ ...SMALL_CHIP_SX, bgcolor: '#eceff1', color: '#455a64' }}
      />
    </Tooltip>
  ) : null;

export type CogItem = {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  /** why it is disabled, or what it will do — worth saying on the row */
  hint?: string;
};

/**
 * The head line's cog — the acts that do not earn a button of their own.
 *
 * The systems card had one and the other two pages did not, so the same
 * kind of act (update the record, make another one) was a visible button
 * on apps and a menu entry on systems.
 */
export const SettingsCog: React.FC<{
  items: CogItem[];
  label?: string;
  /** shown above the items — for a state that explains a short menu */
  note?: React.ReactNode;
}> = ({ items, label = 'Settings', note }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  return (
    <span>
      <Tooltip title={label}>
        <IconButton
          size="small"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-haspopup="true"
          aria-label={label}
        >
          <Settings sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuList disablePadding dense>
          {note && (
            <Typography
              sx={{
                px: 2,
                py: 0.75,
                fontSize: '0.7rem',
                color: 'text.secondary',
                maxWidth: 230,
                lineHeight: 1.5,
              }}
            >
              {note}
            </Typography>
          )}
          {items.map((item) => (
            <MenuItem
              key={item.key}
              disabled={item.disabled}
              title={item.hint}
              // MUI disables a menu row with CSS pointer-events, which is a
              // suggestion rather than a guarantee — a real guard here means
              // "update a locked app" cannot fire however the press arrives
              onClick={() => {
                if (item.disabled) return;
                setAnchorEl(null);
                item.onClick();
              }}
            >
              {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
              <ListItemText>{item.label}</ListItemText>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </span>
  );
};

const QUIET_SX = {
  fontSize: '0.66rem',
  color: 'text.disabled',
  whiteSpace: 'nowrap',
} as const;

/**
 * The card's acts, placed where the preference says.
 *
 * On the head line they compete with the title, the chips and (on apps) a
 * monospace id, and past a certain width they simply run out of room. So
 * the cluster is built once and the page asks for it in one of three
 * places — beside the title, on its own row under the id, or as a bar at
 * the card's foot. `foot` cannot be drawn from in here (the fact boxes
 * come after this component), so the page renders `acts.foot` itself.
 */
export const useDetailActs = (parts: {
  actions?: React.ReactNode;
  json?: { open: boolean; onToggle: () => void; label?: string };
  cog?: React.ReactNode;
}) => {
  const where = actionBar.use();
  const { actions, json, cog } = parts;
  const cluster = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        flexWrap: 'wrap',
        // as one block: a cluster that splits mid-way puts the cog on a
        // line of its own with three chips, which is how the apps head
        // line came apart in the first place
        flexShrink: 0,
        ...(where === 'head' ? { ml: 'auto' } : {}),
      }}
    >
      {actions}
      {json && (
        <HeadAction
          label={json.open ? 'Hide JSON' : json.label ?? 'JSON'}
          icon={<DataObject />}
          active={json.open}
          title="The full record, as the API returns it. Opens below the card"
          onClick={json.onToggle}
        />
      )}
      {cog}
    </Box>
  );
  const row = (sx: object) => <Box sx={sx}>{cluster}</Box>;
  return {
    head: where === 'head' ? cluster : null,
    underId: where === 'under-id' ? row({ mt: 0.75 }) : null,
    foot:
      where === 'foot'
        ? row({
            mt: 1.25,
            pt: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
          })
        : null,
  };
};

export type DetailActs = ReturnType<typeof useDetailActs>;

const DetailHead: React.FC<{
  /** a status glyph that belongs before the name, as jobs has */
  leading?: React.ReactNode;
  title: React.ReactNode;
  /** monospace suits an id you would type; a job's name is prose */
  mono?: boolean;
  /** what it IS: type, runtime, image, how it ended */
  chips?: React.ReactNode;
  /** built by useDetailActs, so the preference decides where they land */
  acts?: DetailActs;
  description?: React.ReactNode;
  uuid?: string;
  uuidLabel?: string;
  created?: string;
  updated?: string;
  /** more for the identity line — a tenant, a submitter */
  identity?: React.ReactNode;
  /** lines between the description and the identity line: parentage,
   *  banners, whatever the page alone has */
  children?: React.ReactNode;
}> = ({
  leading,
  title,
  mono,
  chips,
  acts,
  description,
  uuid,
  uuidLabel = 'UUID',
  created,
  updated,
  identity,
  children,
}) => (
  <>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexWrap: 'wrap',
        minWidth: 0,
      }}
    >
      {leading}
      <Typography
        sx={{
          fontSize: mono ? '1.05rem' : '1rem',
          fontWeight: mono ? 700 : 600,
          ...(mono && { fontFamily: 'monospace' }),
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </Typography>
      {chips}
      {acts?.head}
    </Box>

    {/* Always shown. It used to be behind the header's ? switch on the job
        page, which is a page-wide preference about the app's OWN prose —
        it should never have governed what the record itself says. */}
    {description && (
      <Typography
        sx={{ fontSize: '0.76rem', color: 'text.secondary', mt: 0.5 }}
      >
        {description}
      </Typography>
    )}

    {children}

    {/* who it is on the wire, and its clock — the row you copy from into a
        support ticket. Off the title line: an id nobody reads at a glance
        was taking the space the acts needed. */}
    {(uuid || created || updated) && (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          flexWrap: 'wrap',
          mt: 0.75,
        }}
      >
        {uuid && <CopyText value={uuid} title={uuidLabel} quiet />}
        {created && (
          <Tooltip title={created}>
            <Typography sx={QUIET_SX}>
              · created {timeAgo(created as never)}
            </Typography>
          </Tooltip>
        )}
        {updated && (
          <Tooltip title={updated}>
            <Typography sx={QUIET_SX}>
              · updated {timeAgo(updated as never)}
            </Typography>
          </Tooltip>
        )}
        {identity}
      </Box>
    )}

    {acts?.underId}
  </>
);

export default DetailHead;
