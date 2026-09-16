import { apiClient } from './api-client';
import { rebuildRouter } from './router-registry';

let isPolling = false;

export async function runHealthCheck() {
  if (isPolling) return;
  isPolling = true;

  try {
    const collections = await apiClient.collections.list().catch(() => []);
    let anyStatusChanged = false;

    for (const collection of collections || []) {
      if (collection.type !== 'proxy') continue;
      const targetHost = collection.environments?.find(
        (e: any) => e.id === collection.activeEnvironmentId
      )?.targetHost;

      if (!targetHost) continue;

      // If healthCheckPath is empty, consider healthy
      if (!collection.healthCheckPath || !collection.healthCheckPath.trim()) {
        continue;
      }

      const url = `${targetHost}${collection.healthCheckPath}`;
      let newStatus = 'unhealthy';

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          headers: { 'User-Agent': 'XG-HealthPoller/1.0' },
        });

        clearTimeout(timeoutId);
        if (response.ok) {
          newStatus = 'healthy';
        }
      } catch {
        // Fetch failed or timed out
      }

      if (newStatus !== collection.status) {
        await apiClient.collections.update(collection.id, { status: newStatus }).catch(() => {});
        anyStatusChanged = true;
      }
    }

    if (anyStatusChanged) {
      await rebuildRouter();
    }
  } catch (error) {
    console.error('Error during health check loop:', error);
  } finally {
    isPolling = false;
  }
}

export function startHealthPoller() {
  const globalWithPoller = global as typeof globalThis & {
    __health_poller_active?: boolean;
  };

  if (globalWithPoller.__health_poller_active) {
    return;
  }

  globalWithPoller.__health_poller_active = true;
  runHealthCheck();
  setInterval(runHealthCheck, 30000);
}
