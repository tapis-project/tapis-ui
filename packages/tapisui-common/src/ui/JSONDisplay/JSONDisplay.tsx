import { useMemo, useState, useCallback } from 'react';
import { Input, FormGroup, Label, Button } from 'reactstrap';
import { CopyButton, TooltipModal } from '../../ui';
import styles from './JSONDisplay.module.scss';
import { Icon } from '../../ui';
import PodsCodeMirror from '../PodsCodeMirror';

const simplifyObject = (obj: any) => {
  const result = JSON.parse(JSON.stringify(obj));
  Object.entries(result).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if ((value as Array<any>).length === 0) {
        delete result[key];
      }
      return;
    }
    if (typeof value === 'object' && value !== null) {
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

const convertSets = (obj: any): any => {
  if (obj === undefined) {
    return undefined;
  }
  if (obj === null) {
    return null;
  }
  if (Array.isArray(obj)) {
    return (obj as Array<any>).map((value) => convertSets(value));
  }
  if (obj instanceof Set) {
    return Array.from(obj).map((value) => convertSets(value));
  }
  if (typeof obj === 'object' && obj !== null) {
    const result: any = {};
    Object.entries(obj).forEach(([key, value]) => {
      result[key] = convertSets(value);
    });
    return result;
  }
  return JSON.parse(JSON.stringify(obj));
};

type JSONDisplayProps = {
  json: any;
  className?: string;
  checkbox?: boolean;
  jsonstringify?: boolean;
  tooltipText?: string;
  tooltipTitle?: string;
};

type ToolbarButtonProps = {
  text: string;
  icon: string;
  onClick: () => void;
  disabled: boolean;
};

export type ToolbarModalProps = {
  toggle: () => void;
};

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  text,
  icon,
  onClick,
  disabled = true,
  ...rest
}) => {
  return (
    <div>
      <Button
        disabled={disabled}
        onClick={onClick}
        className={`${styles['toolbar-btn']} ${styles['nav-background']}`}
        {...rest}
      >
        {icon && <Icon name={icon}></Icon>}
        <span> {text}</span>
      </Button>
    </div>
  );
};

const JSONDisplay: React.FC<JSONDisplayProps> = ({
  json,
  className,
  tooltipText,
  tooltipTitle,
  checkbox = true,
  jsonstringify = true,
}) => {
  const [simplified, setSimplified] = useState(true);
  const onChange = useCallback(() => {
    setSimplified(!simplified);
  }, [setSimplified, simplified]);
  const jsonString = useMemo(
    () =>
      JSON.stringify(
        simplified ? simplifyObject(convertSets(json)) : convertSets(json),
        null,
        2
      ),
    [json, simplified]
  );

  // Sometimes we want this transform, sometimes we don't.
  const output_json = jsonstringify ? jsonString : json;

  const [modal, setModal] = useState<string | undefined>(undefined);

  const toggle = () => {
    setModal(undefined);
  };

  return (
    <div className={className}>
      <div className={styles.controls}>
        {checkbox && (
          <FormGroup check>
            <Label check size="sm" className={`form-field__label`}>
              <Input type="checkbox" onChange={onChange} />
              Include Empty Parameters
            </Label>
          </FormGroup>
        )}
        <CopyButton value={output_json} className={styles.copyButtonRight} />
        {tooltipText && (
          <ToolbarButton
            text=""
            icon="bulb"
            disabled={false}
            onClick={() => setModal('tooltip')}
            aria-label="tooltip"
          />
        )}

        {tooltipText && modal === 'tooltip' && (
          <TooltipModal
            toggle={toggle}
            tooltipText={tooltipText}
            tooltipTitle={tooltipTitle}
          />
        )}
      </div>
      <PodsCodeMirror
        value={output_json}
        // height={'20rem'}
        // width={'30rem'}
        isVisible={true}
      />
    </div>
  );
};

export default JSONDisplay;

// const iconNames = [
//   'jobs',
//   'zipped',
//   'compress',
//   'extract',
//   'add-file',
//   'add-folder',
//   'add-project',
//   'add',
//   'alert',
//   'allocations',
//   'applications',
//   'approved-boxed-reverse',
//   'approved-boxed',
//   'approved-reverse',
//   'approved',
//   'bar-graph',
//   'boxed',
//   'browser',
//   'bulb',
//   'burger',
//   'calendar',
//   'close-boxed',
//   'close',
//   'code',
//   'compass',
//   'contract',
//   'conversation',
//   'copy',
//   'coversation-wait',
//   'dashboard',
//   'data-files',
//   'data-processing',
//   'denied-reverse',
//   'denied',
//   'dna',
//   'document',
//   'download',
//   'edit-document',
//   'exit',
//   'expand',
//   'file',
//   'folder',
//   'gear',
//   'globe',
//   'history-reverse',
//   'history',
//   'image',
//   'jupyter',
//   'link',
//   'lock',
//   'monitor',
//   'move',
//   'multiple-coversation',
//   'my-data',
//   'new-browser',
//   'no-alert',
//   'pending',
//   'pie-graph-open',
//   'pie-graph-reverse',
//   'pie-graph',
//   'project',
//   'proposal-approved',
//   'proposal-denied',
//   'proposal-pending',
//   'publications',
//   'push-left',
//   'push-right',
//   'refresh',
//   'rename',
//   'reverse-order',
//   'rotate-ccw',
//   'rotate-cw',
//   'save',
//   'script',
//   'search-folder',
//   'search',
//   'share',
//   'sillouette',
//   'simulation-reverse',
//   'simulation',
//   'subtract-file',
//   'toolbox',
//   'trash',
//   'trophy',
//   'unlock',
//   'upload',
//   'user-reverse',
//   'user',
//   'visualization',
//   'zoom-in',
//   'zoom-out'
// ];
// {
//   /*
//                 {iconNames.map((iconName, index) => (
//                   <div key={index}>
//                     <ToolbarButton
//                       text={iconName}
//                       icon={iconName}
//                       disabled={false}
//                       onClick={() => setModal('tooltip')}
//                       aria-label="tooltip"
//                     />
//                     <br />
//                   </div>
//                 ))} */
// }
