'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { cn } from '@gateway-experience/shared';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { HeadReport } from './headTypes';

/**
 * natural: the GLB as built (photo colour where seen, the worker's flat fill
 * elsewhere); provenance: every unseen region (_OBSERVED = 0) forced grey;
 * sigma: each vertex's model lower-bound uncertainty on a ramp.
 */
export type HeadShading = 'natural' | 'provenance' | 'sigma';

// Part names (primitive extras.part) since realism A, Seagull-core
// docs/superpowers/specs/2026-10-01-3d-head-realism-a-design.md. A GLB from
// before it has no names and renders with its own materials.
const PART_SKIN = 'skin';
const PART_CORNEA = 'cornea';

// Look tuning for the skin (visual only, not data): a soft sheen for a
// subsurface-like skin. Eyeballs keep the GLB's own material: a glossier one
// reflects the room and washes out the photographed iris.
const SKIN_LOOK = { roughness: 0.6, sheen: 0.12, sheenRoughness: 0.9, sheenColor: '#b4503c', specularIntensity: 0.25 };
// Image-based light strength: enough to model the face without washing out
// the photo texture under ACES (visual only).
const ENV_INTENSITY = 0.55;
// three's ACES pre-scales by 1/0.6; this brings mid-tones back near the
// photo's, so skin colour reads as photographed (visual only).
const TONE_EXPOSURE = 0.75;
// A thin clear shell: no refraction blur, a sharp highlight (visual only).
const CORNEA_LOOK = { roughness: 0.02, thickness: 0, clearcoatRoughness: 0.02 };
// Refractive index of the human cornea, 1.376 (Gullstrand schematic eye):
// a property of the eye, not a choice. Gives the cornea its highlight.
const CORNEA_IOR = 1.376;

// Regions no photo saw (_OBSERVED = 0) are the model's estimate. They are
// drawn this flat grey, untextured, so they cannot pass for skin; the worker
// fills unseen texels with the same kind of grey (sRGB 128).
export const PRIOR_GREY = '#9ca3af';
// Sequential ramp for _SIGMA_MM: light = less uncertain, dark = more.
export const SIGMA_RAMP: [string, string] = ['#fef3c7', '#b91c1c'];
// Parts the GLB gives no _SIGMA_MM (hair, head covering: the model has no
// uncertainty for them) are drawn this neutral grey in the sigma view, so a
// missing value never reads as the most certain end of the ramp.
export const NO_SIGMA_GREY = '#e5e7eb';
// Per-vertex stand-in for "no _SIGMA_MM": negative, so it can never be a
// real uncertainty, and the shader tests for it.
const NO_SIGMA = -1;
// Layout: room around the head when it is first framed.
const FRAME_MARGIN = 1.25;

export interface HeadStats {
  report: HeadReport | null;
  /** _SIGMA_MM range over the mesh, mm; null when the GLB carries none. */
  sigmaRange: [number, number] | null;
  /** The GLB had no _OBSERVED attribute: every region is shown as estimated. */
  provenanceMissing: boolean;
  /** Some parts (e.g. hair) carry no _SIGMA_MM; the sigma view draws them NO_SIGMA_GREY. */
  sigmaMissing: boolean;
}

/**
 * A measurement drawn on the head, in the GLB's mesh space (metres). Points
 * come from the report's landmarkPoints, never from a guessed vertex.
 */
export interface HeadMarker {
  key: string;
  kind: 'segment' | 'angle' | 'points';
  points: [number, number, number][];
  selected: boolean;
}

// Same green as the 2D measurement layer, so a line means the same thing on
// the photo and on the head.
const MARKER_COLOUR = '#059669';
// Marker dot radius as a share of the head's height, and how far markers are
// lifted off the skin in dot radii (layout only).
const MARKER_DOT_SHARE = 0.006;
const MARKER_LIFT = 0.8;

