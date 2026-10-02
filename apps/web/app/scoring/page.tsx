import { ScoreManager } from '@gateway-experience/studio/score';


export const metadata = {
  title: 'Scoring Rules | XG Experience Gateway',
  description: 'Manage weighted scoring criteria and threshold evaluation',
};

export default function ScoringPage() {
  return <ScoreManager />;
}
