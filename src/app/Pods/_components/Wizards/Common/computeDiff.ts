export interface DiffResult {
  added: Record<string, any>;
  removed: Record<string, any>;
  modified: Record<string, { from: any; to: any }>;
  unchanged: Record<string, any>;
  /** Flattened object of only the fields that changed (added + modified values) — ready for API submission */
  patch: Record<string, any>;
  hasChanges: boolean;
}

/**
 * Deep-compare two objects and return categorized differences.
 * For nested objects, overwrites are treated as full-object changes (matching API merge-PUT behavior).
 */
export function computeDiff(
  original: Record<string, any> | undefined,
  current: Record<string, any> | undefined
): DiffResult {
  const orig = original ?? {};
  const curr = current ?? {};

  const added: Record<string, any> = {};
  const removed: Record<string, any> = {};
  const modified: Record<string, { from: any; to: any }> = {};
  const unchanged: Record<string, any> = {};
  const patch: Record<string, any> = {};

  const allKeys = new Set([...Object.keys(orig), ...Object.keys(curr)]);

  for (const key of allKeys) {
    const inOrig = key in orig;
    const inCurr = key in curr;

    if (!inOrig && inCurr) {
      added[key] = curr[key];
      patch[key] = curr[key];
    } else if (inOrig && !inCurr) {
      removed[key] = orig[key];
    } else if (inOrig && inCurr) {
      if (deepEqual(orig[key], curr[key])) {
        unchanged[key] = curr[key];
      } else {
        modified[key] = { from: orig[key], to: curr[key] };
        patch[key] = curr[key];
      }
    }
  }

  return {
    added,
    removed,
    modified,
    unchanged,
    patch,
    hasChanges:
      Object.keys(added).length > 0 ||
      Object.keys(removed).length > 0 ||
      Object.keys(modified).length > 0,
  };
}

/** Deep equality check for JSON-compatible values */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, i) => deepEqual(val, b[i]));
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) => key in b && deepEqual(a[key], b[key]));
  }

  return false;
}

/**
 * Build a human-readable summary of changes for display.
 * Returns an array of { field, type, detail } entries.
 */
export function buildChangeSummary(diff: DiffResult): Array<{
  field: string;
  type: 'added' | 'removed' | 'modified';
  detail: string;
}> {
  const summary: Array<{
    field: string;
    type: 'added' | 'removed' | 'modified';
    detail: string;
  }> = [];

  for (const [key, val] of Object.entries(diff.added)) {
    const isArray = Array.isArray(val);
    summary.push({
      field: key,
      type: 'added',
      detail: isArray
        ? `Will APPEND ${val.length} item(s) to existing list`
        : typeof val === 'object' && val !== null
        ? `Will OVERWRITE entire object (${Object.keys(val).length} keys)`
        : `Set to: ${JSON.stringify(val)}`,
    });
  }

  for (const [key] of Object.entries(diff.removed)) {
    summary.push({
      field: key,
      type: 'removed',
      detail: 'Field removed from submission (server keeps current value)',
    });
  }

  for (const [key, { from, to }] of Object.entries(diff.modified)) {
    const isArray = Array.isArray(to);
    summary.push({
      field: key,
      type: 'modified',
      detail: isArray
        ? `Array changed — will REPLACE with ${to.length} item(s)`
        : typeof to === 'object' && to !== null
        ? `Object modified — will OVERWRITE entire object`
        : `Changed from ${JSON.stringify(from)} to ${JSON.stringify(to)}`,
    });
  }

  return summary;
}

/**
 * Strip empty/undefined values from an object before submission.
 * Replaces AutoPruneEmptyFields at submit-time only.
 */
export function pruneForSubmission(
  obj: Record<string, any>,
  readOnlyFields: string[] = []
): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (readOnlyFields.includes(key)) continue;
    if (val === undefined || val === null) continue;
    if (typeof val === 'string' && val.trim() === '') continue;
    if (Array.isArray(val) && val.length === 0) continue;
    if (
      typeof val === 'object' &&
      !Array.isArray(val) &&
      Object.keys(val).length === 0
    )
      continue;
    result[key] = val;
  }
  return result;
}
