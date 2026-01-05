export { default as list } from './list';
export { default as listModelsByPlatform } from './listModelsByPlatform';
export { default as getModelByPlatform } from './getModelByPlatform';

// Map UI platform names to API enum values
export const PLATFORM_KEY_TO_ENUM: Record<string, string> = {
  HuggingFace: 'huggingface',
  Github: 'github',
  Git: 'git',
  Patra: 'patra',
  TaccTapis: 'tacc-tapis',
  s3: 's3',
};
