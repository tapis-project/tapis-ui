/**
 * Who the Settings page treats as an administrator, before SK roles exist.
 *
 * Lives in utils/ rather than beside the hook for one specific reason:
 * `import.meta.env` is a syntax error under ts-jest's CommonJS transform, so
 * every module that reads it has to be mockable by filename — which is why
 * `__mocks__/utils/` already carries twins for the other resolvers. Keeping
 * the env read here means a Settings test never has to think about it.
 *
 * VITE_SETTINGS_ADMINS is a comma-separated list of usernames, read at
 * build time. Nobody is named in the code: a deployment or a developer's
 * .env names its own people, and the whole thing goes away when SK role
 * checks land. Unset, the tenant's own admin_user is still a tenant admin
 * (useSettingsAccess) and nobody is a site admin.
 */

export const settingsAdmins = (): string[] =>
  (import.meta.env.VITE_SETTINGS_ADMINS ?? '')
    .split(',')
    .map((name: string) => name.trim())
    .filter(Boolean);
