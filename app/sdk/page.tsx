import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SDK_OPS } from '@/lib/sdk';
import { SdkPanel } from '@/components/SdkPanel';

// The package does not export ./package.json, so read the installed copy directly.
function sdkVersion(): string {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), 'node_modules/@gateway-experience/beauty-sdk/package.json'), 'utf8')).version ?? '';
  } catch { return ''; }
}

export default function SdkPage() {
  const version = sdkVersion();
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">beauty-sdk (built{version ? `, v${version}` : ''})</h1>
      <p className="max-w-3xl text-sm text-zinc-600">
        Calls go through the SDK&apos;s own client and server proxy (<code>/api/beauty</code>). The proxy targets the services directly via
        <code> /svc/sdkgw</code> rewrites — no gateway. &quot;Both&quot; also runs the simulator&apos;s direct call for the same operation, side by side.
      </p>
      {SDK_OPS.map((op) => <SdkPanel key={op.id} def={op} />)}
    </div>
  );
}
