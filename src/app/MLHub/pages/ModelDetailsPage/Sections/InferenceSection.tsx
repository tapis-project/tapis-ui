import Divider from '@mui/material/Divider';

import { ModelMetadata } from '@mlhub/models-ts-sdk';
import { InfoSection } from './InfoSection';
import { KeyValueGrid, TagCloud } from '../utils';

interface InferenceSectionProps {
  model: ModelMetadata;
}

export function InferenceSection({ model }: InferenceSectionProps) {
  const hardware = model.inference_hardware;

  const infoRows = [
    { label: 'Precision', value: model.inference_precision },
    {
      label: 'Max Latency',
      value: model.inference_max_latency_ms,
      formatValue: (v: unknown) => `${v} ms`,
    },
    {
      label: 'Min Throughput',
      value: model.inference_min_throughput,
      formatValue: (v: unknown) => `${v} req/s`,
    },
    {
      label: 'Max Memory',
      value: model.inference_max_memory_usage_mb,
      formatValue: (v: unknown) => `${v} MB`,
    },
    {
      label: 'Max Energy',
      value: model.inference_max_energy_consumption_watts,
      formatValue: (v: unknown) => `${v} W`,
    },
    {
      label: 'Compute Util',
      value: model.inference_max_compute_utilization_percentage,
      formatValue: (v: unknown) => `${v}%`,
    },
    { label: 'Distributed', value: model.inference_distributed },
    ...(hardware
      ? [
          // TODO
          // {
          //   label: 'GPU',
          //   value: `${hardware.accelerators}x ${hardware.gpu_type}`,
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

      {model.inference_software_dependencies &&
        model.inference_software_dependencies.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <KeyValueGrid rows={[{ label: 'Dependencies', value: '' }]} />
            <TagCloud tags={model.inference_software_dependencies} />
          </>
        )}
    </InfoSection>
  );
}
