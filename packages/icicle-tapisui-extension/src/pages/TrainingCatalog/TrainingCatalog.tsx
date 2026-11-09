import * as React from 'react';
import { Component } from '@tapis/tapisui-extensions-core';

// The catalog is a public GitHub Pages site — no JWT involved, so it renders
// pre-login too (this page is in the extension's prelogin sidebar).
export const TrainingCatalog: Component = () => {
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
      <iframe
        style={{ flexGrow: 1, border: 'none' }}
        src={`https://icicle-ai.github.io/training-catalog/docs/intro`}
      />
    </div>
  );
};

export default TrainingCatalog;
