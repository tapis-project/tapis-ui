/**
 * Reading an ELF binary well enough to say what it is.
 *
 * Opening a compiled program in the viewer used to say "Binary files have
 * nothing to show on screen", which is true of the bytes and untrue of the
 * file: the first sixty-four bytes say which machine it targets, whether it
 * is an executable or a shared object, and where it starts, and the dynamic
 * section says which libraries it wants. That is most of what anyone asks a
 * binary sitting in a job's output directory — did this build for the right
 * architecture, and is it going to find its libraries on the compute node.
 *
 * This is readelf's first two screens, not a disassembler. Nothing here
 * decodes an instruction, and it never will: the point is to answer the
 * questions the file itself already knows the answers to.
 *
 * Pure and DataView-only, so it is testable without a browser and cheap
 * enough to run on the whole file the viewer has already fetched.
 */

export type ElfClass = 32 | 64;

export type ElfSection = {
  name: string;
  type: number;
  typeName: string;
  flags: number;
  addr: number;
  offset: number;
  size: number;
};

export type ElfSegment = {
  type: number;
  typeName: string;
  offset: number;
  vaddr: number;
  filesz: number;
  memsz: number;
  flags: number;
  /** "R E", the way readelf writes it */
  perms: string;
};

export type ElfInfo = {
  class: ElfClass;
  littleEndian: boolean;
  osabi: string;
  type: string;
  machine: string;
  entry: number;
  sections: ElfSection[];
  segments: ElfSegment[];
  /** the dynamic loader this asks for, when it asks for one */
  interpreter?: string;
  /** DT_NEEDED — the shared libraries it will look for at startup */
  needed: string[];
  soname?: string;
  /** DT_RPATH / DT_RUNPATH, where it will look for them */
  runpath?: string;
  buildId?: string;
  /** no .symtab: the symbol table was stripped after linking */
  stripped: boolean;
  /** no PT_INTERP and no DT_NEEDED — everything is already inside */
  staticallyLinked: boolean;
  /** e_type as it is on disk, before the PIE reading below */
  rawType: number;
};

const MAGIC = [0x7f, 0x45, 0x4c, 0x46]; // \x7fELF

/** Cheap enough to run on anything: four bytes at the front. */
export const isElf = (bytes: Uint8Array): boolean =>
  bytes.length >= 4 && MAGIC.every((byte, at) => bytes[at] === byte);

const MACHINES: Record<number, string> = {
  0: 'none',
  3: 'Intel 80386',
  8: 'MIPS',
  20: 'PowerPC',
  21: 'PowerPC64',
  22: 'IBM S/390',
  40: 'ARM',
  42: 'SuperH',
  50: 'Itanium',
  62: 'x86-64',
  183: 'AArch64',
  224: 'AMD GPU',
  243: 'RISC-V',
  258: 'LoongArch',
};

const TYPES: Record<number, string> = {
  0: 'none',
  1: 'relocatable object',
  2: 'executable',
  3: 'shared object',
  4: 'core dump',
};

const OSABI: Record<number, string> = {
  0: 'System V',
  1: 'HP-UX',
  2: 'NetBSD',
  3: 'Linux',
  6: 'Solaris',
  9: 'FreeBSD',
  12: 'OpenBSD',
  64: 'AMD GPU',
};

const SECTION_TYPES: Record<number, string> = {
  0: 'NULL',
  1: 'PROGBITS',
  2: 'SYMTAB',
  3: 'STRTAB',
  4: 'RELA',
  5: 'HASH',
  6: 'DYNAMIC',
  7: 'NOTE',
  8: 'NOBITS',
  9: 'REL',
  11: 'DYNSYM',
  14: 'INIT_ARRAY',
  15: 'FINI_ARRAY',
  0x6ffffff6: 'GNU_HASH',
  0x6fffffff: 'VERSYM',
  0x6ffffffe: 'VERNEED',
};

const SEGMENT_TYPES: Record<number, string> = {
  0: 'NULL',
  1: 'LOAD',
  2: 'DYNAMIC',
  3: 'INTERP',
  4: 'NOTE',
  5: 'SHLIB',
  6: 'PHDR',
  7: 'TLS',
  0x6474e550: 'GNU_EH_FRAME',
  0x6474e551: 'GNU_STACK',
  0x6474e552: 'GNU_RELRO',
  0x6474e553: 'GNU_PROPERTY',
};

const SHT_DYNAMIC = 6;
const SHT_SYMTAB = 2;
const PT_INTERP = 3;

const DT_NULL = 0;
const DT_NEEDED = 1;
const DT_STRTAB = 5;
const DT_SONAME = 14;
const DT_RPATH = 15;
const DT_RUNPATH = 29;

