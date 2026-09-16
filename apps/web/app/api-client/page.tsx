import { ApiClientApp } from '@/features/api-client';

export const metadata = {
  title: 'API Client | Seagull',
  description: 'Seagull (Secure Enterprise API Gateway for Unified Layer Linking) - Build, send, and manage API requests across your collections',
};

export default function ApiClientPage() {
  return <ApiClientApp />;
}
