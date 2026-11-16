import {
  GenericContainer,
  type StartedTestContainer,
  Wait,
} from 'testcontainers';
import type { TestProject } from 'vitest/node';

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- augmentation merges only into an interface
  export interface ProvidedContext {
    baseUrl: string;
  }
}

const IMAGE = 'html-to-pdf:e2e';
const CONTAINER_PORT = 8087;
// Production runs the amd64 image, so render there for goldens that match it.
const PLATFORM = 'linux/amd64';
const HEALTH_TIMEOUT_MS = 60_000;

let container: StartedTestContainer | undefined;

export async function setup(project: TestProject) {
  const image = await GenericContainer.fromDockerfile('.')
    .withPlatform(PLATFORM)
    .build(IMAGE, { deleteOnExit: false });

  container = await image
    .withPlatform(PLATFORM)
    .withExposedPorts(CONTAINER_PORT)
    .withWaitStrategy(Wait.forHttp('/health', CONTAINER_PORT))
    .withStartupTimeout(HEALTH_TIMEOUT_MS)
    .start();

  project.provide(
    'baseUrl',
    `http://${container.getHost()}:${container.getMappedPort(CONTAINER_PORT)}`
  );
}

export async function teardown() {
  await container?.stop();
}
