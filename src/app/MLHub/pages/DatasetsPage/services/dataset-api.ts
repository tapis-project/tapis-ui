import {
  GetDatasetResponseFromJSON,
  ListDatasetsResponseFromJSON,
  type GetDatasetResponse,
  type ListDatasetsResponse,
} from '@mlhub/datasets-ts-sdk';
import { MOCK_DATASETS } from '../data/mock-datasets';

/**
 * Mock of the @mlhub/datasets-ts-sdk DatasetsApi. Returns the exact response
 * envelopes the SDK produces (ListDatasetsResponse / GetDatasetResponse),
 * shaped through the SDK's FromJSON parsers so they always conform.
 */

export async function listDatasets(): Promise<ListDatasetsResponse> {
  return sleep(650).then(() =>
    ListDatasetsResponseFromJSON({
      version: '0.1.0',
      status: 200,
      message: 'OK',
      metadata: { count: MOCK_DATASETS.length },
      result: MOCK_DATASETS.map((d) => ({
        id: d.id,
        owner: d.owner,
        tenant_id: d.tenant_id,
        provider: d.provider,
        visibility: d.visibility,
        size: d.size,
        tags: d.tags,
        items: d.items.map((i) => ({ path: i.path, size: i.size })),
        huggingface_repo_locator: {
          id: d.huggingface_repo_locator.id,
          sha: d.huggingface_repo_locator.sha,
        },
        tapis_system_locator: {
          path: d.tapis_system_locator.path,
          site_id: d.tapis_system_locator.site_id,
          system_id: d.tapis_system_locator.system_id,
          tenant_id: d.tapis_system_locator.tenant_id,
        },
      })),
    })
  );
}

export async function getDataset(id: string): Promise<GetDatasetResponse> {
  const found = MOCK_DATASETS.find((d) => d.id === id);
  if (!found) {
    const err = new Error(
      `DatasetsApi.getDataset() call failed: no dataset with id "${id}"`
    );
    err.name = 'ApiError';
    throw err;
  }
  const result = {
    id: found.id,
    owner: found.owner,
    tenant_id: found.tenant_id,
    provider: found.provider,
    visibility: found.visibility,
    size: found.size,
    tags: found.tags,
    items: found.items.map((i) => ({ path: i.path, size: i.size })),
    huggingface_repo_locator: {
      id: found.huggingface_repo_locator.id,
      sha: found.huggingface_repo_locator.sha,
    },
    tapis_system_locator: {
      path: found.tapis_system_locator.path,
      site_id: found.tapis_system_locator.site_id,
      system_id: found.tapis_system_locator.system_id,
      tenant_id: found.tapis_system_locator.tenant_id,
    },
  };
  // Simulate network round-trip before resolving.
  await sleep(450);
  return GetDatasetResponseFromJSON({
    version: '0.1.0',
    status: 200,
    message: 'OK',
    metadata: { id },
    result,
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
