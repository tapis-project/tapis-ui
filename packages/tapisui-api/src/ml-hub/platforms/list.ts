import { Models } from '@mlhub/ts-sdk';
import { errorDecoder } from '../../utils';

const list = (basePath: string, jwt: string) => {
  const configuration = new Models.Configuration({
    basePath,
    headers: {
      'Content-Type': 'application/json',
      ...(jwt && {
        Authorization: `Bearer ${jwt}`,
      }),
    },
    fetchApi: fetch,
  });

  const platformsApi = new Models.PlatformsApi(configuration);

  // For local MLHub instance, we need to handle the response format directly
  return fetch(`${basePath}/models-api/platforms`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(jwt && {
        Authorization: `Bearer ${jwt}`,
      }),
    },
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('MLHub API response:', data);

    // Transform the response to match expected format
    return {
      result: data.result || [],
      status: data.status,
      message: data.message,
      metadata: data.metadata,
      version: data.version,
    };
  });
};

export default list;
