import { faker } from '@faker-js/faker';
import type {
  Model,
  Deployment,
  Artifact,
  Dataset,
  DatasetArtifact,
  ArtifactType,
} from '../types';
import type { MarketplaceModel, MarketplaceDataset } from '../types';
import {
  ALL_INFERENCE_BACKENDS,
  ALL_MODEL_STATUSES,
  ALL_DATASET_FORMATS,
  ALL_DATASET_STATUSES,
} from '../enums';

export const generateModels = (count: number): Model[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `model-${String(i + 1).padStart(3, '0')}`,
    name:
      [
        'Customer Churn Predictor',
        'Image Classification ResNet',
        'Fraud Detection XGBoost',
        'NLP Sentiment Analyzer',
        'Recommendation Engine',
        'Object Detection YOLO',
        'Time Series Forecaster',
        'Document Classifier BERT',
        'Anomaly Detector AutoEncoder',
        'Price Optimization Model',
        'Speech-to-Text Whisper',
        'Credit Scoring Model',
        'Demand Forecasting LSTM',
        'Entity Recognition NER',
        'Quality Inspection CNN',
      ][i % 15] + (i >= 15 ? ` v${Math.floor(i / 15) + 2}` : ''),
    description: faker.lorem.sentences(2),
    libraries: faker.helpers.arrayElements(ALL_INFERENCE_BACKENDS, {
      min: 1,
      max: 3,
    }),
    version: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(
      Math.random() * 10
    )}.${Math.floor(Math.random() * 10)}`,
    status: ALL_MODEL_STATUSES[i % ALL_MODEL_STATUSES.length],
    f1Score:
      ALL_MODEL_STATUSES[i % ALL_MODEL_STATUSES.length] === 'ready'
        ? Math.round((0.85 + Math.random() * 0.14) * 10000) / 100
        : null,
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 30 }).toISOString(),
    tags: faker.helpers.arrayElements(
      [
        'production',
        'experimental',
        'cv',
        'nlp',
        'tabular',
        'time-series',
        'critical',
        'research',
      ],
      { min: 1, max: 4 }
    ),
    author: faker.person.fullName(),
  }));

export const generateDeployments = (models: Model[]): Deployment[] =>
  models
    .filter((m) => m.status === 'ready')
    .slice(0, 8)
    .map((model, i) => {
      const env: Deployment['environment'] =
        i % 3 === 0 ? 'staging' : 'production';
      const deploymentStatuses: Array<Deployment['status']> = [
        'Running',
        'Running',
        'Running',
        'NotDeployed',
        'Failed',
        'Stopped',
        'Blocked',
        'Unknown',
        'Running',
        'Stopped',
      ];
      const status = deploymentStatuses[i % deploymentStatuses.length];
      return {
        id: `deploy-${String(i + 1).padStart(3, '0')}`,
        modelId: model.id,
        modelName: model.name,
        modelVersion: model.version,
        environment: env,
        status,
        endpoint: `https://api.ml-platform.io/v1/models/${model.id
          .toLowerCase()
          .replace(/\s+/g, '-')}/predict`,
        replicas:
          env === 'production'
            ? faker.number.int({ min: 2, max: 6 })
            : faker.number.int({ min: 1, max: 2 }),
        cpu: faker.helpers.arrayElement(['500m', '1', '2', '4']),
        memory: faker.helpers.arrayElement(['512Mi', '1Gi', '2Gi', '4Gi']),
        deployedAt: ['Running', 'Stopped'].includes(status)
          ? faker.date.recent({ days: 14 }).toISOString()
          : null,
        startedBy: faker.person.fullName(),
      };
    });

export const generateArtifacts = (
  models: Model[],
  datasets: Dataset[]
): Artifact[] => {
  const artifacts: Artifact[] = [];

  // ── Model artifacts ─────────────────────────────────────
  models.forEach((model, idx) => {
    const count = (idx % 3) + 1;
    for (let a = 0; a < count; a++) {
      const storageTypes: Array<Artifact['storageType']> = [
        'platform',
        's3',
        'gcs',
        'azure',
        'url',
      ];
      const storageType = storageTypes[(idx + a) % storageTypes.length];
      const artifactNames = [
        'model_weights.pt',
        'model.pb',
        'model.joblib',
        'model.onnx',
        'tokenizer.json',
        'config.yaml',
      ];

      let path: string;
      switch (storageType) {
        case 'platform':
          path = `/artifacts/${model.id}/${
            artifactNames[a % artifactNames.length]
          }`;
          break;
        case 's3':
          path = `s3://ml-model-bucket/artifacts/${model.id}/${
            artifactNames[a % artifactNames.length]
          }`;
          break;
        case 'gcs':
          path = `gs://ml-platform-models/${model.id}/${
            artifactNames[a % artifactNames.length]
          }`;
          break;
        case 'azure':
          path = `https://mlplatform.blob.core.windows.net/artifacts/${
            model.id
          }/${artifactNames[a % artifactNames.length]}`;
          break;
        case 'url':
          path = `https://cdn.model-registry.io/artifacts/${model.id}/${
            artifactNames[a % artifactNames.length]
          }`;
          break;
      }

      const sizes = [
        '12.4 MB',
        '256 MB',
        '1.2 GB',
        '45.8 MB',
        '890 MB',
        '3.4 GB',
      ];
      const artifactStatuses: Array<Artifact['status']> = [
        'available',
        'available',
        'available',
        'uploading',
        'error',
        'archived',
      ];

      artifacts.push({
        id: `artifact-${String(artifacts.length + 1).padStart(3, '0')}`,
        artifactType: 'model' as ArtifactType,
        modelId: model.id,
        modelName: model.name,
        name: artifactNames[a % artifactNames.length],
        storageType,
        path,
        size: sizes[(idx + a) % sizes.length],
        status: artifactStatuses[(idx + a) % artifactStatuses.length],
        createdAt: faker.date.past({ years: 0.5 }).toISOString(),
        checksum: `sha256:${faker.string.alphanumeric({ length: 64 })}`,
      });
    }
  });

  // ── Dataset artifacts ───────────────────────────────────
  datasets.forEach((dataset, idx) => {
    const count = (idx % 2) + 1;
    for (let a = 0; a < count; a++) {
      const storageTypes: Array<Artifact['storageType']> = [
        'platform',
        's3',
        'gcs',
        'azure',
        'url',
      ];
      const storageType = storageTypes[(idx + a + 2) % storageTypes.length];
      const artifactNames = [
        `${dataset.name.toLowerCase().replace(/\s+/g, '_')}.zip`,
        `${dataset.name.toLowerCase().replace(/\s+/g, '_')}_manifest.json`,
        `${dataset.name.toLowerCase().replace(/\s+/g, '_')}_schema.json`,
        `${dataset.name.toLowerCase().replace(/\s+/g, '_')}_sample.csv`,
        'data_preview.parquet',
        '.datalens_metadata',
      ];

      let path: string;
      switch (storageType) {
        case 'platform':
          path = `/datasets/${dataset.id}/${
            artifactNames[a % artifactNames.length]
          }`;
          break;
        case 's3':
          path = `s3://ml-dataset-bucket/datasets/${dataset.id}/${
            artifactNames[a % artifactNames.length]
          }`;
          break;
        case 'gcs':
          path = `gs://ml-platform-datasets/${dataset.id}/${
            artifactNames[a % artifactNames.length]
          }`;
          break;
        case 'azure':
          path = `https://mlplatform.blob.core.windows.net/datasets/${
            dataset.id
          }/${artifactNames[a % artifactNames.length]}`;
          break;
        case 'url':
          path = `https://cdn.dataset-registry.io/datasets/${dataset.id}/${
            artifactNames[a % artifactNames.length]
          }`;
          break;
      }

      const sizes = [
        '24.8 MB',
        '512 MB',
        '3.1 GB',
        '78 MB',
        '1.5 GB',
        '8.9 GB',
      ];
      const artifactStatuses: Array<Artifact['status']> = [
        'available',
        'available',
        'uploading',
        'error',
        'archived',
      ];

      artifacts.push({
        id: `artifact-${String(artifacts.length + 1).padStart(3, '0')}`,
        artifactType: 'dataset' as ArtifactType,
        datasetId: dataset.id,
        datasetName: dataset.name,
        name: artifactNames[a % artifactNames.length],
        storageType,
        path,
        size: sizes[(idx + a) % sizes.length],
        status: artifactStatuses[(idx + a) % artifactStatuses.length],
        createdAt: faker.date.past({ years: 0.5 }).toISOString(),
        checksum: `sha256:${faker.string.alphanumeric({ length: 64 })}`,
      });
    }
  });

  return artifacts;
};

/* ── Dataset generators ─────────────────────────────────────── */

export const generateDatasets = (count: number): Dataset[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `dataset-${String(i + 1).padStart(3, '0')}`,
    name:
      [
        'User Interaction Logs',
        'Product Catalog Images',
        'Transaction Records',
        'Customer Reviews Corpus',
        'Sensor Readings Stream',
        'Training Image Set v2',
        'Clickstream Events',
        'Fraud Label Annotations',
        'Natural Language Pairs',
        'Time Series Metrics',
        'Geospatial Coordinates',
        'Audio Transcriptions',
        'E-Commerce Search Logs',
        'Medical Imaging Scans',
        'Social Media Posts',
      ][i % 15] + (i >= 15 ? ` v${Math.floor(i / 15) + 2}` : ''),
    description: faker.lorem.sentences(2),
    format: ALL_DATASET_FORMATS[i % ALL_DATASET_FORMATS.length],
    version: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(
      Math.random() * 10
    )}.0`,
    status: ALL_DATASET_STATUSES[i % ALL_DATASET_STATUSES.length],
    rowCount:
      ALL_DATASET_STATUSES[i % ALL_DATASET_STATUSES.length] === 'ready'
        ? faker.number.int({ min: 1_000, max: 50_000_000 })
        : null,
    size: [
      '128 MB',
      '2.4 GB',
      '890 MB',
      '15.6 GB',
      '45 MB',
      '4.2 GB',
      '12.8 GB',
      '256 MB',
    ][i % 8],
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 30 }).toISOString(),
    tags: faker.helpers.arrayElements(
      [
        'production',
        'experimental',
        'training',
        'validation',
        'test',
        'pii',
        'public',
        'internal',
        'raw',
        'processed',
      ],
      { min: 1, max: 4 }
    ),
    author: faker.person.fullName(),
  }));

