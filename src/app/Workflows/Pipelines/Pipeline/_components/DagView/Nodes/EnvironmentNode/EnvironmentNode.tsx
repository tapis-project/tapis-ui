import React from 'react';
import { Position, NodeProps } from '@xyflow/react';
import styles from "./EnvironmentNode.module.scss"
import { StandardHandle } from "../../Handles"
import { Workflows } from '@tapis/tapis-typescript';
import { Edit, Delete } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';

type NodeType = { pipeline: Workflows.Pipeline }
 
const EnvironmentNode: React.FC<NodeProps> = ({ data }) => {
  const { pipeline } = (data as NodeType)
  return (
    <>
      <div className={styles["node"]}>
        <div className={styles["header"]}>
          <span className={styles["title"]}>Environment</span>
        </div>
        <div className={styles["body"]}>
          <i className={styles["description"]}>Pipeline envrionment variables</i>
        </div>
      </div>
      {
        pipeline.env && (
          Object.entries(pipeline.env).map(([varName, value]) => {
            return <StandardHandle id={varName} type="source" position={Position.Bottom}/>
          })
        )
      }
    </>
  );
}

export default EnvironmentNode