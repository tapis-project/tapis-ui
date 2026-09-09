/**
 * What the viewer shows when the file is not text.
 *
 * It used to show "Binary files have nothing to show on screen", or — for
 * anything without a telling extension — the bytes themselves decoded as
 * UTF-8, which is where `ELF>` and a screen of mojibake
 * came from.
 *
 * Both are wrong in the same way. A compiled program is not unreadable, it
 * is readable in a different alphabet: the header says which machine it
 * targets and whether it is an executable or a library, the dynamic section
 * says which shared libraries it will go looking for, and the strings say
 * the rest. Those are the questions people actually bring to a binary in a
 * job's output directory — did this build for the right architecture, and
 * will it find its libraries on the compute node.
 *
 * Two views, because they answer different questions: the decoded header,
 * and `strings`. Neither is a disassembler and neither is trying to be.
 */
import React, { useMemo } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import sizeFormat from '../../../utils/sizeFormat';
import { ElfInfo, binaryStrings, hex, parseElf } from './elf';
import {
  BINARY_VIEWS,
  BinaryView as BinaryViewMode,
  BINARY_VIEW_LABEL,
  getViewerBinaryView,
  setViewerBinaryView,
} from './listingPrefs';

/** How many strings are worth laying out — `strings | head`, in effect. */
export const MAX_STRINGS = 4000;

const LABEL_SX = {
  fontSize: '0.62rem',
  fontWeight: 700,
  color: 'text.secondary',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  whiteSpace: 'nowrap',
  pt: '2px',
} as const;

const MONO_SX = {
  fontFamily: 'monospace',
  fontSize: '0.74rem',
  wordBreak: 'break-all',
} as const;

const CHIP_SX = {
  height: 18,
  fontSize: '0.65rem',
  borderRadius: '4px',
} as const;

const Fact: React.FC<
  React.PropsWithChildren<{ label: string; when?: boolean }>
> = ({ label, when = true, children }) =>
  when ? (
    <Box sx={{ display: 'contents' }}>
      <Typography sx={LABEL_SX}>{label}</Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          flexWrap: 'wrap',
          minWidth: 0,
          fontSize: '0.76rem',
        }}
      >
        {children}
      </Box>
    </Box>
  ) : null;

/** The one-line headline: what this is, in the order it is asked. */
export const elfSummary = (elf: ElfInfo): string =>
  [
    elf.type,
    elf.machine,
    `${elf.class}-bit`,
    elf.littleEndian ? 'little-endian' : 'big-endian',
  ].join(' · ');

