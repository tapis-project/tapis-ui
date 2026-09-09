import { CONDITION_COPY, explainJobEnd, explainJobHold } from '../jobMessages';

const CANCEL_TRANSCRIPT =
  'JOBS_CMD_MSG_RECEIVED Job 26f8d3ac-b8d8-43f7-bfc5-a1d4059329fa-007 ' +
  'received a JOB_CANCEL command from JobsImpl-cancelCmdStatus with ' +
  'correlation id 26f8d3ac-b8d8-43f7-bfc5-a1d4059329fa-007.';

describe('how an ending reads', () => {
  it('a cancel is quiet and speaks the session language, never the transcript', () => {
    const end = explainJobEnd({
      status: 'CANCELLED',
      condition: 'CANCELLED_BY_USER',
      lastMessage: CANCEL_TRANSCRIPT,
    });
    expect(end?.tone).toBe('quiet');
    expect(end?.headline).toMatch(/Cancelled on request/);
    expect(end?.headline).not.toMatch(/JOBS_CMD_MSG_RECEIVED|correlation/);
  });

  it('reads the cancel out of the transcript when condition lags', () => {
    const end = explainJobEnd({ lastMessage: CANCEL_TRANSCRIPT });
    expect(end?.tone).toBe('quiet');
  });

  it('a cancelled status alone is already the quiet story', () => {
    expect(explainJobEnd({ status: 'CANCELLED' })?.tone).toBe('quiet');
  });

  it('limits are warnings, breakages are errors, clean is ok', () => {
    expect(explainJobEnd({ condition: 'SCHEDULER_TIMEOUT' })?.tone).toBe(
      'warn'
    );
    expect(explainJobEnd({ condition: 'JOB_LAUNCH_FAILURE' })?.tone).toBe(
      'error'
    );
    expect(explainJobEnd({ condition: 'NORMAL_COMPLETION' })?.tone).toBe('ok');
  });

  it('covers every condition the API can report, in words, without codes', () => {
    // the generated JobListDTOConditionEnum, kept in lockstep by this test
    for (const [code, copy] of Object.entries(CONDITION_COPY)) {
      expect(copy.headline.length).toBeGreaterThan(10);
      expect(copy.headline).not.toMatch(/[A-Z]{3,}_[A-Z]/); // no raw codes
      expect(['ok', 'quiet', 'warn', 'error']).toContain(copy.tone);
      expect(explainJobEnd({ condition: code })).toBe(copy);
    }
    expect(Object.keys(CONDITION_COPY)).toHaveLength(26);
  });

  it('says nothing about an ending it does not understand', () => {
    expect(
      explainJobEnd({ condition: 'SOMETHING_NEW', lastMessage: 'mystery' })
    ).toBeUndefined();
  });
});

describe('explainJobHold', () => {
  it('lifts the quota numbers out of the transcript into the sentence', () => {
    const hold = explainJobHold({
      status: 'BLOCKED',
      lastMessage:
        'JOBS_QUOTA_MAX_USER_QUEUE_JOBS The job quota of 1 on system ' +
        'vista-tapis has been filled for user cgarcia.',
    });
    expect(hold?.headline).toBe(
      'Blocked on a quota: vista-tapis allows 1 queued job per user, and that slot is taken.'
    );
    expect(hold?.detail).toMatch(/Tapis retries on its own/);
  });

  it('pluralizes a roomier quota', () => {
    const hold = explainJobHold({
      status: 'BLOCKED',
      lastMessage: 'JOBS_QUOTA_X The job quota of 3 on system frontera ...',
    });
    expect(hold?.headline).toMatch(/allows 3 queued jobs per user/);
    expect(hold?.headline).toMatch(/they are all taken/);
  });

  it('still explains a hold whose transcript it cannot parse', () => {
    expect(
      explainJobHold({ status: 'BLOCKED', lastMessage: 'something odd' })
        ?.headline
    ).toMatch(/recoverable condition/);
    expect(explainJobHold({ status: 'PAUSED' })?.headline).toMatch(/Paused/);
  });

  it('says nothing about a job that is not held', () => {
    expect(explainJobHold({ status: 'RUNNING' })).toBeUndefined();
    expect(explainJobHold({ status: 'CANCELLED' })).toBeUndefined();
  });
});
