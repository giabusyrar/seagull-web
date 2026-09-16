import { ScoreManager } from '@gateway-experience/beauty-sdk/score';


export const metadata = {
  title: 'Scoring Rules | XG Experience Gateway',
  description: 'Manage weighted scoring criteria and threshold evaluation',
};

export default function ScoringPage() {
  return <ScoreManager />;
}
