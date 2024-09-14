import React, { useState } from 'react';
import { HelpOutline } from '@mui/icons-material';
import { Drawer, Box, Typography } from '@mui/material';

type HelpProps = {
  title: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  width?: string | number;
  iframeUrl?: string;
  iframePosition?: 'top' | 'bottom';
};

const Help: React.FC<React.PropsWithChildren<HelpProps>> = ({
  title,
  children,
  position = 'right',
  width = '600px',
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
        <Box sx={{ width }} role="presentation">
          <Typography
            variant="h5"
            component="h5"
            style={{
              fontWeight: 600,
              padding: '16px',
              backgroundColor: '#f0f0f0',
              color: '#444444',
              borderBottom: '1px solid #444444',
            }}
          >
            {title}
          </Typography>
          {iframeUrl && iframePosition === 'top' && (
            <iframe
              width="100%"
              height="700px"
              style={{ border: 'none' }}
              src={iframeUrl}
            />
          )}
          <div>{children}</div>
          {iframeUrl && iframePosition === 'bottom' && (
            <iframe
              width="100%"
              height="700px"
              style={{ border: 'none' }}
              src={iframeUrl}
            />
          )}
        </Box>
      </Drawer>
    </span>
  );
};

export default Help;
