import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ParamsTable, type RouteParamItem } from './ParamsTable';

const item = (over: Partial<RouteParamItem> = {}): RouteParamItem => ({
  id: '1',
  key: 'X-Thing',
  value: 'v',
  type: 'static',
  ...over,
});

function render(items: RouteParamItem[], kind: 'headers' | 'query' | 'body' = 'headers') {
  return renderToStaticMarkup(<ParamsTable kind={kind} items={items} onChange={() => {}} />);
}

describe('the is_static column', () => {
  it('is a switch, not a dropdown', () => {
    const html = render([item()]);
    expect(html).toContain('role="switch"');
    expect(html).toContain('>is_static<');
    expect(html).not.toContain('Select type...');
  });

  it('reads on for a static param and off for a dynamic one', () => {
    expect(render([item({ type: 'static' })])).toContain('aria-checked="true"');
    expect(render([item({ type: 'dynamic' })])).toContain('aria-checked="false"');
  });

  it('cannot be switched on for a file field, and says why', () => {
    const html = render([item({ type: 'dynamic', fieldType: 'file' })], 'body');
    expect(html).toMatch(/role="switch"[^>]*disabled/);
    expect(html).toContain('cannot be static');
  });

  it('stays usable for a text body field', () => {
    const html = render([item({ type: 'dynamic', fieldType: 'text' })], 'body');
    expect(html).not.toMatch(/role="switch"[^>]*disabled/);
  });
});

describe('the value column', () => {
  it('is headed Value, without the static-only aside', () => {
    expect(render([item()])).toContain('>Value<');
    expect(render([item()])).not.toContain('Static only');
  });

  it('offers a field only for a static param', () => {
    expect(render([item({ type: 'static', value: 'wardah' })])).toContain('value="wardah"');
    expect(render([item({ type: 'dynamic' })])).not.toContain('value="v"');
  });

  it('says where a dynamic value comes from instead of showing a dead field', () => {
    expect(render([item({ type: 'dynamic' })])).toContain('filled at runtime');
    expect(render([item({ type: 'dynamic', fieldType: 'file' })], 'body')).toContain('supplied by the caller');
  });
});
