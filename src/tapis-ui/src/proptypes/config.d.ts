import PropTypes from 'prop-types';
export declare const ConfigPropType: PropTypes.Requireable<PropTypes.InferProps<{
    token: PropTypes.Requireable<PropTypes.InferProps<{
        access_token: PropTypes.Validator<string>;
        expires_at: PropTypes.Requireable<string>;
        expires_in: PropTypes.Requireable<number>;
        pti: PropTypes.Requireable<string>;
    }>>;
    tenant: PropTypes.Requireable<string>;
    authenticator: PropTypes.Requireable<string>;
}>>;
export default ConfigPropType;
