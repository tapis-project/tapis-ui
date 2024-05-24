import React from 'react';
import { Pill } from '@tapis/tapisui-common';

function UIPatternsPill() {
  return (
    <dl>
      <dt>Default Pill (normal)</dt>
      <dd>
        <Pill>Example Pill</Pill>
      </dd>
      <dt>Normal Pill</dt>
      <dd>
        <Pill type="normal">Normal Pill</Pill>
      </dd>
      <dt>Success Pill</dt>
      <dd>
        <Pill type="success">Success Pill</Pill>
      </dd>
      <dt>Warning Pill</dt>
      <dd>
        <Pill type="warning">Warning Pill</Pill>
      </dd>
      <dt>Danger Pill</dt>
      <dd>
        <Pill type="danger">Danger Pill</Pill>
      </dd>
    </dl>
  );
}

export default UIPatternsPill;
