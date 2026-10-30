import type {
  ExperienceLevel,
  Persona,
  PersonaAnswers,
  PersonaPreference,
  ProfessionKey,
  WorkspaceModule,
} from './types';
import { PROFESSIONS } from './wizardOptions';

/** Workspace modules each workflow unlocks, in priority order. */
const WORKFLOW_MODULES: Record<string, WorkspaceModule> = {
  experimentation: {
    key: 'experiments',
    label: 'Experiment tracker',
    description: 'Compare runs, metrics, and configurations side by side.',
  },
  'model-training': {
    key: 'training-jobs',
    label: 'Training jobs',
    description: 'Launch, monitor, and resume training runs on shared compute.',
  },
  'data-pipelines': {
    key: 'pipelines',
    label: 'Pipelines',
    description: 'DAG view of your ETL jobs with run history and alerts.',
  },
  'data-analysis': {
    key: 'notebooks',
    label: 'Notebooks & queries',
    description: 'SQL + notebook workspace connected to your data sources.',
  },
  prototyping: {
    key: 'sandboxes',
    label: 'Sandboxes',
    description: 'One-click ephemeral environments for demos and spikes.',
  },
  'production-deploys': {
    key: 'deploys',
    label: 'Deployments',
    description: 'Model and service releases, rollbacks, and health checks.',
  },
  'code-review': {
    key: 'activity',
    label: 'Team activity',
    description: 'Reviews, comments, and changes from people you work with.',
  },
  reproducibility: {
    key: 'repro-docs',
    label: 'Reproducibility hub',
    description: 'Pinned environments, datasets, and paper trails per project.',
  },
  infra: {
    key: 'compute',
    label: 'Compute & quotas',
    description: 'Cluster usage, GPU allocation, and cost across your team.',
  },
};

const PROFESSION_DEFAULT_MODULES: Record<ProfessionKey, string[]> = {
  'ai-ml-researcher': ['experiments', 'notebooks', 'repro-docs'],
  'ml-engineer': ['training-jobs', 'deploys', 'experiments'],
  'data-engineer': ['pipelines', 'compute', 'notebooks'],
  'software-engineer': ['activity', 'sandboxes', 'deploys'],
  'research-software-engineer': ['repro-docs', 'sandboxes', 'activity'],
  'data-scientist': ['notebooks', 'experiments', 'activity'],
  'platform-mlops': ['compute', 'deploys', 'pipelines'],
  educator: ['sandboxes', 'notebooks', 'activity'],
  'other-technical': ['notebooks', 'activity', 'sandboxes'],
};

const PROFESSION_TAGLINES: Record<ProfessionKey, string> = {
  'ai-ml-researcher':
    'Optimized for fast iteration on ideas and clean experiment trails.',
  'ml-engineer':
    'Optimized for taking models from training run to production safely.',
  'data-engineer': 'Optimized for reliable pipelines and clear data lineage.',
  'software-engineer': 'Optimized for shipping quickly with your team in view.',
  'research-software-engineer':
    'Optimized for turning research code into durable software.',
  'data-scientist': 'Optimized for exploring data and sharing findings.',
  'platform-mlops':
    'Optimized for infrastructure visibility and operational control.',
  educator:
    'Optimized for teaching AI/ML and CS through tutorials and hackathons.',
  'other-technical':
    'A flexible, general-purpose workspace you can shape over time.',
};

function experiencePreference(level: ExperienceLevel): PersonaPreference {
  switch (level) {
    case 'beginner':
      return {
        key: 'complexity',
        label: 'Interface complexity',
        value: 'Guided flows, sensible defaults, contextual tips',
      };
    case 'advanced':
      return {
        key: 'complexity',
        label: 'Interface complexity',
        value: 'Full toolkit exposed, keyboard-first navigation, dense tables',
      };
    default:
      return {
        key: 'complexity',
        label: 'Interface complexity',
        value: 'Standard flows with advanced settings one click away',
      };
  }
}

export function generatePersona(answers: PersonaAnswers): Persona {
  const profession = (answers.profession || 'other-technical') as ProfessionKey;
  const option = PROFESSIONS.find((p) => p.value === profession);

  // Curated workspace: workflow-driven modules first, profession defaults fill the rest.
  const moduleKeys: string[] = [];
  for (const workflow of answers.workflows) {
    const mod = WORKFLOW_MODULES[workflow];
    if (mod && !moduleKeys.includes(mod.key)) moduleKeys.push(mod.key);
  }
  for (const key of PROFESSION_DEFAULT_MODULES[profession]) {
    if (!moduleKeys.includes(key)) moduleKeys.push(key);
  }
  const workspace = moduleKeys
    .slice(0, 6)
    .map(
      (key) =>
        (Object.values(WORKFLOW_MODULES) as WorkspaceModule[]).find(
          (m) => m.key === key
        )!
    );

  const preferences: PersonaPreference[] = [
    {
      key: 'layout',
      label: 'Home layout',
      value:
        answers.workflows.length > 2
          ? 'Multi-project dashboard with quick-switcher'
          : 'Single-project dashboard with deep links',
    },
    experiencePreference(answers.experienceLevel),
    {
      key: 'pinned',
      label: 'Pinned by default',
      value:
        profession === 'data-engineer' || profession === 'platform-mlops'
          ? 'Pipeline health, run failures, compute alerts'
          : 'Active projects, recent runs, shared artifacts',
    },
    {
      key: 'collaboration',
      label: 'Collaboration surface',
      value:
        answers.workflows.includes('code-review') ||
        answers.workflows.includes('reproducibility')
          ? 'Inline comments and review requests surfaced on the home view'
          : 'Async: notifications summarized once a day',
    },
  ];

  return {
    id: `persona_${Math.random().toString(36).slice(2, 10)}`,
    createdAt: new Date().toISOString(),
    profession,
    archetype: option?.archetype ?? 'The Generalist',
    tagline: PROFESSION_TAGLINES[profession],
    answers,
    workspace,
    preferences,
  };
}
