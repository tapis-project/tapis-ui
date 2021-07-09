import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Variable } from "@tapis/tapis-typescript-streams";
import { useVariables } from 'tapis-redux';
import { VariablesListCallback } from 'tapis-redux/streams/variables/types';
import { Config } from 'tapis-redux/types';
import { LoadingSpinner } from 'tapis-ui/_common';
import { Icon } from 'tapis-ui/_common';
import "./VariableList.scss";

export type OnSelectCallback = (variable: Variable) => any;

interface VariableItemProps {
  variable: Variable,
  select: Function,
  selected: boolean
}

const VariableItem: React.FC<VariableItemProps> = ({ variable, select, selected }) => {
  return (
    <li className="nav-item">
      <div className={"nav-link" + (selected ? ' active' : '')}>
        <div className="nav-content" onClick={() => select(variable) }>
          <Icon name="data-files" />
          <span className="nav-text">{`${variable.var_name}`}</span>
        </div>
      </div>
    </li>
  );
};

VariableItem.defaultProps = {
  selected: false
}

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
  const definitions: Array<Variable> = variables.results;
  const [currentVariable, setCurrentVariable] = useState(String);
  const select = useCallback((variable: Variable) => {
    if(onSelect) {
      onSelect(variable);
    }
    setCurrentVariable(variable.inst_id);
  },[onSelect, setCurrentVariable]);

  if (variables.loading) {
    return <LoadingSpinner/>
  }

  return (
    <div className="variable-list nav flex-column">
      {
        definitions.length
          ? definitions.map(
              (variable) => <VariableItem variable={variable} key={variable.inst_id} selected={currentVariable === variable.inst_id} select={select} />
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
