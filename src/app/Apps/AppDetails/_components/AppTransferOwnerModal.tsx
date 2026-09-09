/**
 * Handing an app to someone else. Confirmed in a dialog because it is
 * the one change here you cannot undo yourself: the moment it lands you
 * are no longer the owner, so you cannot transfer it back.
 */
import React, { useState } from 'react';
import { Apps as AppsHooks } from '@tapis/tapisui-hooks';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputBase,
  Typography,
} from '@mui/material';
import ErrorDetail from 'app/_components/ErrorDetail/ErrorDetail';
import { MONO_SX } from 'app/_components/PageShell/cardKit';

const AppTransferOwnerModal: React.FC<{
  appId: string;
  currentOwner: string;
  open: boolean;
  toggle: () => void;
}> = ({ appId, currentOwner, open, toggle }) => {
  const [userName, setUserName] = useState('');
  const { changeOwner, isLoading, isSuccess, error, reset } =
    AppsHooks.useChangeAppOwner();
  const target = userName.trim();

  const close = () => {
    reset();
    setUserName('');
    toggle();
  };

  return (
    <Dialog open={open} onClose={close} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontSize: '1rem' }}>Transfer ownership</DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: '0.8rem', lineHeight: 1.6 }}>
          Hand <b>{appId}</b> to another user. They become the only account that
          can share it, disable it or delete it — and <b>{currentOwner}</b>{' '}
          loses all of that, including the ability to transfer it back.
        </Typography>
        <Box sx={{ mt: 1.5 }}>
          <InputBase
            autoFocus
            fullWidth
            placeholder="new owner's username"
            value={userName}
            disabled={isSuccess}
            onChange={(e) => setUserName(e.target.value)}
            sx={{
              ...MONO_SX,
              fontSize: '0.8rem',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '4px',
              px: 1,
              py: 0.5,
            }}
          />
        </Box>
        {isSuccess && (
          <Typography sx={{ fontSize: '0.76rem', color: '#1b7f3b', mt: 1 }}>
            Transferred — {target} owns this app now.
          </Typography>
        )}
        {error && (
          <Box sx={{ mt: 1 }}>
            <ErrorDetail message={error.message} fontSize="0.7rem" />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button size="small" onClick={close} sx={{ textTransform: 'none' }}>
          {isSuccess ? 'Close' : 'Cancel'}
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="error"
          disabled={!target || isLoading || isSuccess}
          onClick={() => changeOwner({ appId, userName: target })}
          sx={{ textTransform: 'none' }}
        >
          {isLoading ? 'Transferring…' : 'Transfer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppTransferOwnerModal;
