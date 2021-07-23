import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Streams } from "@tapis/tapis-typescript";
import { useMeasurements } from 'tapis-redux';
import { MeasurementsListCallback } from 'tapis-redux/streams/measurements/types';
import { Config } from 'tapis-redux/types';
import { LoadingSpinner } from 'tapis-ui/_common';
import { v4 as uuidv4 } from "uuid";
import "./MeasurementList.scss";

export type OnSelectCallback = (measurement: Streams.Measurement) => any;

//typings are very wrong, do this later
// const measurements2vars = (measurements: Streams.Measurement[]) => {
//   let varMap = measurements.reduce((acc: {[variable: string]: {[datetime: string]: any}}, value: Streams.Measurement) => {
//     if(value.vars) {
//       let varTimeMap = value.vars.reduce((acc: []) => {

//       }, {});
//     }
    
//     return acc;
//   }, {});

// }

interface MeasurementItemProps {
  measurement: Streams.Measurement,
  onSelect?: OnSelectCallback
}

const MeasurementListItem: React.FC<MeasurementItemProps> = ({ measurement, onSelect }) => {
  let label = "";
  if(measurement.datetime) {
    label = `${measurement.datetime}: `;
  }
  let varIds = measurement.vars.map((measuredVar: Streams.MeasurementVars) => {
    return measuredVar.var_id;
  });
  label += `Measured Variables: ${varIds.join(", ")}`;
  
  return (
    <li onClick={() => onSelect ? onSelect(measurement) : null}>
        {`${label}`}
    </li>
  );
};



MeasurementListItem.defaultProps = {};

interface MeasurementListProps {
  projectId: string,
  siteId: string,
  instrumentId: string,
  config?: Config,
  onList?: MeasurementsListCallback,
  onSelect?: OnSelectCallback
}

const MeasurementList: React.FC<MeasurementListProps> = ({ projectId, siteId, instrumentId, config, onList, onSelect }) => {
  const dispatch = useDispatch();
  const { measurements, list } = useMeasurements(config);
  useEffect(() => {
    dispatch(list({ 
      onList, 
      request: {
        projectUuid: projectId,
        siteId,
        instId: instrumentId
      }
    }));
  }, [dispatch]);
  const definitions: Array<Streams.Measurement> = measurements.results;


  if (measurements.loading) {
    return <LoadingSpinner/>
  }

  return (
    <div className="measurement-list">
      {
        definitions.length
        ? definitions.map(
            (measurement) => <MeasurementListItem measurement={measurement} key={uuidv4()} onSelect={onSelect} />
          )
        : <i>No measurements found</i>
      }
    </div>
  );
};

MeasurementList.defaultProps = {
  config: null,
  onList: null,
  onSelect: null
}

export default MeasurementList;