/** A NUL-terminated string out of a table, without running off the end. */
const cstring = (bytes: Uint8Array, at: number): string => {
  if (at < 0 || at >= bytes.length) return '';
  let end = at;
  while (end < bytes.length && bytes[end] !== 0) end += 1;
  let out = '';
  for (let i = at; i < end; i += 1) out += String.fromCharCode(bytes[i]);
  return out;
};

/**
 * ELF stores addresses and offsets at the word size of the file, so every
 * read of one is either 4 bytes or 8. Read as a Number: a file offset past
 * 2^53 is not a file anyone is previewing.
 */
const readWord = (
  view: DataView,
  at: number,
  is64: boolean,
  le: boolean
): number =>
  is64 ? Number(view.getBigUint64(at, le)) : view.getUint32(at, le);

const permissions = (flags: number): string =>
  `${flags & 4 ? 'R' : ' '}${flags & 2 ? 'W' : ' '}${flags & 1 ? 'E' : ' '}`;

/**
 * Undefined for anything that is not an ELF, or is too truncated to read —
 * the caller still has the bytes and can fall back to strings.
 */
export const parseElf = (bytes: Uint8Array): ElfInfo | undefined => {
  if (!isElf(bytes) || bytes.length < 24) return undefined;

  const is64 = bytes[4] === 2;
  const le = bytes[5] !== 2;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  const header = is64 ? 64 : 52;
  if (bytes.length < header) return undefined;

  const entry = readWord(view, 0x18, is64, le);
  const phoff = readWord(view, is64 ? 0x20 : 0x1c, is64, le);
  const shoff = readWord(view, is64 ? 0x28 : 0x20, is64, le);
  const base = is64 ? 0x36 : 0x2a;
  const phentsize = view.getUint16(base, le);
  const phnum = view.getUint16(base + 2, le);
  const shentsize = view.getUint16(base + 4, le);
  const shnum = view.getUint16(base + 6, le);
  const shstrndx = view.getUint16(base + 8, le);

  const info: ElfInfo = {
    class: is64 ? 64 : 32,
    littleEndian: le,
    osabi: OSABI[bytes[7]] ?? `unknown (${bytes[7]})`,
    type:
      TYPES[view.getUint16(0x10, le)] ??
      `unknown (${view.getUint16(0x10, le)})`,
    rawType: view.getUint16(0x10, le),
    machine:
      MACHINES[view.getUint16(0x12, le)] ??
      `unknown (0x${view.getUint16(0x12, le).toString(16)})`,
    entry,
    sections: [],
    segments: [],
    needed: [],
    stripped: true,
    staticallyLinked: true,
  };

  // ── program headers: what the loader is told to do ───────────────────
  for (let i = 0; i < phnum; i += 1) {
    const at = phoff + i * phentsize;
    if (at + phentsize > bytes.length) break;
    const type = view.getUint32(at, le);
    const flags = is64
      ? view.getUint32(at + 4, le)
      : view.getUint32(at + 24, le);
    const offset = readWord(view, at + (is64 ? 8 : 4), is64, le);
    const vaddr = readWord(view, at + (is64 ? 16 : 8), is64, le);
    const filesz = readWord(view, at + (is64 ? 32 : 16), is64, le);
    const memsz = readWord(view, at + (is64 ? 40 : 20), is64, le);
    info.segments.push({
      type,
      typeName: SEGMENT_TYPES[type] ?? `0x${type.toString(16)}`,
      offset,
      vaddr,
      filesz,
      memsz,
      flags,
      perms: permissions(flags),
    });
    if (type === PT_INTERP && offset + filesz <= bytes.length) {
      info.interpreter = cstring(bytes, offset);
      info.staticallyLinked = false;
    }
  }

  // ── section headers, named through the section-name string table ─────
  const rawSections: Array<
    Omit<ElfSection, 'name' | 'typeName'> & {
      nameOffset: number;
    }
  > = [];
  for (let i = 0; i < shnum; i += 1) {
    const at = shoff + i * shentsize;
    if (at + shentsize > bytes.length) break;
    rawSections.push({
      nameOffset: view.getUint32(at, le),
      type: view.getUint32(at + 4, le),
      flags: Number(
        is64
          ? view.getBigUint64(at + 8, le)
          : BigInt(view.getUint32(at + 8, le))
      ),
      addr: readWord(view, at + (is64 ? 16 : 12), is64, le),
      offset: readWord(view, at + (is64 ? 24 : 16), is64, le),
      size: readWord(view, at + (is64 ? 32 : 20), is64, le),
    });
  }

  const strtab = rawSections[shstrndx];
  info.sections = rawSections.map((section) => ({
    name: strtab ? cstring(bytes, strtab.offset + section.nameOffset) : '',
    type: section.type,
    typeName: SECTION_TYPES[section.type] ?? `0x${section.type.toString(16)}`,
    flags: section.flags,
    addr: section.addr,
    offset: section.offset,
    size: section.size,
  }));

  info.stripped = !info.sections.some(
    (section) => section.type === SHT_SYMTAB || section.name === '.symtab'
  );

  // ── the dynamic section: what it will go looking for at startup ──────
  const dynamic = info.sections.find((s) => s.type === SHT_DYNAMIC);
  const dynstr = info.sections.find((s) => s.name === '.dynstr');
  if (dynamic) {
    const step = is64 ? 16 : 8;
    // DT_STRTAB is a virtual address; .dynstr's file offset is the same
    // table, and is the one that can actually be indexed into these bytes
    const strings = dynstr?.offset ?? 0;
    for (let at = dynamic.offset; at + step <= bytes.length; at += step) {
      const tag = readWord(view, at, is64, le);
      if (tag === DT_NULL) break;
      const value = readWord(view, at + step / 2, is64, le);
      if (tag === DT_NEEDED) {
        info.needed.push(cstring(bytes, strings + value));
        info.staticallyLinked = false;
      } else if (tag === DT_SONAME) {
        info.soname = cstring(bytes, strings + value);
      } else if (tag === DT_RPATH || tag === DT_RUNPATH) {
        info.runpath = cstring(bytes, strings + value);
      } else if (tag === DT_STRTAB && !dynstr) {
        // no section table (stripped of it, or a core dump): nothing to
        // index against, so the names are simply not available
        break;
      }
    }
  }

  // ── build id, out of the GNU note ────────────────────────────────────
  const note = info.sections.find((s) => s.name === '.note.gnu.build-id');
  if (note && note.offset + 16 <= bytes.length) {
    const namesz = view.getUint32(note.offset, le);
    const descsz = view.getUint32(note.offset + 4, le);
    const desc = note.offset + 12 + Math.ceil(namesz / 4) * 4;
    if (desc + descsz <= bytes.length && descsz > 0 && descsz <= 64) {
      info.buildId = Array.from(bytes.slice(desc, desc + descsz))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
    }
  }

  // A position-independent executable is ET_DYN on disk and an executable in
  // every sense that matters — readelf says so too. The thing that tells it
  // apart from a library is that it asks for an interpreter.
  if (info.rawType === 3 && info.interpreter) {
    info.type = 'executable (PIE)';
  }

  return info;
};

