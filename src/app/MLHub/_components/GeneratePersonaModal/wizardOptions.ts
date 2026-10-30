import type { ExperienceLevel, ProfessionKey } from './types';

export interface ProfessionOption {
  value: ProfessionKey;
  label: string;
  description: string;
  /** Short tag shown on the generated persona card. */
  archetype: string;
}

export const PROFESSIONS: ProfessionOption[] = [
  {
    value: 'ai-ml-researcher',
    label: 'AI / ML Researcher',
    description: 'Runs experiments, reads papers, iterates on model ideas.',
    archetype: 'The Researcher',
  },
  {
    value: 'ml-engineer',
    label: 'ML Engineer',
    description: 'Trains, evaluates, and ships models into production.',
    archetype: 'The Shipper',
  },
  {
    value: 'data-engineer',
    label: 'Data Engineer',
    description: 'Builds pipelines, manages data quality and warehouses.',
    archetype: 'The Pipeline Builder',
  },
  {
    value: 'software-engineer',
    label: 'Software Engineer',
    description: 'Builds products and services, reviews code, ships fast.',
    archetype: 'The Builder',
  },
  {
    value: 'research-software-engineer',
    label: 'Research Software Engineer',
    description: 'Turns research code into reliable, reproducible software.',
    archetype: 'The Bridge',
  },
  {
    value: 'data-scientist',
    label: 'Data Scientist',
    description: 'Explores data, builds analyses, and communicates insight.',
    archetype: 'The Analyst',
  },
  {
    value: 'platform-mlops',
    label: 'Platform / MLOps Engineer',
    description: 'Owns infrastructure, CI/CD, and compute for ML teams.',
    archetype: 'The Operator',
  },
  {
    value: 'educator',
    label: 'Educator',
    description: 'Teaches AI/ML or CS, and runs hackathons and tutorials.',
    archetype: 'The Educator',
  },
  {
    value: 'other-technical',
    label: 'Other technical role',
    description: 'Something adjacent. We\u2019ll keep the view flexible.',
    archetype: 'The Generalist',
  },
];

export const EXPERIENCE_LEVELS: {
  value: ExperienceLevel;
  label: string;
  description: string;
}[] = [
  {
    value: 'beginner',
    label: 'New to this kind of platform',
    description: 'Show me around. Guided flows and defaults first.',
  },
  {
    value: 'intermediate',
    label: 'Comfortable',
    description: 'Standard flows, with advanced options a click away.',
  },
  {
    value: 'advanced',
    label: 'Expert',
    description: 'Full toolkit exposed, minimal hand-holding.',
  },
];

export interface WorkflowOption {
  value: string;
  label: string;
}

/** Day-to-day workflows used to curate the workspace view. */
export const WORKFLOW_OPTIONS: WorkflowOption[] = [
  { value: 'experimentation', label: 'Running experiments' },
  { value: 'model-training', label: 'Training & fine-tuning models' },
  { value: 'data-pipelines', label: 'Building data pipelines / ETL' },
  { value: 'data-analysis', label: 'Exploring & visualizing data' },
  { value: 'prototyping', label: 'Prototyping & demos' },
  { value: 'production-deploys', label: 'Deploying to production' },
  { value: 'code-review', label: 'Code review & collaboration' },
  { value: 'reproducibility', label: 'Reproducibility & documentation' },
  { value: 'infra', label: 'Managing compute & infrastructure' },
];
