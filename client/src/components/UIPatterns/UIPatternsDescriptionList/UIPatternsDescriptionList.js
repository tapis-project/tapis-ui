import React from 'react';
import { DescriptionList, Icon } from '_common';

import './UIPatternsDescriptionList.module.css';

const DATA = {
  Username: 'bobward500',
  Prefix: 'Mr.',
  Name: 'Bob Ward',
  Suffix: 'The 5th',
  'Favorite Numeric Value': 5,
  Icon: <Icon name="dashboard" />
};

function UIPatternsDropdownSelector() {
  return (
    <>
      <div styleName="list-cols">
        <dl>
          <dt>Vertical Layout & Default Density</dt>
          <dd>
            <DescriptionList data={DATA} />
          </dd>
        </dl>
        <dl>
          <dt>Vertical Layout & Compact Density</dt>
          <dd>
            <DescriptionList data={DATA} density="compact" />
          </dd>
        </dl>
        <dl>
          <dt>Vertical Layout & Compact Density - Narrow Container</dt>
          <dd>
            <DescriptionList
              data={DATA}
              density="compact"
              styleName="item-x-narrow"
            />
          </dd>
        </dl>
      </div>
      <div styleName="list-rows">
        <dl>
          <dt>Horizontal Layout & Default Density</dt>
          <dd>
            <DescriptionList data={DATA} direction="horizontal" />
          </dd>
          <dt>Horizontal Layout & Compact Density</dt>
          <dd>
            <DescriptionList
              data={DATA}
              density="compact"
              direction="horizontal"
            />
          </dd>
          <dt>Horizontal Layout & Compact Density - Narrow Container</dt>
          <dd>
            <DescriptionList
              data={DATA}
              density="compact"
              direction="horizontal"
              styleName="item-narrow"
            />
          </dd>
        </dl>
      </div>
      <div styleName="list-rows">
        <dl>
          <dt>Vertical Layout & Nested Data</dt>
          <dd>
            <DescriptionList
              data={{
                'Nested List One': (
                  <DescriptionList data={DATA} direction="vertical" />
                ),
                'Nested List Two': (
                  <DescriptionList data={DATA} direction="vertical" />
                )
              }}
            />
          </dd>
          <dt>Horizontal Layout & Nested Data</dt>
          <dd>
            <DescriptionList
              data={{
                'Nested List One': (
                  <DescriptionList data={DATA} direction="horizontal" />
                ),
                'Nested List Two': (
                  <DescriptionList data={DATA} direction="horizontal" />
                )
              }}
              direction="vertical"
            />
          </dd>
        </dl>
      </div>
    </>
  );
}

export default UIPatternsDropdownSelector;
