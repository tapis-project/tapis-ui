/**
 * Who the Settings page treats as an administrator, before SK roles exist.
 *
 * Lives in utils/ rather than beside the hook for one specific reason:
 * `import.meta.env` is a syntax error under ts-jest's CommonJS transform, so
 * every module that reads it has to be mockable by filename — which is why
 * `__mocks__/utils/` already carries twins for the other resolvers. Keeping
 * the env read here means a Settings test never has to think about it.
 *
 * VITE_SETTINGS_ADMINS is a comma-separated list and REPLACES the default
 * when set, so a deployment can name its own people without a rebuild of
 * this file. The baked-in names are the current team, and the whole thing
 * goes away when SK role checks land.
 */

const BAKED_IN = [
  'cgarcia',
  'jstubbs',
  'ajamthe',
  'smruti',
  'wzhang217',
  'nathandf',
];

const fromEnv = (import.meta.env.VITE_SETTINGS_ADMINS ?? '')
  .split(',')
  .map((name: string) => name.trim())
  .filter(Boolean);

export const settingsAdmins = (): string[] =>
  fromEnv.length ? fromEnv : BAKED_IN;
