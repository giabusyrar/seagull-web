// The simulator's screens, shared by the simulator app and the dashboard's
// Simulator Studio. Hosts render <SimulatorApp/> after configureSimulator().
export { SimulatorApp } from './SimulatorApp';
export { configureSimulator, simulatorConfig, services, svcPath } from './lib/services';
export type { ServiceId, ServiceInfo, SimulatorConfig } from './lib/services';
