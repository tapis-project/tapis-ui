import { DatasetFromJSON } from '@mlhub/datasets-ts-sdk';

/**
 * Validate + normalize a raw object against the SDK's Dataset contract by
 * running it through DatasetFromJSON. Throws if the shape is invalid.
 */
export function assertValidDataset(raw: unknown) {
  return DatasetFromJSON(raw as Record<string, unknown>);
}
