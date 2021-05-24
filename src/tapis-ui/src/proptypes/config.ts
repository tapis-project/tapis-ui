import PropTypes from 'prop-types';
import TokenPropType from './token';

export const ConfigPropType = PropTypes.shape({
  token: TokenPropType,
  tenant: PropTypes.string,
  authenticator: PropTypes.string,
});

export default ConfigPropType;