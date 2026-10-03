import { redirect } from 'next/navigation';
import { ReferenceEntityDashboard } from '@gateway-experience/studio/reference';
import { REFERENCE_ENTITY_CONFIGS } from '@gateway-experience/studio/reference/config';


export default async function ReferenceEntityPage({
  params,
}: {
  params: Promise<{ entity: string }>;
}) {
  const { entity } = await params;

  if (!entity || !REFERENCE_ENTITY_CONFIGS[entity]) {
    redirect('/reference/brands');
  }

  return <ReferenceEntityDashboard slug={entity} />;
}
