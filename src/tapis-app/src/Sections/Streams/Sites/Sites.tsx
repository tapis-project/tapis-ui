import { OnSelectCallback } from 'tapis-ui/components/streams/sites/SiteList';
import { Config } from 'tapis-redux/types';
import { SitesListCallback } from 'tapis-redux/streams/sites/types';
import { Streams } from '@tapis/tapis-typescript';
import { ListSectionList } from 'tapis-app/Sections/ListSection';
import { SiteList } from "tapis-ui/components/streams";


interface SitesProps  {
  project: Streams.Project,
  config?: Config,
  onList?: SitesListCallback,
  onSelect?: OnSelectCallback,
  selected?: Streams.Site
}

const Projects: React.FC<SitesProps> = ({ project, config, onList, onSelect, selected }) => {

  return (
    <div className="container">
      {
        project
        ? <ListSectionList><SiteList projectId={project.project_name} config={config} onList={onList} onSelect={onSelect} selected={selected} /></ListSectionList> 
        : <div>No selected project</div>
      }
    </div>
  );
}

export default Projects;