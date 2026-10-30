import { execFileSync } from 'node:child_process';
import { setTimeout } from 'node:timers/promises';

import type { TestProject } from 'vitest/node';

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- augmentation merges only into an interface
  export interface ProvidedContext {
    baseUrl: string;
  }
}

const IMAGE = 'html-to-pdf:e2e';
const CONTAINER_PORT = '8087';
// Production runs the amd64 image, so render there for goldens that match it.
const PLATFORM = 'linux/amd64';
const HEALTH_TIMEOUT_MS = 60_000;

let containerId: string | undefined;

export async function setup(project: TestProject) {
  execFileSync(
    'docker',
    ['build', '--platform', PLATFORM, '--tag', IMAGE, '.'],
    { stdio: 'inherit' }
  );

  containerId = execFileSync(
    'docker',
    [
      'run',
      '--detach',
      '--rm',
      '--platform',
      PLATFORM,
      '--publish',
      `127.0.0.1::${CONTAINER_PORT}`,
      IMAGE,
    ],
    { encoding: 'utf8' }
  ).trim();

  const hostAddress = execFileSync(
    'docker',
    ['port', containerId, CONTAINER_PORT],
    {
      encoding: 'utf8',
    }
  )
    .trim()
    .split('\n')[0];
  const baseUrl = `http://${hostAddress}`;

  await waitUntilHealthy(baseUrl);
  project.provide('baseUrl', baseUrl);
}

export function teardown() {
  if (containerId) {
    execFileSync('docker', ['stop', containerId]);
  }
}

async function waitUntilHealthy(baseUrl: string) {
  const deadline = Date.now() + HEALTH_TIMEOUT_MS;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) {
        return;
      }
    } catch {
      // Not listening yet.
    }
    await setTimeout(500);
  }

  throw new Error('html-to-pdf container did not become healthy');
}
