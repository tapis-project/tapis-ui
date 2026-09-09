/**
 * HostEvalRailButton — the "take me somewhere" control.
 *
 * Same machinery as tapisui-common's HostEvalNavigationButton (which stays
 * for its other consumers): resolve an env var on the host via useHostEval,
 * show the resolved path for a beat, then navigate. Every feature survives
 * the shrink — the $HOME/$WORK/$SCRATCH menu, the custom-variable input, the
 * grace period with cancel-on-route-change, and error surfacing (as a red
 * mark with the message in a paper tooltip instead of a full-width Alert).
 *
 * The top of the system lives in here too, rather than as a second button
 * beside it. They are the same question — "take me to a landmark on this
 * system" — and on a system that cannot resolve $HOME the top is the only
 * answer there is, so it becomes what the button does rather than leaving a
 * greyed-out control that never works.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Systems as SystemsHooks } from '@tapis/tapisui-hooks';
import { useHistory } from 'react-router-dom';
import {
  ArrowDropDown,
  HomeRounded,
  KeyboardDoubleArrowUpRounded,
  PriorityHighRounded,
} from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  ClickAwayListener,
  Grow,
  IconButton,
  Divider,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { PAPER_TOOLTIP } from './ToolbarV2';

type EnvVarOption = { label: string; envVar: string };
type NavStatus = 'idle' | 'fetching' | 'navigating';

const OPTIONS: EnvVarOption[] = [
  { label: 'Go to $HOME', envVar: 'HOME' },
  { label: 'Go to $WORK', envVar: 'WORK' },
  { label: 'Go to $SCRATCH', envVar: 'SCRATCH' },
];

const MENU_ITEM_SX = {
  fontSize: '0.78rem',
  minHeight: '1.9rem',
  py: 0.4,
  gap: 1,
} as const;

const MENU_ICON_SX = { fontSize: 15, color: 'text.disabled' } as const;

const normalizeEnvVarInput = (value: string) =>
  value.trim().replace(/^\$+/, '').replace(/\s+/g, '');

const HostEvalRailButton: React.FC<{
  systemId: string;
  isAuthenticated: boolean;
  /**
   * Browse in place instead of routing to /files — a job's output listing
   * walks its own tree, and jumping to $WORK should not throw the job away.
   */
  onNavigate?: (path: string, systemId: string) => void;
  /** why $HOME is unavailable, when it is unavailable for a nameable reason */
  disabledReason?: string;
  /** take me to the top of this system — the fallback, and a menu entry */
  onTop?: () => void;
  /** already there, so the top is not somewhere to go */
  atTop?: boolean;
}> = ({
  systemId,
  isAuthenticated,
  onNavigate,
  disabledReason,
  onTop,
  atTop,
}) => {
  const [open, setOpen] = useState(false);
  const [selectedEnvVar, setSelectedEnvVar] = useState('HOME');
  const [customEnvVarInput, setCustomEnvVarInput] = useState('');
  const [status, setStatus] = useState<NavStatus>('idle');
  const [pendingRefetch, setPendingRefetch] = useState(false);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const history = useHistory();

  const { data, isLoading, isError, error, refetch } = SystemsHooks.useHostEval(
    { systemId, envVarName: selectedEnvVar },
    { enabled: false, retry: 0, refetchOnWindowFocus: false }
  );
  const path = data?.result?.name;

  // Defer refetch until selectedEnvVar settles so useHostEval sees the new name.
  useEffect(() => {
    if (!pendingRefetch) return;
    setPendingRefetch(false);
    setStatus('fetching');
    refetch();
  }, [pendingRefetch, refetch]);

  useEffect(() => {
    if (status === 'fetching' && path && !isError) {
      setStatus('navigating');
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        if (onNavigate) onNavigate(path, systemId);
        else history.push(`/files/${systemId}${path}`);
        setStatus('idle');
        // long enough to read "→ /path", short enough to feel snappy
      }, 1400);
    }
  }, [status, path, isError, history, systemId, onNavigate]);

  const cancelTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };
  const { pathname } = history.location;
  useEffect(() => {
    cancelTimer();
    setStatus('idle');
  }, [pathname]);
  useEffect(() => {
    if (isError) {
      cancelTimer();
      setStatus('idle');
    }
  }, [isError]);
  useEffect(() => cancelTimer, []);

  const applyCustomEnvVar = () => {
    const normalized = normalizeEnvVarInput(customEnvVarInput);
    if (!normalized) return;
    setSelectedEnvVar(normalized);
    setCustomEnvVarInput('');
    setOpen(false);
    setPendingRefetch(true);
  };

  const busy = isLoading || status === 'navigating';
  const homeLabel =
    OPTIONS.find((o) => o.envVar === selectedEnvVar)?.label ??
    `Go to $${selectedEnvVar}`;

  // On a system that cannot resolve $HOME the top IS the landmark, so the
  // button becomes that rather than sitting greyed out forever.
  const topOnly = !isAuthenticated && Boolean(onTop);
  const label = topOnly ? `Top of ${systemId}` : homeLabel;
  const primaryDisabled = topOnly ? Boolean(atTop) : !isAuthenticated || busy;

  return (
    <Box
      ref={anchorRef}
      sx={{
        display: 'inline-flex',
        // centre, not stretch: the buttons are sized to their glyph and the
        // 20px of content box is exactly two of them, so centring puts the
        // glyph on the pill's midline instead of leaving it to whatever a
        // stretched box does with the space
        alignItems: 'center',
        height: 22,
        boxSizing: 'border-box',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '5px',
        // one control with a caret, not two buttons that happen to touch
        '& .MuiIconButton-root': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        // block, not the default inline: an inline svg sits on a text
        // baseline and reserves room under itself for a descender that is
        // not there, and the tooltip's wrapper span is the same trap one
        // level up. Between them the glyph was riding low, and then high.
        '& .MuiSvgIcon-root': { display: 'block' },
        '& > span': { display: 'inline-flex', alignItems: 'center' },
      }}
    >
      <Tooltip
        arrow
        disableInteractive
        componentsProps={PAPER_TOOLTIP}
        title={
          <Box sx={{ maxWidth: 230 }}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700 }}>
              {label}
            </Typography>
            <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>
              {topOnly
                ? 'Jumps to the root of this system. The caret has the rest.'
                : `Asks the host to resolve $${selectedEnvVar} and jumps to that directory. The caret picks $WORK, $SCRATCH, or any variable.`}
            </Typography>
            {!isAuthenticated && (
              <Typography
                sx={{
                  fontSize: '0.66rem',
                  mt: 0.5,
                  // warm, not grey: this is the reason the thing you wanted
                  // is not on offer, and grey reads as small print
                  color: '#a35c00',
                  fontWeight: 600,
                }}
              >
                {disabledReason ?? 'needs a working listing first'}
              </Typography>
            )}
          </Box>
        }
      >
        <span>
          <IconButton
            size="small"
            disabled={primaryDisabled}
            onClick={() => {
              if (topOnly) {
                onTop?.();
                return;
              }
              setStatus('fetching');
              refetch();
            }}
            aria-label={label}
            sx={{
              // symmetric: 16px of glyph in 20px of content box
              p: '2px',
              borderRadius: '5px 0 0 5px',
              color: 'rgba(0,0,0,0.62)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' },
              '&.Mui-disabled': { color: 'rgba(0,0,0,0.22)' },
              '& .MuiSvgIcon-root': { fontSize: 16 },
            }}
          >
            {isLoading ? (
              <CircularProgress size={15} />
            ) : topOnly ? (
              <KeyboardDoubleArrowUpRounded />
            ) : (
              <HomeRounded />
            )}
          </IconButton>
        </span>
      </Tooltip>
      <IconButton
        size="small"
        disabled={busy}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="select environment variable"
        sx={{
          p: 0,
          pr: '1px',
          borderRadius: '0 5px 5px 0',
          color: 'rgba(0,0,0,0.45)',
          '& .MuiSvgIcon-root': { fontSize: 15 },
        }}
      >
        <ArrowDropDown />
      </IconButton>

      {/* transient feedback stays inline and small */}
      {status === 'navigating' && path && (
        <Typography
          sx={{
            fontSize: '0.66rem',
            color: 'text.secondary',
            maxWidth: 140,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          → {path}
        </Typography>
      )}
      {isError && error && status === 'idle' && (
        <Tooltip
          arrow
          componentsProps={PAPER_TOOLTIP}
          title={error.message || `Failed to resolve $${selectedEnvVar}`}
        >
          <PriorityHighRounded sx={{ fontSize: 14, color: '#c62828' }} />
        </Tooltip>
      )}

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
                <MenuList autoFocusItem dense sx={{ py: 0.5, minWidth: 210 }}>
                  {onTop && (
                    <MenuItem
                      dense
                      disabled={atTop}
                      onClick={() => {
                        setOpen(false);
                        onTop();
                      }}
                      sx={MENU_ITEM_SX}
                    >
                      <KeyboardDoubleArrowUpRounded sx={MENU_ICON_SX} />
                      Top of {systemId}
                    </MenuItem>
                  )}
                  {onTop && <Divider sx={{ my: 0.5 }} />}
                  {!isAuthenticated && (
                    <Typography
                      sx={{
                        px: 1.5,
                        pb: 0.5,
                        fontSize: '0.66rem',
                        color: '#a35c00',
                        fontWeight: 600,
                        maxWidth: 240,
                        whiteSpace: 'normal',
                      }}
                    >
                      {disabledReason ?? 'needs a working listing first'}
                    </Typography>
                  )}
                  {OPTIONS.map((option) => (
                    <MenuItem
                      key={option.envVar}
                      dense
                      disabled={!isAuthenticated}
                      selected={
                        isAuthenticated && option.envVar === selectedEnvVar
                      }
                      onClick={() => {
                        // picking a destination IS the instruction to go
                        // there — it used to only arm the home button, so
                        // $WORK took two presses and looked like nothing
                        // had happened after the first
                        setSelectedEnvVar(option.envVar);
                        setOpen(false);
                        setPendingRefetch(true);
                      }}
                      sx={MENU_ITEM_SX}
                    >
                      <HomeRounded sx={MENU_ICON_SX} />
                      {option.label}
                    </MenuItem>
                  ))}
                  <Box
                    sx={{
                      px: 1,
                      py: 0.5,
                      borderTop: 1,
                      borderColor: 'divider',
                    }}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <TextField
                      size="small"
                      fullWidth
                      value={customEnvVarInput}
                      placeholder="Go to $CUSTOM_VAR — Enter"
                      aria-label="Custom HOST_EVAL variable"
                      disabled={busy || !isAuthenticated}
                      onChange={(event) =>
                        setCustomEnvVarInput(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          applyCustomEnvVar();
                        }
                      }}
                      InputProps={{
                        sx: {
                          borderRadius: '3px',
                          fontSize: '0.8rem',
                          height: '1.7rem',
                        },
                      }}
                    />
                  </Box>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Box>
  );
};

export default HostEvalRailButton;
