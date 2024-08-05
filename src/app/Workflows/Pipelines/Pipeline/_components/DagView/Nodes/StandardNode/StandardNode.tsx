import React from 'react';
import { Position, NodeProps } from '@xyflow/react';
import styles from "./StandardNode.module.scss"
import { StandardHandle } from "../../Handles"
import { Workflows } from '@tapis/tapis-typescript';
import { Edit, Delete } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';

type NodeType = { label: string, task: Workflows.Task, groupId: string, pipelineId: string }

const resolveImageBuildNodeImage = (builder: Workflows.EnumBuilder) => {
  switch (builder) {
    case Workflows.EnumBuilder.Kaniko:
      return "data:image/png;base64,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"
    case Workflows.EnumBuilder.Singularity:
      return "data:image/png;base64,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"
  }
}

const resolveFunctionTaskRuntimeImage = (runtime: Workflows.EnumRuntimeEnvironment) => {
  if (runtime.includes("pytorch")) {
    return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQAqQMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAABgcBBAUDAv/EAEUQAAEEAQIDBAUIBggHAQAAAAEAAgMEBQYREiExB0FRcRMyYYGRFBUiobGywdE2UnR14fAzN0JDU2NygiNUYpKTorMW/8QAGgEBAAMBAQEAAAAAAAAAAAAAAAMEBQYCAf/EACoRAQACAgAFAwIHAQAAAAAAAAABAgMEBRETIUESMTIiUSOBkaGxwfAU/9oADAMBAAIRAxEAPwC8UREBERAREQEREBecj2xxue9wa1o3JPcsySsjY58jg1rRuXOOwAVZav1O7KPdTpOLaTT9Jw/vv4faoc2auKvOVvT1L7WT019vMpPidS/O+o3VKhHyOKFxDiOcjtxz8lKFWfZxG85ySUMPA2Bwc7bkCSNhurL3Gy8697Xp6rPfEMNMObp09oiH0i+Q9rvVIPkvpWFEREQEREBERAREQEREBERAREQF8SvbGwveQ1rRuSTsAFlztgSTtsFWestTPyUrqNR+1Nh2c4f3pH4faoc2WMVecrWpqX2cnpr+b51dqh2VkdUouLaTfWPQyn8lycFhrOZuCCvyY3nJIejB+aYPDWc1bEFcFrG85JSOTR+atfE42tiqja1VnC0dT3uPiVRxY7bFvXf2bu1tY+H4+jh+X+7yYrGVsXTZWqs2a3q49XnxK5Wu7Fqtp976rizeRrZHN6taf5A96key+ZY2SsLJGhzXDYtI3BWjanOnpjs53Hl9OWMlu/fmqnRdqzHqCrHA95ZKSJWg7gt2PM+XJWu1alPGUaJc6nVihc7qWN2JXD1Lq2LEStr1mtsWAQZG77BjfPxKhxV6FPrlb2LzvZ46NO6UotPF5CHJUorVZ3FHIPeD3g+0LcViJiY5woTExPKRERfXwREQEREBERAREQERCgievss6jjW1YXFs1rcbg8wwdfy96r/FUJsneipwcnvPNxHJo7z7l1teWnWdRSs33bA1sbR4d/4ru9muPa2vavvb9N7hEw+AHM/WfqWXf8fY9PiHS4ZjS0OpHyt/aVYjGVsVSZWqMAaBzPe4+JW8myytOIiI5Q5u1ptPqt3kREX18fJB2VVaywj8VkDM3idWsOLmOJ3Id1IJ/nkrXXF1dQbfwNpnDu+NvpWHwLear7GKMlF7h+zODPE+J7ShegMs6nk/kMjj6G103PJr9uXx6fBWaFRcUz4JY5ozs+Nwe0+0HdXfWlE9eOVvNr2BwPmN1DpZOdZrPhd43gimWMkeXsiIrzEEREBERAREQEREBERBTep/0iyBP+MVYOgA3/8ANQ8P679/+4qFa4rGvqOwdthKGyD3jb8FIuzW8HUrNJx2fE/0jR4h38R9azMH07Fol0m9HU4fS1fHL+E22RY3WVpubEREBeVkNMEgd04TuvTdcrVN5tDBW5idnGMsZ/qdyC83nlWZe8dZteKx7qcZ6jfJXNpzf5gxvF1+Sx/dCpyON0r2xR78byGjzPRXfTgFapDA0fRjjawe4bLP0Y72lv8AHZiK46+e72CysLK0nOiIiAiIgIiICIiAiIgh3aJi3WaEd6FpMlb19upYevwPP4qD4XJS4nIxW4gTw8nt/Wb3hXLIxr2Oa5ocCNiD3hVZqvTcmIsGeu0upSElrv8ADP6p/ArP28UxbqVb/Ctql6Tq5fafZZmPvQZCrHZqvD4njcEfYttU1hc5dw83HVfux3rxO9V3t9h9qnuN1ti7TWizI6rIeok9X4hTYdql45TPKVPb4Xmw2maxzqlCLnszOMe3jbkKpb4+mb+a0LursPVB2uNmcP7MP0/rHJTzkpHvKjXBltPKtZ/R3HuDWkkgAc9yqw1rnxlbYrVnb1IHbhw/tu6b+S89Q6st5droIWfJqhOxaHfSf5n8PtXKxeNs5W22tUYXOPrO7mDxKz9jY6k9Ojf0OHxrfj5+3Lx9nY0Li3X8u2y8bwVfpE+L+4firTC5+FxkGJoMq1xuG83OPVx7yV0FcwYunTkx97a/6c038eBERTqYiIgIiICIiAiIgIiIMLznhZNG6OVjXscNi1w3BC9UQQPN6D4nmbDyNZ/kSdP9p/NRC9ir9BxbbpzRgf2iwlvxHJXWvjgCqZNOlp5x2a2vxjPiiK2+qFE8t9jsvavXmsO4K8MkrvCNhd9iu11eBx3MMZPtaF9tY1g2a0AeAChjQ+8rU8dnl2p+6tMRojIW3tde2qw9SDzefIdAp/isTUxVcQU4gwH1ndXPPiSt4DZZVvFgpi+MMrZ3s2z857fZgBZRFMqCIiAiIgIiICIiD4kkbExz5HNaxo3LnHYALU+d8YeQyNPc/wCe381q6w/RTMfscv3Sq37OuzTSeb0XjchkcYZbc8ZMkgsSt3O57g7ZBb0cjJG8Ub2vae9p3C+lTuosFP2XWaOc0xcs/ND7TIbuOmk42cDj1G/Tv9u+3tVptzGO+c24v5ZD8vdF6Vtfi2eWfrAeCDfWq/I0mPLH3K7XNOxBlaCD8Vsnoq/doPs91DmMnIKsdq+yw5130duXdkjiSdwHbA7g8kE2+c6H/PVf/M381lmQpSPDI7dd7nHYNbI0k/WqYh7P9MO7XJ8CcaTjGYoWBD6eT+k4mjfi4t+/pvsp/jOzDSGIyFfIUMW6K1XeJInmzK7hcO/Yu2QTEe1ZUey+ttNYSya2SzNWGw31ouPic3zA6Lfw2fxOdgdPiL8FuNp2cYn7lp9o6hB0kWhkMzjsbYqV71pkM1yQRV2O6yP3A2HxC5N3XulaOQdQtZupHZY7he3i3DT4EjkCgkqLUyWSo4qo+3krUVWuz1pJXBoC4NbtF0hanEEWep8ZOw4ncIJ8zyQb+e1JTwl/F0rTZXTZOf0MAY3cb8tyfDqu0q47THB2q9CFpBByLiCO/k1SbJa40vi7bql7N04rDDs6Myblp9u3RBIUXhSuVr9WK1Snjnryt4mSRu4muHsK90BERAREQcfWH6KZj9jl+6VBOzXXGmMRoTF1sjmqsNiGMiSJxJc3me4BTvWH6KZj9jl+6VFuy/T2EtaFwtmzhsdNYdBu6WSqxzydz1JG6Dh6lz47TrVLT+lIZpsYy0ybIZF8ZZGxjSDwt4huT/Du3I6fatG7BXMDrKpGd8ZYbBa4f8B/I+fPl/uVjRQxQxiOGNkbANg1jdgPcFpagxUObwt3GWAPR2oXRk+BI5H3Hmg8dQ5yth9N3cy97XQwVzKwg+uSPogeZIA81weyTEy47SMVq43a9k5HXrBI57v5jf3bKu8flLGp8Rp7QFlrhdgvOhybTz4Ya/Pn58h5t8le8bWsYGsGzWgAAdwQVvX/AK/LX7jH32rt9qWdt4LSFmbGnhvWHsrV3b82uedtx7QN9vbsuJX/AK/LX7jH32rpdsGOtX9GyzUIvS2KE0dtse25cGHd31c/cg29HaFw2BxMUUtKC1eewOtWp2B75ZDzcdz3bnl/JUS7RcTW0Pk8drTAQtqcFlsF+GIbMlif1PCO/l8dvBWHpXPUdSYWtksfM2RkrBxtBHFG7va4dxBUL7XZ2Z35t0ZQf6W/ftMkmbHzMELdyXO8Pf4INTtogs3MxoyvQnNexPfcyOYdYyeAcXu3U3xmj8Dj8bFRhxtZ8bNiXyxhz3u68RceZO/NRTtQHDqzQAHdlPxYrJ7kFV08ezX3aJlrGZHp8RgnivVqE/QfKernDv7/AKvBTy9pXAX6prW8PRfER6voGj6xzUE0tfh0n2k6gweUIrx5aYW6U0h2bITvu3c9++48xsrPsWIK0DprE0cUTRxOe9wa0Dx3KCs+1vHst5nRWPbLLXjkuvi44HcL2N2YPonuO3epnU0bpupj/kMOFpCuW8Ja6EOJHtJ5nz3UW7S3NfqvQbmEFpyLiCOh5NVjoKu7FSad/WGCiLjTxuUc2uHHfhBc9u3/AKD4lWiqt7If0x7Q/wB7H/6TK0kBERAREQa9+nFfpz07LS6GdhjeAdiWkbHmvHC4qrhMZXx2PY5lau3hja5xcQPMreRAJ2XyXADcnYDqT3LJUBzuldY5Sxerw6sjgxVuQkxCr/xImHqxrt/NBo9mNavmdV6m1fDC0Q2LJq1H7euxoHE8f6tm/X4KzVzsBh6mAxFXF49pbXrMDG8XV3iT7SeZXRQchunce3Ur9Qtjf84vr/Jy/jPDwbg7cPTuXWcOJpBG+6yiCFXOzDTs96a5VF3HTTneX5BadE158eEch7l1dNaPw2mjK/GVnfKJv6WzNIZJZPNx+wclIEQcjMadx2ZvY27fje6fGzemrFshaGv3B5gdegXWCyiDi6n0th9UVRWzVJlhjTux+5a9h/6XDmPsUbb2SaaeWi4/J3IWncQ2Lryz4DZT5EHGyWm8dk7OLsWonl+Lfx1eF5AYeXXx6DquyERBxcFpjGYLIZS/j4nssZSb01pzpC4Odu48genN7l2kRAREQEREBERAWNgiIMoiICIiAiIgIiICIiAiIgIiICIiD//Z"
  }

  if (runtime.includes("tensorflow")) {
    return "data:image/png;base64,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"
  }

  if (runtime.includes("python")) {
    return "data:image/png;base64,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"
  }

  if (runtime.includes("node")) {
    return "data:image/png;base64,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"
  }

  return "data:image/png;base64,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"
}

