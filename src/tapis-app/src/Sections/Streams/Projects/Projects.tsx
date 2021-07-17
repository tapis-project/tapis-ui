import { OnSelectCallback } from 'tapis-ui/components/streams/projects/ProjectList';
import { Config } from 'tapis-redux/types';
import { ProjectsListCallback } from 'tapis-redux/streams/projects/types';
import { Streams } from '@tapis/tapis-typescript';
import { ListSectionList } from 'tapis-app/Sections/ListSection';
import { ProjectList } from "tapis-ui/components/streams";

interface ProjectsProps  {
  config?: Config,
  onList?: ProjectsListCallback,
  onSelect?: OnSelectCallback,
  selected?: Streams.Project
}

const Projects: React.FC<ProjectsProps> = ({ config, onList, onSelect, selected }) => {

  return (
    <ListSectionList>
        <ProjectList config={config} onList={onList} onSelect={onSelect} selected={selected} />
    </ListSectionList> 
  );
}


export default Projects;