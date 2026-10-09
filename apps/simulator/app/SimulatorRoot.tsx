'use client';
import { SimulatorApp, configureSimulator } from '@gateway-experience/simulator-kit';
import { SERVICES } from '../services';

// The simulator app's wiring: services through its own /svc/<id> rewrites (the
// kit's defaults), and the live socket straight to the conversation engine —
// rewrites carry HTTP only. Deployments set NEXT_PUBLIC_SIM_CONVERSATION_WS.
configureSimulator({
  conversationWs: process.env.NEXT_PUBLIC_SIM_CONVERSATION_WS || SERVICES.conv.defaultUrl.replace(/^http/, 'ws'),
  // The live photo check's MediaPipe files (docs/CAPTURE-CHECK.md); unset: the camera works unchecked.
  faceLandmarker: {
    wasmUrl: process.env.NEXT_PUBLIC_MEDIAPIPE_WASM_URL ?? '',
    modelUrl: process.env.NEXT_PUBLIC_FACE_LANDMARKER_MODEL_URL ?? '',
  },
});

export function SimulatorRoot() {
  return <SimulatorApp />;
}
