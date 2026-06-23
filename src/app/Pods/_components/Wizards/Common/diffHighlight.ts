import {
  EditorView,
  ViewPlugin,
  Decoration,
  type DecorationSet,
} from '@codemirror/view';

/** Normalize a string as pretty-printed JSON if valid, otherwise return raw. */
export function normalizeJson(str: string): string {
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
}

/**
 * Compute which 1-indexed line numbers differ between two strings.
 * Uses an LCS approach so that inserted / deleted lines don't cause
 * every subsequent line to light up as changed.
 * Also returns a map from each differing line → the closest paired line
 * from the other side (for inline word-level diffs).
 */
export function computeLineDiffs(
  leftStr: string,
  rightStr: string
): {
  leftLines: Set<number>;
  rightLines: Set<number>;
  leftPairs: Map<number, string>;
  rightPairs: Map<number, string>;
} {
  const empty = {
    leftLines: new Set<number>(),
    rightLines: new Set<number>(),
    leftPairs: new Map<number, string>(),
    rightPairs: new Map<number, string>(),
  };

  if (leftStr === rightStr) return empty;

  const normLeft = normalizeJson(leftStr);
  const normRight = normalizeJson(rightStr);
  if (normLeft === normRight) return empty;

  const leftArr = normLeft.split('\n');
  const rightArr = normRight.split('\n');
  const n = leftArr.length;
  const m = rightArr.length;

  if (n === 0 && m === 0) return empty;

  const { leftLines, rightLines, leftPairs, rightPairs } = empty;

  // Helper: simple line-by-line comparison (used as fallback)
  const simpleDiff = () => {
    const maxLen = Math.max(n, m);
    for (let i = 0; i < maxLen; i++) {
      const l = leftArr[i] ?? '';
      const r = rightArr[i] ?? '';
      if (l !== r) {
        if (i < n) {
          leftLines.add(i + 1);
          leftPairs.set(i + 1, r);
        }
        if (i < m) {
          rightLines.add(i + 1);
          rightPairs.set(i + 1, l);
        }
      }
    }
  };

  // Safety cap: skip LCS for very large files
  if (n + m > 3000) {
    simpleDiff();
    return { leftLines, rightLines, leftPairs, rightPairs };
  }

  if (n === 0) {
    for (let i = 1; i <= m; i++) {
      rightLines.add(i);
      rightPairs.set(i, '');
    }
    return { leftLines, rightLines, leftPairs, rightPairs };
  }
  if (m === 0) {
    for (let i = 1; i <= n; i++) {
      leftLines.add(i);
      leftPairs.set(i, '');
    }
    return { leftLines, rightLines, leftPairs, rightPairs };
  }

  let lcs: [number, number][];
  try {
    lcs = computeLCS(leftArr, rightArr);
  } catch {
    simpleDiff();
    return { leftLines, rightLines, leftPairs, rightPairs };
  }

  // Walk LCS to determine which lines are unchanged.
  let li = 0;
  let ri = 0;
  let lcsIdx = 0;
  while (li < n || ri < m) {
    if (lcsIdx < lcs.length && li === lcs[lcsIdx][0] && ri === lcs[lcsIdx][1]) {
      li++;
      ri++;
      lcsIdx++;
    } else if (
      lcsIdx < lcs.length &&
      li < lcs[lcsIdx][0] &&
      ri < lcs[lcsIdx][1]
    ) {
      leftLines.add(li + 1);
      rightLines.add(ri + 1);
      leftPairs.set(li + 1, rightArr[ri]);
      rightPairs.set(ri + 1, leftArr[li]);
      li++;
      ri++;
    } else if (lcsIdx >= lcs.length || li < lcs[lcsIdx][0]) {
      leftLines.add(li + 1);
      leftPairs.set(li + 1, '');
      li++;
    } else {
      rightLines.add(ri + 1);
      rightPairs.set(ri + 1, '');
      ri++;
    }
  }

  return { leftLines, rightLines, leftPairs, rightPairs };
}

/**
 * Compute LCS as array of [leftIndex, rightIndex] pairs.
 * Uses common prefix/suffix trimming + O(NM) DP for the middle.
 */
