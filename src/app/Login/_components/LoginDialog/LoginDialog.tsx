import React, { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Dialog, IconButton } from '@mui/material';
import { CheckCircleRounded, CloseRounded } from '@mui/icons-material';
import { useTapisConfig } from '@tapis/tapisui-hooks';
import { useExtension } from 'extensions';
import Login from '../Login';
import pageStyles from '../../_Layout/Layout.module.scss';
import styles from './LoginDialog.module.scss';

// Sign-in over the current page — for deployments with a public pre-login
// landing. ProtectedRoute bounces an unauthenticated visitor back to that
// landing with { loginModal: true, from } in location state; the app chrome
// opens this dialog so the user never visually leaves the page they were on.
//
// Visually this is the /login landing page condensed into a dialog: same
// brand block, host chip, and sign-in card (shared SCSS from Login/_Layout),
// a one-line "X needs your account" context line, and a single quiet
// full-page link. Cancel is the ✕ (or backdrop/Esc) — no button row.
//
// The embedded Login form is the same component as the /login page: SSO
// leaves the page entirely (the OAuth2 callback restores `from` from
// sessionStorage), while password login resolves in place — we show a brief
// "taking you there" beat and then navigate to the original target. The beat
// changes words, not layout: the card title says who signed in, the form
// stays put but locked, and the link row says where you're going, so the
// dialog neither jumps nor recentres.

type LoginDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Route the user was headed to when they got bounced. */
  fromPathname?: string;
  fromSearch?: string;
  /** Custom context line — for in-page action gates (e.g. the board's
   *  upcoming previews) where no target route exists. Wins over the
   *  route-derived copy. */
  message?: string;
};

// Words a route spells in lower case that the sidebar spells otherwise.
const ROUTE_WORDS: { [word: string]: string } = {
  ai: 'AI',
  ml: 'ML',
  mlhub: 'ML Hub',
  ui: 'UI',
  mcp: 'MCP',
};

/** '/ai-hub' → 'AI Hub' — good enough for dialog copy. */
const routeLabel = (pathname?: string): string | undefined => {
  const segment = pathname?.split('/').filter(Boolean)[0];
  if (!segment) return undefined;
  return segment
    .split('-')
    .map(
      (word) =>
        ROUTE_WORDS[word] ?? word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ');
};

const SUCCESS_NAVIGATE_MS = 1200;

const LoginDialog: React.FC<LoginDialogProps> = ({
  open,
  onClose,
  fromPathname,
  fromSearch,
  message,
}) => {
  const { accessToken, basePath, claims } = useTapisConfig();
  const { extension } = useExtension();
  const authenticated = Boolean(accessToken?.access_token);
  const username: string | undefined = claims?.['tapis/username'];

  const history = useHistory();
  const location = useLocation();
  const label = routeLabel(fromPathname);

  const host = basePath.replace('https://', '').replace('http://', '');
  const logoSrc =
    extension?.logo?.filePath || extension?.logo?.url || './logo_tapis.png';

  // Password login resolved while the dialog is up: hold on the success
  // beat below for a moment, then continue to the page the user wanted.
  // replace (not push) so Back doesn't land on the modal-opening state.
  useEffect(() => {
    if (!open || !authenticated) return;
    const timer = setTimeout(() => {
      history.replace(
        fromPathname
          ? { pathname: fromPathname, search: fromSearch }
          : location.pathname
      );
    }, SUCCESS_NAVIGATE_MS);
    return () => clearTimeout(timer);
  }, [
    open,
    authenticated,
    fromPathname,
    fromSearch,
    history,
    location.pathname,
  ]);

  return (
    <Dialog
      open={open}
      onClose={authenticated ? undefined : onClose}
      PaperProps={{
        sx: {
          borderRadius: '10px',
          // the page's column width, so the card inside matches the page's
          width: 'min(380px, calc(100vw - 32px))',
          m: 2,
        },
      }}
    >
      <div className={styles.body}>
        {!authenticated && (
          <IconButton
            aria-label="Close"
            size="small"
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'rgba(0, 0, 0, 0.35)',
            }}
          >
            <CloseRounded fontSize="small" />
          </IconButton>
        )}
        <div className={pageStyles.head}>
          <div className={pageStyles.logoRow}>
            <img className={pageStyles.logo} src={logoSrc} alt="" />
          </div>
          <div className={pageStyles.hostRow}>
            <span className={pageStyles.host}>{host}</span>
          </div>
          <div className={pageStyles.description}>
            {message ??
              (label
                ? `${label} requires sign-in.`
                : 'This page requires sign-in.')}
          </div>
        </div>
        <div className={`${pageStyles.signInCard} ${styles.card}`}>
          {authenticated ? (
            <div
              className={`${pageStyles.signInTitle} ${styles.successTitle}`}
              role="status"
            >
              <CheckCircleRounded className={styles.successMark} />
              Signed in{username ? ` as ${username}` : ''}
            </div>
          ) : (
            <div className={pageStyles.signInTitle}>Sign in</div>
          )}
          <div className={authenticated ? styles.locked : undefined}>
            <Login />
          </div>
          {authenticated && (
            <div
              className={styles.successBar}
              style={{ animationDuration: `${SUCCESS_NAVIGATE_MS}ms` }}
            />
          )}
        </div>
        <div className={`${pageStyles.links} ${styles.fullPageLink}`}>
          {authenticated ? (
            <span className={styles.successDetail}>
              {label ? `Opening ${label}…` : 'Continuing…'}
            </span>
          ) : (
            <button
              type="button"
              onClick={() =>
                history.push({
                  pathname: '/login',
                  state: {
                    from: { pathname: fromPathname, search: fromSearch },
                  },
                })
              }
            >
              Open the full login page
            </button>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default LoginDialog;
