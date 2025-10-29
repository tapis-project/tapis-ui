import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Table, Alert, Button } from 'reactstrap';
import { LoadingButton } from '@mui/lab';
import { useHistory } from 'react-router-dom';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { QueryWrapper, JSONEditor } from '@tapis/tapisui-common';

type Props = { artifactId: string };

const ArtifactDetail: React.FC<Props> = ({ artifactId }) => {
  const history = useHistory();
  const { data, isLoading, error, refetch } =
    Hooks.Models.Artifacts.useGetModelArtifact(artifactId);

  const {
    create,
    isLoading: isSaving,
    error: saveError,
  } = (Hooks as any).Models.Artifacts.useCreateModelMetadata();

  const artifact = data?.result as any;

  const templateMetadata: any = {
    // General Info
    name: '',
    version: '',
    framework: '',
    model_type: '',
    keywords: [],
    license: '',
    // Datasets
    pretraining_datasets: [],
    finetuning_datasets: [],
    // Architecture Flags
    multi_modal: false,
    slimmed: false,
    pruned: false,
    // Quantization / Optimization
    quantization_aware: false,
    supports_quantization: false,
    edge_optimized: false,
    // Training
    training_distributed: false,
    training_hardware: {
      cpus: 0,
      memory_gb: 0,
      disk_gb: 0,
      accelerators: [],
      architectures: [],
    },
    training_time: 0,
    training_precision: '',
    training_max_energy_consumption_watts: 0,
    // Inference
    inference_distributed: false,
    inference_hardware: {
      cpus: 0,
      memory_gb: 0,
      disk_gb: 0,
      accelerators: [],
      architectures: [],
    },
    inference_precision: '',
    inference_max_latency_ms: 0,
    inference_min_throughput: 0,
    inference_max_memory_usage_mb: 0,
    inference_max_energy_consumption_watts: 0,
    inference_max_compute_utilization_percentage: 0,
    inference_software_dependencies: [],
    // I/O
    model_inputs: [],
    model_outputs: [],
    // Bias / Regulation
    bias_evaluation_score: 0,
    regulatory: [],
    // Misc
    annotation: '',
  };

  useEffect(() => {}, [artifact]);

  return (
    <div style={{ padding: '20px' }}>
      <Card style={{ marginBottom: '20px' }}>
        <CardHeader tag="h5">Artifact Details</CardHeader>
        <CardBody>
          <QueryWrapper isLoading={isLoading} error={error}>
            {!artifact ? (
              <p>Artifact not found.</p>
            ) : (
              <Table bordered responsive size="sm">
                <tbody>
                  <tr>
                    <th style={{ width: '240px' }}>Artifact ID</th>
                    <td>{artifact.id}</td>
                  </tr>
                  <tr>
                    <th>Artifact Type</th>
                    <td>{artifact.artifact_type || 'N/A'}</td>
                  </tr>
                  <tr>
                    <th>Created</th>
                    <td>{artifact.created_at}</td>
                  </tr>
                  <tr>
                    <th>Last Modified</th>
                    <td>{artifact.last_modified}</td>
                  </tr>
                  {artifact.path && (
                    <tr>
                      <th>Path</th>
                      <td>{artifact.path}</td>
                    </tr>
                  )}
                  {artifact.size && (
                    <tr>
                      <th>Size</th>
                      <td>{artifact.size}</td>
                    </tr>
                  )}
                  <tr>
                    <th>Metadata</th>
                    <td>
                      <pre className="mb-0">
                        {artifact.metadata
                          ? JSON.stringify(artifact.metadata, null, 2)
                          : 'N/A'}
                      </pre>
                    </td>
                  </tr>
                </tbody>
              </Table>
            )}
          </QueryWrapper>
        </CardBody>
      </Card>

      {/* Metadata Editor */}
      <Card style={{ marginBottom: '20px' }}>
        <CardHeader tag="h5">Edit Model Metadata</CardHeader>
        <CardBody>
          <JSONEditor
            obj={artifact?.metadata ?? templateMetadata}
            style={{
              width: '100%',
              height: '450px',
              backgroundColor: '#1E1E1E',
              color: 'white',
              fontSize: 12,
              fontFamily:
                'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
            }}
            actions={[
              {
                name: 'Save Metadata',
                actionFn: (obj: any | undefined) => {
                  create(
                    { artifactId, metadata: obj || {} },
                    {
                      onSuccess: () => {
                        refetch();
                      },
                    }
                  );
                },
                validator: (obj: any | undefined) => ({
                  success: typeof obj === 'object' && obj !== null,
                  message:
                    typeof obj === 'object' && obj !== null
                      ? undefined
                      : 'Metadata must be a JSON object',
                }),
                isLoading: isSaving,
              },
            ]}
          />
          {saveError && (
            <Alert color="danger" className="mt-2 mb-0">
              {(saveError as any).message}
            </Alert>
          )}
        </CardBody>
      </Card>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <Button
          color="secondary"
          onClick={() => history.push('/ml-hub/artifacts')}
        >
          ← Back to Artifacts
        </Button>
      </div>
    </div>
  );
};

export default ArtifactDetail;
