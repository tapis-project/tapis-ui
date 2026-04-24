import type { ChatTurn } from './agentTypes';

export function extractTapisToken(jwt: unknown): string {
  const token =
    typeof jwt === 'string' ? jwt : (jwt as any)?.access_token || jwt;
  if (!token || typeof token !== 'string') {
    throw new Error('Invalid token: Token is required and must be a string');
  }
  return token;
}

export function formatAgentError(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === 'string') return e;
  return JSON.stringify(e);
}

export function getLastUserMessage(history: ChatTurn[]): string {
  const lastUser = [...history].reverse().find((t) => t.role === 'user');
  return lastUser?.content || '';
}

export async function assertOkResponse(
  response: Response,
  serviceName: string
): Promise<void> {
  if (response.ok) return;
  const errorText = await response.text();
  let errorMessage = `${serviceName} API error (${response.status}): ${errorText}`;
  try {
    const errorData = JSON.parse(errorText);
    if (errorData.message) {
      errorMessage = `${serviceName} API error (${response.status}): ${errorData.message}`;
    }
  } catch {
    // Keep raw error text when the body isn't JSON.
  }
  throw new Error(errorMessage);
}

export function wrapNetworkError(e: unknown, serviceName: string): Error {
  if (e instanceof Error) {
    if (
      e.message.includes('CORS') ||
      e.message.includes('Failed to fetch') ||
      e.message.includes('NetworkError')
    ) {
      return new Error(
        `CORS error: Unable to connect to ${serviceName} API. If running in development, ensure the Vite proxy is configured. Error: ${e.message}`
      );
    }
    return e;
  }
  return new Error(`${serviceName} error: ${e}`);
}
