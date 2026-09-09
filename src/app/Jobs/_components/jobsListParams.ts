/**
 * The one jobs-list read the whole Jobs page shares. Nav, dashboard, and the
 * apps page's run-context all key react-query off these exact params, so the
 * page costs a single request no matter how many surfaces consume it.
 *
 * limit: the server defaults to a small page; aggregates over "the last 300
 * jobs" is an honest window we can state in the UI, without pulling a
 * multi-year history on every open.
 */
import { Jobs } from '@tapis/tapis-typescript';

export const JOBS_LIST_LIMIT = 300;

export const JOBS_LIST_PARAMS: Jobs.GetJobListRequest = {
  orderBy: 'created(desc)',
  limit: JOBS_LIST_LIMIT,
};