// Pre-generate mock data
export const mockModels = generateModels(15);
export const mockDeployments = generateDeployments(mockModels);
export const mockDatasets = generateDatasets(12);
export const mockArtifacts = generateArtifacts(mockModels, mockDatasets);

/* ── Dataset Artifact generators (for dataset-specific views) ── */

export const generateDatasetArtifacts = (
  datasets: Dataset[]
): DatasetArtifact[] => {
  const artifacts: DatasetArtifact[] = [];

  datasets.forEach((dataset, idx) => {
    // Each dataset has 1-2 artifacts
    const count = (idx % 2) + 1;
    for (let a = 0; a < count; a++) {
      const storageTypes: Array<DatasetArtifact['storageType']> = [
        'platform',
        's3',
        'gcs',
        'azure',
        'url',
      ];
      const storageType = storageTypes[(idx + a) % storageTypes.length];
      const artifactNames = [
        `${dataset.name.toLowerCase().replace(/\s+/g, '_')}.zip`,
        `${dataset.name.toLowerCase().replace(/\s+/g, '_')}_manifest.json`,
        `${dataset.name.toLowerCase().replace(/\s+/g, '_')}_schema.json`,
        `${dataset.name.toLowerCase().replace(/\s+/g, '_')}_sample.csv`,
        'data_preview.parquet',
        '.datalens_metadata',
      ];

      let path: string;
      switch (storageType) {
        case 'platform':
          path = `/datasets/${dataset.id}/${
            artifactNames[a % artifactNames.length]
          }`;
          break;
        case 's3':
          path = `s3://ml-dataset-bucket/datasets/${dataset.id}/${
            artifactNames[a % artifactNames.length]
          }`;
          break;
        case 'gcs':
          path = `gs://ml-platform-datasets/${dataset.id}/${
            artifactNames[a % artifactNames.length]
          }`;
          break;
        case 'azure':
          path = `https://mlplatform.blob.core.windows.net/datasets/${
            dataset.id
          }/${artifactNames[a % artifactNames.length]}`;
          break;
        case 'url':
          path = `https://cdn.dataset-registry.io/datasets/${dataset.id}/${
            artifactNames[a % artifactNames.length]
          }`;
          break;
      }

      const sizes = [
        '24.8 MB',
        '512 MB',
        '3.1 GB',
        '78 MB',
        '1.5 GB',
        '8.9 GB',
      ];
      const artifactStatuses: Array<DatasetArtifact['status']> = [
        'available',
        'available',
        'uploading',
        'error',
        'archived',
      ];

      artifacts.push({
        id: `ds-artifact-${String(artifacts.length + 1).padStart(3, '0')}`,
        datasetId: dataset.id,
        datasetName: dataset.name,
        name: artifactNames[a % artifactNames.length],
        storageType,
        path,
        size: sizes[(idx + a) % sizes.length],
        status: artifactStatuses[(idx + a) % artifactStatuses.length],
        createdAt: faker.date.past({ years: 0.5 }).toISOString(),
        checksum: `sha256:${faker.string.alphanumeric({ length: 64 })}`,
      });
    }
  });

  return artifacts;
};