interface Props {
  glb: ArrayBuffer;
  shading: HeadShading;
  onLoaded: (stats: HeadStats) => void;
  onError: (message: string) => void;
  /** Measurements to draw on the head, on its surface; hidden when on the far side. */
  markers?: HeadMarker[];
  /** Box sizing; by default a 4:5 frame at full width. */
  className?: string;
}

interface ShaderUniforms {
  uMode: { value: number };
  uSigmaMax: { value: number };
  uPriorGrey: { value: THREE.Color };
  uRampLo: { value: THREE.Color };
  uRampHi: { value: THREE.Color };
  uNoSigma: { value: THREE.Color };
}

/**
 * The fitted head, rotatable. GLTFLoader lower-cases custom attributes, so
 * _OBSERVED and _SIGMA_MM arrive as `_observed` and `_sigma_mm`; they are
 * copied to plain names for the shader. Shading:
 * - provenance: texture where a photo saw the surface, grey where it did not;
 * - sigma: each vertex's model lower-bound uncertainty on a sequential ramp.
 */
export function HeadViewer({ glb, shading, onLoaded, onError, markers = [], className = 'aspect-[4/5] w-full' }: Props) {
  const mount = useRef<HTMLDivElement>(null);
  const uniforms = useRef<ShaderUniforms[]>([]);
  const redraw = useRef<() => void>(() => {});
  const sigmaMaxRef = useRef(1);
  // Where markers hang: the node holding the head mesh, so they share its
  // transform; and the head's height, to size the dots.
  const markerParent = useRef<THREE.Object3D | null>(null);
  const headHeight = useRef(1);
  // The head's centre in the markers' frame: "outward" for lifting markers.
  const headCentre = useRef(new THREE.Vector3());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;
    let disposed = false;
    uniforms.current = [];

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = TONE_EXPOSURE;
    el.appendChild(renderer.domElement);

    // Image-based light from a neutral room, plus a soft key for shape.
    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envMap;
    scene.environmentIntensity = ENV_INTENSITY;
    const key = new THREE.DirectionalLight(0xffffff, 0.6);
    key.position.set(0.4, 0.6, 1);
    scene.add(key);

    const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 10);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;

    const render = () => renderer.render(scene, camera);
    redraw.current = render;
    controls.addEventListener('change', render);

    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      render();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    resize();

    new GLTFLoader().parse(
      glb,
      '',
      (gltf) => {
        if (disposed) return;
        let sigmaMin = Infinity;
        let sigmaMax = -Infinity;
        let provenanceMissing = false;
        let sigmaMissing = false;

        gltf.scene.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (!mesh.isMesh) return;
          const geo = mesh.geometry;
          const count = geo.getAttribute('position').count;
          const observed = geo.getAttribute('_observed');
          if (!observed) provenanceMissing = true;
          geo.setAttribute('aObserved', observed ?? new THREE.BufferAttribute(new Float32Array(count), 1));
          const sigma = geo.getAttribute('_sigma_mm');
          if (sigma) {
            for (let i = 0; i < sigma.count; i++) {
              const v = sigma.getX(i);
              if (Number.isFinite(v)) {
                sigmaMin = Math.min(sigmaMin, v);
                sigmaMax = Math.max(sigmaMax, v);
              }
            }
          }
          if (!sigma) sigmaMissing = true;
          geo.setAttribute('aSigma', sigma ?? new THREE.BufferAttribute(new Float32Array(count).fill(NO_SIGMA), 1));

          const part = typeof geo.userData?.part === 'string' ? (geo.userData.part as string) : null;
          if (part) mesh.material = partMaterial(part, mesh.material as THREE.MeshStandardMaterial);
          // The cornea is a clear shell over the iris: never greyed or ramped.
          if (part === PART_CORNEA) return;

          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach((mat) => {
            // Open edges of the mesh (the neck) show their inside when the
            // head is turned, instead of vanishing. A part the GLB has no
            // geometry for still renders as a hole.
            mat.side = THREE.DoubleSide;
            mat.onBeforeCompile = (shader) => {
              const u: ShaderUniforms = {
                uMode: { value: 0 },
                uSigmaMax: { value: 1 },
                uPriorGrey: { value: new THREE.Color(PRIOR_GREY) },
                uRampLo: { value: new THREE.Color(SIGMA_RAMP[0]) },
                uRampHi: { value: new THREE.Color(SIGMA_RAMP[1]) },
                uNoSigma: { value: new THREE.Color(NO_SIGMA_GREY) },
              };
              Object.assign(shader.uniforms, u);
              uniforms.current.push(u);
              shader.vertexShader = shader.vertexShader
                .replace(
                  '#include <common>',
                  '#include <common>\nattribute float aObserved;\nattribute float aSigma;\nvarying float vObserved;\nvarying float vSigma;',
                )
                .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObserved = aObserved;\nvSigma = aSigma;');
              shader.fragmentShader = shader.fragmentShader
                .replace(
                  '#include <common>',
                  '#include <common>\nuniform float uMode;\nuniform float uSigmaMax;\nuniform vec3 uPriorGrey;\nuniform vec3 uRampLo;\nuniform vec3 uRampHi;\nuniform vec3 uNoSigma;\nvarying float vObserved;\nvarying float vSigma;',
                )
                .replace(
                  '#include <map_fragment>',
                  [
                    '#include <map_fragment>',
                    'if (uMode > 0.5 && uMode < 1.5) {',
                    '  if (vObserved < 0.5) diffuseColor.rgb = uPriorGrey;',
                    '} else if (uMode > 1.5) {',
                    '  diffuseColor.rgb = vSigma < 0.0 ? uNoSigma : mix(uRampLo, uRampHi, clamp(vSigma / max(uSigmaMax, 1e-6), 0.0, 1.0));',
                    '}',
                  ].join('\n'),
                );
              applyShading(u, shading, sigmaMax);
            };
            mat.needsUpdate = true;
          });
        });

        scene.add(gltf.scene);
        let meshNode: THREE.Object3D | null = null;
        gltf.scene.traverse((o) => {
          if (!meshNode && (o as THREE.Mesh).isMesh) meshNode = o.parent ?? gltf.scene;
        });
        markerParent.current = meshNode ?? gltf.scene;
        // Frame the head: centred, its height filling most of the view, seen
        // from the front (+Z out of the face).
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const centre = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        headHeight.current = size.y;
        gltf.scene.updateMatrixWorld(true);
        headCentre.current = (markerParent.current ?? gltf.scene).worldToLocal(centre.clone());
        const dist = (Math.max(size.y, size.x) / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) * FRAME_MARGIN;
        camera.position.set(centre.x, centre.y, centre.z + dist);
        camera.near = dist / 100;
        camera.far = dist * 10;
        camera.updateProjectionMatrix();
        controls.target.copy(centre);
        controls.minDistance = dist * 0.4;
        controls.maxDistance = dist * 3;
        controls.update();
        render();

        const extras = (gltf.asset as { extras?: unknown }).extras ?? null;
        onLoaded({
          report: isHeadReport(extras) ? extras : null,
          sigmaRange: Number.isFinite(sigmaMax) ? [sigmaMin, sigmaMax] : null,
          provenanceMissing,
          sigmaMissing,
        });
        sigmaMaxRef.current = Number.isFinite(sigmaMax) ? sigmaMax : 1;
        setReady(true);
      },
      (err) => {
        if (!disposed) onError(err instanceof Error ? err.message : String(err));
      },
    );

    return () => {
      disposed = true;
      observer.disconnect();
      controls.dispose();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((m) => {
          Object.values(m).forEach((v) => v instanceof THREE.Texture && v.dispose());
          m.dispose();
        });
      });
      markerParent.current = null;
      envMap.dispose();
      pmrem.dispose();
      renderer.dispose();
      el.removeChild(renderer.domElement);
      setReady(false);
    };
    // Shading is applied through uniforms below, not by rebuilding the scene.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glb]);

  // Markers live in their own group, rebuilt when they change; the head is not reloaded.
  const markerKey = JSON.stringify(markers);
  useEffect(() => {
    const parent = markerParent.current;
    if (!ready || !parent) return;
    const group = new THREE.Group();
    group.renderOrder = 10;
    const r = headHeight.current * MARKER_DOT_SHARE;
    for (const mk of markers) {
      const colour = new THREE.Color(MARKER_COLOUR);
      const opacity = markers.some((m) => m.selected) && !mk.selected ? 0.35 : 1;
      // Each point lies on the skin. Lift it a little outward (away from the
      // head's centre) so the marker sits on the surface instead of half in it;
      // depth-tested, so points on the far side stay hidden. Display only.
      const pts = mk.points.map(([x, y, z]) => {
        const p = new THREE.Vector3(x, y, z);
        return p.add(p.clone().sub(headCentre.current).normalize().multiplyScalar(r * MARKER_LIFT));
      });
      if (mk.kind !== 'points' && pts.length > 1) {
        const line = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(pts),
          new THREE.LineBasicMaterial({ color: colour, transparent: true, opacity }),
        );
        line.renderOrder = 10;
        group.add(line);
      }
      const dot = new THREE.SphereGeometry(r * (mk.selected ? 1.5 : 1), 12, 8);
      const mat = new THREE.MeshBasicMaterial({ color: colour, transparent: true, opacity });
      for (const p of pts) {
        const m = new THREE.Mesh(dot, mat);
        m.position.copy(p);
        m.renderOrder = 11;
        group.add(m);
      }
    }
    parent.add(group);
    redraw.current();
    return () => {
      parent.remove(group);
      group.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        (m.material as THREE.Material | undefined)?.dispose();
      });
      redraw.current();
    };
    // markerKey stands for markers' content.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markerKey, ready]);

  useEffect(() => {
    uniforms.current.forEach((u) => applyShading(u, shading, sigmaMaxRef.current));
    redraw.current();
  }, [shading, ready]);

  return (
    <div
      ref={mount}
      className={cn('cursor-grab touch-none overflow-hidden rounded-lg border border-border bg-muted/30 active:cursor-grabbing', className)}
      aria-label="Kepala 3D; seret untuk memutar, gulir untuk zoom"
    />
  );
}

