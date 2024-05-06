import { MutableRefObject, useRef } from 'react';
import styles from './Node.module.scss';

type NodeProps = {
    id: string
    description?: string
    onClickNode: () => void
    handleLeftAnchorClick: (anchor: MutableRefObject<HTMLDivElement | null>) => void
    handleRightAnchorClick: (anchor: MutableRefObject<HTMLDivElement | null>) => void
    hideAnchorType?: "left" | "right"
}

const Node: React.FC<NodeProps> = ({
    id,
    description = "No description",
    onClickNode,
    handleLeftAnchorClick,
    handleRightAnchorClick,
    hideAnchorType = null
}) => {
    const leftAnchorRef = useRef(null)
    const rightAnchorRef = useRef(null)

    return (
        <div
            id={id}
            className={styles["node"]}
            onClick={onClickNode}
        >
            <div className={styles["node-name"]}>{id}</div>
            <div
                id={`node-right-anchor-${id}`}
                ref={rightAnchorRef}
                onClick={(e) => {
                    handleRightAnchorClick(rightAnchorRef);
                    e.stopPropagation();
                }}
                className={`${styles["right-anchor"]} ${styles["node-anchor"]}`}
                style={hideAnchorType === "right" ? {display: "none"} : {}}
            />
            <div
                id={`node-left-anchor-${id}`}
                ref={leftAnchorRef}
                onClick={(e) => {
                    handleLeftAnchorClick(leftAnchorRef);
                    e.stopPropagation();
                }}
                className={`${styles["left-anchor"]} ${styles["node-anchor"]}`}
                style={hideAnchorType === "left" ? {display: "none"} : {}}
            />
        </div>
    );
};

export default Node