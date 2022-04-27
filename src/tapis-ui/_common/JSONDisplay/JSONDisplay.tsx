import { useMemo, useState, useCallback } from 'react';
import { Input, FormGroup, Label } from 'reactstrap';
import { CopyButton } from 'tapis-ui/_common';
import styles from './JSONDisplay.module.scss';

const simplifyObject = (obj: any) => {
  const result = JSON.parse(JSON.stringify(obj));
  Object.entries(result).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if ((value as Array<any>).length === 0) {
        delete result[key];
      }
      return;
    }
    if (typeof value === 'object') {
      const simplifiedValue = simplifyObject(value);
      if (Object.entries(simplifiedValue).length === 0) {
        delete result[key];
      } else {
        result[key] = simplifiedValue;
      }
      return;
    }
    if (value === undefined) {
      delete result[key];
    }
  });
  return result;
};

type JSONDisplayProps = {
  json: any;
  className?: string;
};

const JSONDisplay: React.FC<JSONDisplayProps> = ({ json, className }) => {
  const [simplified, setSimplified] = useState(false);
  const onChange = useCallback(() => {
    setSimplified(!simplified);
  }, [setSimplified, simplified]);
  const jsonString = useMemo(
    () => JSON.stringify(simplified ? simplifyObject(json) : json, null, 2),
    [json, simplified]
  );
  return (
    <div className={className}>
      <div className={styles.controls}>
        <FormGroup check>
          <Label check size="sm" className={`form-field__label`}>
            <Input type="checkbox" onChange={onChange} />
            Simplified
          </Label>
        </FormGroup>
        <CopyButton value={jsonString} />
      </div>
      <Input
        type="textarea"
        value={jsonString}
        className={styles.json}
        rows="20"
        disabled={true}
      />
    </div>
  );
};

export default JSONDisplay;
