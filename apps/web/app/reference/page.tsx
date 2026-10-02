import { ReferenceManager } from '@gateway-experience/studio/reference';


export const metadata = {
  title: 'Reference Data | XG Experience Gateway',
  description: 'Manage master lookup reference types and items',
};

export default function ReferencePage() {
  return <ReferenceManager />;
}
