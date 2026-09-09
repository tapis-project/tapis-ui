/**
 * UnlinkParentModal — cutting a child system loose from its parent. The
 * spec has offered unlinkFromParent all along; the gear entry was a
 * "not wired yet" stub until now. Confirmed in a dialog because there is
 * no relink door in this UI — undoing it means asking an admin.
 */
import React from 'react';
import { Systems as SystemsHooks } from '@tapis/tapisui-hooks';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import ErrorDetail from 'app/_components/ErrorDetail/ErrorDetail';

const UnlinkParentModal: React.FC<{
  systemId: string;
  parentId: string;
  open: boolean;
  toggle: () => void;
}> = ({ systemId, parentId, open, toggle }) => {
  const { unlink, isLoading, isSuccess, error, invalidate, reset } =
    SystemsHooks.useUnlinkFromParent();

  return (
    <Dialog open={open} onClose={toggle} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontSize: '1rem' }}>Unlink from parent</DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: '0.8rem', lineHeight: 1.6 }}>
          This makes <b>{systemId}</b> a standalone system — <b>{parentId}</b>{' '}
          stops managing its definition, and updates to the parent no longer
          reach it. There is no relink door here: undoing this means asking an
          administrator.
        </Typography>
        {isSuccess && (
          <Typography sx={{ fontSize: '0.76rem', color: '#1b7f3b', mt: 1 }}>
            Unlinked — this system stands on its own now.
          </Typography>
        )}
        {error && (
          <Box sx={{ mt: 1 }}>
            <ErrorDetail message={error.message} fontSize="0.7rem" />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          size="small"
          onClick={() => {
            reset();
            toggle();
          }}
          sx={{ textTransform: 'none' }}
        >
          {isSuccess ? 'Close' : 'Cancel'}
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="error"
          disabled={isLoading || isSuccess}
          onClick={() =>
            unlink(
              { childSystemId: systemId },
              { onSuccess: () => invalidate() }
            )
          }
          sx={{ textTransform: 'none' }}
        >
          {isLoading ? 'Unlinking…' : 'Unlink'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnlinkParentModal;
