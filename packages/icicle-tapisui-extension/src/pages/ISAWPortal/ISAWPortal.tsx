import * as React from 'react';
import { Component } from '@tapis/tapisui-extensions-core';
import SignedInPortal from '../PortalShared/SignedInPortal';

export const ISAWPortal: Component = ({ accessToken }) => (
  <SignedInPortal
    accessToken={accessToken}
    src="https://isawfrontendprod.pods.icicleai.tapis.io/"
    title="I-SAW Portal"
    blurb="I-SAW field kits — camera-trap backpacks and drones — with live device monitoring. Sign in to open the control center."
  />
);

export default ISAWPortal;
