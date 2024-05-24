import React from 'react';
import { DropdownSelector } from '@tapis/tapisui-common';

function UIPatternsDropdownSelector() {
  return (
    <dl>
      <dt>
        Default (<code>single</code>)
      </dt>
      <dd>
        <small>Only field (not dropdown) can be styled cross-browser.</small>
        <DropdownSelector>
          <optgroup label="Cryptographic People">
            <option value="alice">Alice</option>
            <option value="bob">Bob</option>
            <option value="charlie">Charlie</option>
          </optgroup>
          <optgroup label="Common American Fruit">
            <option value="apple">Apple</option>
            <option value="banana">Banana</option>
            <option value="grapes">Grapes</option>
          </optgroup>
        </DropdownSelector>
      </dd>
      <dt>
        Multiple (<code>multiple</code>)
      </dt>
      <dd>
        <small>Styling options are limited and browser-dependent.</small>
        <DropdownSelector type="multiple">
          <optgroup label="Cryptographic People">
            <option value="alice">Alice</option>
            <option value="bob">Bob</option>
            <option value="charlie">Charlie</option>
          </optgroup>
          <optgroup label="Common American Fruit">
            <option value="apple">Apple</option>
            <option value="banana">Banana</option>
            <option value="grapes">Grapes</option>
          </optgroup>
        </DropdownSelector>
      </dd>
    </dl>
  );
}

export default UIPatternsDropdownSelector;
