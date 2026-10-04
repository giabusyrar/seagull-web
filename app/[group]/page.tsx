import { notFound } from 'next/navigation';
import { GROUPS, getGroup } from '@/lib/groups';
import { EndpointPanel } from '@/components/EndpointPanel';

export function generateStaticParams() { return GROUPS.map((g) => ({ group: g.id })); }

export default async function GroupPage({ params }: { params: Promise<{ group: string }> }) {
  const { group } = await params;
  const g = getGroup(group);
  if (!g) notFound();
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">{g.title}</h1>
      {g.endpoints.map((e) => <EndpointPanel key={e.id} def={e} />)}
    </div>
  );
}
