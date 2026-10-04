import { HealthPills } from './HealthPills';
import { BrandPicker } from './BrandPicker';
export function TopBar() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-2">
      <span className="font-semibold">Seagull Simulator</span>
      <HealthPills />
      <BrandPicker />
    </header>
  );
}
