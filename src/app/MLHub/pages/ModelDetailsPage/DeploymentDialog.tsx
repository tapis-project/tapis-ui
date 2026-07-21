import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

import type {
  DeploymentStrategyReference,
  ModelMetadata,
} from '../../types/model-metadata';

/* ------------------------------------------------------------------ */
/*  Context — dialog owns its own open/strategy state                  */
/* ------------------------------------------------------------------ */

interface DeploymentDialogContextValue {
  openDeploy: (strategy?: DeploymentStrategyReference) => void;
}

const DeploymentDialogContext = createContext<DeploymentDialogContextValue>({
  openDeploy: () => {},
});

export function useDeploymentDialog() {
  return useContext(DeploymentDialogContext);
}

interface DeploymentDialogProviderProps {
  model: ModelMetadata;
  children: ReactNode;
}

export function DeploymentDialogProvider({
  model,
  children,
}: DeploymentDialogProviderProps) {
  const [open, setOpen] = useState(false);
  const [strategy, setStrategy] = useState<
    DeploymentStrategyReference | undefined
  >();

  const openDeploy = useCallback(
    (strategy?: DeploymentStrategyReference) => {
      if (strategy) {
        setStrategy(strategy);
      } else {
        // Default to the first available strategy
        if (model.deployment_strategy_refs.length > 0) {
          setStrategy(model.deployment_strategy_refs[0]);
        }
      }
      setOpen(true);
    },
    [model.deployment_strategy_refs]
  );

  const handleClose = useCallback(() => {
    setOpen(false);
    setStrategy(undefined);
  }, []);

  const handleDeploy = useCallback(() => {
    handleClose();
  }, [handleClose]);

  return (
    <DeploymentDialogContext.Provider value={{ openDeploy }}>
      {children}
      <DeploymentDialogContent
        model={model}
        strategy={strategy}
        open={open}
        onClose={handleClose}
        onDeploy={handleDeploy}
      />
    </DeploymentDialogContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Dialog render                                                       */
/* ------------------------------------------------------------------ */

interface DeploymentDialogContentProps {
  model: ModelMetadata;
  strategy?: DeploymentStrategyReference;
  open: boolean;
  onClose: () => void;
  onDeploy: () => void;
}

export default function DeploymentDialogContent({
  open,
  onClose,
  onDeploy,
  model,
  strategy,
}: DeploymentDialogContentProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <RocketLaunchIcon sx={{ color: 'primary.main' }} />
          Deploy Model
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {/* Model information */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1.5,
              bgcolor: 'info.light',
              borderRadius: 2,
            }}
          >
            <Typography variant="body2">
              Deploying <strong>{model.name}</strong>
              {model.author && (
                <Box component="span" sx={{ ml: 0.5 }}>
                  by <strong>{model.author}</strong>
                </Box>
              )}
            </Typography>
          </Box>

          <Divider />

          {/* Strategy information */}
          {strategy ? (
            <Box>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {strategy.name}
                </Typography>
                {strategy.strategy_id && (
                  <Chip
                    label={strategy.strategy_id}
                    size="small"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
              </Box>

              <Stack spacing={1}>
                {strategy.strategy_id && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Strategy ID
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {strategy.strategy_id}
                    </Typography>
                  </Box>
                )}

                {strategy.endpoint && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Endpoint
                    </Typography>
                    <Link
                      href={strategy.endpoint}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="body2"
                      sx={{ fontWeight: 500 }}
                    >
                      {strategy.endpoint}
                    </Link>
                  </Box>
                )}
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="text.secondary">
                Deployed by <strong>{model.author}</strong>
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No deployment strategy selected.
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onDeploy} variant="contained" disabled={!strategy}>
          Deploy
        </Button>
      </DialogActions>
    </Dialog>
  );
}
