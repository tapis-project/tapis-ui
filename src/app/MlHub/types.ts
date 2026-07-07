import type { InferenceBackend } from './enums';
import type {
  ModelStatus,
  DeploymentEnvironment,
  DeploymentStatus,
  ArtifactStorageType,
  ArtifactStatus,
  ArtifactType,
  DatasetFormat,
  DatasetStatus,
  MarketplacePlatform,
  DatasetPlatform,
} from './enums';

// Re-export for convenience (but prefer importing from './enums')
export type { InferenceBackend };
export type {
  ModelStatus,
  DeploymentEnvironment,
  DeploymentStatus,
  ArtifactStorageType,
  ArtifactStatus,
  ArtifactType,
  DatasetFormat,
  DatasetStatus,
  MarketplacePlatform,
  DatasetPlatform,
} from './enums';

export interface Dataset {
  id: string;
  name: string;
  description: string;
  format: DatasetFormat;
  version: string;
  status: DatasetStatus;
  rowCount: number | null;
  size: string; // human-readable size
  createdAt: string;
  updatedAt: string;
  tags: string[];
  author: string;
}

export interface DatasetArtifact {
  id: string;
  datasetId: string;
  datasetName: string;
  name: string;
  storageType: ArtifactStorageType;
  path: string;
  size: string;
  status: ArtifactStatus;
  createdAt: string;
  checksum: string;
}

// ── Model types ─────────────────────────────────────────────────

export interface Model {
  id: string;
  name: string;
  description: string;
  libraries: InferenceBackend[];
  version: string;
  status: ModelStatus;
  f1Score: number | null;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  author: string;
}

export interface Deployment {
  id: string;
  modelId: string;
  modelName: string;
  modelVersion: string;
  environment: DeploymentEnvironment;
  status: DeploymentStatus;
  endpoint: string;
  replicas: number;
  cpu: string;
  memory: string;
  deployedAt: string | null;
  startedBy: string;
}

export interface Artifact {
  id: string;
  /** Which entity this artifact belongs to */
  artifactType: ArtifactType;
  /** Model fields (present when artifactType === 'model') */
  modelId?: string;
  modelName?: string;
  /** Dataset fields (present when artifactType === 'dataset') */
  datasetId?: string;
  datasetName?: string;
  name: string;
  storageType: ArtifactStorageType;
  path: string; // platform path or remote URL/URI
  size: string; // human-readable size
  status: ArtifactStatus;
  createdAt: string;
  checksum: string;
}

// ── Marketplace (external curated) types ──────────────────────

export interface MarketplaceModel {
  id: string;
  name: string;
  description: string;
  platform: MarketplacePlatform;
  libraries: InferenceBackend[];
  task: string; // e.g. 'Text Classification', 'Object Detection', 'Image Generation'
  license: string;
  downloads: number;
  stars: number;
  author: string;
  externalUrl: string;
  tags: string[];
  curatedBy: string; // e.g. 'MLHub Team'
  addedAt: string;
}

export interface MarketplaceDataset {
  id: string;
  name: string;
  description: string;
  platform: DatasetPlatform;
  format: DatasetFormat;
  domain: string; // e.g. 'NLP', 'Computer Vision', 'Tabular', 'Audio', 'Multimodal'
  license: string;
  downloads: number;
  likes: number;
  size: string; // human-readable
  rowCount: number | null;
  author: string;
  externalUrl: string;
  tags: string[];
  curatedBy: string;
  addedAt: string;
}
