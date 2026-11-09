import {
  binaryStrings,
  imageFormat,
  isElf,
  parseElf,
} from '@tapis/tapisui-common';

/**
 * A real, if very small, 64-bit little-endian ELF.
 *
 * Built here rather than committed as a fixture: every field the parser
 * reads is written a few lines above the assertion about it, so a test that
 * fails says which byte moved. The layout is the one a linker produces —
 * header, one program header, a handful of sections at the end.
 */
const INTERP = '/lib64/ld-linux-x86-64.so.2';

const SHSTRTAB =
  '\0.shstrtab\0.dynstr\0.dynamic\0.note.gnu.build-id\0.symtab\0';
const DYNSTR = '\0libc.so.6\0libm.so.6\0mylib.so.1\0';

const AT_PHDR = 0x40;
const AT_INTERP = 0x100;
const AT_SHSTRTAB = 0x200;
const AT_DYNSTR = 0x300;
const AT_DYNAMIC = 0x400;
const AT_NOTE = 0x500;
const AT_SECTIONS = 0x600;

type Options = {
  /** ET_EXEC, ET_DYN … 2 and 3 are the ones that matter here */
  type?: number;
  machine?: number;
  /** leave the interpreter out: a static binary asks for no loader */
  interpreter?: boolean;
  /** leave .dynamic out: nothing to resolve at startup */
  dynamic?: boolean;
  /** leave .symtab out: stripped after linking */
  symtab?: boolean;
  bigEndian?: boolean;
  class32?: boolean;
};

const buildElf = (options: Options = {}): Uint8Array => {
  const {
    type = 3,
    machine = 62,
    interpreter = true,
    dynamic = true,
    symtab = true,
    bigEndian = false,
    class32 = false,
  } = options;
  const le = !bigEndian;
  const is64 = !class32;

  const bytes = new Uint8Array(0x800);
  const view = new DataView(bytes.buffer);
  const ascii = (at: number, value: string) => {
    for (let i = 0; i < value.length; i += 1)
      bytes[at + i] = value.charCodeAt(i);
  };
  const word = (at: number, value: number) => {
    if (is64) view.setBigUint64(at, BigInt(value), le);
    else view.setUint32(at, value, le);
  };

  // ── e_ident ──────────────────────────────────────────────────────────
  bytes.set([0x7f, 0x45, 0x4c, 0x46], 0);
  bytes[4] = is64 ? 2 : 1;
  bytes[5] = le ? 1 : 2;
  bytes[6] = 1;
  bytes[7] = 3; // Linux

  view.setUint16(0x10, type, le);
  view.setUint16(0x12, machine, le);
  view.setUint32(0x14, 1, le);
  word(0x18, 0x401f30); // e_entry
  word(is64 ? 0x20 : 0x1c, AT_PHDR); // e_phoff
  word(is64 ? 0x28 : 0x20, AT_SECTIONS); // e_shoff

  const base = is64 ? 0x36 : 0x2a;
  const phentsize = is64 ? 56 : 32;
  const shentsize = is64 ? 64 : 40;
  view.setUint16(base, phentsize, le);
  view.setUint16(base + 2, interpreter ? 1 : 0, le); // e_phnum
  view.setUint16(base + 4, shentsize, le);
  view.setUint16(base + 6, symtab ? 6 : 5, le); // e_shnum
  view.setUint16(base + 8, 1, le); // e_shstrndx → .shstrtab

  // ── PT_INTERP ────────────────────────────────────────────────────────
  if (interpreter) {
    ascii(AT_INTERP, INTERP);
    view.setUint32(AT_PHDR, 3, le); // p_type
    if (is64) {
      view.setUint32(AT_PHDR + 4, 4, le); // p_flags (R)
      word(AT_PHDR + 8, AT_INTERP);
      word(AT_PHDR + 16, 0);
      word(AT_PHDR + 32, INTERP.length + 1);
    } else {
      word(AT_PHDR + 4, AT_INTERP);
      word(AT_PHDR + 8, 0);
      word(AT_PHDR + 16, INTERP.length + 1);
      view.setUint32(AT_PHDR + 24, 4, le);
    }
  }

  ascii(AT_SHSTRTAB, SHSTRTAB);
  ascii(AT_DYNSTR, DYNSTR);

  // ── .dynamic: two NEEDED and a SONAME, then the terminator ───────────
  const step = is64 ? 16 : 8;
  const half = step / 2;
  const entries: Array<[number, number]> = dynamic
    ? [
        [1, 1], // DT_NEEDED  → libc.so.6
        [1, 11], // DT_NEEDED → libm.so.6
        [14, 21], // DT_SONAME → mylib.so.1
        [0, 0], // DT_NULL
      ]
    : [[0, 0]];
  entries.forEach(([tag, value], at) => {
    word(AT_DYNAMIC + at * step, tag);
    word(AT_DYNAMIC + at * step + half, value);
  });

  // ── the GNU build-id note ────────────────────────────────────────────
  view.setUint32(AT_NOTE, 4, le); // namesz
  view.setUint32(AT_NOTE + 4, 4, le); // descsz
  view.setUint32(AT_NOTE + 8, 3, le); // NT_GNU_BUILD_ID
  ascii(AT_NOTE + 12, 'GNU\0');
  bytes.set([0xde, 0xad, 0xbe, 0xef], AT_NOTE + 16);

  // ── section headers ──────────────────────────────────────────────────
  const section = (
    index: number,
    nameOffset: number,
    kind: number,
    offset: number,
    size: number
  ) => {
    const at = AT_SECTIONS + index * shentsize;
    view.setUint32(at, nameOffset, le);
    view.setUint32(at + 4, kind, le);
    word(at + 8, 0); // sh_flags
    word(at + (is64 ? 16 : 12), 0); // sh_addr
    word(at + (is64 ? 24 : 16), offset);
    word(at + (is64 ? 32 : 20), size);
  };
  section(0, 0, 0, 0, 0);
  section(1, 1, 3, AT_SHSTRTAB, SHSTRTAB.length);
  section(2, 11, 3, AT_DYNSTR, DYNSTR.length);
  section(3, 19, 6, AT_DYNAMIC, entries.length * step);
  section(4, 28, 7, AT_NOTE, 20);
  if (symtab) section(5, 47, 2, 0, 0);

  return bytes;
};

