/**
 * Flows — how long fetching a window actually takes, drawn as time.
 *
 * Measured (not simulated) against a real tenant with scripts/bench/
 * paging-bench.mjs; the JSON here is that run's output, and the header
 * says when and where it ran. Each strategy row draws its representative
 * trial's requests as bars on a shared time axis, left to right — a
 * sequential strategy reads as a staircase, a parallel one as a stack —
 * with the median total at the end of the lane.
 *
 * Same figure grammar as the jobs dashboard: Okabe–Ito, square ends,
 * hairlines, mono annotations. Re-measure with:
 *   TAPIS_JWT=... node scripts/bench/paging-bench.mjs 10 out.json
 *   node scripts/bench/flows-from-bench.mjs out.json \
 *     src/app/Components/_components/pagingFlows.json
 */
import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { SectionTitle, WELL } from 'app/_components/PageShell/overviewKit';
import flows from './pagingFlows.json';

const GRID_LINE = 'rgba(0,0,0,0.07)';
const ANNOTATION_SX = {
  fontFamily: 'monospace',
  fontSize: '0.6rem',
  color: 'text.disabled',
} as const;

/** request bars cycle through the research palette by page index */
const BAR_COLORS = ['#0072b2', '#009e73', '#e69f00', '#d55e00', '#56b4e9'];

const kib = (bytes: number) => `${(bytes / 1024).toFixed(0)}KiB`;

type Request = {
  label: string;
  startMs: number;
  endMs: number;
  ms: number;
  items: number;
  bytes: number;
};
type Strategy = {
  strategy: string;
  medianMs: number;
  minMs: number;
  maxMs: number;
  trials: number;
  items: number;
  medianBytes: number;
  requestCount: number;
  timeline: Request[];
};

const StrategyLane: React.FC<{ s: Strategy; scaleMs: number }> = ({
  s,
  scaleMs,
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.4 }}>
    <Typography
      sx={{
        fontFamily: 'monospace',
        fontSize: '0.68rem',
        width: 168,
        flexShrink: 0,
      }}
      noWrap
    >
      {s.strategy}
    </Typography>
    {/* the lane: every request a bar on the shared clock */}
    <Box
      sx={{
        flex: 1,
        position: 'relative',
        height: s.timeline.length > 4 ? 26 : 16,
        bgcolor: 'rgba(0,0,0,0.03)',
        borderRadius: '1px',
        overflow: 'hidden',
      }}
    >
      {s.timeline.map((r, at) => {
        // parallel requests overlap in time — spread them into two mini
        // rows so the stack reads as simultaneous, not painted over
        const lane = s.timeline.length > 4 ? at % 2 : 0;
        return (
          <Tooltip
            key={`${r.label}-${at}`}
            arrow
            disableInteractive
            title={`${r.label}: ${r.ms}ms, ${r.items} items, ${kib(r.bytes)}`}
          >
            <Box
              sx={{
                position: 'absolute',
                left: `${(r.startMs / scaleMs) * 100}%`,
                width: `${Math.max(
                  ((r.endMs - r.startMs) / scaleMs) * 100,
                  0.6
                )}%`,
                top: lane === 0 ? 2 : 14,
                height: s.timeline.length > 4 ? 10 : 12,
                bgcolor: BAR_COLORS[at % BAR_COLORS.length],
                borderRadius: '1px',
              }}
            />
          </Tooltip>
        );
      })}
    </Box>
    <Typography sx={{ ...ANNOTATION_SX, width: 128, textAlign: 'right' }}>
      {s.medianMs}ms · {s.requestCount} req · {kib(s.medianBytes)}
    </Typography>
  </Box>
);

