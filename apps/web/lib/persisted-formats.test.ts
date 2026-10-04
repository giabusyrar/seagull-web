// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { readPersisted, readPersistedString, writePersisted, writePersistedString } from '@gateway-experience/shared';

// The keys moved from direct localStorage calls onto persistent-state. A value
// saved before the move must still read back, and a value saved after it must
// be byte-for-byte what the old code wrote.
beforeEach(() => window.localStorage.clear());

describe('persisted formats', () => {
  it('keeps the active environment as a bare id', () => {
    window.localStorage.setItem('k', 'env-dev');
    expect(readPersistedString('k')).toBe('env-dev');
    writePersistedString('k', 'env-prod');
    expect(window.localStorage.getItem('k')).toBe('env-prod');
    writePersistedString('k', null);
    expect(window.localStorage.getItem('k')).toBeNull();
  });

  it('keeps JSON values as JSON.stringify wrote them', () => {
    const workspace = { tabs: [], activeTabId: 'tab-overview', openRouteIds: ['r1'], activeRouteId: null };
    writePersisted('w', workspace);
    expect(window.localStorage.getItem('w')).toBe(JSON.stringify(workspace));
    window.localStorage.setItem('t', JSON.stringify({ brandId: 'b', applicationId: 'a' }));
    expect(readPersisted('t')).toEqual({ brandId: 'b', applicationId: 'a' });
  });

  it('reads an unparsable saved value as absent, as the old try/catch did', () => {
    window.localStorage.setItem('p', '{broken');
    expect(readPersisted('p')).toBeUndefined();
  });
});
