import React from 'react';
import { Config } from 'tapis-redux/types';
import { LoginCallback } from 'tapis-redux/authenticator/types';
interface LoginProps {
    config?: Config;
    onAuth?: LoginCallback;
}
declare const Login: React.FC<LoginProps>;
export default Login;
