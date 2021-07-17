import { OnSelectCallback } from 'tapis-ui/components/streams/sites/SiteList';
import { Config } from 'tapis-redux/types';
import { SitesListCallback } from 'tapis-redux/streams/sites/types';
import { Streams } from '@tapis/tapis-typescript';
import { SiteList } from "tapis-ui/components/streams";
import { ListSectionListFull, ListSection, ListSectionBody, ListSectionHeader } from 'tapis-app/Sections/ListSection';
import { Icon } from 'tapis-ui/_common';


interface SitesProps  {
  project: Streams.Project,
  config?: Config,
  onList?: SitesListCallback,
  onSelect?: OnSelectCallback,
  selected?: Streams.Site,
  refresh?: () => void
}

const Projects: React.FC<SitesProps> = ({ project, config, onList, onSelect, selected, refresh }) => {
  if(!refresh) {
    refresh = () => {
      onSelect(null);
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
              <SiteList projectId={project.project_name} config={config} onList={onList} onSelect={onSelect} selected={selected} />
            </ListSectionListFull> 
            : <div>No selected project</div>
          }
        </ListSectionBody>
    </ListSection>
  );
}

export default Projects;