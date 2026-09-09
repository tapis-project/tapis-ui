/**
 * The drawing, as opposed to the reasoning (jobVerdict.test). Two things
 * are worth pinning: that rebuilt reuses the EXISTING status icons rather
 * than inventing any, and that the corner dot is the same small mark the
 * pending cancel has always used.
 */
import React from 'react';
import { screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import JobGlyph from '../JobGlyph';
import { jobGlyphStyle } from 'app/_components/PageShell/viewPrefs';

const MIN = 60 * 1000;
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

const longCancel = {
  uuid: 'j1',
  status: 'CANCELLED',
  condition: 'CANCELLED_BY_USER',
  remoteStarted: ago(120 * MIN),
  ended: ago(0),
};

/** the dot is a span with a border-radius of 50% inside the glyph */
const dot = (container: HTMLElement) =>
  container.querySelector('span[class*="MuiBox-root"][class*="css"]')
    ? Array.from(container.querySelectorAll('span')).find(
        (el) => getComputedStyle(el).borderRadius === '50%'
      )
    : undefined;

afterEach(() => jobGlyphStyle.reset());

describe('classic', () => {
  it('draws the status and nothing else', () => {
    jobGlyphStyle.set('classic');
    const { container } = renderComponent(<JobGlyph job={longCancel} />);
    expect(screen.getByLabelText('CANCELLED')).toBeInTheDocument();
    expect(dot(container)).toBeUndefined();
  });
});

describe('rebuilt', () => {
  it('promotes a long run to the finished icon, and says why it stopped', () => {
    // the whole point: this is CANCELLED, and it worked
    renderComponent(<JobGlyph job={longCancel} />);
    expect(
      screen.getByLabelText('Ran 2h, then you cancelled it')
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('CANCELLED')).toBeNull();
  });

  it('leaves a run that barely started looking like what it was', () => {
    renderComponent(
      <JobGlyph job={{ ...longCancel, remoteStarted: ago(30 * 1000) }} />
    );
    // not promoted — the icon is still the cancel, with the reason dot
    expect(screen.getByLabelText(/Only ran/)).toBeInTheDocument();
  });

  it('leaves a job that never started as the refusal it was', () => {
    renderComponent(
      <JobGlyph
        job={{
          uuid: 'j2',
          status: 'FAILED',
          condition: 'JOB_UNABLE_TO_STAGE_INPUTS',
        }}
      />
    );
    expect(screen.getByLabelText(/Never started/)).toBeInTheDocument();
  });

  it('marks nothing on a clean finish', () => {
    const { container } = renderComponent(
      <JobGlyph
        job={{
          uuid: 'j3',
          status: 'FINISHED',
          condition: 'NORMAL_COMPLETION',
          remoteStarted: ago(30 * MIN),
          ended: ago(0),
        }}
      />
    );
    expect(dot(container)).toBeUndefined();
  });

  it('defers to the status machine while the job is still in flight', () => {
    // a pipeline stage is not a verdict
    renderComponent(
      <JobGlyph job={{ uuid: 'j4', status: 'STAGING_INPUTS' }} />
    );
    expect(screen.getByLabelText('STAGING_INPUTS')).toBeInTheDocument();
  });
});

describe('a cancel in flight', () => {
  it('outranks the ending — it is the newest thing known', () => {
    renderComponent(
      <JobGlyph job={{ uuid: 'j5', status: 'RUNNING' }} cancelling />
    );
    expect(screen.getByLabelText(/Cancelling — sent/)).toBeInTheDocument();
  });
});
