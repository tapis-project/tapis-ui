import { Token } from 'tapis-redux/src/authenticator/types';

export const isExpired = (token: Token) => {
  const expiry: number = Date.parse(token?.expires_at ?? '');
  return expiry < Date.now();
}