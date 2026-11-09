/**
 * The apps columns picker — the shared house ColumnsButton over the apps
 * registry. Two sections: the built-ins, and keys discovered from
 * `key: value` tags on the loaded apps; when no app uses the convention
 * yet the section teaches it instead of hiding — tagging an app
 * "portalName: dd" is how a tenant grows this table a column without
 * anyone shipping code.
 */
import React, { useSyncExternalStore } from 'react';
import { Apps } from '@tapis/tapis-typescript';
import { ColumnsButton } from 'app/_components/PageShell/tableColumns';
import {
  APP_COLUMNS,
  DEFAULT_COLUMN_IDS,
  discoverTagKeys,
  getAppsColumns,
  resetAppsColumns,
  subscribeAppsColumns,
  toggleAppsColumn,
} from './appsColumns';

const AppsColumnsMenu: React.FC<{ apps: Array<Apps.TapisApp> }> = ({
  apps,
}) => {
  const chosen = useSyncExternalStore(subscribeAppsColumns, getAppsColumns);
  const tagKeys = discoverTagKeys(apps);
  const isDefault =
    chosen.length === DEFAULT_COLUMN_IDS.length &&
    chosen.every((id, at) => id === DEFAULT_COLUMN_IDS[at]);

  return (
    <ColumnsButton
      title="Choose the table's columns — app fields, and any key: value tag"
      chosen={chosen}
      onToggle={toggleAppsColumn}
      onReset={resetAppsColumns}
      isDefault={isDefault}
      resetLabel="Reset to the usual six"
      sections={[
        {
          label: 'Columns',
          options: APP_COLUMNS.map((column) => ({
            id: column.id,
            label: column.label,
            hint: column.description,
          })),
        },
        {
          label: 'From tags',
          options: tagKeys.map((key) => ({
            id: `tag:${key}`,
            label: key,
            hint: `tags written "${key}: value"`,
          })),
          empty: (
            <>
              None yet — tag an app <code>portalName: dd</code> and the key
              becomes a column here, no code involved.
            </>
          ),
        },
      ]}
    />
  );
};

export default AppsColumnsMenu;
