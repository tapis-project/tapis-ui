/**
 * useCredentialProbe: the credential answer on a system card. Two steps,
 * run as two: a cheap registry lookup (is one stored?) and only then the
 * expensive dial (a real connection attempt by the Systems service).
 * "none registered" is answered in milliseconds without touching the host.
 */
import { useEffect, useRef, useState } from 'react';
import { Systems as SystemsHooks, useTapisConfig } from '@tapis/tapisui-hooks';
import { Systems } from '@tapis/tapis-typescript';

/**
 * The dial's two refusals are different facts: "no credential stored for
 * you" (common, often fine — shares and public grants list without one)
 * versus "a stored credential could not connect" (an actual problem).
 * Worded tightly so a DNS "host not found" cannot read as no-credential.
 */
export const isNoCredential = (message?: string): boolean =>
  /CRED_NOT_FOUND|NO_CREDENTIAL|credentials? (?:was |were )?not found|not found[^.]*credential/i.test(
    message ?? ''
  );

/**
 * A listing failure that is about the MACHINE, not about you: timeouts,
 * refused connections, dead routes, unknown hosts. Saying "credentials or
 * shares missing" for a powered-off computer sends people to register keys
 * at a machine that is not listening.
 */
export const isHostDown = (message?: string): boolean =>
  /timed? ?out|timeout|connection refused|no route to host|unreachable|unknown host|could not connect|connection (?:failed|error|closed|reset)|ssh.{0,20}connect/i.test(
    message ?? ''
  );

/**
 * How long the last run of something took — for the two access checks,
 * whose honest cost is part of deciding which to lean on. Timed from the
 * fetching flag flipping on to it flipping off.
 */
const useDuration = (active: boolean): number | null => {
  const started = useRef<number | null>(null);
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => {
    if (active) {
      started.current = Date.now();
    } else if (started.current != null) {
      setMs(Date.now() - started.current);
      started.current = null;
    }
  }, [active]);
  return ms;
};

const useCredentialProbe = ({
  system,
  accessError,
  authenticated,
  deleted,
}: {
  system: Systems.TapisSystem;
  /** the page's passive probe refusal, which triggers the lookup */
  accessError?: Error | null;
  authenticated: boolean;
  deleted?: boolean;
}) => {
  // The other credential answer, on demand: a REAL connection attempt by
  // the Systems service (LINUX and S3 only). Expensive server-side, so it
  // ships disabled and runs only on the press — never because we mounted.
  const credentialCheckable = ['LINUX', 'S3'].includes(
    (system.systemType as string) ?? ''
  );
  const credLookup = SystemsHooks.useGetCredential(
    { systemId: system.id! },
    { enabled: false }
  );
  const credCheck = SystemsHooks.useCheckCredential(
    { systemId: system.id! },
    { enabled: false }
  );
  const lookupMs = useDuration(!!credLookup.isFetching);
  const dialMs = useDuration(!!credCheck.isFetching);
  const runCredCheck = async () => {
    credCheck.remove();
    const found = await credLookup.refetch();
    // Only a POSITIVE "none stored" stops the chain — that answer is final
    // and free. Any other lookup refusal (reading credentials is often more
    // locked-down than dialing them — owners were getting UNAUTH here) must
    // fall through to the dial, which is the actual authority.
    if (found.error && isNoCredential(found.error.message)) return;
    await credCheck.refetch();
  };
  const credSettledError = credCheck.isError
    ? credCheck.error
    : credLookup.isError
    ? credLookup.error
    : null;

  // Whose credential the remove flow aims at: on a static-effectiveUserId
  // system that is the HOST account, not your Tapis name.
  const { claims } = useTapisConfig();
  const credUserName = system.isDynamicEffectiveUser
    ? claims['tapis/username']
    : system.effectiveUserId || claims['tapis/username'];
  // On a static system you do not own, the shared account's credential is
  // not yours to ask about — the service answers SYSLIB_UNAUTH. Say that
  // up front instead of offering a press that can only be refused.
  const isOwner = system.owner === claims['tapis/username'];
  const canDial =
    credentialCheckable && (!!system.isDynamicEffectiveUser || isOwner);

  // A failed probe has three true stories (no creds yet / creds exist but
  // refused / host down) and only the registry can split the first two.
  // The lookup is a registry read, not a host dial — cheap enough to run
  // itself, once per distinct refusal.
  const lookedUpFor = useRef<string | null>(null);
  // bumped by forget: the same refusal after a removal needs a new lookup
  const [forgotten, setForgotten] = useState(0);
  useEffect(() => {
    const msg = accessError?.message;
    // a working probe ends the refusal: the same message later is a new one
    if (authenticated) lookedUpFor.current = null;
    if (deleted) return;
    if (!msg || authenticated || !canDial) return;
    if (isHostDown(msg)) return;
    if (lookedUpFor.current === msg) return;
    lookedUpFor.current = msg;
    credLookup.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessError?.message, authenticated, forgotten]);

  // Both answers and the latch describe a credential that is gone: drop
  // them so the next refusal looks the credential up again.
  const forget = () => {
    lookedUpFor.current = null;
    credLookup.remove();
    credCheck.remove();
    setForgotten((count) => count + 1);
  };

  return {
    credentialCheckable,
    credLookup,
    credCheck,
    lookupMs,
    dialMs,
    runCredCheck,
    credSettledError,
    credUserName,
    isOwner,
    canDial,
    forget,
  };
};

export default useCredentialProbe;
