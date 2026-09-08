import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { FolderOutlined } from '@mui/icons-material';
import { QueryWrapper } from '@tapis/tapisui-common';
import { Systems as SystemsHooks } from '@tapis/tapisui-hooks';
import {
  Route,
  RouteComponentProps,
  Switch,
  useHistory,
} from 'react-router-dom';
import Explorer from './Explorer';
import { pathFromRouteParam, toFilesV2Route } from './utils';

function SystemPicker() {
  const history = useHistory();
  const { data, isLoading, error } = SystemsHooks.useList();
  const systems = data?.result || [];
  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <div style={{ padding: 24, overflow: 'auto', height: '100%' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          File Explorer V2
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Select a system to browse its files and directories.
        </Typography>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {systems.map((system) => (
            <Card key={system.id} variant="outlined">
              <CardActionArea
                onClick={() =>
                  history.push(toFilesV2Route(system.id || '', '/'))
                }
              >
                <CardContent>
                  <FolderOutlined color="primary" sx={{ mb: 1 }} />
                  <Typography fontWeight={700}>{system.id}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {system.description || system.systemType || 'Tapis system'}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </div>
        {!systems.length && !isLoading && (
          <Typography color="text.secondary">No systems found.</Typography>
        )}
      </div>
    </QueryWrapper>
  );
}

export default function FilesV2Router() {
  return (
    <Switch>
      <Route path="/files/v2" exact component={SystemPicker} />
      <Route
        path="/files/v2/:systemId/:systemPath*"
        render={({
          match,
        }: RouteComponentProps<{
          systemId: string;
          systemPath?: string;
        }>) => (
          <Explorer
            systemId={decodeURIComponent(match.params.systemId)}
            path={pathFromRouteParam(match.params.systemPath)}
          />
        )}
      />
    </Switch>
  );
}
