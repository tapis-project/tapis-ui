import { budgetMs } from 'testing/perfBudget';
import {
  BLOB_LINE_LIMIT,
  sliceBlob,
  tokenizeJson,
  type JsonToken,
} from '../jsonTokens';

const kinds = (tokens: JsonToken[]) =>
  tokens.filter((token) => token.kind !== 'plain').map((token) => token.kind);

/** a record the size the pods pages really draw: a derived pod is tens of KB */
const bigRecord = (members: number) => {
  const pod = (n: number) => ({
    pod_id: `worker-${n}`,
    image: 'ghcr.io/andes90/collabmd:v0.1.29',
    status: n % 3 === 0 ? 'AVAILABLE' : 'STOPPED',
    persistent: n % 2 === 0,
    gpus: 0,
    description: null,
    networking: {
      default: { protocol: 'http', port: 1234, url: `w${n}.pods.tapis.io` },
    },
    environment_variables: { LOG_LEVEL: 'info', WORKERS: String(n) },
    volume_mounts: { '/data': { type: 'tapisvolume', source_id: 'shared' } },
  });
  return JSON.stringify(
    { result: Array.from({ length: members }, (_, n) => pod(n)) },
    null,
    2
  );
};

describe('splitting a blob into colours', () => {
  it('knows a key from a string from a number', () => {
    expect(kinds(tokenizeJson('{\n  "port": 8888\n}'))).toEqual([
      'key',
      'number',
    ]);
    expect(kinds(tokenizeJson('{"image": "nginx"}'))).toEqual([
      'key',
      'string',
    ]);
  });

  it('knows the literals apart', () => {
    expect(kinds(tokenizeJson('[true, false, null, 0, -1.5e3]'))).toEqual([
      'boolean',
      'boolean',
      'null',
      'number',
      'number',
    ]);
  });

  it('is not fooled by a brace or a colon inside a string', () => {
    const tokens = tokenizeJson('{"cmd": "sh -c \\"echo {a: 1}\\""}');
    expect(kinds(tokens)).toEqual(['key', 'string']);
  });

  it('gives back exactly the text it was given', () => {
    // what is drawn has to select and copy as the JSON it came from
    const text = bigRecord(8);
    expect(tokenizeJson(text).reduce((all, t) => all + t.text, '')).toBe(text);
  });

  it('emits the uncoloured runs whole, not a token each', () => {
    // braces, commas and indentation are most of a pretty-printed record;
    // one node each is what made the old raw view slow
    const tokens = tokenizeJson(bigRecord(20));
    const plain = tokens.filter((token) => token.kind === 'plain').length;
    expect(plain).toBeLessThan(tokens.length);
  });

  it('has nothing to say about nothing', () => {
    expect(tokenizeJson('')).toEqual([]);
  });
});

describe('holding back the tail of a long blob', () => {
  const lines = (n: number) =>
    Array.from({ length: n }, (_, at) => `"line ${at}": ${at}`).join('\n');

  it('shows a short blob whole', () => {
    const text = lines(10);
    expect(sliceBlob(text)).toEqual({ text, held: 0 });
  });

  it('cuts a long one and says how much is left', () => {
    const text = lines(BLOB_LINE_LIMIT + 40);
    const slice = sliceBlob(text);
    expect(slice.text.split('\n')).toHaveLength(BLOB_LINE_LIMIT);
    // 640 lines in, 600 shown, so 40 waiting behind the press
    expect(slice.held).toBe(40);
  });

  it('hands the whole thing over when asked', () => {
    const text = lines(BLOB_LINE_LIMIT + 40);
    expect(sliceBlob(text, undefined, true)).toEqual({ text, held: 0 });
  });
});

describe('speed', () => {
  // The number that matters: this replaced an editor that built a document
  // model and a DOM node per line for read-only text. The bound is loose
  // enough for a slow CI box and tight enough to catch a rewrite that
  // starts allocating per character.
  it('tokenizes a 200-pod record well inside a frame', () => {
    const text = bigRecord(200);
    expect(text.length).toBeGreaterThan(100_000);

    // warm, so the measurement is of the pass rather than of the first JIT
    tokenizeJson(text.slice(0, 2_000));

    const started = performance.now();
    const tokens = tokenizeJson(text);
    const took = performance.now() - started;

    expect(tokens.length).toBeGreaterThan(1_000);
    expect(took).toBeLessThan(budgetMs(50));
  });

  it('cuts a long blob without walking every line into an array', () => {
    const text = bigRecord(2_000);
    const started = performance.now();
    const slice = sliceBlob(text);
    const took = performance.now() - started;

    expect(slice.held).toBeGreaterThan(0);
    expect(took).toBeLessThan(budgetMs(25));
  });

  it('draws only what it shows: the cut blob is what gets tokenized', () => {
    const text = bigRecord(2_000);
    const whole = tokenizeJson(text).length;
    const shown = tokenizeJson(sliceBlob(text).text).length;
    expect(shown).toBeLessThan(whole / 4);
  });
});
