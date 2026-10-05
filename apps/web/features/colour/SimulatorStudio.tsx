'use client';

import { SimulatorApp, configureSimulator } from '@gateway-experience/simulator-kit';

// The dashboard's wiring for the shared simulator: every service through this
// app's gateway proxy (lib/proxy-handler.ts adds the data-plane key and the
// selected environment's host), so the paths are used as they are —
// /core/…, /api/reference/…, /conversation/…. No health pills: the gateway
// routes no health checks.
//
// The live conversation socket cannot go through this app (Next proxies HTTP
// only), so it goes to NEXT_PUBLIC_CONVERSATION_WS_URL, else to the gateway's
// data plane (NEXT_PUBLIC_GATEWAY_PROXY_URL as ws/wss), which routes
// /conversation/ws. Neither set: the advisor reports it cannot connect.
const wsBase =
  process.env.NEXT_PUBLIC_CONVERSATION_WS_URL ||
  (process.env.NEXT_PUBLIC_GATEWAY_PROXY_URL || '').replace(/^http/, 'ws');

configureSimulator({
  bases: { core: '', ref: '', conv: '' },
  healthPaths: { core: null, ref: null, conv: null },
  conversationWs: wsBase,
});

/** The simulator itself, exactly as the simulator app shows it. */
export function SimulatorStudio() {
  return <SimulatorApp />;
}
