import { Config } from 'tapis-redux/types';
import { Streams } from '@tapis/tapis-typescript';
import { SectionMessage } from 'tapis-ui/_common';
import { VariableAndMeasurementList } from 'tapis-ui/components/streams';
import { VariablesListCallback } from 'tapis-redux/streams/variables/types';
import { MeasurementsListCallback } from 'tapis-redux/streams/measurements/types';



interface VariablesProps  {
  project: Streams.Project,
  site: Streams.Site,
  instrument: Streams.Instrument,
  config?: Config,
  onVariableList?: VariablesListCallback,
  onMeasurementList?: MeasurementsListCallback
  onVariableSelect?
}

const VariablesAndMeasurements: React.FC<VariablesProps> = ({ project, site, instrument, config, onVariableList, onMeasurementList }) => {

  return (
    <div id="variableAndMeasurementContainer">
      {
        project && site && instrument
        ? <VariableAndMeasurementList projectId={project.project_name} siteId={site.site_id} instrumentId={instrument.inst_id} config={config} onVariableList={onVariableList} onMeasurementList={onMeasurementList} />
        : <SectionMessage type="info">
          Select an Instrument from the list.
        </SectionMessage>
      }
    </div>
        
  );
}

export default VariablesAndMeasurements;