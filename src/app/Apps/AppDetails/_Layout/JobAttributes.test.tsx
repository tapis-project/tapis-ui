import React from 'react';
import { screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { JobAttributes } from './Layout';

const app = (jobAttributes: Record<string, unknown>) => ({ jobAttributes });

const render = (jobAttributes: Record<string, unknown>) =>
  renderComponent(<JobAttributes app={app(jobAttributes)} />);

describe('JobAttributes', () => {
  it('names the system the app runs on, as a link to it', () => {
    render({ execSystemId: 'stampede2.cgarcia' });
    const link = screen.getByText('stampede2.cgarcia');
    expect(link.closest('a')).toHaveAttribute(
      'href',
      '/#/systems/stampede2.cgarcia'
    );
  });

  it('carries the queue and the dynamic flag beside it', () => {
    render({
      execSystemId: 'stampede2.cgarcia',
      execSystemLogicalQueue: 'normal',
      dynamicExecSystem: true,
    });
    expect(screen.getByText('normal')).toBeInTheDocument();
    expect(screen.getByText('dynamic')).toBeInTheDocument();
  });

  it('says who picks the system when the app does not', () => {
    render({ dynamicExecSystem: true });
    expect(screen.getByText('chosen at submit time')).toBeInTheDocument();
  });

  it('treats !tapis_not_set as no answer rather than as an answer', () => {
    // it is the sentinel Tapis writes for "take the system default"; printed
    // as-is it reads like a broken app definition
    render({
      execSystemId: 'stampede2.cgarcia',
      dtnSystemInputDir: '!tapis_not_set',
      dtnSystemOutputDir: '!tapis_not_set',
    });
    expect(screen.queryByText(/tapis_not_set/)).not.toBeInTheDocument();
    expect(screen.queryByText('DTN')).not.toBeInTheDocument();
  });

  it('shows the DTN directories when the app really sets them', () => {
    render({
      dtnSystemId: 'stockyard',
      dtnSystemInputDir: '/dtn/in',
      dtnSystemOutputDir: '/dtn/out',
    });
    expect(screen.getByText('DTN')).toBeInTheDocument();
    expect(screen.getByText('in /dtn/in')).toBeInTheDocument();
    expect(screen.getByText('out /dtn/out')).toBeInTheDocument();
  });

  it('renders nothing at all for an app with no job attributes', () => {
    const { container } = renderComponent(<JobAttributes app={{}} />);
    expect(container).toBeEmptyDOMElement();
  });
});
