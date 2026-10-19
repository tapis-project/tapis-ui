import { ArrowDropDown, ForkRight } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Button, MenuItem, MenuList, Popover, Tooltip } from '@mui/material';
import { useState } from 'react';

interface ForkPopoverProps {
  isLoading?: boolean;
  onFork: () => void;
  onForkAndDeploy: () => void;
  size?: 'small' | 'medium';
}

export function ForkPopover({
  onFork,
  onForkAndDeploy,
  size,
  isLoading = false,
}: ForkPopoverProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const popoverId = open
    ? 'fork-popover-' + Math.random().toString(36).slice(2)
    : undefined;
  const btnSize = size ?? 'small';

  return (
    <>
      <Tooltip title="Fork with options">
        <LoadingButton
          loading={isLoading}
          variant="outlined"
          size={btnSize}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          endIcon={
            <ArrowDropDown
              fontSize={btnSize === 'small' ? 'small' : 'medium'}
            />
          }
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            fontSize: btnSize === 'small' ? '0.8rem' : '0.8125rem',
            pr: 0.75,
            pl: 2,
            height: 28,
            borderRadius: btnSize === 'small' ? '4px' : '6px',
            borderColor: '#e5e7eb',
            color: 'text.primary',
            backgroundColor: '#fafafa',
            '&:hover': {
              backgroundColor: '#f0f0f0',
              borderColor: '#d1d5db',
            },
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.6,
          }}
        >
          <ForkRight
            fontSize={btnSize === 'small' ? 'small' : 'medium'}
            sx={{
              color: '#9ca3af',
              mr: 0.25,
              flexShrink: 0,
            }}
          />
          Fork
        </LoadingButton>
      </Tooltip>

      {/* Popover menu */}
      <Popover
        id={popoverId}
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        PaperProps={{
          sx: {
            minWidth: 220,
            mt: 0.5,
            boxShadow: 6,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <MenuList
          sx={{
            py: 0.5,
            p: 0.25,
            gap: 0,
          }}
        >
          <MenuItem
            onClick={() => {
              onFork();
              setAnchorEl(null);
            }}
            sx={{ fontWeight: 600, fontSize: '0.8125rem', py: 1, gap: 1 }}
          >
            <ForkRight fontSize="small" />
            Fork
          </MenuItem>
          <MenuItem
            onClick={() => {
              onForkAndDeploy();
              setAnchorEl(null);
            }}
            disabled
            sx={{ fontWeight: 600, fontSize: '0.8125rem', py: 1, gap: 1 }}
          >
            <ForkRight fontSize="small" />
            Fork and Deploy
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}
