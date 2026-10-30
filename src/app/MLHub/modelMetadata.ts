import * as Models from '@mlhub/models-ts-sdk';

export type ModelResource = Models.Model | Models.ExternalModel;

export const externalModelFor = (model: ModelResource): Models.ExternalModel =>
  'external_model' in model ? model.external_model : model;

export const derivedMetadataFor = (model: ModelResource) =>
  externalModelFor(model).metadata.derived;

export const modelAuthorFor = (model: ModelResource) =>
  derivedMetadataFor(model).author ??
  ('owner' in model ? model.owner : undefined) ??
  'Unknown author';

export const modelNameFor = (model: ModelResource) =>
  ('name' in model ? model.name : undefined) ??
  derivedMetadataFor(model).name ??
  externalModelFor(model).huggingface_repo_locator?.id ??
  model.id;

export const modelDescriptionFor = (model: ModelResource) =>
  'description' in model ? model.description : undefined;
