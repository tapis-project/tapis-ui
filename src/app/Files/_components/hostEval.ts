/**
 * Whether asking a system to resolve $HOME means anything.
 *
 * HOST_EVAL runs the variable on the host as the effective user, so it only
 * answers on a Linux system that has one — a system with a fixed effective
 * user has no personal $HOME to ask about — and only when the system is not
 * rooted somewhere below /, since a resolved path outside its root is not a
 * path Tapis will let you list.
 *
 * Extracted so the file rail and the path bar cannot drift: they had one copy
 * of this rule and one button that guessed.
 */
import { Systems } from '@tapis/tapis-typescript';

export const canHostEval = (system?: Systems.TapisSystem): boolean =>
  system?.systemType === Systems.SystemTypeEnum.Linux &&
  Boolean(system?.isDynamicEffectiveUser) &&
  (!system?.rootDir || system?.rootDir === '/');

/** Why it is greyed, for the tooltip that has to say something. */
export const hostEvalBlocker = (
  system?: Systems.TapisSystem
): string | undefined => {
  if (!system) return 'still reading the system';
  if (system.systemType !== Systems.SystemTypeEnum.Linux) {
    return 'only a Linux system can resolve $HOME';
  }
  if (!system.isDynamicEffectiveUser) {
    return 'this system runs as one fixed user, so there is no personal $HOME';
  }
  if (system.rootDir && system.rootDir !== '/') {
    return `this system is rooted at ${system.rootDir}, so a resolved path would fall outside it`;
  }
  return undefined;
};

/**
 * What "the top of this system" actually is, on the machine.
 *
 * The bar and the error panel both say "top of <system>", which is a Tapis
 * word rather than a path — and a system rooted at /work/01234 does not put
 * you at / when you press it. The system definition knows: rootDir is the
 * directory every Tapis path on this system is relative to, and host and
 * effectiveUserId say whose view of it you are getting.
 *
 * Returned as lines rather than a sentence, because the two places that
 * show it are both tooltips and a tooltip reads as a list.
 */
export const describeSystemRoot = (
  systemId: string,
  system?: Systems.TapisSystem
): string[] => {
  if (!system) return [`Still reading the ${systemId} definition`];
  const lines: string[] = [];
  lines.push(`Rooted at ${system.rootDir || '/'}`);
  if (system.host) lines.push(`on ${system.host}`);
  if (system.effectiveUserId) lines.push(`as ${system.effectiveUserId}`);
  if (system.rootDir && system.rootDir !== '/') {
    lines.push(
      'Paths here are relative to that, so / is the root of the system as Tapis sees it, not the root of the host.'
    );
  }
  return lines;
};
