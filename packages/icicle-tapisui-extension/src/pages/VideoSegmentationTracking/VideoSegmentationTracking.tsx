import { Component } from '@tapis/tapisui-extensions-core';

export const VideoSegmentationTracking: Component = ({ accessToken }) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {accessToken ? (
        <iframe
          style={{ flexGrow: 1, border: 'none' }}
          title="Video Segmentation and Tracking"
          src={`https://videosegmentationtracking.pods.icicleai.tapis.io/`}
        />
      ) : (
        <>Invalid JWT. Log out of TapisUI then log back in</>
      )}
    </div>
  );
};
export default VideoSegmentationTracking;
