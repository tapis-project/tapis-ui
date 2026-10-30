import * as Models from '@mlhub/models-ts-sdk';

export const LIBRARIES = [
  { value: 'transformers', label: 'Transformers' },
  { value: 'diffusers', label: 'Diffusers' },
  { value: 'pytorch', label: 'PyTorch' },
] as const;

export enum TaskCategory {
  NLP = 'NLP',
  ComputerVision = 'Computer Vision',
  Audio = 'Audio',
  Tabular = 'Tabular',
  Other = 'Other',
}

export type Task = {
  value: Models.Task;
  label: string;
  category: TaskCategory;
};

export const TASK_TYPES: Task[] = [
  {
    value: Models.Task.TextGeneration,
    label: 'Text Generation',
    category: TaskCategory.NLP,
  },
  {
    value: Models.Task.TextClassification,
    label: 'Text Classification',
    category: TaskCategory.NLP,
  },
  {
    value: Models.Task.TokenClassification,
    label: 'Token Classification',
    category: TaskCategory.NLP,
  },
  {
    value: Models.Task.QuestionAnswering,
    label: 'Question Answering',
    category: TaskCategory.NLP,
  },
  {
    value: Models.Task.FillMask,
    label: 'Fill-Mask',
    category: TaskCategory.NLP,
  },
  {
    value: Models.Task.Summarization,
    label: 'Summarization',
    category: TaskCategory.NLP,
  },
  {
    value: Models.Task.Translation,
    label: 'Translation',
    category: TaskCategory.NLP,
  },
  {
    value: Models.Task.SentenceSimilarity,
    label: 'Sentence Similarity',
    category: TaskCategory.NLP,
  },
  {
    value: Models.Task.FeatureExtraction,
    label: 'Feature Extraction',
    category: TaskCategory.NLP,
  },
  {
    value: Models.Task.ZeroShotClassification,
    label: 'Zero-Shot Classification',
    category: TaskCategory.NLP,
  },
  {
    value: Models.Task.TableQuestionAnswering,
    label: 'Table Question Answering',
    category: TaskCategory.NLP,
  },
  {
    value: Models.Task.ImageClassification,
    label: 'Image Classification',
    category: TaskCategory.ComputerVision,
  },
  {
    value: Models.Task.ImageToText,
    label: 'Image-to-Text',
    category: TaskCategory.ComputerVision,
  },
  {
    value: Models.Task.ImageSegmentation,
    label: 'Image Segmentation',
    category: TaskCategory.ComputerVision,
  },
  {
    value: Models.Task.ImageFeatureExtraction,
    label: 'Image Feature Extraction',
    category: TaskCategory.ComputerVision,
  },
  {
    value: Models.Task.TextToImage,
    label: 'Text-to-Image',
    category: TaskCategory.ComputerVision,
  },
  {
    value: Models.Task.TextToVideo,
    label: 'Text-to-Video',
    category: TaskCategory.ComputerVision,
  },
  {
    value: Models.Task.VisualQuestionAnswering,
    label: 'Visual Question Answering',
    category: TaskCategory.ComputerVision,
  },
  {
    value: Models.Task.DocumentQuestionAnswering,
    label: 'Document Question Answering',
    category: TaskCategory.ComputerVision,
  },
  {
    value: Models.Task.ObjectDetection,
    label: 'Object Detection',
    category: TaskCategory.ComputerVision,
  },
  {
    value: Models.Task.DepthEstimation,
    label: 'Depth Estimation',
    category: TaskCategory.ComputerVision,
  },
  {
    value: Models.Task.VideoClassification,
    label: 'Video Classification',
    category: TaskCategory.ComputerVision,
  },
  {
    value: Models.Task.AutomaticSpeechRecognition,
    label: 'Automatic Speech Recognition',
    category: TaskCategory.Audio,
  },
  {
    value: Models.Task.AudioClassification,
    label: 'Audio Classification',
    category: TaskCategory.Audio,
  },
  {
    value: Models.Task.TextToSpeech,
    label: 'Text-to-Speech',
    category: TaskCategory.Audio,
  },
  {
    value: Models.Task.AudioToAudio,
    label: 'Audio-to-Audio',
    category: TaskCategory.Audio,
  },
  {
    value: Models.Task.ReinforcementLearning,
    label: 'Reinforcement Learning',
    category: TaskCategory.Other,
  },
  {
    value: Models.Task.TabularClassification,
    label: 'Tabular Classification',
    category: TaskCategory.Tabular,
  },
  {
    value: Models.Task.TabularRegression,
    label: 'Tabular Regression',
    category: TaskCategory.Tabular,
  },
];

export const CATEGORY_ORDER: TaskCategory[] = [
  TaskCategory.NLP,
  TaskCategory.ComputerVision,
  TaskCategory.Audio,
  TaskCategory.Tabular,
  TaskCategory.Other,
];

/** Unique color for each task category */
export const CATEGORY_COLOR_MAP: Record<TaskCategory, string> = {
  [TaskCategory.NLP]: '#5B8DEF', // Blue
  [TaskCategory.ComputerVision]: '#9C27B0', // Purple
  [TaskCategory.Audio]: '#F57C00', // Orange
  [TaskCategory.Tabular]: '#00897B', // Teal
  [TaskCategory.Other]: '#757575', // Grey
};

/** Group TASK_TYPES by category for the filter UI */
export const TASKS_BY_CATEGORY = CATEGORY_ORDER.map((cat) => ({
  category: cat,
  tasks: TASK_TYPES.filter((t) => t.category === cat),
}));
