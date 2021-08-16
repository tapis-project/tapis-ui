import { Token } from '../authenticator/types';

// Default configuration uses environment variables to configure URLs
export const defaultConfig: Config = {
  jwt: null,
  tenant: process.env.REACT_APP_TAPIS_TENANT_URL
};

export interface Config {
  jwt: string | null,
  tenant: string | undefined,
}