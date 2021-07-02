import React, { useState } from 'react';
import {
  Button,
  FormGroup,
  Label,
  Input,
  FormText,
  Badge,
  InputGroup,
  InputGroupAddon,
} from 'reactstrap';

import { useField } from 'formik';
import PropTypes from 'prop-types';
import './JobFormField.scss';

/** A limited-choice wrapper for `FormField` */
const FormFieldWrapper = ({ children, type }) => {
  let wrapper;

  switch (type) {
    case 'InputGroup':
      wrapper = <InputGroup>{children}</InputGroup>;
      break;

    case 'FormGroup':
    default:
      wrapper = <FormGroup>{children}</FormGroup>;
  }

  return wrapper;
};
FormFieldWrapper.propTypes = {
  /** The content for the wrapper */
  children: PropTypes.node.isRequired,
  /** Which wrapper to use */
  type: PropTypes.oneOf(['InputGroup', 'FormGroup', '']),
};
FormFieldWrapper.defaultProps = {
  type: 'FormGroup',
};

/**
 * A standard form field that supports some customization and presets.
 *
 * Customizations:
 * - providing an `<InputGroupAddon>` (can not use with "Agave File Selector")
 *
 * Presets:
 * - Agave File Selector (requires `agaveFile` and `SelectModal`)
 */
const FormField = ({
  addon,
  addonType,
  label,
  description,
  required,
  ...props
}) => {
  // useField() returns [formik.getFieldProps(), formik.getFieldMeta()]
  // which we can spread on <input> and also replace ErrorMessage entirely.
  const [field, meta, helpers] = useField(props);
  const { id, name } = props;
  const hasAddon = addon !== undefined;
  const wrapperType = hasAddon ? 'InputGroup' : '';

  const FieldLabel = () => (
    /* !!!: Temporary extra markup to make simpler PR diff */
    <>
      <Label
        className="form-field__label"
        for={id || name}
        size="sm"
        style={{ display: 'flex', alignItems: 'center' }}
      >
        {label}{' '}
        {required ? (
          <Badge color="danger" style={{ marginLeft: '10px' }}>
            Required
          </Badge>
        ) : null}
      </Label>
    </>
  );
  const FieldNote = () => (
    <>
      {meta.touched && meta.error ? (
        <div className="form-field__validation-error">{meta.error}</div>
      ) : (
        description && (
          <FormText className="form-field__help" color="muted">
            {description}
          </FormText>
        )
      )}
    </>
  );

  return (
    /* !!!: Temporary bad indentation to make simpler PR diff */
    /* eslint-disable prettier/prettier */
    <>
      {label && hasAddon ? <FieldLabel /> : null}
      <FormFieldWrapper type={wrapperType}>
        {label && !hasAddon ? <FieldLabel /> : null}
        {hasAddon && addonType === 'prepend' ? addon : null}
        <Input {...field} {...props} bsSize="sm" />
        {hasAddon && addonType === 'append' ? addon : null}
        {!hasAddon ? <FieldNote /> : null}
      </FormFieldWrapper>
      {hasAddon ? <FieldNote /> : null}
    </>
    /* eslint-enable prettier/prettier */
  );
};
FormField.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  label: PropTypes.string,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  required: PropTypes.bool,
  /** An [`<InputGroupAddon>`](https://reactstrap.github.io/components/input-group/) to add */
  addon: PropTypes.node,
  /** The [`<InputGroupAddon>` `addonType`](https://reactstrap.github.io/components/input-group/) to add */
  addonType: PropTypes.oneOf(['prepend', 'append']),
};
FormField.defaultProps = {
  id: undefined,
  name: undefined,
  label: undefined,
  description: undefined,
  required: false,
  addon: undefined,
  addonType: undefined,
};

export default FormField;
