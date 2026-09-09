import { lazy } from 'react';

// All extensions load at boot, and GEO pulls in leaflet and its plugins. Lazy
// pages keep that out of the entry bundle of every other tenant.
export const GEO = lazy(() => import('./GEO/GEO'));
export const SeismoDB = lazy(() => import('./SeismoDB/SeismoDB'));
