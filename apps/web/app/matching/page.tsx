import { MatchManager } from '@gateway-experience/studio/match';


export const metadata = {
  title: 'Route Matcher | XG Experience Gateway',
  description: 'Configure route pattern matching rules and priority resolution',
};

export default function MatchingPage() {
  return <MatchManager />;
}