function computeLCS(a: string[], b: string[]): [number, number][] {
  let prefixLen = 0;
  while (
    prefixLen < a.length &&
    prefixLen < b.length &&
    a[prefixLen] === b[prefixLen]
  )
    prefixLen++;

  let suffixLen = 0;
  while (
    suffixLen < a.length - prefixLen &&
    suffixLen < b.length - prefixLen &&
    a[a.length - 1 - suffixLen] === b[b.length - 1 - suffixLen]
  )
    suffixLen++;

  const result: [number, number][] = [];
  for (let i = 0; i < prefixLen; i++) result.push([i, i]);

  const midA = a.slice(prefixLen, a.length - suffixLen);
  const midB = b.slice(prefixLen, b.length - suffixLen);

  if (midA.length > 0 && midB.length > 0) {
    const na = midA.length;
    const nb = midB.length;
    if (na * nb <= 500_000) {
      const dp: number[][] = Array.from({ length: na + 1 }, () =>
        new Array<number>(nb + 1).fill(0)
      );
      for (let i = 1; i <= na; i++) {
        for (let j = 1; j <= nb; j++) {
          dp[i][j] =
            midA[i - 1] === midB[j - 1]
              ? dp[i - 1][j - 1] + 1
              : Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
      const midLcs: [number, number][] = [];
      let i = na;
      let j = nb;
      while (i > 0 && j > 0) {
        if (midA[i - 1] === midB[j - 1]) {
          midLcs.push([prefixLen + i - 1, prefixLen + j - 1]);
          i--;
          j--;
        } else if (dp[i - 1][j] >= dp[i][j - 1]) {
          i--;
        } else {
          j--;
        }
      }
      midLcs.reverse();
      result.push(...midLcs);
    }
  }

  for (let i = 0; i < suffixLen; i++) {
    result.push([a.length - suffixLen + i, b.length - suffixLen + i]);
  }

  return result;
}

/**
 * Find differing character ranges between two strings.
 * Returns [start, end) offsets into `a` that differ from `b`.
 */
function inlineCharDiffs(a: string, b: string): [number, number][] {
  if (a === b || a.length === 0) return [];
  let prefix = 0;
  while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix])
    prefix++;
  let suffixA = a.length;
  let suffixB = b.length;
  while (
    suffixA > prefix &&
    suffixB > prefix &&
    a[suffixA - 1] === b[suffixB - 1]
  ) {
    suffixA--;
    suffixB--;
  }
  if (prefix < suffixA) return [[prefix, suffixA]];
  return [];
}

/**
 * CodeMirror ViewPlugin that highlights lines differing from a comparison string.
 * Applies a line-level background AND inline character highlights (GitHub-style).
 */
export function makeDiffHighlightPlugin(
  getComparisonStr: () => string,
  lineBg: string,
  wordBg: string,
  side: 'left' | 'right'
) {
  const lineMark = Decoration.line({
    attributes: { style: `background-color: ${lineBg}` },
  });
  const wordMark = Decoration.mark({
    attributes: { style: `background-color: ${wordBg}; border-radius: 2px` },
  });
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      private lastDocStr = '';
      private lastOtherStr = '';

      constructor(view: EditorView) {
        this.decorations = this.build(view);
      }
      update(u: any) {
        if (u.docChanged || u.transactions.some((t: any) => t.reconfigured)) {
          this.decorations = this.build(u.view);
        } else {
          const otherStr = getComparisonStr();
          if (otherStr !== this.lastOtherStr) {
            this.decorations = this.build(u.view);
          }
        }
      }
      build(view: EditorView): DecorationSet {
        try {
          const doc = view.state.doc;
          const thisStr = doc.toString();
          const otherStr = getComparisonStr();

          if (!otherStr || !thisStr || thisStr === otherStr) {
            this.lastDocStr = thisStr;
            this.lastOtherStr = otherStr;
            return Decoration.none;
          }
          if (thisStr === this.lastDocStr && otherStr === this.lastOtherStr) {
            return this.decorations;
          }

          this.lastDocStr = thisStr;
          this.lastOtherStr = otherStr;

          const { leftLines, rightLines, leftPairs, rightPairs } =
            computeLineDiffs(
              side === 'left' ? thisStr : otherStr,
              side === 'left' ? otherStr : thisStr
            );
          const lines = side === 'left' ? leftLines : rightLines;
          const pairs = side === 'left' ? leftPairs : rightPairs;
          if (lines.size === 0) return Decoration.none;

          const ranges: any[] = [];
          for (let i = 1; i <= doc.lines; i++) {
            if (!lines.has(i)) continue;
            const line = doc.line(i);
            ranges.push(lineMark.range(line.from));
            const otherLine = pairs.get(i) ?? '';
            const charDiffs = inlineCharDiffs(line.text, otherLine);
            for (const [start, end] of charDiffs) {
              const from = line.from + start;
              const to = Math.min(line.from + end, line.to);
              if (from < to) {
                ranges.push(wordMark.range(from, to));
              }
            }
          }
          ranges.sort((a: any, b: any) => a.from - b.from || a.to - b.to);
          return Decoration.set(ranges);
        } catch {
          return Decoration.none;
        }
      }
    },
    { decorations: (v: any) => v.decorations }
  );
}
