/**
 * Which pages give up the app-level breadcrumb bar.
 *
 * Two lists feed one decision: the app's own (service pages on the shell)
 * and whatever the active extension declares. The extension half is the part
 * that breaks quietly — the parameter existed for a while with nothing
 * passing it, so an extension could declare a route and be ignored.
 */
import {
  shouldHideBreadcrumbs,
  resolveTopBar,
  HIDE_BREADCRUMB_ROUTES,
  KEEP_BREADCRUMB_ROUTES,
} from '../breadcrumbRoutes';

describe('the app-level breadcrumb opt-out', () => {
  it.each(['/systems', '/apps', '/files', '/jobs', '/dashboard', '/login'])(
    'hides on %s and below',
    (route) => {
      expect(shouldHideBreadcrumbs(route)).toBe(true);
      expect(shouldHideBreadcrumbs(`${route}/some-id`)).toBe(true);
    }
  );

  it.each(['/pods', '/mlhub', '/workflows', '/'])(
    'leaves %s alone — no shell header of its own to replace it',
    (route) => {
      expect(shouldHideBreadcrumbs(route)).toBe(false);
    }
  );

  it('does not match a route that merely starts with the same letters', () => {
    expect(shouldHideBreadcrumbs('/jobsomething')).toBe(false);
    expect(shouldHideBreadcrumbs('/filesystems')).toBe(false);
  });

  it('honours what the extension declares', () => {
    // the icicle Services Board is '/home', and it draws its own header
    expect(shouldHideBreadcrumbs('/home')).toBe(false);
    expect(shouldHideBreadcrumbs('/home', ['/home'])).toBe(true);
    expect(shouldHideBreadcrumbs('/home/detail', ['/home'])).toBe(true);
  });

  it('keeps the more specific opt-back-in', () => {
    expect(shouldHideBreadcrumbs('/files')).toBe(true);
    expect(shouldHideBreadcrumbs('/files/v2')).toBe(false);
    expect(shouldHideBreadcrumbs('/files/v2/mysys/a')).toBe(false);
  });

  it('keeps the two lists disjoint, or the precedence is a coin toss', () => {
    HIDE_BREADCRUMB_ROUTES.forEach((hidden) => {
      expect(KEEP_BREADCRUMB_ROUTES).not.toContain(hidden);
    });
  });

  describe('the strip policy', () => {
    const strip = (route: string) => ({ route, text: `strip for ${route}` });

    it('defaults to breadcrumbs when nobody said anything', () => {
      expect(resolveTopBar('/workflows')).toEqual({ mode: 'crumbs' });
      expect(resolveTopBar('/workflows', {})).toEqual({ mode: 'crumbs' });
    });

    it('turns a hidden route into none', () => {
      expect(resolveTopBar('/jobs/abc')).toEqual({ mode: 'none' });
      expect(
        resolveTopBar('/home', { hideBreadcrumbRoutes: ['/home'] })
      ).toEqual({ mode: 'none' });
    });

    it('renders an extension strip on its route and below', () => {
      const ext = { topBar: [strip('/insights')] };
      expect(resolveTopBar('/insights', ext)).toEqual({
        mode: 'strip',
        strip: strip('/insights'),
      });
      expect(resolveTopBar('/insights/x', ext).mode).toBe('strip');
      expect(resolveTopBar('/insightsx', ext).mode).toBe('crumbs');
    });

    it('a strip beats the hide list: the page said what it wants there', () => {
      const ext = {
        hideBreadcrumbRoutes: ['/home'],
        topBar: [strip('/home')],
      };
      expect(resolveTopBar('/home', ext).mode).toBe('strip');
      expect(resolveTopBar('/jobs', { topBar: [strip('/jobs')] }).mode).toBe(
        'strip'
      );
    });

    it('the longest matching prefix wins', () => {
      const ext = { topBar: [strip('/home'), strip('/home/detail')] };
      expect(resolveTopBar('/home/detail/1', ext)).toMatchObject({
        strip: { route: '/home/detail' },
      });
      expect(resolveTopBar('/home/other', ext)).toMatchObject({
        strip: { route: '/home' },
      });
    });

    it('the keep list still wins over everything', () => {
      expect(
        resolveTopBar('/files/v2/sys', { topBar: [strip('/files')] })
      ).toEqual({ mode: 'crumbs' });
    });
  });
});
