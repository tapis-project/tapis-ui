import React from 'react';
import { Card, CardBody, CardHeader, Table, Button } from 'reactstrap';
import { useHistory } from 'react-router-dom';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { QueryWrapper } from '@tapis/tapisui-common';

// MOCK DATA - Remove when server is ready
const MOCK_PUBLICATIONS = [
  {
    id: 'pub-001',
    artifact_id: 'artifact-abc123',
    target_platform: 'HuggingFace',
    status: 'Published',
    attempts: 1,
    created_at: '2024-11-01T10:30:00Z',
    last_modified: '2024-11-01T11:15:00Z',
    last_message: 'Successfully published model to HuggingFace Hub',
  },
  {
    id: 'pub-002',
    artifact_id: 'artifact-def456',
    target_platform: 'Github',
    status: 'Publishing',
    attempts: 2,
    created_at: '2024-11-03T14:20:00Z',
    last_modified: '2024-11-05T09:45:00Z',
    last_message: 'Upload in progress... 75% complete',
  },
  {
    id: 'pub-003',
    artifact_id: 'artifact-ghi789',
    target_platform: 'Patra',
    status: 'Failed',
    attempts: 3,
    created_at: '2024-10-28T08:00:00Z',
    last_modified: '2024-10-28T10:30:00Z',
    last_message: 'Error: Authentication failed. Please check credentials.',
  },
  {
    id: 'pub-004',
    artifact_id: 'artifact-abc123',
    target_platform: 'Github',
    status: 'Published',
    attempts: 1,
    created_at: '2024-11-02T16:45:00Z',
    last_modified: '2024-11-02T17:20:00Z',
    last_message: 'Model successfully published to GitHub repository',
  },
  {
    id: 'pub-005',
    artifact_id: 'artifact-jkl012',
    target_platform: 's3',
    status: 'Pending',
    attempts: 0,
    created_at: '2024-11-05T12:00:00Z',
    last_modified: '2024-11-05T12:00:00Z',
    last_message: null,
  },
];

const PublicationsList: React.FC = () => {
  const history = useHistory();
  const { data, isLoading, error } =
    Hooks.Models.Publications.useListModelPublications();

  // MOCK DATA - Use mock data instead of API response
  const publications = MOCK_PUBLICATIONS; // Replace with: data?.result || [];

  const handleClick = (publicationId: string) => {
    history.push(`/ml-hub/publications/${publicationId}`);
  };

  return (
    <div className="p-3 p-md-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Model Publications</h2>
        <Button
          color="primary"
          onClick={() => history.push('/ml-hub/publications/publish')}
        >
          + Publish Model
        </Button>
      </div>

      <Card>
        <CardHeader tag="h5">All Publications</CardHeader>
        <CardBody>
          <p className="text-muted mb-3">
            Click a row to view publication details.
          </p>
          <QueryWrapper isLoading={isLoading} error={error}>
            {publications.length === 0 ? (
              <p>No publications found.</p>
            ) : (
              <Table striped responsive hover bordered size="sm">
                <thead>
                  <tr>
                    <th>Publication ID</th>
                    <th>Artifact ID</th>
                    <th>Target Platform</th>
                    <th>Status</th>
                    <th>Attempts</th>
                    <th>Created</th>
                    <th>Last Modified</th>
                  </tr>
                </thead>
                <tbody>
                  {publications.map((publication: any) => (
                    <tr
                      key={publication.id}
                      className="cursor-pointer"
                      onClick={() => handleClick(publication.id)}
                    >
                      <td>{publication.id}</td>
                      <td>{publication.artifact_id || 'N/A'}</td>
                      <td>{publication.target_platform || 'N/A'}</td>
                      <td>{publication.status || 'N/A'}</td>
                      <td>{publication.attempts ?? 'N/A'}</td>
                      <td>{publication.created_at}</td>
                      <td>{publication.last_modified}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </QueryWrapper>
        </CardBody>
      </Card>
    </div>
  );
};

export default PublicationsList;
