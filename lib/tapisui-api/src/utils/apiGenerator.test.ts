import { describe, it, expect } from 'vitest';
import { Systems } from '@tapis/tapis-typescript';
import apiGenerator from './apiGenerator';

describe('Api Generator', () => {
  it('generates an API with necessary function calls and configuration', () => {
    const api: Systems.SystemsApi = apiGenerator<Systems.SystemsApi>(
      Systems,
      Systems.SystemsApi,
      'https://basepath',
      'token'
    );
    expect(api).toHaveProperty('getSystem');
  });
});