describe('isElf', () => {
  it('is four bytes at the front, and nothing else', () => {
    expect(isElf(buildElf())).toBe(true);
    expect(isElf(new TextEncoder().encode('#!/bin/bash\n'))).toBe(false);
    expect(isElf(new Uint8Array([0x7f, 0x45]))).toBe(false);
  });
});

describe('parseElf', () => {
  it('says what the file is, in the words readelf uses', () => {
    const elf = parseElf(buildElf({ type: 2 }))!;
    expect(elf.class).toBe(64);
    expect(elf.littleEndian).toBe(true);
    expect(elf.machine).toBe('x86-64');
    expect(elf.type).toBe('executable');
    expect(elf.osabi).toBe('Linux');
    expect(elf.entry).toBe(0x401f30);
  });

  it('calls a position-independent executable one', () => {
    // ET_DYN with an interpreter is a PIE, not a library — readelf makes
    // the same distinction, and the thing that tells them apart is that a
    // PIE asks for a loader
    expect(parseElf(buildElf({ type: 3 }))!.type).toBe('executable (PIE)');
    expect(parseElf(buildElf({ type: 3, interpreter: false }))!.type).toBe(
      'shared object'
    );
  });

  it('names the loader it will ask for', () => {
    expect(parseElf(buildElf())!.interpreter).toBe(INTERP);
  });

  it('lists the libraries it will go looking for', () => {
    // the question a binary in an output directory is usually opened to
    // answer: will it find what it needs on the compute node
    const elf = parseElf(buildElf())!;
    expect(elf.needed).toEqual(['libc.so.6', 'libm.so.6']);
    expect(elf.soname).toBe('mylib.so.1');
    expect(elf.staticallyLinked).toBe(false);
  });

  it('knows a static binary has nothing to resolve', () => {
    const elf = parseElf(buildElf({ interpreter: false, dynamic: false }))!;
    expect(elf.needed).toEqual([]);
    expect(elf.staticallyLinked).toBe(true);
    expect(elf.interpreter).toBeUndefined();
  });

  it('reads the build id out of the GNU note', () => {
    expect(parseElf(buildElf())!.buildId).toBe('deadbeef');
  });

  it('notices whether the symbol table survived linking', () => {
    expect(parseElf(buildElf({ symtab: true }))!.stripped).toBe(false);
    expect(parseElf(buildElf({ symtab: false }))!.stripped).toBe(true);
  });

  it('names the sections through the section-name string table', () => {
    const names = parseElf(buildElf())!.sections.map((s) => s.name);
    expect(names).toEqual([
      '',
      '.shstrtab',
      '.dynstr',
      '.dynamic',
      '.note.gnu.build-id',
      '.symtab',
    ]);
  });

  it('reads a 32-bit file, where every offset is half as wide', () => {
    const elf = parseElf(buildElf({ class32: true }))!;
    expect(elf.class).toBe(32);
    expect(elf.entry).toBe(0x401f30);
    expect(elf.needed).toEqual(['libc.so.6', 'libm.so.6']);
  });

  it('reads a big-endian file, which a POWER build still is', () => {
    const elf = parseElf(buildElf({ bigEndian: true, machine: 21 }))!;
    expect(elf.littleEndian).toBe(false);
    expect(elf.machine).toBe('PowerPC64');
    expect(elf.entry).toBe(0x401f30);
  });

  it('says so rather than guessing at a machine it does not know', () => {
    expect(parseElf(buildElf({ machine: 0x9999 }))!.machine).toContain(
      'unknown'
    );
  });

  it('declines anything that is not one, or is cut short', () => {
    expect(
      parseElf(new TextEncoder().encode('not an elf at all'))
    ).toBeUndefined();
    expect(parseElf(buildElf().slice(0, 8))).toBeUndefined();
  });

  it('does not run off the end of a truncated file', () => {
    // a partial download should give a partial answer, not an exception
    const half = buildElf().slice(0, 0x420);
    expect(() => parseElf(half)).not.toThrow();
  });
});

