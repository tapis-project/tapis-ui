import { Token } from 'tapis-redux/authenticator/types';

export const isExpired = (token: Token) => {
  const expiry: number = Date.parse(token?.expires_at ?? '');
  return expiry < Date.now();
}