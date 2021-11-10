type ProgressProps = {
  value: number
  color?: string
  height?: number
  styles?: {[name: string]: string}
  showProgress?: boolean
}

const Progress: React.FC<ProgressProps> = ({
  value,
  color,
  height = 20,
  styles,
  showProgress = true
}) => {
  return(
    <div style={{
        position: "relative",
        border: "1px solid #DDDDDD",
        width: "100%",
        height: `${height}px`,
        lineHeight: `${height - 3}px`,
        ...styles
      }}
    >
      <div
        style={{
          width: `${value}%`,
          height: "100%",
          backgroundColor: `${color ? color : "#44D130"}`,
          position: "relative"
        }}
      />
      {showProgress &&
        <div style={{position: "absolute", width: "100%", height: "100%", top: 0, left: 0, backgroundColor: "transparent"}}>
          <p style={{textAlign: "center"}}>{value}%</p>
        </div>
      }
    </div>
  )
};

export default Progress;
