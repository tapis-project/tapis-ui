import * as React from 'react';
import { SectionHeader } from '@tapis/tapisui-common';
import { Component } from '@tapis/tapisui-extensions-core';

export const TrainingCatalog: Component = ({ accessToken }) => {
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
          src={`https://davidl0914.github.io/mkdocs-testing/`}
        />
      ) : (
        <>Invalid JWT. Log out of TapisUI then log back in</>
      )}
    </div>
  );
};

export default TrainingCatalog;
