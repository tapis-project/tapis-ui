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

interface MeasurementListItemProps {
  measurement: Streams.Measurement,
  select: Function
}

const MeasurementListItem: React.FC<MeasurementListItemProps> = ({ measurement, select }) => {
  let label = "";
  if(measurement.datetime) {
    label = `${measurement.datetime}: `;
  }
  let varIds = measurement.vars.map((measuredVar: Streams.MeasurementVars) => {
    return measuredVar.var_id;
  });
  label += `Measured Variables: ${varIds.join(", ")}`;
  
  return (
    <div onClick={() => select ? select(measurement) : null}>
      {`${label}`}
    </div>
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


  const select = useCallback((measurement: Streams.Measurement) => {
    if(onSelect) {
      onSelect(measurement);
    }
  }, [onSelect]);

  if (measurements.loading) {
    return <LoadingSpinner/>
  }

  return (
    <div className="measurement-list nav flex-column">
      {
        definitions.length
          ? definitions.map(
              (measurement) => <MeasurementListItem measurement={measurement} key={uuidv4()} select={select} />
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