export const mockDatasetArtifacts = generateDatasetArtifacts(mockDatasets);

/* ── Marketplace (curated external models) ─────────────────── */

export const mockMarketplaceModels: MarketplaceModel[] = [
  {
    id: 'mp-001',
    name: 'BERT-Large-Uncased (SQuAD Fine-tuned)',
    description:
      'State-of-the-art BERT-large model fine-tuned on SQuAD 2.0 for question answering and reading comprehension tasks with exceptional accuracy.',
    platform: 'huggingface',
    libraries: ['pytorch', 'tensorflow'],
    task: 'Question Answering',
    license: 'Apache-2.0',
    downloads: 4_520_000,
    stars: 12_840,
    author: 'google-research',
    externalUrl:
      'https://huggingface.co/google-bert/bert-large-uncased-whole-word-masking-finetuned-squad',
    tags: ['nlp', 'qa', 'transformers', 'bert'],
    curatedBy: 'MLHub Team',
    addedAt: '2025-11-15T08:00:00Z',
  },
  {
    id: 'mp-002',
    name: 'YOLOv8x Object Detection',
    description:
      'Ultralytics YOLOv8x — the latest real-time object detection model with state-of-the-art speed/accuracy tradeoff. Supports 80 COCO classes.',
    platform: 'huggingface',
    libraries: ['pytorch', 'onnx'],
    task: 'Object Detection',
    license: 'AGPL-3.0',
    downloads: 3_180_000,
    stars: 21_500,
    author: 'ultralytics',
    externalUrl: 'https://huggingface.co/ultralytics/yolov8x',
    tags: ['cv', 'detection', 'yolo', 'real-time'],
    curatedBy: 'MLHub Team',
    addedAt: '2025-10-22T14:30:00Z',
  },
  {
    id: 'mp-003',
    name: 'Stable Diffusion XL 1.0',
    description:
      'Latent text-to-image diffusion model capable of generating photorealistic images from text prompts. Supports inpainting, outpainting, and image-to-image.',
    platform: 'huggingface',
    libraries: ['pytorch'],
    task: 'Text-to-Image Generation',
    license: 'CreativeML Open RAIL-M',
    downloads: 8_920_000,
    stars: 18_200,
    author: 'stabilityai',
    externalUrl:
      'https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0',
    tags: ['generative', 'diffusion', 'image', 'sdxl'],
    curatedBy: 'MLHub Team',
    addedAt: '2025-09-05T10:15:00Z',
  },
  {
    id: 'mp-004',
    name: 'ResNet-50 (ImageNet Pretrained)',
    description:
      'Deep residual network pretrained on ImageNet-1K. A foundational backbone for transfer learning, feature extraction, and classification tasks.',
    platform: 'pytorch-hub',
    libraries: ['pytorch', 'onnx'],
    task: 'Image Classification',
    license: 'BSD-3-Clause',
    downloads: 2_450_000,
    stars: 9_300,
    author: 'PyTorch Vision Team',
    externalUrl: 'https://pytorch.org/hub/pytorch_vision_resnet/',
    tags: ['cv', 'classification', 'backbone', 'imagenet'],
    curatedBy: 'MLHub Team',
    addedAt: '2025-12-01T16:45:00Z',
  },
  {
    id: 'mp-005',
    name: 'Llama 3.2 3B Instruct',
    description:
      "Meta's efficient instruction-tuned language model optimized for edge deployment, agentic workflows, and multilingual dialogue applications.",
    platform: 'huggingface',
    libraries: ['pytorch'],
    task: 'Text Generation / Chat',
    license: 'LLaMA 3.2 Community License',
    downloads: 6_780_000,
    stars: 34_100,
    author: 'meta-llama',
    externalUrl: 'https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct',
    tags: ['llm', 'instruct', 'multilingual', 'efficient'],
    curatedBy: 'MLHub Team',
    addedAt: '2026-01-10T09:20:00Z',
  },
  {
    id: 'mp-006',
    name: 'XGBoost Credit Default Predictor',
    description:
      'Production-grade XGBoost gradient boosting model trained on credit default data. Includes feature importance analysis and SHAP explanations.',
    platform: 'kaggle',
    libraries: ['xgboost', 'sklearn'],
    task: 'Tabular Classification',
    license: 'MIT',
    downloads: 320_000,
    stars: 1_850,
    author: 'kaggle-community',
    externalUrl:
      'https://www.kaggle.com/models/datasets/credit-default-xgboost',
    tags: ['tabular', 'classification', 'finance', 'shap'],
    curatedBy: 'MLHub Community',
    addedAt: '2025-08-18T11:00:00Z',
  },
  {
    id: 'mp-007',
    name: 'EfficientNet-B4 (TensorFlow Hub)',
    description:
      'EfficientNet-B4 convolutional neural network from TensorFlow Hub. Achieves ImageNet top-1 accuracy of 82.9% with significantly fewer parameters than ResNet.',
    platform: 'tensorflow-hub',
    libraries: ['tensorflow'],
    task: 'Image Classification / Feature Extraction',
    license: 'Apache-2.0',
    downloads: 780_000,
    stars: 3_420,
    author: 'Google Research',
    externalUrl: 'https://tfhub.dev/google/efficientnet/b4/classification/1',
    tags: ['cv', 'classification', 'efficientnet', 'feature-extraction'],
    curatedBy: 'MLHub Team',
    addedAt: '2025-07-25T13:10:00Z',
  },
  {
    id: 'mp-008',
    name: 'Whisper Large v3 (Multilingual)',
    description:
      "OpenAI's robust automatic speech recognition model supporting 99 languages. Transcribes audio to text with state-of-the-art accuracy across diverse accents.",
    platform: 'huggingface',
    libraries: ['pytorch'],
    task: 'Speech Recognition',
    license: 'MIT',
    downloads: 5_340_000,
    stars: 15_600,
    author: 'openai',
    externalUrl: 'https://huggingface.co/openai/whisper-large-v3',
    tags: ['audio', 'asr', 'multilingual', 'whisper'],
    curatedBy: 'MLHub Team',
    addedAt: '2025-11-28T17:35:00Z',
  },
  {
    id: 'mp-009',
    name: 'ViT-Large/16 (Vision Transformer)',
    description:
      "Google's Vision Transformer large variant pretrained on ImageNet-21K and fine-tuned on ImageNet-1K. Excellent zero-shot transfer capabilities.",
    platform: 'pytorch-hub',
    libraries: ['pytorch', 'tensorflow'],
    task: 'Image Classification',
    license: 'Apache-2.0',
    downloads: 1_120_000,
    stars: 6_780,
    author: 'google-research',
    externalUrl: 'https://pytorch.org/vision/main/models/vit.html',
    tags: ['cv', 'transformer', 'vision', 'vit'],
    curatedBy: 'MLHub Team',
    addedAt: '2025-10-10T08:50:00Z',
  },
  {
    id: 'mp-010',
    name: 'GPT-2 Medium Text Generator',
    description:
      "OpenAI's GPT-2 medium (345M parameters) for general-purpose text generation, completion, and creative writing tasks. Fast inference on consumer hardware.",
    platform: 'huggingface',
    libraries: ['pytorch', 'tensorflow', 'onnx'],
    task: 'Text Generation',
    license: 'Modified MIT',
    downloads: 9_150_000,
    stars: 8_900,
    author: 'openai',
    externalUrl: 'https://huggingface.co/gpt2-medium',
    tags: ['nlp', 'text-generation', 'gpt', 'creative'],
    curatedBy: 'MLHub Community',
    addedAt: '2025-06-14T12:00:00Z',
  },
  {
    id: 'mp-011',
    name: 'ONNX YOLOv7 Object Detection',
    description:
      'Optimized YOLOv7 exported to ONNX format for cross-platform inference. Ideal for CPU/GPU deployment in production pipelines without Python dependency.',
    platform: 'onnx-model-zoo',
    libraries: ['onnx'],
    task: 'Object Detection',
    license: 'GPL-3.0',
    downloads: 430_000,
    stars: 2_140,
    author: 'WongKinYiu',
    externalUrl:
      'https://github.com/onnx/models/tree/main/vision/object_detection_segmentation/yolov7',
    tags: ['cv', 'detection', 'yolo', 'onnx', 'production'],
    curatedBy: 'MLHub Community',
    addedAt: '2025-09-30T15:20:00Z',
  },
  {
    id: 'mp-012',
    name: 'TabNet Tabular Deep Learning',
    description:
      "Google DeepMind's TabNet — an attentive tabular learning architecture that achieves SOTA performance on tabular data without manual feature engineering.",
    platform: 'huggingface',
    libraries: ['pytorch'],
    task: 'Tabular Classification / Regression',
    license: 'Apache-2.0',
    downloads: 185_000,
    stars: 1_230,
    author: 'dreamquark-ai',
    externalUrl: 'https://huggingface.co/dreamquark-ai/tabnet',
    tags: ['tabular', 'deep-learning', 'attention', 'tabnet'],
    curatedBy: 'MLHub Team',
    addedAt: '2026-01-02T10:00:00Z',
  },
];

