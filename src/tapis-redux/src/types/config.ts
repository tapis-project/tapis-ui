import { Token } from '../authenticator/types';

// Default configuration uses environment variables to configure URLs
export const defaultConfig: Config = {
  token: null,
  tenant: process.env.TAPIS_TENANT_URL,
  authenticator: process.env.TAPIS_AUTHENTICATOR_URL,
};

export interface Config {
  token: Token,
  tenant: string,
  authenticator: string
}