const ServicePanel: React.FC<{
  service: string;
  strategies: Strategy[];
}> = ({ service, strategies }) => {
  const scaleMs = Math.max(
    1,
    ...strategies.map((s) =>
      Math.max(s.medianMs, ...s.timeline.map((r) => r.endMs))
    )
  );
  return (
    <Box sx={WELL}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
        <SectionTitle>
          {service} · {strategies[0]?.items ?? 0} objects
        </SectionTitle>
        <Box sx={{ flex: 1 }} />
        <Typography sx={ANNOTATION_SX}>
          0 ─ {Math.round(scaleMs / 1000)}s, shared clock
        </Typography>
      </Box>
      {/* quartile hairlines behind the lanes, the dashboard's frame */}
      <Box sx={{ position: 'relative' }}>
        {[25, 50, 75].map((pct) => (
          <Box
            key={pct}
            aria-hidden
            sx={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `calc(168px + 8px + (100% - 168px - 8px - 136px) * ${pct} / 100)`,
              borderLeft: `1px solid ${GRID_LINE}`,
            }}
          />
        ))}
        {strategies.map((s) => (
          <StrategyLane key={s.strategy} s={s} scaleMs={scaleMs} />
        ))}
      </Box>
    </Box>
  );
};

const FINDINGS: Array<{ title: string; body: string }> = [
  {
    title:
      'The server bills per item, not per request — and seq-50 is the worst',
    body: 'On portals, 341 systems with allAttributes cost ~9.1s in one request, ~9.5s as two 200s, and ~10.7s as seven sequential 50s — the current nav behavior is the slowest strategy measured, because serialization on the server dominates and sequential pages stack their latencies on top of it.',
  },
  {
    title: 'Projection is the big lever — 10x to 50x',
    body: 'The same 341 systems as summaryAttributes: ~0.9s at a ninth of the bytes; 142 apps drop from ~9.0s to ~0.18s. The landing tables and navs render from a dozen fields — a select projection serves them whole, and allAttributes becomes the detail page’s read.',
  },
  {
    title: 'Parallelism helps in proportion to the page count',
    body: 'Firing the remaining pages together after page one cut systems (7 real pages) from ~9.1s to ~3.4s; apps (3 real pages) only to ~7.0s. Worth it when allAttributes is genuinely needed for many pages; pointless when a projection would skip the cost entirely.',
  },
  {
    title: 'First paint beats total time',
    body: 'A 50-row summary first page is the fastest thing measured, and it is all a first screen can show. The shape that follows: summary page one immediately, the rest of the window behind it in parallel, allAttributes only where a single object is being read.',
  },
  {
    title: 'What this changes in the UI',
    body: 'Keep the 50-window UX, but ask for summary projections in the windowed list sources (systems/apps), grow windows with parallel pages instead of sequential, and lose nothing: detail pages already refetch their own object whole. Not yet implemented — the sources still fetch allAttributes.',
  },
];

export const FlowsTab: React.FC = () => (
  <Box sx={{ display: 'grid', gap: 1.5 }}>
    <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
      Measured {new Date(flows.generated).toISOString().slice(0, 10)} against{' '}
      <Box component="span" sx={{ fontFamily: 'monospace' }}>
        {flows.base}
      </Box>
      , {flows.trials} trial{flows.trials === 1 ? '' : 's'} per strategy, window
      capped at {flows.cap} objects. Each lane draws its median trial&apos;s
      requests on a shared clock — a staircase is sequential paging, a stack is
      parallel. Hover any bar for that request&apos;s numbers.
    </Typography>
    {flows.services.map((svc) => (
      <ServicePanel
        key={svc.service}
        service={svc.service}
        strategies={svc.strategies as Strategy[]}
      />
    ))}
    <Box sx={WELL}>
      <SectionTitle>What the numbers say</SectionTitle>
      <Box sx={{ display: 'grid', gap: 0.75 }}>
        {FINDINGS.map((f) => (
          <Box key={f.title}>
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 700 }}>
              {f.title}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.72rem',
                color: 'text.secondary',
                lineHeight: 1.55,
              }}
            >
              {f.body}
            </Typography>
          </Box>
        ))}
      </Box>
      <Typography sx={{ ...ANNOTATION_SX, mt: 1 }}>
        note: portals holds only 9 jobs, so the jobs lanes measure request
        overhead, not paging — re-run against a job-heavy tenant for that
        answer.
      </Typography>
    </Box>
  </Box>
);

export default FlowsTab;
