import { Config } from 'tapis-redux/types';
import { Streams } from '@tapis/tapis-typescript';
import { SectionMessage } from 'tapis-ui/_common';
import { VariableList } from 'tapis-ui/components/streams';
import { VariablesListCallback } from 'tapis-redux/streams/variables/types';



interface VariablesProps  {
  project: Streams.Project,
  site: Streams.Site,
  instrument: Streams.Instrument,
  config?: Config,
  onList?: VariablesListCallback,
}

const Variables: React.FC<VariablesProps> = ({ project, site, instrument, config, onList }) => {

  return (
        project && site && instrument
        ? <VariableList projectId={project.project_name} siteId={site.site_id} instrumentId={instrument.inst_id} config={config} onList={onList} />
        : <SectionMessage type="info">
          Select an instrument from the list.
        </SectionMessage>
  );
}

export default Variables;