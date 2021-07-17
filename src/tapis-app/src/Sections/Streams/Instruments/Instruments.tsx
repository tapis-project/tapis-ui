import { OnSelectCallback } from 'tapis-ui/components/streams/instruments/InstrumentList';
import { Config } from 'tapis-redux/types';
import { Streams } from '@tapis/tapis-typescript';
import { ListSectionList, ListSectionDetail, ListSectionHeader } from 'tapis-app/Sections/ListSection';
import { InstrumentList } from "tapis-ui/components/streams";
import { InstrumentsListCallback } from 'tapis-redux/streams/instruments/types';
import { default as Measurements } from "../Measurements";
import { default as Variables } from "../Variables";

interface InstrumentsProps  {
  project: Streams.Project,
  site: Streams.Site,
  config?: Config,
  onList?: InstrumentsListCallback,
  onSelect?: OnSelectCallback,
  selected?: Streams.Instrument
}

const Projects: React.FC<InstrumentsProps> = ({ project, site, config, onList, onSelect, selected }) => {

  return (
    <div className="container">
      {
        site && project
        ?
        <>
          <ListSectionList>
            <InstrumentList projectId={project.project_name} siteId={site.site_id} config={config} onList={onList} onSelect={onSelect} selected={selected} />
          </ListSectionList>
          <ListSectionDetail>
            <ListSectionHeader type={"sub-header"}>Measurements</ListSectionHeader>
            <Measurements config={config} project={project} site={site} instrument={selected} />
          </ListSectionDetail>
          <ListSectionDetail>
            <ListSectionHeader type={"sub-header"}>Variables</ListSectionHeader>
            <Variables config={config} project={project} site={site} instrument={selected} />
          </ListSectionDetail>
        </>
        : <div>No selected site</div>
      }
    </div>
  );
}

export default Projects;