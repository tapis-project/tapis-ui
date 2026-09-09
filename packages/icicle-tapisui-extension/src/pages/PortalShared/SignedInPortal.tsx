import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { useLoginPrompt } from '@tapis/tapisui-common';

/**
 * Full-bleed frame for a hosted ICICLE portal that needs a Tapis session.
 *
 * Services listed in the extension's `prelogin.sidebarServices` render as
 * PUBLIC routes — the component is mounted with `accessToken` undefined for
 * visitors who have never logged in. So the signed-out branch has to invite
 * them to sign in rather than report a broken token; it raises the app's
 * login modal over this page (loginPromptState) and records the route as
 * `from`, so logging in returns them to the portal they asked for.
 */
export const SignedInPortal: React.FC<{
  accessToken?: string;
  src: string;
  title: string;
  /** One line on what the portal is, shown to signed-out visitors. */
  blurb?: string;
}> = ({ accessToken, src, title, blurb }) => {
  const location = useLocation();
  // before the early return below: hooks run in the same order every render
  const promptLogin = useLoginPrompt();

  if (accessToken) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <iframe
          style={{ flexGrow: 1, border: 'none' }}
          src={src}
          title={title}
        />
      </div>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        p: 4,
        textAlign: 'center',
      }}
    >
      <Typography variant="h6">Sign in to open {title}</Typography>
      {blurb && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 460 }}
        >
          {blurb}
        </Typography>
      )}
      <Button
        variant="contained"
        disableElevation
        sx={{ mt: 1, textTransform: 'none' }}
        onClick={() =>
          promptLogin({
            message: `Sign in to open ${title}.`,
            from: { pathname: location.pathname },
          })
        }
      >
        Sign in
      </Button>
    </Box>
  );
};

export default SignedInPortal;
