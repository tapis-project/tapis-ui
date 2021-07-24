import { OnSelectCallback } from 'tapis-ui/components/streams/sites/SiteList';
import { Config } from 'tapis-redux/types';
import { SitesListCallback } from 'tapis-redux/streams/sites/types';
import { Streams } from '@tapis/tapis-typescript';
import { SiteList } from "tapis-ui/components/streams";
import { ListSectionListFull, ListSection, ListSectionBody, ListSectionHeader } from 'tapis-app/Sections/ListSection';
import { Icon } from 'tapis-ui/_common';
import { useSites } from 'tapis-redux';
import { useDispatch } from 'react-redux';


interface SitesProps  {
  project: Streams.Project,
  config?: Config,
  onList?: SitesListCallback,
  onSelect?: OnSelectCallback,
  refresh?: () => void
}

const Sites: React.FC<SitesProps> = ({ project, config, onList, onSelect, refresh }) => {
  const { list } = useSites();
  const dispatch = useDispatch();
  if(!refresh) {
    refresh = () => {
      onSelect(null);
      dispatch(list({
        request: {
          projectUuid: project.project_name
        }
      }));
    }
  }

  return (
    <ListSection>
        <ListSectionHeader>
            <div>
                Site List
                &nbsp;
                <span className="btn-head" onClick={refresh}>
                    <Icon name="refresh" />
                </span>
            </div>
        </ListSectionHeader>
        <ListSectionBody>
          {
            project
            ? <ListSectionListFull>
              <SiteList projectId={project.project_name} config={config} onList={onList} onSelect={onSelect} />
            </ListSectionListFull> 
            : <div>Please select a Project to view its Sites</div>
          }
        </ListSectionBody>
    </ListSection>
  );
}

export default Sites;