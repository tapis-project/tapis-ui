import React from 'react';
import { QueryWrapper, TextCopyField } from '@tapis/tapisui-common';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from 'reactstrap';
import { useHistory } from 'react-router-dom';

type Props = { ingestionId: string };

const IngestionDetail: React.FC<Props> = ({ ingestionId }) => {
  const history = useHistory();
  const { data, isLoading, error } = (
    Hooks as any
  ).Models.Ingestions.useGetModelIngestion(ingestionId);
  const ingestion = data?.result;
  const status = ingestion?.status as string | undefined;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Finished':
        return 'success';
      case 'Failed':
        return 'danger';
      case 'Running':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Ingestion Job Details</h2>
      </div>

      <QueryWrapper isLoading={isLoading} error={error}>
        {/* Status Summary */}
        <Card style={{ marginBottom: '20px' }}>
          <CardHeader>
            <CardTitle>Job Status</CardTitle>
          </CardHeader>
          <CardBody>
            <div style={{ marginBottom: '15px' }}>
              <Badge
                color={getStatusColor(status || '')}
                style={{ fontSize: '14px' }}
              >
                {status || 'Unknown'}
              </Badge>
              {status === 'Running' && (
                <span className="spinner-border spinner-border-sm ms-2" />
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px',
              }}
            >
              <div>
                <strong>Platform:</strong>
                <div>{ingestion?.platform || 'Unknown'}</div>
              </div>
              <div>
                <strong>Model ID:</strong>
                <div style={{ fontFamily: 'monospace' }}>
                  {ingestion?.model_id || 'N/A'}
                </div>
              </div>
              <div>
                <strong>Created:</strong>
                <div>
                  {ingestion?.created_at
                    ? new Date(ingestion.created_at).toLocaleDateString()
                    : 'N/A'}
                </div>
              </div>
              <div>
                <strong>Last Modified:</strong>
                <div>
                  {ingestion?.last_modified
                    ? new Date(ingestion.last_modified).toLocaleDateString()
                    : 'N/A'}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Combined Job Information and Message */}
        <Card style={{ marginBottom: '20px' }}>
          <CardHeader>
            <CardTitle>Job Information</CardTitle>
          </CardHeader>
          <CardBody>
            <div style={{ marginBottom: '15px' }}>
              <strong>Job ID:</strong>
              <div style={{ marginTop: '5px' }}>
                <TextCopyField value={ingestionId} placeholder="Job ID" />
              </div>
            </div>

            {ingestion?.artifact_id && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Artifact ID:</strong>
                <div style={{ marginTop: '5px' }}>
                  <TextCopyField
                    value={ingestion.artifact_id}
                    placeholder="Artifact ID"
                  />
                </div>
              </div>
            )}

            {ingestion?.last_message && (
              <div>
                <strong>Latest Message:</strong>
                <div
                  style={{
                    background: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    padding: '10px',
                    marginTop: '5px',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {ingestion.last_message}
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <div
          style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}
        >
          <Button
            color="secondary"
            onClick={() => history.push('/ml-hub/ingestions')}
          >
            ← Back to Ingestion
          </Button>
          {ingestion?.artifact_id && (
            <Button
              color="primary"
              onClick={() => {
                // Placeholder for artifact view functionality
                console.log('View artifact:', ingestion.artifact_id);
              }}
            >
              View Artifact
            </Button>
          )}
        </div>
      </QueryWrapper>
    </div>
  );
};

export default IngestionDetail;
