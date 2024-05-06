import Cookies from 'js-cookie';
import jwt_decode from 'jwt-decode';
import { ViewEnum } from 'tapis-app/Workflows/Pipelines/Pipeline/Pipeline';

type UserPreferences = {
    pipelineView: ViewEnum
}

const useUserPreferences = () => {
  const getUserPreferences = (): UserPreferences | undefined => {
    const cookie = Cookies.get('user-preferences');
    if (!!cookie) return JSON.parse(cookie);
    return undefined;
  };

  const setUserPreferences = (userPreferences: Partial<UserPreferences>): void => {
    let currentUserPreferences = getUserPreferences()
    Cookies.set(
        'user-preferences',
        JSON.stringify({
            ...currentUserPreferences,
            ...userPreferences
        })
    );
  };

  return {};
};

export default useUserPreferences;
