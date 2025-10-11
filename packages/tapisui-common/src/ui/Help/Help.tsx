import React, { useState } from 'react';
import { HelpOutline } from '@mui/icons-material';
import { Drawer, Box, Stack, Grid, Typography } from '@mui/material';

type HelpProps = {
  title: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  width?: string | number;
  minWidth?: string | number;
  height?: string | number;
  showHeader?: boolean;
  childrenSectionHeight?: string | number;
  iframeUrl?: string;
  iframePosition?: 'top' | 'bottom';
};

const Help: React.FC<React.PropsWithChildren<HelpProps>> = ({
  title,
  children,
  position = 'right',
  width = '42vw',
  minWidth = '92vw',
  height = '100vh', // There's a header which autohides, but on scroll up gets shown.
  childrenSectionHeight = '700px',
  showHeader = true,
  iframeUrl,
  iframePosition = 'top',
}) => {
  const [open, setOpen] = useState(false);

  return (
    <span>
      <HelpOutline
        fontSize="small"
        style={{ cursor: 'pointer' }}
        onClick={() => {
          setOpen(!open);
        }}
      />
      <Drawer
        open={open}
        anchor={position}
        onClose={() => {
          setOpen(false);
        }}
      >
        <Box
          sx={{ width, minWidth, height: height, overflow: 'clip' }}
          role="presentation"
        >
          <Stack direction="column" sx={{ height: '100%' }}>
            {showHeader && (
              <Grid>
                <Typography
                  variant="h5"
                  component="h5"
                  sx={{
                    fontWeight: 600,
                    padding: '16px',
                    backgroundColor: '#f0f0f0',
                    color: '#444444',
                    borderBottom: '1px solid #444444',
                  }}
                >
                  {title}
                </Typography>
              </Grid>
            )}
            <Grid sx={{ overflow: 'auto', flexGrow: 1 }}>
              {iframeUrl && iframePosition === 'top' && (
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                  src={iframeUrl}
                />
              )}
              <Box sx={{ height: childrenSectionHeight }}>{children}</Box>
              {iframeUrl && iframePosition === 'bottom' && (
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                  src={iframeUrl}
                />
              )}
            </Grid>
          </Stack>
        </Box>
      </Drawer>
    </span>
  );
};

export default Help;
