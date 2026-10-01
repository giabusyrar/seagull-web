import { afterEach, describe, expect, it } from 'vitest';
import { getModelServerUrl, getSkinWorkerUrl } from './services';

const saved = { ...process.env };

afterEach(() => {
  process.env = { ...saved };
});

describe('getSkinWorkerUrl', () => {
  it('defaults to the skin worker port', () => {
    delete process.env.SKIN_WORKER_URL;
    expect(getSkinWorkerUrl()).toBe('http://127.0.0.1:8088');
  });

  it('ignores the pre-split name, which no longer describes the service', () => {
    delete process.env.SKIN_WORKER_URL;
    process.env.VISION_AI_WORKER_URL = 'http://elsewhere:9999';
    expect(getSkinWorkerUrl()).toBe('http://127.0.0.1:8088');
  });
});

describe('getModelServerUrl', () => {
  it('defaults to the model server, not the skin worker', () => {
    delete process.env.MODEL_SERVER_URL;
    expect(getModelServerUrl()).toBe('http://127.0.0.1:8096');
  });

  it('takes the deployed address from the environment', () => {
    process.env.MODEL_SERVER_URL = 'https://models.example.test/';
    expect(getModelServerUrl()).toBe('https://models.example.test');
  });
});
