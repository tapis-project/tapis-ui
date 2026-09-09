import React from 'react';
import { useHistory } from 'react-router-dom';
import { Box, ButtonBase } from '@mui/material';

// The not-logged-in bar for deployments with a public pre-login landing —
// rendered on the prelogin main page only. Deliberately quiet: a hairline
// strip in the portal's purple ($core-portal-color-primary #9d85ef family),
// static text (no marquee — motion is an accessibility wart).

const DEFAULT_TEXT =
  "You're browsing without being signed in — pages that need your account " +
  "won't work until you log in.";

// Portal purple family (matches the sidebar + login buttons).
const PURPLE = '#9d85ef';
const PURPLE_TEXT = '#5f4bb5';

const PreloginBanner: React.FC<{ text?: string }> = ({ text }) => {
  const history = useHistory();
  return (
    <Box
      sx={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 1.75,
        py: '4px',
        minHeight: 30,
        bgcolor: 'rgba(157, 133, 239, 0.09)',
        borderBottom: '1px solid rgba(157, 133, 239, 0.3)',
        color: PURPLE_TEXT,
        fontSize: '0.78rem',
        lineHeight: 1.3,
      }}
    >
      <Box
        sx={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          bgcolor: PURPLE,
          flexShrink: 0,
        }}
      />
      <Box
        component="span"
        sx={{
          flexGrow: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {text ?? DEFAULT_TEXT}
      </Box>
      <ButtonBase
        onClick={() => history.push('/login')}
        sx={{
          flexShrink: 0,
          px: 1.25,
          py: '2px',
          borderRadius: '5px',
          border: '1px solid rgba(157, 133, 239, 0.55)',
          color: PURPLE_TEXT,
          fontSize: '0.72rem',
          fontWeight: 600,
          fontFamily: 'inherit',
          transition: 'background 0.06s, color 0.06s',
          '&:hover': { bgcolor: PURPLE, color: '#ffffff' },
        }}
      >
        Sign in
      </ButtonBase>
    </Box>
  );
};

export default PreloginBanner;
