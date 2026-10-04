export default function Home() {
  return (
    <div className="max-w-2xl space-y-2 text-sm text-zinc-700">
      <h1 className="text-lg font-semibold text-zinc-900">Seagull Simulator</h1>
      <p>Calls every Seagull service directly (no gateway). Pick a brand and application above, then a screen on the left.</p>
      <p>Service URLs come from <code>.env.local</code> (see <code>.env.example</code>); restart after changing them.</p>
    </div>
  );
}