describe('binaryStrings', () => {
  const bytes = (...parts: Array<string | number[]>) => {
    const out: number[] = [];
    parts.forEach((part) => {
      if (typeof part === 'string') {
        for (let i = 0; i < part.length; i += 1) out.push(part.charCodeAt(i));
      } else out.push(...part);
    });
    return new Uint8Array(out);
  };

  it('finds runs of printable characters, the way strings does', () => {
    expect(
      binaryStrings(bytes('__gmon_start__', [0, 1, 2], 'libc.so.6', [0]))
    ).toEqual(['__gmon_start__', 'libc.so.6']);
  });

  it('ignores runs too short to be words', () => {
    // four is the default strings(1) uses; three catches every register name
    expect(binaryStrings(bytes('ab', [0], 'abcd', [0]))).toEqual(['abcd']);
    expect(binaryStrings(bytes('ab', [0], 'abcd', [0]), 5)).toEqual([]);
  });

  it('keeps a run that reaches the end of the file', () => {
    expect(binaryStrings(bytes([0], 'trailing'))).toEqual(['trailing']);
  });

  it('stops at the cap, because a big binary has more than a page of them', () => {
    const many = bytes(
      ...Array(50)
        .fill(0)
        .map(() => 'word\0')
    );
    expect(binaryStrings(many, 4, 10)).toHaveLength(10);
  });

  it('says nothing about bytes that are not text', () => {
    expect(binaryStrings(bytes([0, 1, 2, 3, 0xff, 0xfe]))).toEqual([]);
  });
});

describe('imageFormat', () => {
  const of = (...head: number[]) => new Uint8Array([...head, 0, 0, 0, 0]);

  it('knows a picture by its first bytes, whatever it is called', () => {
    // this is the one that must never be wrong: a .png reaching the binary
    // decoder is a screenful of strings where a plot should be
    expect(
      imageFormat(of(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))
    ).toBe('png');
    expect(imageFormat(of(0xff, 0xd8, 0xff))).toBe('jpeg');
    expect(imageFormat(of(0x47, 0x49, 0x46, 0x38))).toBe('gif');
    expect(imageFormat(of(0x42, 0x4d))).toBe('bmp');
    expect(imageFormat(of(0x49, 0x49, 0x2a, 0x00))).toBe('tiff');
    expect(imageFormat(of(0x4d, 0x4d, 0x00, 0x2a))).toBe('tiff');
  });

  it('reads WEBP past the length field it hides behind', () => {
    const webp = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x10, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    ]);
    expect(imageFormat(webp)).toBe('webp');
    // RIFF alone is a wave file, not a picture
    expect(imageFormat(webp.slice(0, 8))).toBeUndefined();
  });

  it('says nothing about things that are not pictures', () => {
    expect(imageFormat(of(0x7f, 0x45, 0x4c, 0x46))).toBeUndefined();
    expect(imageFormat(new TextEncoder().encode('#!/bin/sh'))).toBeUndefined();
    expect(imageFormat(new Uint8Array())).toBeUndefined();
  });
});
