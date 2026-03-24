import React, { useRef, useState } from 'react';
import { Systems as SystemsHooks } from '@tapis/tapisui-hooks';
import { useHistory } from 'react-router-dom';
import { ArrowDropDown, HomeOutlined } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  ClickAwayListener,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  type SxProps,
  type Theme,
  TextField,
  Tooltip,
} from '@mui/material';

type EnvVarOption = {
  label: string;
  envVar: string;
};

type NavStatus = 'idle' | 'fetching' | 'navigating';

const defaultEnvVarOptions: EnvVarOption[] = [
  { label: 'Go to $HOME', envVar: 'HOME' },
  { label: 'Go to $WORK', envVar: 'WORK' },
  { label: 'Go to $SCRATCH', envVar: 'SCRATCH' },
];

export type HostEvalNavigationButtonProps = {
  systemId: string;
  isAuthenticated: boolean;
  options?: EnvVarOption[];
  variant?: 'default' | 'toolbar';
};

const normalizeEnvVarInput = (value: string) =>
  value.trim().replace(/^\$+/, '').replace(/\s+/g, '');

const toolbarButtonSx: SxProps<Theme> = {
  height: '2rem',
  marginLeft: '0.5em',
  fontSize: '0.7em',
  borderRadius: '0 !important',
  backgroundColor: '#f4f4f4',
  color: '#333333',
  border: '1px solid #6c757d !important',
  whiteSpace: 'nowrap',
  flexShrink: 0,
  textTransform: 'none',
  minWidth: 'auto',
  '&:hover': {
    backgroundColor: '#ececec',
    borderColor: '#545b62 !important',
  },
  '&.Mui-disabled': {
    color: '#999999',
    backgroundColor: '#f4f4f4',
    borderColor: '#6c757d !important',
  },
};

const toolbarButtonGroupSx: SxProps<Theme> = {
  flexShrink: 0,
  '& .MuiButtonGroup-grouped': {
    borderColor: '#6c757d',
  },
};

