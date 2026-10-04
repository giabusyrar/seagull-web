export interface DbSkinConditionRecord {
  id: string;
  code: string;
  name: string;
  dimensionCode: string;
  visionCapabilities: string[];
  triggerKeys: string[];
  description?: string;
}

// In-memory cache store
let cachedConditions: DbSkinConditionRecord[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Fetches dynamic skin conditions and their PyTorch vision capability mappings from the database.
 * No static hardcoded arrays — database is the single source of truth.
 */
export async function fetchSkinConditionsFromDb(skinConditionsUrl: string): Promise<DbSkinConditionRecord[]> {
  const now = Date.now();
  if (cachedConditions && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedConditions;
  }

  try {
    const res = await fetch(skinConditionsUrl, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      const records: DbSkinConditionRecord[] = Array.isArray(data.items)
        ? data.items
        : Array.isArray(data.skinConditions)
        ? data.skinConditions
        : Array.isArray(data)
        ? data
        : [];
      cachedConditions = records;
      lastFetchTime = now;
      return cachedConditions;
    }
  } catch (err) {
    console.warn('Unable to query skin_conditions from database endpoint:', err);
  }

  return cachedConditions || [];
}

/**
 * Invalidates the in-memory cache to force a fresh DB read on next dispatch.
 */
export function invalidateSkinConditionCache(): void {
  cachedConditions = null;
  lastFetchTime = 0;
}

/**
 * Dynamically resolves required PyTorch vision capabilities from database-defined skin conditions
 * based on user-detected conditions and trigger keys.
 */
export async function resolveRequiredCapabilitiesFromDb(
  detectedConditions: string[],
  skinConditionsUrl: string
): Promise<string[]> {
  const allDbConditions = await fetchSkinConditionsFromDb(skinConditionsUrl);
  const matchedCapabilities = new Set<string>();
  const normalizedUserConditions = detectedConditions.map((c) => c.toLowerCase().trim());

  for (const condition of allDbConditions) {
    const triggerKeys = (condition.triggerKeys || []).map((k) => k.toLowerCase().trim());
    const conditionCode = (condition.code || '').toLowerCase().trim();

    const isMatched =
      normalizedUserConditions.includes(conditionCode) ||
      triggerKeys.some((tKey) =>
        normalizedUserConditions.some((uKey) => uKey.includes(tKey) || tKey.includes(uKey))
      );

    if (isMatched && Array.isArray(condition.visionCapabilities)) {
      condition.visionCapabilities.forEach((cap) => {
        if (cap && typeof cap === 'string') {
          matchedCapabilities.add(cap.trim());
        }
      });
    }
  }

  return Array.from(matchedCapabilities);
}

/**
 * Backward compatibility alias for resolveRequiredCapabilitiesFromDb.
 */
export async function resolveRequiredCapabilities(
  detectedConditions: string[],
  skinConditionsUrl: string
): Promise<string[]> {
  return resolveRequiredCapabilitiesFromDb(detectedConditions, skinConditionsUrl);
}
