/**
 * The one systems-list read the Files page shares (nav + header count +
 * connection check context).
 *
 * select matters: the endpoint's default is `summaryAttributes`, which OMITS
 * enabled / isPublic / updated / tags — fields the nav's badges and groups
 * are built on. An absent boolean must never be rendered as false (that bug
 * shipped a red "disabled" lock on every row), so the list asks for
 * everything and the badges additionally require `=== false`. hasCredentials
 * also rides along but is deliberately NOT surfaced: it only sees the
 * requesting user's registered credentials, which says nothing for
 * static-effectiveUserId systems.
 */
import { Systems } from '@tapis/tapis-typescript';

export const SYSTEMS_LIST_PARAMS: Systems.GetSystemsRequest = {
  listType: Systems.ListTypeEnum.All,
  select: 'allAttributes',
  limit: -1,
};

/**
 * The spine engine's version of the same read: identical scope and shape
 * (ALL + allAttributes — the generated client's ListTypeEnum has no MINE, so
 * scope-splitting is not on the table yet), but windowed. limit/skip/
 * computeTotal are the window hook's to manage; orderBy makes the pages a
 * stable, resumable sequence instead of whatever the server felt like.
 */
export const SYSTEMS_WINDOW_PARAMS: Omit<
  Systems.GetSystemsRequest,
  'limit' | 'skip' | 'computeTotal'
> = {
  listType: Systems.ListTypeEnum.All,
  select: 'allAttributes',
  orderBy: 'id(asc)',
};
