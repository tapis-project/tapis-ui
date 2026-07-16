import Divider from '@mui/material/Divider';
import { ModelMetadata } from '@mlhub/models-ts-sdk';
import { InfoSection } from './InfoSection';
import { KeyValueGrid, TagCloud, formatDuration } from '../utils';

interface TrainingSectionProps {
  model: ModelMetadata;
}

export function TrainingSection({ model }: TrainingSectionProps) {
  const hardware = model.training_hardware;

  const infoRows = [
    { label: 'Precision', value: model.training_precision },
    { label: 'Distributed', value: model.training_distributed },
    {
      label: 'Training Time',
      value: model.training_time,
      formatValue: (v: unknown) => formatDuration(v as number),
    },
    {
      label: 'Max Energy',
      value: model.training_max_energy_consumption_watts,
      formatValue: (v: unknown) => `${v} W`,
    },
    ...(hardware
      ? [
          // {
          //   label: 'GPU',
          //   value: `${hardware.gpu_count}x ${hardware.gpu_type}`,
          // },
          { label: 'CPU', value: `${hardware.cpus} cores` },
          { label: 'Memory', value: `${hardware.memory_gb} GB` },
          { label: 'Storage', value: `${hardware.disk_gb} GB` },
        ]
      : []),
  ].filter((row) => row.value !== null && row.value !== undefined);

  return (
    <InfoSection>
      <KeyValueGrid rows={infoRows} />

      {model.libraries && model.libraries.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <KeyValueGrid rows={[{ label: 'Libraries', value: '' }]} />
          <TagCloud tags={model.libraries} />
        </>
      )}

      {model.pretraining_datasets && model.pretraining_datasets.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <KeyValueGrid
            rows={[{ label: 'Pre-training Datasets', value: '' }]}
          />
          <TagCloud tags={model.pretraining_datasets} />
        </>
      )}

      {model.finetuning_datasets && model.finetuning_datasets.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <KeyValueGrid rows={[{ label: 'Fine-tuning Datasets', value: '' }]} />
          <TagCloud tags={model.finetuning_datasets} />
        </>
      )}
    </InfoSection>
  );
}
