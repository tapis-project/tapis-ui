export type Implicit = {
  authorizationPath: string;
  clientId: string;
  redirectURI: string;
  responseType: 'token';
};

export type OAuth = {
  implicit?: Implicit;
  password?: boolean;
};

export type AuthMethod = 'implicit' | 'password';
