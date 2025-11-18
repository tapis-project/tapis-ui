export type RuleOperator =
  | 'Eq'
  | 'Neq'
  | 'Gt'
  | 'Gte'
  | 'Lt'
  | 'Lte'
  | 'Contains';

export type RuleDefinition = {
  field: string;
  operator: RuleOperator;
  value: string | number | boolean;
};

export type RuleSetDefinition = {
  name: string;
  rules: RuleDefinition[];
};

export type DeploymentStrategy = {
  id: string;
  name: string;
  description: string;
  ruleSets?: RuleSetDefinition[];
  useRuleSets: string[];
  useParameterSet: 'Jobs' | 'Pods';
  systemId?: string;
};

export type StrategyReadiness = {
  requiresAllocation: boolean;
  hasAllocation: boolean;
  allocationSteps: string[];
};

export type LocalModelMetadata = {
  name: string;
  author: string;
  model_type: string[];
  frameworks: string[];
  image: string;
  keywords: string[] | null;
  annotations: {
    $upstream: {
      platform: string;
      author: string;
      name: string;
      model_id: string;
      url: string;
      likes: string | number;
      downloads: string | number;
      trendingScore?: string | number;
      visibility: 'private' | 'public';
    };
    $internal: {
      metadata_created_at: string;
      ingested: boolean;
      deployment_strat: string[];
    };
  };
  multi_modal: boolean;
  model_inputs: Array<{
    data_type: string;
    shape: number[];
  }>;
  model_outputs: Array<{
    data_type: string;
    shape: number[];
  }>;
  task_types: string[];
  inference_precision: string;
  inference_hardware: {
    cpus: number;
    memory_gb: number;
    disk_gb: number | null;
    accelerators: string[];
    architectures: string | null;
  };
  inference_software_dependencies: string[];
  inference_max_energy_consumption_watts: number;
  inference_max_latency_ms: number;
  inference_min_throughput: number;
  inference_max_compute_utilization_percentage: number;
  inference_max_memory_usage_mb: number;
  inference_distributed: boolean;
  training_time: number;
  training_precision: string;
  training_hardware: {
    cpus: number;
    memory_gb: number;
    disk_gb: number | null;
    accelerators: string[];
    architectures: string | null;
  };
  pretraining_datasets: string[];
  finetuning_datasets: string[];
  edge_optimized: boolean;
  quantization_aware: boolean;
  supports_quantization: boolean;
  pretrained: boolean;
  pruned: boolean;
  slimmed: boolean;
  training_distributed: boolean;
  training_max_energy_consumption_watts: number;
  regulatory: string[];
  license: string;
  bias_evaluation_score: number;
};

const createStrategyId = (label: string) =>
  label.toLowerCase().replace(/\s+/g, '-');

const strategyList: DeploymentStrategy[] = [
  {
    id: createStrategyId('Stampede3'),
    name: 'Stampede3',
    description:
      'Deploys the model as a Slurm batch job on the Stampede3 HPC system at TACC.',
    ruleSets: [
      {
        name: 'IsNotNotDeepseek',
        rules: [
          {
            field: 'author',
            operator: 'Neq',
            value: 'hf.deepseek',
          },
        ],
      },
    ],
    useRuleSets: ['TransformerCompatibleOnHPC'],
    useParameterSet: 'Jobs',
    systemId: 'stampede3-tapis',
  },
  {
    id: createStrategyId('Frontera'),
    name: 'Frontera',
    description:
      'Deploys the model as a Slurm batch job on the Frontera HPC system at TACC.',
    useRuleSets: ['TransformerCompatibleOnHPC'],
    useParameterSet: 'Jobs',
    systemId: 'frontera-tapis',
  },
  {
    id: createStrategyId('LoneStar6'),
    name: 'LoneStar6',
    description:
      'Deploys the model as a Slurm batch job on the LoneStar6 HPC system at TACC.',
    useRuleSets: ['TransformerCompatibleOnHPC'],
    useParameterSet: 'Jobs',
    systemId: 'mingyu-test-linux',
  },
  {
    id: createStrategyId('Vista'),
    name: 'Vista',
    description:
      'Deploys the model as a Slurm batch job on the Vista HPC system at TACC.',
    useRuleSets: ['TransformerCompatibleOnHPC'],
    useParameterSet: 'Jobs',
    systemId: 'vista-tapis',
  },
  {
    id: createStrategyId('Pods'),
    name: 'Pods',
    description: 'Deploys the model as an HTTP inference server using Pods.',
    useRuleSets: ['TransformerCompatibleOnPods'],
    useParameterSet: 'Pods',
  },
];

export const deploymentStrategyCatalog: Record<string, DeploymentStrategy> =
  strategyList.reduce((catalog, strategy) => {
    catalog[strategy.id] = strategy;
    return catalog;
  }, {} as Record<string, DeploymentStrategy>);