/**
 * The `strings` view: runs of printable bytes long enough to be words.
 *
 * Four is the default `strings(1)` uses and it is the right one — three
 * catches every register name in a symbol table. Capped, because a hundred
 * megabyte binary has more strings in it than a browser will lay out.
 */
export const binaryStrings = (
  bytes: Uint8Array,
  min = 4,
  limit = 5000
): string[] => {
  const found: string[] = [];
  let run = '';
  for (let at = 0; at < bytes.length && found.length < limit; at += 1) {
    const byte = bytes[at];
    // printable ASCII, plus tab: anything else ends the run
    if ((byte >= 0x20 && byte <= 0x7e) || byte === 0x09) {
      run += String.fromCharCode(byte);
      continue;
    }
    if (run.length >= min) found.push(run);
    run = '';
  }
  if (run.length >= min && found.length < limit) found.push(run);
  return found;
};

/** "0x401f30", the way an address is written everywhere else. */
export const hex = (value: number): string => `0x${value.toString(16)}`;

/**
 * Image formats, by their magic bytes.
 *
 * Extension is a guess and the guess goes missing: a plot written without
 * one, or a file the service reports as OTHER, used to reach the text path
 * and — once the viewer started reading bytes — the binary decoder. A PNG is
 * not a thing to run `strings` over. The bytes say what it is, so they get
 * asked before anything else does.
 */
const IMAGE_MAGIC: Array<[string, number[]]> = [
  ['png', [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  ['jpeg', [0xff, 0xd8, 0xff]],
  ['gif', [0x47, 0x49, 0x46, 0x38]],
  ['bmp', [0x42, 0x4d]],
  // TIFF, both byte orders
  ['tiff', [0x49, 0x49, 0x2a, 0x00]],
  ['tiff', [0x4d, 0x4d, 0x00, 0x2a]],
];

export const imageFormat = (bytes: Uint8Array): string | undefined => {
  const match = IMAGE_MAGIC.find(([, magic]) =>
    magic.every((byte, at) => bytes[at] === byte)
  );
  if (match) return match[0];
  // RIFF....WEBP — the tag is four bytes in, past the length
  if (
    bytes.length >= 12 &&
    [0x52, 0x49, 0x46, 0x46].every((byte, at) => bytes[at] === byte) &&
    [0x57, 0x45, 0x42, 0x50].every((byte, at) => bytes[at + 8] === byte)
  ) {
    return 'webp';
  }
  return undefined;
};
