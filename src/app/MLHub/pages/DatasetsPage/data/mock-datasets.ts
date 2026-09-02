import { faker } from '@faker-js/faker';
import { DatasetFromJSON, type Dataset } from '@mlhub/datasets-ts-sdk';

export const MOCK_PROVIDERS: string[] = ['HuggingFace', 'Tapis'];

const MOCK_TAGS = [
  'nlp',
  'computer-vision',
  'tabular',
  'text-classification',
  'text-generation',
  'image-classification',
  'object-detection',
  'speech',
  'audio',
  'translation',
  'summarization',
  'multimodal',
  'question-answering',
  'fill-mask',
];

const MOCK_OWNERS = [
  'alexarias',
  'marisol-torres',
  'devon-chen',
  'priya-raman',
  'jordan-kim',
  'sofia-herrera',
  'mateo-nguyen',
  'lena-vasquez',
];

const MOCK_TENANTS = ['tacc', 'sdsc', 'xsede', 'designsafe', 'agave'];

const MOCK_TAPIS_SYSTEMS = [
  { site_id: 'tacc', system_id: 'tacc.tacc.ls5', path: '/corral/communal/' },
  { site_id: 'sdsc', system_id: 'sdsc.sdsc.ls2', path: '/ocean/projects/' },
  {
    site_id: 'xsede',
    system_id: 'xsede.xsede.expanse',
    path: '/work/datasets/',
  },
  {
    site_id: 'designsafe',
    system_id: 'designsafe.rt',
    path: '/corral-repl/designsafe/',
  },
];

// Deterministic seed so the registry renders consistently.
faker.seed(20260831);

const slug = (words: number): string =>
  faker.helpers
    .arrayElements(
      [
        'med',
        'vision',
        'nlp',
        'speech',
        'tabular',
        'bio',
        'geo',
        'text',
        'image',
        'audio',
        'finance',
        'code',
      ],
      words
    )
    .join('-')
    .toLowerCase();

function items(count: number): Array<{ path: string; size: number }> {
  return faker.helpers
    .arrayElements(
      [
        'train.parquet',
        'test.parquet',
        'valid.parquet',
        'labels.json',
        'meta.json',
        'vocab.txt',
        'audio/',
        'images/',
      ],
      count
    )
    .map((name) => ({
      path: `${faker.string.alpha({ length: 10 })}/${name}`,
      size: faker.number.int({ min: 1024, max: 6 * 1024 * 1024 * 1024 }),
    }));
}

function buildDataset(index: number): Dataset {
  // Convert the SDK enum-ish union values to the concrete literals.
  const provider = index % 2 === 0 ? 'HuggingFace' : 'Tapis';
  const visibility = faker.datatype.boolean(0.72) ? 'Public' : 'Private';
  const owner = faker.helpers.arrayElement(MOCK_OWNERS);
  const tenant_id = faker.helpers.arrayElement(MOCK_TENANTS);
  const tapis = faker.helpers.arrayElement(MOCK_TAPIS_SYSTEMS);

  // Both locators are required by the SDK Dataset model.
  const raw = {
    id: slug(3),
    owner,
    tenant_id,
    provider,
    visibility,
    size: faker.number.int({ min: 1024 * 1024, max: 120 * 1024 * 1024 * 1024 }),
    tags: faker.helpers.arrayElements(
      MOCK_TAGS,
      faker.number.int({ min: 2, max: 6 })
    ),
    items: items(faker.number.int({ min: 4, max: 10 })),
    huggingface_repo_locator: {
      id: `${owner}/${slug(2)}`,
      sha: faker.string.hexadecimal({ length: 40 }),
    },
    tapis_system_locator: {
      ...tapis,
      tenant_id,
    },
  };

  // Route through the SDK's real deserializer to guarantee conformance.
  return DatasetFromJSON(raw);
}

export const MOCK_DATASETS: Dataset[] = Array.from({ length: 24 }, (_, i) =>
  buildDataset(i)
);
