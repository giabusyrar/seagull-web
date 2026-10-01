// ==========================================
// @paragon/beauty-sdk - Enterprise Beauty Tech SDK
// ==========================================

// 1. Core Layer (API Client, Auth, Types)
export * from './core';
export * as Core from './core';

// 2. Contracts
// @gateway-experience/contracts was emptied on 2026-10-01, when assessments
// moved to core-engine and the gateway retired its unified-assessment DTOs.
// Re-exporting an empty namespace only advertised something that is not there,
// so the dependency is gone. The assessment shapes this SDK uses live in
// ./core/assessment-types; a future cross-repo contract can be added back the
// same way, deliberately.

// 3. Hooks Layer (Headless React Hooks)
export * from './hooks';
export * as Hooks from './hooks';

// 4. UI Layer (Consumer-Facing Visual Primitives & Widgets)
export * from './ui';
export * as UI from './ui';

// 5. Studio Layer (Admin & Backoffice Management UI)
export * from './studio';
export * as Studio from './studio';

// 6. Orchestrator Layer (Unified 4-Engine Diagnostic Pipeline)
export * from './orchestrator';
export * as Orchestrator from './orchestrator';

// Backward-compatible module aliases for legacy imports
export * as Vision from './ui';
export * as Form from './studio/form';
export * as Score from './studio/score';
export * as Match from './studio/match';
export * as Reference from './studio/reference';
