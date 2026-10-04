'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GROUPS } from '@/lib/groups';

export function Nav() {
  const path = usePathname();
  const sections = ['Core', 'Reference', 'Workers'] as const;
  const item = (href: string, label: string) => (
    <Link key={href} href={href} className={`block rounded px-2 py-1 text-sm ${path === href ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-100'}`}>{label}</Link>
  );
  return (
    <nav className="w-52 shrink-0 space-y-4 border-r p-3">
      {sections.map((s) => (
        <div key={s}>
          <div className="mb-1 text-xs font-semibold uppercase text-zinc-500">{s}</div>
          {GROUPS.filter((g) => g.section === s).map((g) => item(`/${g.id}`, g.title))}
        </div>
      ))}
      <div>
        <div className="mb-1 text-xs font-semibold uppercase text-zinc-500">Conversation</div>
        {item('/conversation', 'Session + chat')}
      </div>
    </nav>
  );
}