const buildModel = ({
  modelId,
  author,
  name,
  keywords,
  frameworks,
  taskTypes,
  license,
  multiModal,
  modelTypes,
  deploymentStrategies,
}: {
  modelId: string;
  author: string;
  name: string;
  keywords: string[];
  frameworks: string[];
  taskTypes: string[];
  license: string;
  multiModal: boolean;
  modelTypes: string[];
  deploymentStrategies: string[];
}): LocalModelMetadata => {
  const [, shortName = name] = name.split('/');
  const normalizedId = modelId.replace(':', '/');
  return {
    name,
    author,
    model_type: modelTypes,
    frameworks,
    image: '',
    keywords,
    annotations: {
      $upstream: {
        platform: 'huggingface',
        author,
        name: shortName,
        model_id: modelId,
        url: `https://huggingface.co/models/${normalizedId}`,
        likes: '3.1k',
        downloads: '890k',
        trendingScore: '87',
        visibility: 'public',
      },
      $internal: {
        metadata_created_at: new Date().toISOString(),
        ingested: false,
        deployment_strat: deploymentStrategies,
      },
    },
    multi_modal: multiModal,
    model_inputs: [
      {
        data_type: 'uint8',
        shape: [1, 224, 224, 3],
      },
    ],
    model_outputs: [
      {
        data_type: 'float32',
        shape: [1, 3],
      },
    ],
    task_types: taskTypes,
    inference_precision: 'int8',
    inference_hardware: {
      cpus: 2,
      memory_gb: 8,
      disk_gb: null,
      accelerators: [],
      architectures: null,
    },
    inference_software_dependencies: [],
    inference_max_energy_consumption_watts: 45,
    inference_max_latency_ms: 30,
    inference_min_throughput: 300,
    inference_max_compute_utilization_percentage: 70,
    inference_max_memory_usage_mb: 1024,
    inference_distributed: false,
    training_time: 18000,
    training_precision: 'int8',
    training_hardware: {
      cpus: 8,
      memory_gb: 32,
      disk_gb: null,
      accelerators: [],
      architectures: null,
    },
    pretraining_datasets: ['ImageNet'],
    finetuning_datasets: ['CatsVsDogs'],
    edge_optimized: true,
    quantization_aware: true,
    supports_quantization: true,
    pretrained: true,
    pruned: true,
    slimmed: true,
    training_distributed: false,
    training_max_energy_consumption_watts: 400,
    regulatory: ['ISO/IEC 27001'],
    license,
    bias_evaluation_score: -1,
  };
};

export const localModels: LocalModelMetadata[] = [
  buildModel({
    modelId: 'hf.deepstart/vision-transformer',
    author: 'hf.deepstart',
    name: 'hf.deepstart.vision-transformer',
    keywords: ['vision', 'classification', 'license:MIT'],
    frameworks: ['transformers', 'litserve'],
    taskTypes: ['ImageClassification'],
    license: 'MIT',
    multiModal: false,
    modelTypes: ['vision-transformer'],
    deploymentStrategies: [createStrategyId('Stampede3'), createStrategyId('Pods')],
  }),
  buildModel({
    modelId: 'hf.luminae/audio-gen',
    author: 'hf.luminae',
    name: 'hf.luminae.audio-gen',
    keywords: ['audio', 'generation', 'license:Apache-2.0'],
    frameworks: ['transformers', 'ollama'],
    taskTypes: ['AudioGeneration', 'TextToSpeech'],
    license: 'Apache-2.0',
    multiModal: true,
    modelTypes: ['audio-generation'],
    deploymentStrategies: [
      createStrategyId('Frontera'),
      createStrategyId('Vista'),
      createStrategyId('Pods'),
    ],
  }),
  buildModel({
    modelId: 'hf.logicstream/multi-modal-mamba',
    author: 'hf.logicstream',
    name: 'hf.logicstream.multi-modal-mamba',
    keywords: ['mamba', 'multi-modal', 'license:BSD-3-Clause'],
    frameworks: ['transformers', 'llamacpp'],
    taskTypes: ['MultiModalReasoning', 'ImageCaptioning'],
    license: 'BSD-3-Clause',
    multiModal: true,
    modelTypes: ['mamba', 'multi-modal'],
    deploymentStrategies: [createStrategyId('LoneStar6'), createStrategyId('Pods')],
  }),
];

export const modelDeploymentReadiness: Record<
  string,
  Record<string, StrategyReadiness>
> = {
  'hf.deepstart.vision-transformer': {
    [createStrategyId('Stampede3')]: {
      requiresAllocation: true,
      hasAllocation: false,
      allocationSteps: [
        'Request a Stampede3 allocation through the TACC Portal.',
        'Associate your project with allocation STA-12345.',
        'Wait for approval email before continuing.',
      ],
    },
    [createStrategyId('Pods')]: {
      requiresAllocation: false,
      hasAllocation: true,
      allocationSteps: [
        'Ensure you have the Pods service enabled for your tenant.',
      ],
    },
  },
  'hf.luminae.audio-gen': {
    [createStrategyId('Frontera')]: {
      requiresAllocation: true,
      hasAllocation: true,
      allocationSteps: [
        'Confirm allocation FRN-90871 is active.',
        'Ensure queue "normal" is enabled for your project.',
      ],
    },
    [createStrategyId('Vista')]: {
      requiresAllocation: true,
      hasAllocation: false,
      allocationSteps: [
        'Submit allocation request VS-22018 via allocations portal.',
        'Provide justification referencing the Luminae collaboration.',
      ],
    },
    [createStrategyId('Pods')]: {
      requiresAllocation: false,
      hasAllocation: true,
      allocationSteps: [
        'Pods deployment requires reserving 2 vCPU and 4 GB memory.',
      ],
    },
  },
  'hf.logicstream.multi-modal-mamba': {
    [createStrategyId('LoneStar6')]: {
      requiresAllocation: true,
      hasAllocation: true,
      allocationSteps: [
        'Associate LoneStar6 allocation LS6-33211 with project.',
        'Upload SSH public key for ls6.tacc.utexas.edu.',
      ],
    },
    [createStrategyId('Pods')]: {
      requiresAllocation: false,
      hasAllocation: true,
      allocationSteps: [
        'Enable GPU-backed Pods (beta) for this tenant.',
        'Select the "TransformerCompatibleOnPods" rule set.',
      ],
    },
  },
};

