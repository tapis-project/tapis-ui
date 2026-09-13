// A wall-clock budget catches a change in complexity, not a slow machine, and
// parallel workers or a shared CI runner run several times slower than an idle
// laptop.
export const budgetMs = (ms: number): number => ms * (process.env.CI ? 10 : 5);
