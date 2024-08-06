import styles from './Progress.module.scss';

type ProgressProps = {
  value: number;
  color?: string;
  styles?: { [name: string]: string };
  showProgress?: boolean;
};

const Progress: React.FC<ProgressProps> = ({
  value,
  color,
  showProgress = true,
}) => {
  const style = {
    '--width': `${value}%`,
  } as React.CSSProperties;

  return (
    <div className={styles['progress-bar']}>
      <div className={styles['inner-bar']} style={style} />
      {showProgress && (
        <div className={styles['overlay']}>
          <p>{value}%</p>
        </div>
      )}
    </div>
  );
};

export default Progress;
