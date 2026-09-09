export type Implicit = {
  authorizationPath: string;
  clientId: string;
  redirectURI: string;
  responseType: 'token';
};

export type OAuth = {
  implicit?: Implicit;
  password?: boolean;
  /** The login page's access-token sign-in (paste a raw access_token
   *  instead of running an auth flow). On for every tenant when omitted;
   *  false turns it off for this deployment, and a list of tenant ids
   *  keeps it only for those. Develop-site hosts always have it. */
  jwtBypass?: boolean | string[];
  /** Older hostname allowlist for the same affordance; [] turns it off.
   *  Prefer jwtBypass, which names tenants rather than hosts. */
  jwtBypassHosts?: string[];
};

export type AuthMethod = 'implicit' | 'password';
