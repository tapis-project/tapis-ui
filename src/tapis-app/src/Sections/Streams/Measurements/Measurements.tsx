import { Config } from 'tapis-redux/types';
import { Streams } from '@tapis/tapis-typescript';
import { SectionMessage } from 'tapis-ui/_common';
import { MeasurementList } from 'tapis-ui/components/streams';
import { MeasurementsListCallback } from 'tapis-redux/streams/measurements/types';



interface MeasurementsProps  {
  project: Streams.Project,
  site: Streams.Site,
  instrument: Streams.Instrument,
  config?: Config,
  onList?: MeasurementsListCallback,
}

const Measurements: React.FC<MeasurementsProps> = ({ project, site, instrument, config, onList }) => {

  return (
    <div className="container">
      {
        project && site && instrument
        ? <MeasurementList projectId={project.project_name} siteId={site.site_id} instrumentId={instrument.inst_id} config={config} onList={onList} />
        : <SectionMessage type="info">
          Select an instrument from the list.
        </SectionMessage>
      }
    </div>
  );
}

export default Measurements;