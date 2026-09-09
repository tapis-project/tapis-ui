import { Tenants as TenantsHooks, useTapisConfig } from '@tapis/tapisui-hooks';
import { Tenants } from '@tapis/tapis-typescript';
import { settingsAdmins } from 'utils/settingsAdmins';

// Stopgap rosters until SK role checks replace them. tenant_admin is real where
// it comes from v3/tenants admin_user; EXTRA_TENANT_ADMINS force-adds users so
// the UI is reachable before the SK wiring exists — services still 403 anyone
// who isn't actually permissed. site_admin has no client-checkable source yet.
//
// The names come from utils/settingsAdmins so a deployment can set
// VITE_SETTINGS_ADMINS instead of shipping a rebuild of this file.
export const EXTRA_TENANT_ADMINS = settingsAdmins();
export const SITE_ADMINS = settingsAdmins();

export interface SettingsAccess {
  isTenantAdmin: boolean;
  isSiteAdmin: boolean;
  tenants: Tenants.Tenant[];
  currentTenant: Tenants.Tenant | undefined;
  /** tenant_admin usernames for the current tenant (admin_user + extras) */
  tenantAdmins: string[];
  isLoading: boolean;
  error: Error | null;
}

const useSettingsAccess = (): SettingsAccess => {
  const { username, tokenTenantId } = useTapisConfig();
  const { data, isLoading, error } = TenantsHooks.useList();

  const tenants = data?.result ?? [];
  const currentTenant = tenants.find((t) => t.tenant_id === tokenTenantId);
  const tenantAdmins = Array.from(
    new Set(
      [currentTenant?.admin_user, ...EXTRA_TENANT_ADMINS].filter(
        (u): u is string => !!u
      )
    )
  );

  const isSiteAdmin = !!username && SITE_ADMINS.includes(username);
  const isTenantAdmin =
    isSiteAdmin || (!!username && tenantAdmins.includes(username));

  return {
    isTenantAdmin,
    isSiteAdmin,
    tenants,
    currentTenant,
    tenantAdmins,
    isLoading,
    error,
  };
};

export default useSettingsAccess;
