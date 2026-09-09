import React, { useState } from 'react';
import { Box, Button, Collapse, Typography } from '@mui/material';
import {
  ArrowUpwardRounded,
  ExpandLess,
  ExpandMore,
  LinkOffOutlined,
  LockOutlined,
  SearchOffOutlined,
  VpnKeyOutlined,
} from '@mui/icons-material';

/**
 * Turning a Files error into something a person can act on.
 *
 * The two failures you actually meet browsing systems are not faults in the
 * UI's sense — one is a setup step, the other is a host being unreachable —
 * and both arrive as a chain of wrapped Java exceptions that the generic red
 * block printed whole:
 *
 *   FILES_OPSC_ERR Operations error. OboTenant: tacc OboUser: cgarcia
 *   Operation: ls System: ssh-test-cgarcia Path: Error: FILES_OPSC_ERR …
 *   Error: FILES_CLIENT_SSH_SESSION_POOL_ERROR … Exception Message:
 *   SSH_POOL_CONNECTION_FAILURE Ssh/Sftp connection failed. Tenant: tacc,
 *   Host: negishi.rcac.purdue.edu, Port: -1, EffectiveUserId: nano1,
 *   AuthnMethod: PKI_KEYS, ConnectionGroupStatus: RECENT_CONNECTION_FAILURE
 *
 * Every layer restates the same three facts. This reads the innermost one,
 * says it in a sentence, and keeps the chain behind a toggle for when you do
 * need to paste it at somebody.
 */
export type FilesErrorKind =
  | 'credentials'
  | 'connection'
  | 'permission'
  | 'notFound';

export type FilesErrorExplanation = {
  kind: FilesErrorKind;
  host?: string;
  user?: string;
  method?: string;
  /** -1 means the system has no port set, which fails every time */
  port?: string;
  /** the system definition's root — the path every listing hangs off */
  rootDir?: string;
  /** RECENT_CONNECTION_FAILURE = the pool is backing off, not retrying now */
  backingOff: boolean;
};

const MISSING_CREDENTIALS = /SSH_POOL_MISSING_CREDENTIALS|missing credentials/i;
const CONNECTION_FAILURE =
  /SSH_POOL_CONNECTION_FAILURE|FILES_CLIENT_SSH_SESSION_POOL_ERROR/i;
// A path that is not there is the third one you meet, and the one the job
// output listing meets constantly: a job that has not started has no output
// directory yet, and an archived one no longer has the original.
const NOT_FOUND =
  /FILES_NOT_FOUND|NOT_FOUND|No such file or directory|does not exist/i;
// And the fourth: the host let Tapis in and then refused this directory.
// Common on a shared filesystem, where reaching a system says nothing about
// which of its directories your unix account can read.
const PERMISSION =
  /SSH_FX_PERMISSION_DENIED|FILES_CLIENT_SSH_PERM_DENIED|FILES_NOT_AUTHORIZED|Permission denied/i;

/**
 * The LAST value wins: each wrapper repeats the fields of the one it wraps,
 * and the innermost is the one that actually failed.
 */
const field = (message: string, name: string): string | undefined => {
  // Stop at a comma, a newline, OR the next `Label:` — the ssh chain
  // separates its fields with commas and the sftp one with spaces, and a
  // greedy match on the second swallowed the rest of the line into the host.
  const pattern = new RegExp(
    `${name}:\\s*(.+?)(?=\\s+[A-Z][A-Za-z]*:|,|\\n|$)`,
    'gi'
  );
  let found: string | undefined;
  let match = pattern.exec(message);
  while (match) {
    found = match[1]?.trim() || found;
    match = pattern.exec(message);
  }
  return found;
};

/** Undefined for anything else, which the caller still shows as an error. */
export const explainFilesError = (
  message?: string
): FilesErrorExplanation | undefined => {
  if (!message) return undefined;
  // Ordered by specificity: a connection chain can mention a path, but a
  // missing path never explains a refused session.
  const kind: FilesErrorKind | undefined = MISSING_CREDENTIALS.test(message)
    ? 'credentials'
    : CONNECTION_FAILURE.test(message)
    ? 'connection'
    : PERMISSION.test(message)
    ? 'permission'
    : NOT_FOUND.test(message)
    ? 'notFound'
    : undefined;
  if (!kind) return undefined;
  return {
    kind,
    host: field(message, 'Host'),
    // the ssh chain says EffectiveUserId, the sftp one says EffectiveUser
    user: field(message, 'EffectiveUserId') ?? field(message, 'EffectiveUser'),
    method: field(message, 'AuthnMethod'),
    port: field(message, 'Port'),
    rootDir: field(message, 'RootDir'),
    backingOff: /RECENT_CONNECTION_FAILURE/i.test(message),
  };
};