/**
 * The material a named part gets, keeping the GLB's texture. Skin: physical
 * with sheen; cornea: a clear, transmissive
 * shell with a clearcoat highlight. Unknown parts keep their own material.
 */
function partMaterial(part: string, from: THREE.MeshStandardMaterial): THREE.Material {
  const map = from.map ?? null;
  if (part === PART_SKIN) {
    from.dispose();
    return new THREE.MeshPhysicalMaterial({
      map,
      roughness: SKIN_LOOK.roughness,
      sheen: SKIN_LOOK.sheen,
      sheenRoughness: SKIN_LOOK.sheenRoughness,
      sheenColor: new THREE.Color(SKIN_LOOK.sheenColor),
      specularIntensity: SKIN_LOOK.specularIntensity,
    });
  }
  if (part === PART_CORNEA) {
    from.dispose();
    return new THREE.MeshPhysicalMaterial({
      transmission: 1,
      transparent: true,
      roughness: CORNEA_LOOK.roughness,
      ior: CORNEA_IOR,
      thickness: CORNEA_LOOK.thickness,
      clearcoat: 1,
      clearcoatRoughness: CORNEA_LOOK.clearcoatRoughness,
    });
  }
  return from;
}

function applyShading(u: ShaderUniforms, shading: HeadShading, sigmaMax: number) {
  u.uMode.value = shading === 'sigma' ? 2 : shading === 'provenance' ? 1 : 0;
  if (Number.isFinite(sigmaMax)) u.uSigmaMax.value = sigmaMax;
}

function isHeadReport(v: unknown): v is HeadReport {
  return !!v && typeof v === 'object' && (v as HeadReport).kind === 'fitted' && Array.isArray((v as HeadReport).views);
}
