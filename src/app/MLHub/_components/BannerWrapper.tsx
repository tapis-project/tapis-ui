import React from 'react';
import { Box } from '@mui/material';

type BannerPosition = 'top-middle' | 'top-right-angled';

interface BannerProps {
  text: string;
  position?: BannerPosition;
  bannerColor?: string;
  textColor?: string;
}

const BannerWrapper: React.FC<React.PropsWithChildren<BannerProps>> = ({
  text,
  children,
  position = 'top-middle',
  bannerColor = '#fbc02d',
  textColor = '#000000',
}) => {
  const isAngled = position === 'top-right-angled';

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'grid',
        // This ensures the grid matches the exact intrinsic width of the button
        width: 'max-content',
        overflow: isAngled ? 'hidden' : 'visible',
      }}
    >
      {/* Target item goes in the grid row/column 1 */}
      <Box sx={{ gridArea: '1 / 1' }}>{children}</Box>

      {/* Overlay badge goes in the exact same grid slot */}
      <Box
        sx={{
          gridArea: '1 / 1',
          position: 'absolute',
          justifySelf: 'center', // Centers the badge horizontally over the slot
          ...(isAngled
            ? {
                top: 0,
                right: 0,
                transform: 'translate(30%, -30%) rotate(45deg)',
                transformOrigin: 'bottom left',
                width: '90px',
                padding: '2px 0',
                fontSize: '9px',
                fontWeight: 'bold',
                textAlign: 'center',
              }
            : {
                // Sits exactly 8px above the boundary of the button slot
                top: '-8px',
                padding: '2px 8px',
                fontSize: '10px',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                fontWeight: 'bold',
                transform: 'translateY(-50%)',
              }),
          backgroundColor: bannerColor,
          color: textColor,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          zIndex: 1,
          pointerEvents: 'none',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      >
        {text}
      </Box>
    </Box>
  );
};

export default BannerWrapper;
