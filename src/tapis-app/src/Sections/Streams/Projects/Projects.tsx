import { OnSelectCallback } from 'tapis-ui/components/streams/projects/ProjectList';
import { Config } from 'tapis-redux/types';
import { ProjectsListCallback } from 'tapis-redux/streams/projects/types';
import { Streams } from '@tapis/tapis-typescript';
import { ListSectionListFull, ListSection, ListSectionBody, ListSectionHeader } from 'tapis-app/Sections/ListSection';
import { ProjectList } from "tapis-ui/components/streams";
import { Icon } from 'tapis-ui/_common';

interface ProjectsProps  {
  config?: Config,
  onList?: ProjectsListCallback,
  onSelect?: OnSelectCallback,
  selected?: Streams.Project,
  refresh?: () => void
}

const Projects: React.FC<ProjectsProps> = ({ config, onList, onSelect, selected, refresh }) => {
  if(!refresh) {
    refresh = () => {
      onSelect(null);
    }
  }

  return (
    <ListSection>
        <ListSectionHeader>
            <div>
                Project List
                &nbsp;
                <span className="btn-head" onClick={refresh}>
                    <Icon name="refresh" />
                </span>
            </div>
        </ListSectionHeader>
        <ListSectionBody>
          <ListSectionListFull>
            <ProjectList config={config} onList={onList} onSelect={onSelect} selected={selected} />
          </ListSectionListFull> 
        </ListSectionBody>
    </ListSection>
    
  );
}


export default Projects;