import React, { useEffect } from 'react';
import { FieldDictionary, FieldDictionaryComponent } from './FieldDictionary';
import { InputSpec } from '@tapis/tapis-typescript-jobs';

export type TestJobSpec = {
  namedFileInputs: {
    [key: string]: InputSpec
  }
}

const NamedFileComponent: FieldDictionaryComponent<TestJobSpec, 'namedFileInputs'> = ({ key, value, remove }) => {
  return (
    <div>{key}: {JSON.stringify(value)}</div>
  )
}

const NamedFileInputs: React.FC = () => {
  return (
    <FieldDictionary<TestJobSpec, 'namedFileInputs'>
      name="namedFileInputs"
      render={NamedFileComponent}
      title="Test Dictionary"
      appendData={{sourceUrl: "newSource", targetPath: "newPath"}}
    />
  )
}

export default NamedFileInputs;
