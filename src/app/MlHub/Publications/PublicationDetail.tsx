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

// MOCK DATA - Remove when server is ready
const MOCK_PUBLICATIONS: any = {
  'pub-001': {
    id: 'pub-001',
    artifact_id: 'artifact-abc123',
    target_platform: 'HuggingFace',
    status: 'Published',
    attempts: 1,
    created_at: '2024-11-01T10:30:00Z',
    last_modified: '2024-11-01T11:15:00Z',
    last_message: 'Successfully published model to HuggingFace Hub',
  },
  'pub-002': {
    id: 'pub-002',
    artifact_id: 'artifact-def456',
    target_platform: 'Github',
    status: 'Publishing',
    attempts: 2,
    created_at: '2024-11-03T14:20:00Z',
    last_modified: '2024-11-05T09:45:00Z',
    last_message: 'Upload in progress... 75% complete',
  },
  'pub-003': {
    id: 'pub-003',
    artifact_id: 'artifact-ghi789',
    target_platform: 'Patra',
    status: 'Failed',
    attempts: 3,
    created_at: '2024-10-28T08:00:00Z',
    last_modified: '2024-10-28T10:30:00Z',
    last_message: 'Error: Authentication failed. Please check credentials.',
  },
};

type Props = { publicationId: string };

const PublicationDetail: React.FC<Props> = ({ publicationId }) => {
  const history = useHistory();
  const { data, isLoading, error } =
    Hooks.Models.Publications.useGetModelPublication(publicationId);

  // MOCK DATA - Use mock data instead of API response
  const publication =
    MOCK_PUBLICATIONS[publicationId] || MOCK_PUBLICATIONS['pub-001']; // Replace with: data?.result;
  const status = publication?.status as string | undefined;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published':
      case 'Completed':
      case 'Success':
        return 'success';
      case 'Failed':
      case 'Error':
        return 'danger';
      case 'Publishing':
      case 'InProgress':
      case 'Pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Publication Details</h2>
      </div>

      <QueryWrapper isLoading={isLoading} error={error}>
        {/* Status Summary */}
        <Card style={{ marginBottom: '20px' }}>
          <CardHeader>
            <CardTitle>Publication Status</CardTitle>
          </CardHeader>
          <CardBody>
            <div style={{ marginBottom: '15px' }}>
              <Badge
                color={getStatusColor(status || '')}
                style={{ fontSize: '14px' }}
              >
                {status || 'Unknown'}
              </Badge>
              {(status === 'Publishing' || status === 'InProgress') && (
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
                <strong>Publication ID:</strong>
                <div style={{ fontFamily: 'monospace' }}>
                  {publication?.id || 'N/A'}
                </div>
              </div>
              <div>
                <strong>Artifact ID:</strong>
                <div style={{ fontFamily: 'monospace' }}>
                  {publication?.artifact_id || 'N/A'}
                </div>
              </div>
              <div>
                <strong>Target Platform:</strong>
                <div>{publication?.target_platform || 'N/A'}</div>
              </div>
              <div>
                <strong>Attempts:</strong>
                <div>{publication?.attempts ?? 'N/A'}</div>
              </div>
              <div>
                <strong>Created:</strong>
                <div>
                  {publication?.created_at
                    ? new Date(publication.created_at).toLocaleDateString()
                    : 'N/A'}
                </div>
              </div>
              <div>
                <strong>Last Modified:</strong>
                <div>
                  {publication?.last_modified
                    ? new Date(publication.last_modified).toLocaleDateString()
                    : 'N/A'}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Publication Information */}
        <Card style={{ marginBottom: '20px' }}>
          <CardHeader>
            <CardTitle>Publication Information</CardTitle>
          </CardHeader>
          <CardBody>
            <div style={{ marginBottom: '15px' }}>
              <strong>Publication ID:</strong>
              <div style={{ marginTop: '5px' }}>
                <TextCopyField
                  value={publicationId}
                  placeholder="Publication ID"
                />
              </div>
            </div>

            {publication?.artifact_id && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Artifact ID:</strong>
                <div style={{ marginTop: '5px' }}>
                  <TextCopyField
                    value={publication.artifact_id}
                    placeholder="Artifact ID"
                  />
                </div>
              </div>
            )}

            {publication?.target_platform && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Target Platform:</strong>
                <div>{publication.target_platform}</div>
              </div>
            )}

            {publication?.attempts !== undefined && (
              <div style={{ marginBottom: '15px' }}>
                <strong>Attempts:</strong>
                <div>{publication.attempts}</div>
              </div>
            )}

            {publication?.last_message && (
              <div>
                <strong>Last Message:</strong>
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
                  {publication.last_message}
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
            onClick={() => history.push('/ml-hub/publications')}
          >
            ← Back to Publications
          </Button>
          {publication?.artifact_id && (
            <Button
              color="primary"
              onClick={() => {
                history.push(`/ml-hub/artifacts/${publication.artifact_id}`);
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

export default PublicationDetail;