/* ── Marketplace Datasets (curated external datasets) ───────── */

export const mockMarketplaceDatasets: MarketplaceDataset[] = [
  {
    id: 'ds-mp-001',
    name: 'ImageNet-1K (ILSVRC2012)',
    description:
      'The iconic large-scale dataset for visual object recognition research. Contains 1.28M training images across 1,000 object categories with bounding box annotations.',
    platform: 'huggingface',
    format: 'image',
    domain: 'Computer Vision',
    license: 'Custom (Non-commercial)',
    downloads: 12_500_000,
    likes: 18_400,
    size: '150 GB',
    rowCount: 1_281_167,
    author: 'Stanford Vision Lab',
    externalUrl: 'https://huggingface.co/datasets/imagenet-1k',
    tags: ['classification', 'benchmark', 'images', 'object-recognition'],
    curatedBy: 'MLHub Team',
    addedAt: '2025-10-01T08:00:00Z',
  },
  {
    id: 'ds-mp-002',
    name: 'GLUE Benchmark Collection',
    description:
      'General Language Understanding Evaluation benchmark — a collection of 9 NLP tasks for training and evaluating shared models across diverse language understanding tasks.',
    platform: 'huggingface',
    format: 'csv',
    domain: 'NLP',
    license: 'Apache-2.0',
    downloads: 3_200_000,
    likes: 5_600,
    size: '890 MB',
    rowCount: 4_500_000,
    author: 'NYU, Google, University of Washington',
    externalUrl: 'https://huggingface.co/datasets/glue',
    tags: ['nlp', 'benchmark', 'classification', 'regression', 'sentiment'],
    curatedBy: 'MLHub Team',
    addedAt: '2025-09-15T14:30:00Z',
  },
  {
    id: 'ds-mp-003',
    name: 'California Housing Prices',
    description:
      'Classic tabular dataset derived from the 1990 U.S. Census. Used for regression tasks predicting median house prices in California districts based on housing attributes.',
    platform: 'kaggle',
    format: 'csv',
    domain: 'Tabular',
    license: 'CC0-1.0',
    downloads: 980_000,
    likes: 3_200,
    size: '1.2 MB',
    rowCount: 20_640,
    author: ' Pace R. Kellogg & Ronald K. Pace',
    externalUrl:
      'https://www.kaggle.com/datasets/camnugent/california-housing-prices',
    tags: ['tabular', 'regression', 'housing', 'census', 'beginner-friendly'],
    curatedBy: 'MLHub Community',
    addedAt: '2025-07-20T11:00:00Z',
  },
  {
    id: 'ds-mp-004',
    name: 'LibriSpeech ASR Corpus',
    description:
      'Large-scale corpus of approximately 1000 hours of 16kHz read English speech audio, ideal for training automatic speech recognition models with transcriptions.',
    platform: 'huggingface',
    format: 'audio',
    domain: 'Audio',
    license: 'CC-BY-4.0',
    downloads: 1_850_000,
    likes: 4_100,
    size: '63 GB',
    rowCount: null,
    author: 'Vassil Panayotov',
    externalUrl: 'https://huggingface.co/datasets/librispeech_asr',
    tags: ['audio', 'asr', 'speech', 'transcription', 'english'],
    curatedBy: 'MLHub Team',
    addedAt: '2025-11-05T09:20:00Z',
  },
  {
    id: 'ds-mp-005',
    name: 'COCO 2017 — Object Detection',
    description:
      'Microsoft COCO is a large-scale object detection, segmentation, and captioning dataset with 330K images, 1.5M object instances, and 80 object categories.',
    platform: 'huggingface',
    format: 'image',
    domain: 'Computer Vision',
    license: 'CC-BY-4.0',
    downloads: 6_700_000,
    likes: 12_800,
    size: '25 GB',
    rowCount: 330_000,
    author: 'Lin Tsung-Yi et al.',
    externalUrl: 'https://huggingface.co/datasets/coco-dataset',
    tags: ['cv', 'detection', 'segmentation', 'captioning', 'images'],
    curatedBy: 'MLHub Team',
    addedAt: '2025-08-12T16:45:00Z',
  },
  {
    id: 'ds-mp-006',
    name: 'UCI Machine Learning Repository: Adult Income',
    description:
      'Classic census income prediction dataset. Predict whether annual income exceeds $50K/yr based on demographic features. Widely used for classification benchmarks.',
    platform: 'uciml',
    format: 'csv',
    domain: 'Tabular',
    license: 'CC0-1.0',
    downloads: 2_100_000,
    likes: 2_900,
    size: '4 MB',
    rowCount: 48_842,
    author: 'Ronny Kohavi & Barry Becker',
    externalUrl: 'https://archive.ics.uci.edu/ml/datasets/adult',
    tags: ['tabular', 'classification', 'census', 'fairness', 'benchmark'],
    curatedBy: 'MLHub Community',
    addedAt: '2025-06-01T13:10:00Z',
  },
  {
    id: 'ds-mp-007',
    name: 'LAION-5B Aesthetic Subset',
    description:
      'Large-scale image-text dataset filtered for aesthetic quality. Contains 600M+ image-caption pairs for CLIP-style contrastive learning and image generation fine-tuning.',
    platform: 'huggingface',
    format: 'parquet',
    domain: 'Multimodal',
    license: 'CC-BY-4.0',
    downloads: 4_300_000,
    likes: 8_700,
    size: '8.5 TB',
    rowCount: 600_000_000,
    author: 'Christoph Schuhmann',
    externalUrl: 'https://huggingface.co/datasets/laion/laion-aesthetic-large',
    tags: [
      'multimodal',
      'clip',
      'image-generation',
      'large-scale',
      'aesthetic',
    ],
    curatedBy: 'MLHub Team',
    addedAt: '2025-12-20T17:35:00Z',
  },
  {
    id: 'ds-mp-008',
    name: 'Titanic - Machine Learning from Disaster',
    description:
      'The quintessential beginner ML competition dataset. Predict which passengers survived the Titanic disaster using passenger demographics and travel information.',
    platform: 'kaggle',
    format: 'csv',
    domain: 'Tabular',
    license: 'CC0-1.0',
    downloads: 8_900_000,
    likes: 15_600,
    size: '60 KB',
    rowCount: 891,
    author: 'Kaggle Community',
    externalUrl: 'https://www.kaggle.com/c/titanic/data',
    tags: [
      'tabular',
      'classification',
      'beginner-friendly',
      'competition',
      'education',
    ],
    curatedBy: 'MLHub Community',
    addedAt: '2025-04-10T12:00:00Z',
  },
  {
    id: 'ds-mp-009',
    name: 'Common Crawl — Web Text Corpus',
    description:
      'Massive multilingual text corpus scraped from the web. Pre-cleaned and deduplicated, suitable for pretraining LLMs, embedding models, and text generation pipelines.',
    platform: 'github',
    format: 'jsonl',
    domain: 'NLP',
    license: 'CC-BY-4.0',
    downloads: 1_450_000,
    likes: 6_300,
    size: '2.8 TB',
    rowCount: 8_500_000_000,
    author: 'Common Crawl',
    externalUrl: 'https://github.com/commoncrawl/cc-news',
    tags: ['nlp', 'llm', 'pretraining', 'text', 'multilingual'],
    curatedBy: 'MLHub Team',
    addedAt: '2026-01-05T08:50:00Z',
  },
  {
    id: 'ds-mp-010',
    name: 'AudioSet — Sound Event Dataset',
    description:
      "Google's large-scale dataset of human-labeled 10-second sound clips drawn from YouTube videos. Covers 632 audio event classes in a hierarchical taxonomy.",
    platform: 'huggingface',
    format: 'audio',
    domain: 'Audio',
    license: 'CC-BY-4.0',
    downloads: 520_000,
    likes: 1_850,
    author: 'Google Research',
    externalUrl: 'https://huggingface.co/datasets/google/audioset',
    size: '22 GB',
    rowCount: 2_084_320,
    tags: [
      'audio',
      'sound-events',
      'classification',
      'youtube',
      'hierarchical',
    ],
    curatedBy: 'MLHub Team',
    addedAt: '2025-10-28T15:20:00Z',
  },
];
