import { OnSelectCallback } from 'tapis-ui/components/streams/instruments/InstrumentList';
import { Config } from 'tapis-redux/types';
import { Streams } from '@tapis/tapis-typescript';
import { InstrumentList } from "tapis-ui/components/streams";
import { InstrumentsListCallback } from 'tapis-redux/streams/instruments/types';
import { default as Measurements } from "../Measurements";
import { default as Variables } from "../Variables";
import { ListSectionList, ListSection, ListSectionBody, ListSectionHeader, ListSectionDetail, ListSectionDetailSection } from 'tapis-app/Sections/ListSection';
import { Icon } from 'tapis-ui/_common';

interface InstrumentsProps  {
  project: Streams.Project,
  site: Streams.Site,
  config?: Config,
  onList?: InstrumentsListCallback,
  onSelect?: OnSelectCallback,
  selected?: Streams.Instrument,
  refresh?: () => void
}

const Projects: React.FC<InstrumentsProps> = ({ project, site, config, onList, onSelect, selected, refresh }) => {

  return (
    <ListSection>
        <ListSectionHeader>
            <div>
                Instrument List
                &nbsp;
                <span className="btn-head" onClick={refresh}>
                    <Icon name="refresh" />
                </span>
            </div>
        </ListSectionHeader>
        <ListSectionBody>
        {
          site && project
          ?
          <>
            <ListSectionList>
              <InstrumentList projectId={project.project_name} siteId={site.site_id} config={config} onList={onList} onSelect={onSelect} selected={selected} />
            </ListSectionList>
            {/* <ListSectionDetailHalf>
              <ListSectionHeader type={"sub-header"}>Measurements</ListSectionHeader>
              <Measurements config={config} project={project} site={site} instrument={selected} />
            </ListSectionDetailHalf> */}
            <ListSectionDetail>
              {/* <ListSectionDetailSection> */}
              <ListSectionHeader type={"sub-header"}>Variables</ListSectionHeader>
              <Variables config={config} project={project} site={site} instrument={selected} />
              {/* </ListSectionDetailSection>
              <ListSectionDetailSection>
                <ListSectionHeader type={"sub-header"}>Measurements</ListSectionHeader>
                <Measurements config={config} project={project} site={site} instrument={selected} />
              </ListSectionDetailSection> */}
            </ListSectionDetail>
          </>
          : <div>Please select a Site to view its Instruments</div>
        }
        </ListSectionBody>
    </ListSection>

      

  );
}

export default Projects;