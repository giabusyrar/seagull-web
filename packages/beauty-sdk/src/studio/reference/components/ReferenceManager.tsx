'use client';

import React from 'react';
import { ReferenceEntityDashboard } from './ReferenceEntityDashboard';

interface ReferenceManagerProps {
  initialEntity?: string;
}

export const ReferenceManager: React.FC<ReferenceManagerProps> = ({ initialEntity = 'brands' }) => {
  const slugMap: Record<string, string> = {
    brand: 'brands',
    brands: 'brands',
    product: 'products',
    products: 'products',
    'event-type': 'event-types',
    'event-types': 'event-types',
    status: 'statuses',
    statuses: 'statuses',
    ingredient: 'ingredients',
    ingredients: 'ingredients',
    dimension: 'dimensions',
    dimensions: 'dimensions',
    'scoring-dimension': 'dimensions',
    'scoring-dimensions': 'dimensions',
    condition: 'conditions',
    conditions: 'conditions',
    'customer-condition': 'conditions',
    'customer-conditions': 'conditions',
    'skin-concern': 'skin-conditions',
    'skin-concerns': 'skin-conditions',
    'skin-condition': 'skin-conditions',
    'skin-conditions': 'skin-conditions',
    concern: 'skin-conditions',
    concerns: 'skin-conditions',
  };

  const slug = slugMap[initialEntity] || initialEntity || 'brands';

  return <ReferenceEntityDashboard slug={slug} />;
};