const HostEvalNavigationButton: React.FC<HostEvalNavigationButtonProps> = ({
  systemId,
  isAuthenticated,
  options = defaultEnvVarOptions,
  variant = 'default',
}) => {
  const [open, setOpen] = useState(false);
  const [selectedEnvVar, setSelectedEnvVar] = useState(
    options[0]?.envVar ?? 'HOME'
  );
  const [customEnvVarInput, setCustomEnvVarInput] = useState('');
  const [status, setStatus] = useState<NavStatus>('idle');
  const [pendingRefetch, setPendingRefetch] = useState(false);

  const anchorRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const history = useHistory();

  const { data, isLoading, isError, error, refetch } = SystemsHooks.useHostEval(
    { systemId, envVarName: selectedEnvVar },
    {
      enabled: false,
      retry: 0,
      refetchOnWindowFocus: false,
    }
  );

  const path = data?.result?.name;

  // Defer refetch until after setSelectedEnvVar settles so useHostEval sees the new envVarName.
  React.useEffect(() => {
    if (!pendingRefetch) return;
    setPendingRefetch(false);
    setStatus('fetching');
    refetch();
  }, [pendingRefetch, refetch]);

  React.useEffect(() => {
    if (status === 'fetching' && path && !isError) {
      setStatus('navigating');
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        history.push(`/files/${systemId}${path}`);
        setStatus('idle');
        // 1400ms gives the user a moment to read "Going to /path..." before the
        // route changes — long enough to register, short enough to feel snappy.
      }, 1400);
    }
  }, [status, path, isError, history, systemId]);

  const cancelTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const { pathname } = history.location;
  React.useEffect(() => {
    cancelTimer();
    setStatus('idle');
  }, [pathname]);

  React.useEffect(() => {
    if (isError) {
      cancelTimer();
      setStatus('idle');
    }
  }, [isError]);

  React.useEffect(() => {
    return cancelTimer;
  }, []);

  const handleHostVarButtonClick = () => {
    setStatus('fetching');
    refetch();
  };

  const handleMenuItemClick = (option: EnvVarOption) => {
    setSelectedEnvVar(option.envVar);
    setStatus('idle');
    setOpen(false);
  };

  const applyCustomEnvVar = () => {
    const normalizedEnvVar = normalizeEnvVarInput(customEnvVarInput);
    if (!normalizedEnvVar) return;
    setSelectedEnvVar(normalizedEnvVar);
    setCustomEnvVarInput('');
    setOpen(false);
    setPendingRefetch(true);
  };

  const selectedLabel =
    options.find((o) => o.envVar === selectedEnvVar)?.label ??
    `Go to $${selectedEnvVar}`;
  const busy = isLoading || status === 'navigating';
  const isToolbarVariant = variant === 'toolbar';

  return (
    <>
      <ButtonGroup
        variant={isToolbarVariant ? 'outlined' : 'text'}
        size="small"
        ref={anchorRef}
        disabled={!isAuthenticated}
        sx={isToolbarVariant ? toolbarButtonGroupSx : undefined}
      >
        <Button
          onClick={handleHostVarButtonClick}
          disabled={busy}
          startIcon={
            isLoading ? <CircularProgress size={16} /> : <HomeOutlined />
          }
          sx={isToolbarVariant ? toolbarButtonSx : undefined}
        >
          {isLoading
            ? 'Resolving...'
            : status === 'navigating' && path
            ? `Going to ${path} ...`
            : selectedLabel}
        </Button>
        <Button
          onClick={() => setOpen((prev) => !prev)}
          aria-label="select environment variable"
          disabled={busy}
          sx={{
            ...(isToolbarVariant ? (toolbarButtonSx as object) : {}),
            px: 0.25,
            minWidth: '24px !important',
          }}
        >
          <ArrowDropDown fontSize="small" />
        </Button>
      </ButtonGroup>

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        transition
        disablePortal
        sx={{ zIndex: 1 }}
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
            <Paper>
              <ClickAwayListener onClickAway={() => setOpen(false)}>
                <MenuList autoFocusItem dense sx={{ py: 0.5 }}>
                  {options.map((option) => (
                    <MenuItem
                      key={option.envVar}
                      dense
                      selected={option.envVar === selectedEnvVar}
                      onClick={() => handleMenuItemClick(option)}
                      sx={{ fontSize: '0.85rem', minHeight: '2rem', py: 0.5 }}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                  <Box
                    sx={{
                      px: 1,
                      pt: 0.5,
                      pb: 0.5,
                      borderTop: 1,
                      borderColor: 'divider',
                    }}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        mb: 0.5,
                      }}
                    >
                      {/* Box span required: Tooltip needs a ref-forwarding child; plain text nodes can't hold refs */}
                      <Tooltip
                        title="Press Enter to continue"
                        placement="top"
                        arrow
                      >
                        <Box
                          component="span"
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 24,
                            height: 14,
                            border: '1px solid',
                            borderColor: 'text.disabled',
                            borderRadius: '3px',
                            fontSize: '10px',
                            lineHeight: 1,
                            color: 'text.secondary',
                            cursor: 'default',
                            userSelect: 'none',
                          }}
                        >
                          ↵
                        </Box>
                      </Tooltip>
                    </Box>
                    <TextField
                      size="small"
                      fullWidth
                      value={customEnvVarInput}
                      placeholder="Go to $CUSTOM_VAR"
                      aria-label="Custom HOST_EVAL variable"
                      disabled={busy}
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
                          fontSize: '0.85rem',
                          height: '1.8rem',
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

      {isError && error && status === 'idle' && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error.message || `Failed to resolve $${selectedEnvVar}`}
        </Alert>
      )}
    </>
  );
};

export default HostEvalNavigationButton;