/**
 * The chain, out of a failed HTTP response.
 *
 * A PostIt redeem URL is fetched directly rather than through the generated
 * client, so a refusal arrives as a body rather than as a thrown SDK error —
 * and the body is the same Tapis envelope, with the whole chain in `message`.
 * Reading it is the difference between "500 from the file" and "the host
 * refused to read that path".
 */
export const tapisErrorMessage = (body: string): string | undefined => {
  try {
    const parsed = JSON.parse(body);
    const message = parsed?.message;
    return typeof message === 'string' ? message : undefined;
  } catch {
    // Some failures are plain text, or HTML from a proxy in front of Tapis.
    // Some are not failures at all — an image whose <img> gave up gets read
    // back here, and a screenful of PNG presented as an error message is
    // worse than no message.
    if (
      !body.trim() ||
      /[\u0000-\u0008\u000e-\u001f]/.test(body.slice(0, 512))
    ) {
      return undefined;
    }
    return body.slice(0, 2000);
  }
};

/**
 * The same explanation, in one line.
 *
 * The panel above is for a page that has nothing else to show. A file you
 * cannot read is not that — the listing around it is fine, and the right
 * answer is a sentence in passing rather than a window that opens onto an
 * error. Both read the same chain so they cannot say different things.
 */
export const filesErrorSummary = (
  explanation: FilesErrorExplanation,
  what: string,
  systemId: string
): { title: string; detail: string } => {
  const who = explanation.user ? ` as ${explanation.user}` : '';
  const where = explanation.host ?? systemId;
  switch (explanation.kind) {
    case 'permission':
      return {
        title: 'Permission denied',
        detail: `${where} let Tapis in${who}, but ${what} isn't readable by that account — the file's own permissions decide this one.`,
      };
    case 'notFound':
      return {
        title: 'Nothing at that path',
        detail: `Tapis reached ${systemId} but found no ${what}. It may have been moved or deleted since the listing was read.`,
      };
    case 'credentials':
      return {
        title: 'This system needs your credentials',
        detail: `Tapis has no ${readable(explanation.method)} for${
          who || ' you'
        } on ${where}, so it cannot read ${what}.`,
      };
    default:
      return {
        title: `Could not reach ${where}`,
        detail: `Tapis could not open an SSH session${who}${
          explanation.backingOff
            ? ', and is backing off after a recent failure'
            : ''
        }. Nothing is wrong with ${what}.`,
      };
  }
};

const readable = (method?: string) =>
  method ? method.toLowerCase().replaceAll('_', ' ') : 'credential';

// The house button voice: quiet rounded rectangles, a glyph each — matches
// the Files toolbar rail rather than stock MUI blue.
const houseBtnSx = {
  textTransform: 'none',
  fontSize: '0.72rem',
  borderRadius: '5px',
  px: 1,
  py: '2px',
  minWidth: 0,
  color: 'text.secondary',
  borderColor: 'divider',
  '&:hover': { bgcolor: 'rgba(0,0,0,0.04)', borderColor: 'text.disabled' },
} as const;

