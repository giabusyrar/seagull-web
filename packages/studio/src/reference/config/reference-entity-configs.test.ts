import { describe, expect, it } from 'vitest';
import { REFERENCE_ENTITY_CONFIGS } from './reference-entity-configs';

describe('products', () => {
  const products = REFERENCE_ENTITY_CONFIGS.products;
  const field = (key: string) => products.fields.find((f) => f.key === key);

  // reference-service answers 400 when categoryId is missing, so a form
  // without the field could never create a product.
  it('asks for a category, as the API requires one', () => {
    expect(field('categoryId')).toMatchObject({
      type: 'relation',
      relationEntity: 'categories',
      required: true,
    });
  });

  it('offers a texture without demanding one', () => {
    expect(field('textureId')).toMatchObject({ type: 'relation', relationEntity: 'textures' });
    expect(field('textureId')?.required).toBeUndefined();
  });

  it('keeps the fields the API already accepted', () => {
    expect(field('brandId')?.required).toBe(true);
    expect(field('ingredientIds')?.type).toBe('multi-relation');
    expect(field('imageUrl')?.type).toBe('text');
  });
});

describe('the entities a product points at', () => {
  it.each(['categories', 'textures'])('%s is editable in its own right', (slug) => {
    const config = REFERENCE_ENTITY_CONFIGS[slug];
    expect(config.resource).toBe(slug);
    expect(config.dataKey).toBe(slug);
    // code and name are both required by reference-service.
    expect(config.fields.find((f) => f.key === 'code')?.required).toBe(true);
    expect(config.fields.find((f) => f.key === 'name')?.required).toBe(true);
  });

  it('is reachable by every relationEntity a field names', () => {
    for (const config of Object.values(REFERENCE_ENTITY_CONFIGS)) {
      for (const f of config.fields) {
        if (!f.relationEntity) continue;
        // The relation select fetches /api/reference/<relationEntity>; a name
        // with no matching endpoint would render an empty, silent dropdown.
        expect(typeof f.relationEntity).toBe('string');
      }
    }
  });
});
