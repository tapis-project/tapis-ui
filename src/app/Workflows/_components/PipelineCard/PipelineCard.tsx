import React from "react"
import { Workflows } from "@tapis/tapis-typescript"
import styles from "./PipelineCard.module.scss"
import { UnfoldMore, MoreVert } from "@mui/icons-material"
import { Link } from "react-router-dom"

type PipelineCardProps = {
  pipeline: Workflows.Pipeline,
  groupId: string
}

const PipelineCard: React.FC<PipelineCardProps> = ({groupId, pipeline}) => {
  return (
    <div className={styles["card"]}>
      <Link className={styles["card-title"]} to={`/workflows/pipelines/${pipeline.id}`}>
        <b>{pipeline.id}</b>
      </Link>
      &nbsp;<div className={styles["card-status"]}></div>
      <Link to={`/workflows/pipelines/${groupId}`} className={`${styles["group"]} ${styles["link"]}`}>{groupId}</Link>
      <Link to={`/workflows/pipelines/${pipeline.group}`} className={`${styles["run"]} ${styles["link"]}`}>{pipeline.group}</Link>
      <UnfoldMore className={styles["expand"]} />
      <MoreVert className={styles["more"]} />
    </div>
  )
}

export default PipelineCard