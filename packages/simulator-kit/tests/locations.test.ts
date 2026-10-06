import { describe, expect, it } from 'vitest';
import { GET, locations } from '@/location/server';
import { locationsUrl } from '@/lib/locations';
import { configureSimulator } from '@/lib/services';
import { customerBody } from '@/lib/conversation';
import { locationFields, piiFields } from '@/lib/form';

describe('locations (server)', () => {
  it('lists the world countries, Indonesia among them', async () => {
    const r = await locations();
    expect(r.level).toBe('country');
    expect(r.data.length).toBeGreaterThan(240);
    expect(r.data.find((c) => c.code === 'ID')?.name).toBe('Indonesia');
    expect(r.source.license).toBe('ODbL 1.0');
  });

  it('uses the Kemendagri list for Indonesia: 38 provinces, official kabupaten/kota', async () => {
    const p = await locations('id');
    expect(p.level).toBe('province');
    expect(p.data).toHaveLength(38);
    expect(p.data.some((x) => /^(Jawa|Sumatera|Kalimantan)$/.test(x.name))).toBe(false); // no island groups
    expect(p.source.name).toMatch(/Kepmendagri/);
    const jakarta = p.data.find((x) => x.code === '31')!; // Daerah Khusus Ibukota Jakarta
    expect(jakarta.name).toMatch(/Jakarta/);
    const c = await locations('ID', jakarta.code);
    expect(c.data.map((x) => x.name)).toContain('Kabupaten Administrasi Kepulauan Seribu');
    expect(c.data).toHaveLength(6);
    let total = 0;
    for (const prov of p.data) total += (await locations('ID', prov.code)).data.length;
    expect(total).toBe(514);
  });

  it('uses the world list elsewhere, without island groups', async () => {
    const states = await locations('MY');
    expect(states.data.map((s) => s.name)).toContain('Selangor');
    const sel = states.data.find((s) => s.name === 'Selangor')!;
    expect((await locations('MY', sel.code)).data.length).toBeGreaterThan(0);
  });

  it('serves it over GET with a long cache', async () => {
    const res = await GET(new Request('http://x/api/locations?country=ID'));
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toMatch(/max-age/);
    expect((await res.json()).data).toHaveLength(38);
  });
});

describe('locations (browser)', () => {
  it('asks the configured route', () => {
    configureSimulator({ locationsPath: '/api/locations' });
    expect(locationsUrl()).toBe('/api/locations');
    expect(locationsUrl('ID', '31')).toBe('/api/locations?country=ID&province=31');
    expect(locationsUrl(undefined, '31')).toBe('/api/locations');
  });

  it('sends the place to the advisor session only, by name', () => {
    const who = { fullName: 'Sari', country: 'ID', province: 'DKI Jakarta', provinceCode: '31', city: ' Kota Administrasi Jakarta Selatan ', consentDataProcessing: false, consentMarketing: false };
    expect(locationFields(who)).toEqual({ country: 'ID', province: 'DKI Jakarta', city: 'Kota Administrasi Jakarta Selatan' });
    expect(piiFields(who)).toEqual({ full_name: 'Sari' }); // form/score take no location
    expect(customerBody(who)).toMatchObject({ country: 'ID', province: 'DKI Jakarta' });
    expect(customerBody(who)).not.toHaveProperty('provinceCode');
  });
});
