/**
 * Splits JSON text into coloured runs in one pass. Records can be tens of
 * kilobytes, so callers render plain `<span>`s with a class each.
 * Pure and synchronous, so it can be memoised by text.
 */

export type TokenKind =
  | 'key'
  | 'string'
  | 'number'
  | 'boolean'
  | 'null'
  | 'plain';

export type JsonToken = { text: string; kind: TokenKind };

/** a string (with the colon after it when it is a key), a literal, a number */
const JSON_TOKEN =
  /("(?:\\.|[^"\\])*")(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;

/**
 * One pass over the text. `plain` runs (braces, commas, whitespace) are
 * emitted whole to keep the token count low.
 */
export const tokenizeJson = (text: string): JsonToken[] => {
  const out: JsonToken[] = [];
  // new regex per call: a shared /g regex keeps lastIndex between calls
  const scan = new RegExp(JSON_TOKEN);
  let last = 0;
  for (let match = scan.exec(text); match; match = scan.exec(text)) {
    const [whole, string, colon] = match;
    if (match.index > last)
      out.push({ text: text.slice(last, match.index), kind: 'plain' });
    const body = string ?? whole;
    out.push({
      text: body,
      kind: string
        ? colon
          ? 'key'
          : 'string'
        : whole === 'null'
        ? 'null'
        : whole === 'true' || whole === 'false'
        ? 'boolean'
        : 'number',
    });
    if (colon) out.push({ text: colon, kind: 'plain' });
    last = match.index + whole.length;
  }
  if (last < text.length) out.push({ text: text.slice(last), kind: 'plain' });
  return out;
};

/** Lines drawn before the rest is held behind "show all". Cost is per DOM node. */
export const BLOB_LINE_LIMIT = 600;

export type BlobSlice = {
  text: string;
  /** lines held back, 0 when the whole blob is shown */
  held: number;
};

export const sliceBlob = (
  text: string,
  limit = BLOB_LINE_LIMIT,
  all = false
): BlobSlice => {
  if (all) return { text, held: 0 };
  // count with indexOf, not split(), to avoid an array of every line
  let seen = 0;
  let at = -1;
  while (seen < limit) {
    const next = text.indexOf('\n', at + 1);
    if (next < 0) return { text, held: 0 };
    at = next;
    seen += 1;
  }
  let held = 0;
  for (let from = at; from >= 0; from = text.indexOf('\n', from + 1)) held += 1;
  return { text: text.slice(0, at), held };
};