const resolveNodeImage = (task: Workflows.Task) => {
  switch (task.type) {
    case Workflows.EnumTaskType.Function:
      return resolveFunctionTaskRuntimeImage(task.runtime!)
    case Workflows.EnumTaskType.TapisJob:
      return "data:image/png;base64,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"
    case Workflows.EnumTaskType.Template:
      return "data:image/png;base64,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"
    case Workflows.EnumTaskType.ImageBuild:
      return resolveImageBuildNodeImage(task.builder!)
      default:
      return "https://t3.ftcdn.net/jpg/06/54/14/70/360_F_654147004_3mnMUDadkASxqC2xJyhkuFuG0QMPIqMR.jpg"
  }
}
 
const StandardNode: React.FC<NodeProps> = ({ data }) => {
  const history = useHistory();
  let { label, task, groupId, pipelineId } = (data as NodeType);
  
  return (
    <>
      <StandardHandle type="target" position={Position.Left}/>
      <div className={styles["node"]}>
        <div className={styles["header"]}>
          <img src={resolveNodeImage(task)} className={styles["header-img"]}/>
          <span className={styles["title"]}>{label}</span>
        </div>
        <div className={styles["body"]}>
          <i className={styles["description"]}>{task.description || "No description"}</i>
        </div>
        <div className={styles["footer"]}>
          <Edit className={styles["action"]} onClick={() => {history.push(`/workflows/pipelines/${groupId}/${pipelineId}/tasks/${task.id}`)}}/>
          <Delete className={styles["action-danger"]} color="error" onClick={() => {alert("Delete function unavailable")}}/>
        </div>
      </div>
      <StandardHandle type="source" position={Position.Right}/>
    </>
  );
}

export default StandardNode