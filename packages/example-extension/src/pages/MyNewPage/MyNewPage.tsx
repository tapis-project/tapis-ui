import { Component } from '@tapis/tapisui-extensions-core';

export const MyNewPage: Component = () => {
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
      <h1>My new page</h1>
      <p>Hello from my new page!</p>
    </div>
  );
};

export default MyNewPage;
