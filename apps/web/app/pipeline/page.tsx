import { PipelineSimulatorView } from '@/features/orchestrator/PipelineSimulatorView';

export const metadata = {
  title: 'Unified Journey Pipeline | Seagull Gateway',
  description: 'End-to-end diagnostic orchestrator combining Form, Vision, Score, and Match engines.',
};

export default function PipelinePage() {
  return <PipelineSimulatorView />;
}
