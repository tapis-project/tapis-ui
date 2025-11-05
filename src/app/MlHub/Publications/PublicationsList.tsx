import React from 'react';
import { Card, CardBody, CardHeader, Table } from 'reactstrap';
import { useHistory } from 'react-router-dom';
import { MLHub as Hooks } from '@tapis/tapisui-hooks';
import { QueryWrapper } from '@tapis/tapisui-common';

const PublicationsList: React.FC = () => {
  const history = useHistory();
  const { data, isLoading, error } =
    Hooks.Models.Publications.useListModelPublications();

  const publications = data?.result || [];

  const handleClick = (publicationId: string) => {
    history.push(`/ml-hub/publications/${publicationId}`);
  };

  return (
    <div className="p-3 p-md-4">
      <h2 className="mb-3">Model Publications</h2>

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
