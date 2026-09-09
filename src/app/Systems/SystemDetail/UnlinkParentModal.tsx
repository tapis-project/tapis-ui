/**
 * UnlinkParentModal: confirms unlinkFromParent for a child system. The UI
 * has no relink action, so the dialog asks first.
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
          This makes <b>{systemId}</b> standalone. <b>{parentId}</b> no longer
          manages its definition, and parent updates no longer apply. Only an
          administrator can relink it.
        </Typography>
        {isSuccess && (
          <Typography sx={{ fontSize: '0.76rem', color: '#1b7f3b', mt: 1 }}>
            Unlinked.
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
