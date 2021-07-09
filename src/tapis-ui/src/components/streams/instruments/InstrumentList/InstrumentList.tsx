import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Instrument } from "@tapis/tapis-typescript-streams";
import { useInstruments } from 'tapis-redux';
import { InstrumentsListCallback } from 'tapis-redux/streams/instruments/types';
import { Config } from 'tapis-redux/types';
import { LoadingSpinner } from 'tapis-ui/_common';
import { Icon } from 'tapis-ui/_common';
import "./InstrumentList.scss";

export type OnSelectCallback = (instrument: Instrument) => any;

interface InstrumentItemProps {
  instrument: Instrument,
  select: Function,
  selected: boolean
}

const InstrumentItem: React.FC<InstrumentItemProps> = ({ instrument, select, selected }) => {
  return (
    <li className="nav-item">
      <div className={"nav-link" + (selected ? ' active' : '')}>
        <div className="nav-content" onClick={() => select(instrument) }>
          <Icon name="data-files" />
          <span className="nav-text">{`${instrument.inst_name}`}</span>
        </div>
      </div>
    </li>
  );
};

InstrumentItem.defaultProps = {
  selected: false
}

interface InstrumentListProps {
  projectId: string,
  siteId: string,
  config?: Config,
  onList?: InstrumentsListCallback,
  onSelect?: OnSelectCallback,
  selected?: Instrument
}

const InstrumentList: React.FC<InstrumentListProps> = ({ projectId, siteId, config, onList, onSelect, selected }) => {
  const dispatch = useDispatch();
  const { instruments, list } = useInstruments(config);
  useEffect(() => {
    dispatch(list({ 
      onList, 
      request: {
        projectUuid: projectId,
        siteId
      }
    }));
  }, [dispatch]);
  const definitions: Array<Instrument> = instruments.results;
  const select = useCallback((instrument: Instrument) => {
    if(onSelect) {
      onSelect(instrument);
    }
  },[onSelect]);

  if (instruments.loading) {
    return <LoadingSpinner/>
  }

  return (
    <div className="instrument-list nav flex-column">
      {
        definitions.length
          ? definitions.map(
              (instrument) => <InstrumentItem instrument={instrument} key={instrument.inst_id} selected={selected ? selected.inst_id === instrument.inst_id : false} select={select} />
            )
          : <i>No instruments found</i>
      }
    </div>
  );
};

InstrumentList.defaultProps = {
  config: null,
  onList: null,
  onSelect: null
}

export default InstrumentList;