const ElfDetails: React.FC<{ elf: ElfInfo }> = ({ elf }) => (
  <Box sx={{ p: 1.5, minWidth: 0 }}>
    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 0.25 }}>
      {elfSummary(elf)}
    </Typography>
    <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mb: 1.25 }}>
      Read from the ELF header and its dynamic section — no code is decoded.
    </Typography>

    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'max-content minmax(0, 1fr)',
        columnGap: 1.5,
        rowGap: 0.75,
        alignItems: 'center',
      }}
    >
      <Fact label="Entry">
        <Box component="span" sx={MONO_SX}>
          {hex(elf.entry)}
        </Box>
        {elf.entry === 0 && (
          <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
            — nothing to start, which is normal for a library
          </Typography>
        )}
      </Fact>

      <Fact label="ABI">
        <Typography sx={{ fontSize: '0.76rem' }}>{elf.osabi}</Typography>
      </Fact>

      <Fact label="Loader" when={Boolean(elf.interpreter)}>
        <Box component="span" sx={MONO_SX}>
          {elf.interpreter}
        </Box>
      </Fact>

      {/* The question a binary in an output directory is usually opened to
          answer: what does it want to find on the node it runs on. */}
      <Fact label="Needs" when={elf.needed.length > 0}>
        {elf.needed.map((library) => (
          <Chip
            key={library}
            size="small"
            variant="outlined"
            label={library}
            sx={{ ...CHIP_SX, fontFamily: 'monospace' }}
          />
        ))}
      </Fact>

      <Fact label="Linking" when={elf.staticallyLinked}>
        <Chip size="small" label="static" sx={CHIP_SX} />
        <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
          nothing to resolve at startup — everything is already inside
        </Typography>
      </Fact>

      <Fact label="SONAME" when={Boolean(elf.soname)}>
        <Box component="span" sx={MONO_SX}>
          {elf.soname}
        </Box>
      </Fact>

      <Fact label="RUNPATH" when={Boolean(elf.runpath)}>
        <Box component="span" sx={MONO_SX}>
          {elf.runpath}
        </Box>
      </Fact>

      <Fact label="Build ID" when={Boolean(elf.buildId)}>
        <Box component="span" sx={MONO_SX}>
          {elf.buildId}
        </Box>
      </Fact>

      <Fact label="Symbols">
        <Typography sx={{ fontSize: '0.76rem' }}>
          {elf.stripped
            ? 'stripped — no symbol table to name functions with'
            : 'kept'}
        </Typography>
      </Fact>

      <Fact label="Layout">
        <Typography sx={{ fontSize: '0.76rem' }}>
          {elf.sections.length} sections · {elf.segments.length} segments
        </Typography>
      </Fact>
    </Box>

    {elf.sections.length > 0 && (
      <Box sx={{ mt: 1.5 }}>
        <Typography sx={{ ...LABEL_SX, pt: 0, mb: 0.5 }}>Sections</Typography>
        <Box
          component="table"
          sx={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
            fontSize: '0.72rem',
            '& th': {
              textAlign: 'left',
              fontSize: '0.62rem',
              fontWeight: 700,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              pb: 0.25,
            },
            '& td': {
              py: '2px',
              fontFamily: 'monospace',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            },
          }}
        >
          <Box component="thead">
            <Box component="tr">
              <Box component="th">Name</Box>
              <Box component="th" sx={{ width: 96 }}>
                Type
              </Box>
              <Box component="th" sx={{ width: 96 }}>
                Address
              </Box>
              <Box component="th" sx={{ width: 84, textAlign: 'right' }}>
                Size
              </Box>
            </Box>
          </Box>
          <Box component="tbody">
            {elf.sections.map((section, at) => (
              <Box component="tr" key={`${section.name}-${at}`}>
                <Box component="td">{section.name || '—'}</Box>
                <Box component="td" sx={{ color: 'text.secondary' }}>
                  {section.typeName}
                </Box>
                <Box component="td" sx={{ color: 'text.secondary' }}>
                  {section.addr ? hex(section.addr) : ''}
                </Box>
                <Box
                  component="td"
                  sx={{ textAlign: 'right', color: 'text.secondary' }}
                >
                  {sizeFormat(section.size)}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    )}
  </Box>
);

const StringsList: React.FC<{ bytes: Uint8Array }> = ({ bytes }) => {
  const found = useMemo(() => binaryStrings(bytes, 4, MAX_STRINGS), [bytes]);
  return (
    <Box sx={{ p: 1.5, minWidth: 0 }}>
      <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mb: 1 }}>
        Runs of four or more printable characters, in the order they appear —
        the same rule <code>strings</code> uses.
        {found.length >= MAX_STRINGS &&
          ` Showing the first ${MAX_STRINGS.toLocaleString()}.`}
      </Typography>
      {found.length === 0 ? (
        <Typography sx={{ fontSize: '0.74rem', color: 'text.secondary' }}>
          Nothing printable in it — compressed or encrypted data usually looks
          like this.
        </Typography>
      ) : (
        <Box
          component="pre"
          data-testid="binary-strings"
          sx={{
            m: 0,
            fontFamily: 'monospace',
            fontSize: '0.74rem',
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          {found.join('\n')}
        </Box>
      )}
    </Box>
  );
};

const Tab: React.FC<{
  view: BinaryViewMode;
  active: boolean;
}> = ({ view, active }) => (
  <Box
    component="button"
    type="button"
    aria-pressed={active}
    onClick={() => setViewerBinaryView(view)}
    sx={{
      px: 1,
      py: '3px',
      border: '1px solid',
      borderColor: active ? '#1565c0' : 'divider',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.7rem',
      fontWeight: 600,
      color: active ? '#1565c0' : 'text.secondary',
      bgcolor: active ? 'rgba(21,101,192,0.08)' : 'transparent',
      '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' },
    }}
  >
    {BINARY_VIEW_LABEL[view]}
  </Box>
);

const BinaryView: React.FC<{
  bytes: Uint8Array;
  /** what the caller has already decided to call it, for the not-ELF line */
  kindLabel: string;
  view: BinaryViewMode;
}> = ({ bytes, kindLabel, view }) => {
  const elf = useMemo(() => parseElf(bytes), [bytes]);
  // With nothing decoded there is only one view, so there is no switch
  const showing = elf ? view : 'strings';

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1.5,
          py: 0.75,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {elf ? (
          BINARY_VIEWS.map((option) => (
            <Tab key={option} view={option} active={showing === option} />
          ))
        ) : (
          <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
            {kindLabel} — not an ELF binary, so there is no header to read.
          </Typography>
        )}
        <Box sx={{ flex: 1 }} />
        <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>
          {sizeFormat(bytes.length)} read
        </Typography>
      </Box>

      {showing === 'details' && elf ? (
        <ElfDetails elf={elf} />
      ) : (
        <StringsList bytes={bytes} />
      )}
    </Box>
  );
};

export { getViewerBinaryView };
export default BinaryView;
