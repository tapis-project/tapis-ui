import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Streams } from "@tapis/tapis-typescript";
import { useVariables } from 'tapis-redux';
import { VariablesListCallback, VariablesListingAction } from 'tapis-redux/streams/variables/types';
import { Config } from 'tapis-redux/types';
import { LoadingSpinner } from 'tapis-ui/_common';
import { v4 as uuidv4 } from "uuid";
import "./VariableList.scss";

export type OnSelectCallback = (variable: Streams.Variable) => any;

interface VariableItemProps {
  variable: Streams.Variable,
  onSelect?: OnSelectCallback
}

const VariableItem: React.FC<VariableItemProps> = ({ variable, onSelect }) => {
  return (
    <li onClick={() => onSelect ? onSelect(variable) : null}>
        {`${variable.var_name}`}
    </li>
  );
};

interface VariableListProps {
  projectId: string,
  siteId: string,
  instrumentId: string,
  config?: Config,
  onList?: VariablesListCallback,
  onSelect?: OnSelectCallback
}



const VariableList: React.FC<VariableListProps> = ({ projectId, siteId, instrumentId, config, onList, onSelect }) => {
  const dispatch = useDispatch();
  const { variables, list } = useVariables(config);
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
  const definitions: Array<Streams.Variable> = variables.results;


  if (variables.loading) {
    return <LoadingSpinner/>
  }

  return (
    <div className="variable-list">
      {
        definitions.length
        ? definitions.map(
            (variable: Streams.Variable) => <VariableItem variable={variable} key={uuidv4()} onSelect={onSelect} />
          )
        : <i>No variables found</i>
      }
    </div>
  );
};

VariableList.defaultProps = {
  config: null,
  onList: null,
  onSelect: null
}

export default VariableList;
