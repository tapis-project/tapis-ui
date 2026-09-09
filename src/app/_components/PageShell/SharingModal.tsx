/**
 * SharingModal — what sharing and permissions each actually do, one press
 * from the Sharing & access box.
 *
 * The box used to carry this as a grey one-liner under the chips:
 * "sharing lets a user see and use the system; permissions add explicit
 * rights on the definition itself". True, and the single densest sentence
 * on the card — two mechanisms, three verbs and a distinction, in 0.64rem
 * text nobody reads twice. It is a real question with a real answer, so it
 * gets the treatment the auth-method matrix gets: a small ⓘ, and room.
 */
import React from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { GroupsRounded } from '@mui/icons-material';

const HCELL_SX = {
  textAlign: 'left' as const,
  fontSize: '0.62rem',
  fontWeight: 700,
  color: 'text.secondary',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  py: 0.5,
  px: 0.75,
  whiteSpace: 'nowrap' as const,
};

const CELL_SX = {
  fontSize: '0.72rem',
  py: 0.55,
  px: 0.75,
  verticalAlign: 'top' as const,
};

const SharingModal: React.FC<{
  open: boolean;
  onClose: () => void;
  /** singular, lower case — 'system', 'app' */
  noun: string;
  /** what "use it" means for this kind of thing */
  useIt: string;
}> = ({ open, onClose, noun, useIt }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle
      sx={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 1 }}
    >
      <GroupsRounded sx={{ fontSize: 18, color: 'text.disabled' }} />
      Sharing and permissions
    </DialogTitle>
    <DialogContent>
      <Typography sx={{ fontSize: '0.8rem', lineHeight: 1.6, mb: 1.5 }}>
        They are two different doors, and a {noun} can have either without the
        other. Sharing is about <b>reaching</b> the {noun}; permissions are
        about the <b>record</b> itself.
      </Typography>

      <Box
        component="table"
        sx={{ width: '100%', borderCollapse: 'collapse', mb: 1.5 }}
      >
        <thead>
          <tr>
            <Box component="th" sx={HCELL_SX}>
              door
            </Box>
            <Box component="th" sx={HCELL_SX}>
              what it grants
            </Box>
            <Box component="th" sx={HCELL_SX}>
              granted to
            </Box>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Box component="td" sx={{ ...CELL_SX, fontWeight: 600 }}>
              shared with
            </Box>
            <Box component="td" sx={CELL_SX}>
              see the {noun}, and {useIt}
            </Box>
            <Box component="td" sx={CELL_SX}>
              named users, or the whole tenant at once (public)
            </Box>
          </tr>
          <tr>
            <Box component="td" sx={{ ...CELL_SX, fontWeight: 600 }}>
              permissions
            </Box>
            <Box component="td" sx={CELL_SX}>
              explicit rights on the definition: READ, MODIFY, EXECUTE
            </Box>
            <Box component="td" sx={CELL_SX}>
              one named user at a time
            </Box>
          </tr>
        </tbody>
      </Box>

      <Typography
        sx={{ fontSize: '0.74rem', lineHeight: 1.6, color: 'text.secondary' }}
      >
        Two consequences worth knowing. Public sharing and per-user sharing are{' '}
        <b>independent</b>: taking someone off the list does not close a public{' '}
        {noun} to them. And MODIFY or EXECUTE is unusable on its own, so
        granting either sends READ with it; the service will not add it for you.
      </Typography>
    </DialogContent>
  </Dialog>
);

export default SharingModal;
