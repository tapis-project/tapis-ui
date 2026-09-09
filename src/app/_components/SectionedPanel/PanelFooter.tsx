import React, { useState } from 'react';
import {
  Box,
  ButtonBase,
  Divider,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { UnfoldMoreRounded } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';
import { ACCENT } from './panelKit';
import { listPanels, requestPanel } from './panelSwitch';

// The nav column's bottom strip: which panel am I in, what else exists, and
// the panel's own persistent action (Settings puts Log out here so it's
// reachable from any page, any section).
//
// The switcher is the answer to "a user opened Settings looking for the admin
// tools" — every panel can reach every other one, instead of each living
// behind its own entry point somewhere in the chrome.

const PanelFooter: React.FC<{
  /** Current panel's id (hidden from the switch list). */
  panelId: string;
  /** Current panel's display name. */
  panelLabel: string;
  accent?: string;
  /** Called before switching away (dialog hosts close themselves). */
  onSwitchAway?: () => void;
  /** Panel-specific persistent action(s), rendered under the switcher. */
  children?: React.ReactNode;
}> = ({ panelId, panelLabel, accent = ACCENT, onSwitchAway, children }) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const history = useHistory();
  const others = listPanels().filter((p) => p.id !== panelId);

  return (
    <Box sx={{ flexShrink: 0 }}>
      <Divider />
      <Stack spacing={0.5} sx={{ p: 0.75 }}>
        {others.length > 0 && (
          <>
            <ButtonBase
              onClick={(e) => setAnchor(e.currentTarget)}
              aria-label="Switch panel"
              sx={{
                width: '100%',
                justifyContent: 'space-between',
                gap: 0.5,
                px: 1,
                py: 0.6,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                textAlign: 'left',
                '&:hover': {
                  bgcolor: alpha(accent, 0.08),
                  borderColor: accent,
                },
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: 9,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'text.disabled',
                    lineHeight: 1.2,
                  }}
                >
                  panel
                </Typography>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {panelLabel}
                </Typography>
              </Box>
              <UnfoldMoreRounded
                sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }}
              />
            </ButtonBase>
            <Menu
              anchorEl={anchor}
              open={!!anchor}
              onClose={() => setAnchor(null)}
              anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
              transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              slotProps={{ paper: { sx: { maxWidth: 300 } } }}
            >
              {others.map((p) => (
                <MenuItem
                  key={p.id}
                  onClick={() => {
                    setAnchor(null);
                    onSwitchAway?.();
                    // after this frame, so the closing dialog doesn't eat the
                    // incoming one's focus. The route push (when the target
                    // lives on one) rides along — the arriving host claims
                    // the parked request.
                    setTimeout(
                      () => requestPanel(p.id, (r) => history.push(r)),
                      0
                    );
                  }}
                  sx={{ alignItems: 'flex-start', gap: 1, py: 0.75 }}
                >
                  <Box
                    sx={{
                      width: 3,
                      alignSelf: 'stretch',
                      borderRadius: 2,
                      bgcolor: p.accent,
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>
                      {p.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', whiteSpace: 'normal' }}
                    >
                      {p.blurb}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          </>
        )}
        {children}
      </Stack>
    </Box>
  );
};

export default PanelFooter;
