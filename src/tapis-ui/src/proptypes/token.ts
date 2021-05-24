import PropTypes from 'prop-types';

const TokenPropType = PropTypes.shape({
  access_token: PropTypes.string.isRequired,
  expires_at: PropTypes.string,
  expires_in: PropTypes.number,
  pti: PropTypes.string,
});

export default TokenPropType;
