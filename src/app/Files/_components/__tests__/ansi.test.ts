import {
  hasAnsi,
  parseAnsi,
  splitAnsiLines,
  stripAnsi,
} from '@tapis/tapisui-common';

const ESC = '';

// The line that started this: one tracing log record, printed raw.
const TRACING =
  `${ESC}[2m2026-08-27T16:29:10.645950Z${ESC}[0m ${ESC}[32m INFO${ESC}[0m ` +
  `${ESC}[1mHTTP request${ESC}[0m${ESC}[1m{${ESC}[0m${ESC}[3mhttp.method${ESC}[0m` +
  `${ESC}[2m=${ESC}[0mGET`;

describe('stripAnsi', () => {
  it('takes the noise out of a log line and leaves the log', () => {
    expect(stripAnsi(TRACING)).toBe(
      '2026-08-27T16:29:10.645950Z  INFO HTTP request{http.method=GET'
    );
  });

  it('removes the codes that are not about colour too', () => {
    // a log that has been through a progress bar carries these, and leaving
    // them in trades one kind of gibberish for another
    expect(stripAnsi(`one${ESC}[2Ktwo${ESC}[1Athree`)).toBe('onetwothree');
    expect(stripAnsi(`${ESC}]0;a title${ESC}\\body`)).toBe('body');
  });

  it('leaves a file with no escapes exactly as it was', () => {
    const plain = 'just\nsome\ttext';
    expect(stripAnsi(plain)).toBe(plain);
    expect(hasAnsi(plain)).toBe(false);
    expect(hasAnsi(TRACING)).toBe(true);
  });
});

describe('parseAnsi', () => {
  it('turns the codes into runs of styling', () => {
    const segments = parseAnsi(`${ESC}[32mINFO${ESC}[0m plain`);
    expect(segments).toHaveLength(2);
    expect(segments[0].text).toBe('INFO');
    expect(segments[0].style.color).toBeTruthy();
    expect(segments[1]).toEqual({ text: ' plain', style: {} });
  });

  it('carries bold, dim, italic and underline', () => {
    const [dim] = parseAnsi(`${ESC}[2mquiet`);
    expect(dim.style.dim).toBe(true);
    const [bold] = parseAnsi(`${ESC}[1mloud`);
    expect(bold.style.bold).toBe(true);
    const [italic] = parseAnsi(`${ESC}[3mtilted`);
    expect(italic.style.italic).toBe(true);
    const [under] = parseAnsi(`${ESC}[4mlined`);
    expect(under.style.underline).toBe(true);
  });

  it('resets everything on 0, and intensity alone on 22', () => {
    const segments = parseAnsi(`${ESC}[1;31mA${ESC}[22mB${ESC}[0mC`);
    expect(segments[0].style).toMatchObject({ bold: true });
    expect(segments[1].style.bold).toBe(false);
    expect(segments[1].style.color).toBeTruthy();
    expect(segments[2].style).toEqual({});
  });

  it('reads 256-colour and truecolour', () => {
    const [indexed] = parseAnsi(`${ESC}[38;5;208morange`);
    expect(indexed.style.color).toBe('rgb(255, 135, 0)');
    const [exact] = parseAnsi(`${ESC}[38;2;10;20;30mprecise`);
    expect(exact.style.color).toBe('rgb(10, 20, 30)');
  });

  it('merges runs that share a style, so a chatty log is not an element per word', () => {
    // tracing resets after every field; without merging this would be six
    // segments for three words
    const segments = parseAnsi(`${ESC}[0ma${ESC}[0mb${ESC}[0mc`);
    expect(segments).toEqual([{ text: 'abc', style: {} }]);
  });

  it('drops escapes that are not about colour rather than showing them', () => {
    const segments = parseAnsi(`${ESC}[2Kclean`);
    expect(segments.map((segment) => segment.text).join('')).toBe('clean');
  });

  it('is not confused by a file with no escapes at all', () => {
    expect(parseAnsi('hello')).toEqual([{ text: 'hello', style: {} }]);
    expect(parseAnsi('')).toEqual([]);
  });
});

describe('splitAnsiLines', () => {
  it('cuts the runs at every newline, for the numbered gutter', () => {
    const lines = splitAnsiLines(
      parseAnsi(`${ESC}[32mone\ntwo${ESC}[0m\nthree`)
    );
    expect(lines).toHaveLength(3);
    expect(lines[0][0].text).toBe('one');
    // the colour survives the line break, the way a terminal would carry it
    expect(lines[1][0].style.color).toBe(lines[0][0].style.color);
    expect(lines[2][0].text).toBe('three');
  });

  it('keeps a blank line as a line', () => {
    expect(splitAnsiLines(parseAnsi('a\n\nb'))).toHaveLength(3);
  });
});
