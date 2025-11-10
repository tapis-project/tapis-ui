import React from 'react';

interface RouteLoaderProps {
  message?: string;
}

const RouteLoader: React.FC<RouteLoaderProps> = ({
  message = 'Loading...',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        fontSize: '16px',
        color: '#666',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div>{message}</div>
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RouteLoader;
