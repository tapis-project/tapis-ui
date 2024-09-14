import React from 'react';
import { Typography } from '@mui/material';

type HelpSectionProps = {
  title?: string;
};

const HelpSection: React.FC<React.PropsWithChildren<HelpSectionProps>> = ({
  title,
  children,
}) => {
  return (
    <div>
      {title && (
        <Typography
          variant="h6"
          component="h6"
          style={{
            padding: '16px',
            backgroundColor: '#f0f0f0',
            color: '#444444',
          }}
        >
          {title}
        </Typography>
      )}
      <div style={{ padding: '16px' }}>{children}</div>
    </div>
  );
};

export default HelpSection;
