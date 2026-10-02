'use client';

import { BeautyProvider, usePhotoSet } from '@gateway-experience/beauty-sdk/react';
import { PhotoSet } from '@gateway-experience/beauty-sdk/photo';

function Photos() {
  const set = usePhotoSet();
  return <PhotoSet photos={set.photos} onChange={set.set} views={['front', 'left', 'right']} classNames={{ grid: 'demo-grid' }} />;
}

export function Demo() {
  return (
    <BeautyProvider baseUrl="/api/beauty" locale="en" messages={{ 'photo.front': 'Your face' }}>
      <Photos />
    </BeautyProvider>
  );
}