const FilesErrorPanel: React.FC<{
  systemId: string;
  explanation: FilesErrorExplanation;
  /** the untouched chain, for the details toggle */
  message: string;
  /**
   * The path that was being listed. Taken from the caller rather than the
   * message: every wrapper in the chain carries a `Path:` field and most of
   * them are empty, so reading it back out is guesswork.
   */
  path?: string;
  /**
   * Back, when the page has one.
   *
   * A directory you cannot read is a dead end you arrived at by pressing
   * something, and the useful move is the one that undoes that — not a trip
   * to the system's own page.
   */
  /**
   * Up one directory.
   *
   * Not back. Back is history, and history is not where you want to be sent
   * from a door that will not open — it is wherever you happened to be, and
   * from a link or a fresh tab it is nowhere at all. Up is the move that is
   * always the same one and always somewhere: the directory this one is in.
   * With no directory above, there is nothing to offer and nothing is shown.
   */
  onUp?: () => void;
  /**
   * Go to the top of this system, in place.
   *
   * Without it the button is a link to the Files page, which is right there
   * and wrong inside a job's output listing.
   */
  onTop?: () => void;
  /**
   * Inside the listing rather than instead of it.
   *
   * A directory you cannot read used to replace the whole table, which threw
   * away the column header, the row count and the density switches along
   * with the rows — and told you nothing you could act on that the sentence
   * did not. Embedded, the explorer is still there around the explanation:
   * the path bar, the rail, up, back, and the next directory you try.
   */
  inline?: boolean;
}> = ({ systemId, explanation, message, path, onUp, onTop, inline }) => {
  const [open, setOpen] = useState(false);
  const credentials = explanation.kind === 'credentials';
  const missing = explanation.kind === 'notFound';
  const denied = explanation.kind === 'permission';
  const noPort = explanation.port === '-1';
  // Already at the top of the system: "Browse frontera" is an offer to go
  // where you are standing, and it was being made every time.
  const segments = (path ?? '').split('/').filter(Boolean);
  const atTop = !segments.length;
  // what "up" lands on, named — the parent's own name, or the system when
  // the parent is the top of it
  const upTo = segments.length > 1 ? segments[segments.length - 2] : systemId;
  const systemPage = `/#/systems/${encodeURIComponent(systemId)}`;

  return (
    <Box
      sx={{
        maxWidth: '62ch',
        // embedded, the table is already the frame — a second border inside
        // one is a box in a box
        ...(inline
          ? { mx: 'auto', my: 2.5, p: 1.5 }
          : {
              m: 1,
              p: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: '#fcfcfb',
            }),
      }}
    >
      <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
        {credentials ? (
          <VpnKeyOutlined sx={{ fontSize: 18, color: '#8a6d00', mt: '2px' }} />
        ) : denied ? (
          <LockOutlined sx={{ fontSize: 18, color: '#a35c00', mt: '2px' }} />
        ) : missing ? (
          <SearchOffOutlined
            sx={{ fontSize: 18, color: 'text.secondary', mt: '2px' }}
          />
        ) : (
          <LinkOffOutlined sx={{ fontSize: 18, color: '#c62828', mt: '2px' }} />
        )}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 0.5 }}>
            {credentials
              ? 'This system needs your credentials'
              : denied
              ? 'You do not have permission to read this directory'
              : missing
              ? atTop
                ? 'Nothing at the top of this system'
                : 'Nothing at this path'
              : `Could not reach ${explanation.host ?? 'the host'}`}
          </Typography>

          <Typography
            sx={{
              fontSize: '0.76rem',
              color: 'text.secondary',
              lineHeight: 1.55,
            }}
          >
            {credentials ? (
              <>
                Tapis has no {readable(explanation.method)} for
                {explanation.user ? ` ${explanation.user}` : ' you'}
                {explanation.host ? ` on ${explanation.host}` : ''}, so it
                cannot list files here. Seeing a system is not the same as being
                able to read it — public and shared systems still need a login
                of your own.
              </>
            ) : denied ? (
              <>
                {explanation.host ?? systemId} let Tapis in
                {explanation.user ? ` as ${explanation.user}` : ''} and then
                refused to list{' '}
                <Box component="span" sx={{ fontFamily: 'monospace' }}>
                  {path || 'this directory'}
                </Box>
                . The host's own directory permissions decide this — the same
                answer you would get over SSH. Directories your account owns
                will open normally; if nothing opens, the credentials are worth
                a look.
              </>
            ) : missing && atTop ? (
              // "/" cannot have been moved or deleted — it is the system
              // definition's RootDir, resolved on the host for this login
              <>
                Tapis logged in
                {explanation.user ? ` as ${explanation.user}` : ''}, but the
                system&apos;s root directory
                {explanation.rootDir ? (
                  <>
                    {' '}
                    <Box component="span" sx={{ fontFamily: 'monospace' }}>
                      {explanation.rootDir}
                    </Box>
                  </>
                ) : (
                  ''
                )}{' '}
                is missing on the host — and every path on {systemId} hangs off
                it.
              </>
            ) : missing ? (
              <>
                Tapis reached {systemId} but found nothing at{' '}
                <Box component="span" sx={{ fontFamily: 'monospace' }}>
                  {path || 'this path'}
                </Box>
                . It may have been moved or deleted — or not written yet: a job
                that has not reached its output stage has no output directory.
              </>
            ) : (
              <>
                Tapis could not open an SSH session
                {explanation.user ? ` as ${explanation.user}` : ''}
                {explanation.method
                  ? ` using ${readable(explanation.method)}`
                  : ''}
                . The host may be down or refusing the key — nothing here is
                wrong with your files.
              </>
            )}
          </Typography>

          {/* Two facts from the chain that are worth promoting: one is a
              misconfigured system, the other explains why an immediate retry
              will not help. */}
          {/* Refused at the very top is almost never about the directory —
              that is the one the whole system hangs off. */}
          {denied && atTop && (
            <Typography
              sx={{
                fontSize: '0.74rem',
                color: '#8a6d00',
                mt: 0.75,
                lineHeight: 1.5,
              }}
            >
              Not authorized at the top of a system is usually a credential
              problem — start by checking that yours is still valid on this
              host.
            </Typography>
          )}
          {missing && atTop && (
            <Typography
              sx={{
                fontSize: '0.74rem',
                color: '#8a6d00',
                mt: 0.75,
                lineHeight: 1.5,
              }}
            >
              Either the credential lands as the wrong login, or the
              system&apos;s root is set wrong — start by checking your
              credentials.
            </Typography>
          )}
          {explanation.kind === 'connection' && noPort && (
            <Typography
              sx={{
                fontSize: '0.74rem',
                color: '#8a6d00',
                mt: 0.75,
                lineHeight: 1.5,
              }}
            >
              The system has no SSH port set (port -1). That will fail every
              time until it is corrected on the system definition.
            </Typography>
          )}
          {explanation.kind === 'connection' && explanation.backingOff && (
            <Typography
              sx={{ fontSize: '0.74rem', color: 'text.secondary', mt: 0.5 }}
            >
              Tapis is holding off after a recent failure, so retrying straight
              away will not get through.
            </Typography>
          )}

          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              mt: 1.25,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {/* "Up to tacc" read like a quantity; "Parent · tacc" only
                reads one way. The top-of-system button is gone per field
                feedback — parent, credentials, details is the whole menu. */}
            {onUp && !atTop && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<ArrowUpwardRounded sx={{ fontSize: 15 }} />}
                onClick={onUp}
                sx={houseBtnSx}
              >
                Parent ·&nbsp;
                <Box component="span" sx={{ fontFamily: 'monospace' }}>
                  {upTo}
                </Box>
              </Button>
            )}

            {/* The system's own page, when there is something to do there.
                Nothing on it helps with a subdirectory that does not exist —
                but nothing at the TOP of a system is a creds-or-definition
                problem, and both live on that page. */}
            {(!missing || atTop) && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<VpnKeyOutlined sx={{ fontSize: 15 }} />}
                href={systemPage}
                sx={houseBtnSx}
              >
                {credentials ? 'Set up creds' : 'Check creds'}
              </Button>
            )}
            <Button
              size="small"
              onClick={() => setOpen((wasOpen) => !wasOpen)}
              endIcon={
                open ? (
                  <ExpandLess sx={{ fontSize: 15 }} />
                ) : (
                  <ExpandMore sx={{ fontSize: 15 }} />
                )
              }
              sx={{ ...houseBtnSx, border: 'none' }}
            >
              {open ? 'less' : 'details'}
            </Button>
          </Box>

          <Collapse in={open} unmountOnExit>
            <Box
              component="pre"
              sx={{
                m: 0,
                mt: 1,
                p: 1,
                maxHeight: '30vh',
                overflow: 'auto',
                borderRadius: '4px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                fontFamily: 'monospace',
                fontSize: '0.7rem',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {/* the chain reads as a chain once each 'Error:' starts a line */}
              {message.replace(/\s+Error:/g, '\nError:')}
            </Box>
          </Collapse>
        </Box>
      </Box>
    </Box>
  );
};

export default FilesErrorPanel;
