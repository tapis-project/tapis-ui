import PropTypes from 'prop-types';
declare const TokenPropType: PropTypes.Requireable<PropTypes.InferProps<{
    access_token: PropTypes.Validator<string>;
    expires_at: PropTypes.Requireable<string>;
    expires_in: PropTypes.Requireable<number>;
    pti: PropTypes.Requireable<string>;
}>>;
export default TokenPropType;
