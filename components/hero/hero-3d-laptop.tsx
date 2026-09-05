"use client";

import * as React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls as OrbitControlsImpl } from "three/examples/jsm/controls/OrbitControls.js";

/**
 * The hero's 3D visual — a stylized, low-poly laptop built entirely from
 * primitive geometry (no imported .glb/.gltf model exists anywhere in this
 * project; see `public/images/hero.svg`'s own generation note in the design
 * system doc — this follows that same "generate our own asset" convention
 * instead of pulling in an unverified third-party model). Body colors are
 * neutral zinc, matching the SVG illustrations; the screen glow / header
 * line / corner brackets / power LED all share one fixed accent color
 * (`GLOW_COLOR` — brand green, see Design System Reference → Brand).
 *
 * Desktop-only: this module is dynamically imported (`ssr: false`) by
 * `hero-visual.tsx` and only mounted at `lg` breakpoints and up — see that
 * file for why (bundle weight + WebGL cost don't belong on mobile hero
 * paint). This file assumes it only ever renders client-side.
 *
 * Motion, all imperative inside `useFrame` (refs, not React state, so none
 * of it causes a re-render) and driven off `state.clock.elapsedTime`, i.e.
 * time since the Canvas mounted — a one-time intro, not something that
 * replays:
 *
 *  1. Assembly (0s → `ASSEMBLY_COMPLETE_S`): every part (base+deck+hinge+LED,
 *     trackpad, screen, and each of the 48 keys) starts scattered away from
 *     the laptop, tumbling, and flies into its resting spot — see
 *     `applyAssembly`. Arrival order: base, then trackpad, then the screen
 *     (further away, slower — the deliberately dramatic one), then the keys
 *     rain down across the keyboard in a diagonal wave, landing last.
 *  2. Open (`ASSEMBLY_COMPLETE_S` → `+ OPEN_DURATION_S`): once every part has
 *     landed, the lid opens, ease-out.
 *  3. Idle: breathe (the lid angle oscillates a couple degrees), bob (the
 *     whole laptop floats gently), and a slow idle spin that permanently
 *     stops the first time the visitor drags to orbit it (see `Controls`) —
 *     two rotation sources fighting each other reads as broken, not premium.
 *
 * `prefers-reduced-motion` skips straight to the end state: laptop
 * assembled, open, centered, still. Orbit/zoom (drag + wheel) stays
 * available either way — that's a visitor-initiated interaction, not the
 * kind of automatic motion the reduced-motion preference is about.
 */

const BODY_COLOR = "#3f3f46"; // zinc-700 — device shell, matches the SVG illustrations
const DECK_COLOR = "#18181b"; // zinc-900 — keyboard deck / bezel
const TRACKPAD_COLOR = "#27272a"; // border token
const KEY_COLOR = "#52525b"; // zinc-600 — individual keycaps, a touch lighter than the deck so they read as keys
const SCREEN_BASE = "#0d0d0d"; // surface token — screen "off" color under the glow
const GLOW_COLOR = "#22c55e"; // brand primary green — screen glow / header line / corner brackets / power LED

const SCREEN_OPEN_ANGLE = -0.18; // slight backward tilt, like a real open laptop
const SCREEN_CLOSED_ANGLE = Math.PI / 2 - 0.04; // lid folded forward down onto the keyboard deck
const OPEN_DURATION_S = 2;
const BREATHE_AMPLITUDE = 0.035; // radians of lid wobble once open
const BREATHE_PERIOD_S = 4.4;
const BOB_AMPLITUDE = 0.045; // world units of vertical float
const BOB_PERIOD_S = 3.6;
const IDLE_ROTATE_SPEED = 0.06; // rad/s, stops permanently on first drag

// --- Assembly intro timing -------------------------------------------------

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
/** Small overshoot-then-settle — used for the keys so they read as landing, not just sliding into place. */
const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

interface AssemblyConfig {
  delay: number;
  duration: number;
  /** Offset from the part's authored resting position while fully scattered. */
  scatter: readonly [number, number, number];
  /** Radians/second of tumble while waiting; also the (fixed) angle-at-`delay` the arrival lerps down from. */
  tumble: readonly [number, number, number];
  ease?: (t: number) => number;
}

/**
 * Drives `obj` from a scattered, tumbling starting pose into its authored
 * resting pose (local identity transform) over one `AssemblyConfig`. `obj`
 * must be a wrapper with no other authored position/rotation of its own —
 * the part's actual placement lives on a child inside it, untouched by this
 * (see e.g. how `Keyboard` nests a positioned `<mesh>` inside the group this
 * function animates). Purely imperative — a handful of lerps per part per
 * frame, negligible even across 48 keys.
 */
function applyAssembly(obj: THREE.Object3D, elapsed: number, cfg: AssemblyConfig) {
  const ease = cfg.ease ?? easeOutCubic;
  if (elapsed <= cfg.delay) {
    obj.position.set(cfg.scatter[0], cfg.scatter[1], cfg.scatter[2]);
    obj.rotation.set(elapsed * cfg.tumble[0], elapsed * cfg.tumble[1], elapsed * cfg.tumble[2]);
    return;
  }
  const t = Math.min((elapsed - cfg.delay) / cfg.duration, 1);
  const eased = ease(t);
  obj.position.set(
    THREE.MathUtils.lerp(cfg.scatter[0], 0, eased),
    THREE.MathUtils.lerp(cfg.scatter[1], 0, eased),
    THREE.MathUtils.lerp(cfg.scatter[2], 0, eased),
  );
  // Lerps from the tumble angle it had at the exact instant `delay` ended —
  // continuous with the waiting phase above (at t=0, eased=0, so this
  // evaluates to exactly that same angle) — down to the resting angle (0).
  obj.rotation.set(
    THREE.MathUtils.lerp(cfg.delay * cfg.tumble[0], 0, eased),
    THREE.MathUtils.lerp(cfg.delay * cfg.tumble[1], 0, eased),
    THREE.MathUtils.lerp(cfg.delay * cfg.tumble[2], 0, eased),
  );
}

const BASE_ASSEMBLY: AssemblyConfig = {
  delay: 0,
  duration: 0.9,
  scatter: [-3.4, -2.2, 2.8],
  tumble: [1.4, 1.8, 0.9],
};
const TRACKPAD_ASSEMBLY: AssemblyConfig = {
  delay: 0.35,
  duration: 0.8,
  scatter: [2.6, 2.0, 2.4],
  tumble: [1.7, 1.1, 1.3],
};
// The dramatic one: starts later, flies from much further away, takes longer.
const SCREEN_ASSEMBLY: AssemblyConfig = {
  delay: 1.0,
  duration: 1.4,
  scatter: [1.2, 5.5, -6.5],
  tumble: [2.0, 2.6, 1.5],
};

const KEY_ROWS = 4;
const KEY_COLS = 12;
const KEY_WIDTH = 0.115;
const KEY_DEPTH = 0.085;
const KEY_HEIGHT = 0.012;
const KEY_GAP_X = 0.02;
const KEY_GAP_Z = 0.018;
const KEY_TOTAL_WIDTH = KEY_COLS * KEY_WIDTH + (KEY_COLS - 1) * KEY_GAP_X;
const KEY_START_X = -KEY_TOTAL_WIDTH / 2 + KEY_WIDTH / 2;
const KEY_START_Z = -0.5 + KEY_DEPTH / 2;

const KEYS_START_S = SCREEN_ASSEMBLY.delay + SCREEN_ASSEMBLY.duration; // keys only start once the screen has landed
const KEY_COL_STAGGER = 0.028; // per column → a left-to-right wave
const KEY_ROW_STAGGER = 0.05; // per row → a slight diagonal to the wave
const KEY_FALL_DURATION = 0.4;

// Everything (base/trackpad/screen flight + the keys' wave) is done by this
// point — the lid's own open animation starts here. +0.15s padding so the
// very last key visibly lands before the lid starts moving.
const ASSEMBLY_COMPLETE_S =
  KEYS_START_S + (KEY_COLS - 1) * KEY_COL_STAGGER + (KEY_ROWS - 1) * KEY_ROW_STAGGER + KEY_FALL_DURATION + 0.15;

interface CornerBracketsProps {
  width: number;
  height: number;
  centerY: number;
  z: number;
  color: string;
  armLength?: number;
  thickness?: number;
}

/** Four viewfinder-style corner brackets on the screen face — the same motif `public/images/*.svg` uses. */
function CornerBrackets({ width, height, centerY, z, color, armLength = 0.16, thickness = 0.018 }: CornerBracketsProps) {
  const hw = width / 2;
  const hh = height / 2;
  const corners: Array<[number, number]> = [
    [-1, 1],
    [1, 1],
    [-1, -1],
    [1, -1],
  ];

  return (
    <group position={[0, centerY, z]}>
      {corners.map(([sx, sy]) => (
        <group key={`${sx}-${sy}`} position={[sx * hw, sy * hh, 0]}>
          <mesh position={[(-sx * armLength) / 2, 0, 0]}>
            <boxGeometry args={[armLength, thickness, thickness]} />
            <meshBasicMaterial color={color} />
          </mesh>
          <mesh position={[0, (-sy * armLength) / 2, 0]}>
            <boxGeometry args={[thickness, armLength, thickness]} />
            <meshBasicMaterial color={color} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

interface KeyAssembly {
  x: number;
  z: number;
  assembly: AssemblyConfig;
}

/**
 * Fixed per-key layout + intro-assembly config, computed once at module
 * load — not inside the component. It only depends on the grid constants
 * above, so there's nothing to recompute per render/mount; keeping the
 * `Math.random()` scatter/tumble variety here (rather than in a `useMemo`)
 * also keeps `Keyboard`'s render itself pure, per the
 * `react-hooks/purity` rule (a `useMemo` callback still runs during render;
 * this doesn't).
 */
function buildKeyLayout(): KeyAssembly[] {
  const list: KeyAssembly[] = [];
  for (let r = 0; r < KEY_ROWS; r++) {
    for (let c = 0; c < KEY_COLS; c++) {
      const delay = KEYS_START_S + c * KEY_COL_STAGGER + r * KEY_ROW_STAGGER + Math.random() * 0.04;
      const jitter = () => (Math.random() - 0.5) * 0.5;
      list.push({
        x: KEY_START_X + c * (KEY_WIDTH + KEY_GAP_X),
        z: KEY_START_Z + r * (KEY_DEPTH + KEY_GAP_Z),
        assembly: {
          delay,
          duration: KEY_FALL_DURATION,
          scatter: [jitter(), 1.6 + Math.random() * 0.9, jitter()],
          tumble: [1 + Math.random(), 1.2 + Math.random(), 0.6 + Math.random() * 0.6],
          ease: easeOutBack,
        },
      });
    }
  }
  return list;
}

const KEY_LAYOUT = buildKeyLayout();

/**
 * A grid of raised keycaps sitting on the keyboard deck — decorative, not a
 * real per-key model. Each key gets its own `applyAssembly` wrapper and a
 * delay staggered by grid position (`KEY_COL_STAGGER`/`KEY_ROW_STAGGER`),
 * producing the diagonal "rain down in a wave" landing. Runs its own
 * `useFrame` (rather than being driven from `Laptop`'s) since it owns 48
 * independent refs no other part needs to know about.
 */
function Keyboard({ deckTopY, reducedMotion }: { deckTopY: number; reducedMotion: boolean }) {
  const keyRefs = React.useRef<Array<THREE.Group | null>>([]);

  useFrame((state) => {
    if (reducedMotion) return; // refs stay at their JSX identity transform — already the resting pose
    const elapsed = state.clock.elapsedTime;
    for (let i = 0; i < KEY_LAYOUT.length; i++) {
      const ref = keyRefs.current[i];
      if (ref) applyAssembly(ref, elapsed, KEY_LAYOUT[i].assembly);
    }
  });

  return (
    <group>
      {KEY_LAYOUT.map((k, i) => (
        <group
          key={i}
          ref={(el) => {
            keyRefs.current[i] = el;
          }}
        >
          <mesh position={[k.x, deckTopY + KEY_HEIGHT / 2, k.z]}>
            <boxGeometry args={[KEY_WIDTH, KEY_HEIGHT, KEY_DEPTH]} />
            <meshStandardMaterial color={KEY_COLOR} metalness={0.15} roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Laptop({
  reducedMotion,
  hasInteractedRef,
}: {
  reducedMotion: boolean;
  hasInteractedRef: React.MutableRefObject<boolean>;
}) {
  const spinRef = React.useRef<THREE.Group>(null);
  const bobRef = React.useRef<THREE.Group>(null);
  const screenRef = React.useRef<THREE.Group>(null);
  const baseAssemblyRef = React.useRef<THREE.Group>(null);
  const trackpadAssemblyRef = React.useRef<THREE.Group>(null);
  const screenAssemblyRef = React.useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    if (!reducedMotion) {
      if (baseAssemblyRef.current) applyAssembly(baseAssemblyRef.current, t, BASE_ASSEMBLY);
      if (trackpadAssemblyRef.current) applyAssembly(trackpadAssemblyRef.current, t, TRACKPAD_ASSEMBLY);
      if (screenAssemblyRef.current) applyAssembly(screenAssemblyRef.current, t, SCREEN_ASSEMBLY);
    }

    const assembled = reducedMotion || t >= ASSEMBLY_COMPLETE_S;

    if (spinRef.current && !reducedMotion && assembled && !hasInteractedRef.current) {
      spinRef.current.rotation.y += delta * IDLE_ROTATE_SPEED;
    }

    if (bobRef.current) {
      bobRef.current.position.y =
        !reducedMotion && assembled ? Math.sin(t * ((Math.PI * 2) / BOB_PERIOD_S)) * BOB_AMPLITUDE : 0;
    }

    if (screenRef.current) {
      if (reducedMotion) {
        screenRef.current.rotation.x = SCREEN_OPEN_ANGLE;
      } else {
        const openT = Math.min(Math.max((t - ASSEMBLY_COMPLETE_S) / OPEN_DURATION_S, 0), 1);
        const eased = easeOutCubic(openT);
        const baseAngle = THREE.MathUtils.lerp(SCREEN_CLOSED_ANGLE, SCREEN_OPEN_ANGLE, eased);
        const breathe = openT >= 1 ? Math.sin(t * ((Math.PI * 2) / BREATHE_PERIOD_S)) * BREATHE_AMPLITUDE : 0;
        screenRef.current.rotation.x = baseAngle + breathe;
      }
    }
  });

  const screenWidth = 1.88;
  const screenHeight = 1.16;
  const deckTopY = -0.368;

  return (
    <group ref={bobRef}>
      <group ref={spinRef} rotation={[0.1, -0.5, 0]}>
        {/* Base + deck + hinge + LED fly in and land together as one chassis piece. */}
        <group ref={baseAssemblyRef}>
          <mesh position={[0, -0.42, 0]}>
            <boxGeometry args={[2.1, 0.09, 1.4]} />
            <meshStandardMaterial color={BODY_COLOR} metalness={0.2} roughness={0.55} />
          </mesh>
          <mesh position={[0, -0.372, -0.12]}>
            <boxGeometry args={[1.86, 0.008, 0.85]} />
            <meshStandardMaterial color={DECK_COLOR} metalness={0.1} roughness={0.75} />
          </mesh>
          {/* Power LED */}
          <mesh position={[0.97, -0.4, 0.66]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshStandardMaterial color={GLOW_COLOR} emissive={GLOW_COLOR} emissiveIntensity={2.2} />
          </mesh>
          {/* Hinge */}
          <mesh position={[0, -0.372, -0.68]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.045, 2.1, 16]} />
            <meshStandardMaterial color={DECK_COLOR} metalness={0.25} roughness={0.5} />
          </mesh>
        </group>

        <Keyboard deckTopY={deckTopY} reducedMotion={reducedMotion} />

        <group ref={trackpadAssemblyRef}>
          <mesh position={[0, -0.371, 0.42]}>
            <boxGeometry args={[0.55, 0.006, 0.36]} />
            <meshStandardMaterial color={TRACKPAD_COLOR} metalness={0.05} roughness={0.65} />
          </mesh>
        </group>

        {/* Screen assembly: this outer wrapper only ever carries the intro
            fly-in offset (scattered → identity). The hinge pivot + open/
            close/breathe rotation stays entirely on the inner `screenRef`
            group, exactly as before the assembly intro existed — the two
            transforms compose without either needing to know about the
            other. */}
        <group ref={screenAssemblyRef}>
          <group ref={screenRef} position={[0, -0.372, -0.68]} rotation={[SCREEN_CLOSED_ANGLE, 0, 0]}>
            <mesh position={[0, screenHeight / 2, -0.03]}>
              <boxGeometry args={[2.1, screenHeight + 0.2, 0.06]} />
              <meshStandardMaterial color={BODY_COLOR} metalness={0.2} roughness={0.55} />
            </mesh>
            <mesh position={[0, screenHeight / 2, 0.005]}>
              <boxGeometry args={[screenWidth + 0.1, screenHeight + 0.1, 0.02]} />
              <meshStandardMaterial color={DECK_COLOR} metalness={0.1} roughness={0.7} />
            </mesh>
            {/* Screen base stays unlit and near-black — a full-bleed lit plane
                here would read as a solid color card, exactly the "full-bleed
                fill" / neon look the brand rebrand rejected (see Design
                System Reference → Brand). The glow lives in the smaller inset
                plane below instead: a soft, low-opacity tint with a visible
                dark margin around it, so it reads as a lit screen, not a
                flat-colored one. */}
            <mesh position={[0, screenHeight / 2, 0.018]}>
              <planeGeometry args={[screenWidth, screenHeight]} />
              <meshBasicMaterial color={SCREEN_BASE} />
            </mesh>
            <mesh position={[0, screenHeight / 2, 0.019]}>
              <planeGeometry args={[screenWidth * 0.58, screenHeight * 0.42]} />
              <meshBasicMaterial color={GLOW_COLOR} transparent opacity={0.1} />
            </mesh>
            {/* Header line — echoes the "screen header lines" detail from the SVG illustrations */}
            <mesh position={[0, screenHeight - 0.14, 0.02]}>
              <planeGeometry args={[screenWidth - 0.3, 0.028]} />
              <meshBasicMaterial color={GLOW_COLOR} transparent opacity={0.85} />
            </mesh>
            <CornerBrackets width={screenWidth} height={screenHeight} centerY={screenHeight / 2} z={0.021} color={GLOW_COLOR} />
          </group>
        </group>
      </group>
    </group>
  );
}

/**
 * Imperative OrbitControls (three.js's own `examples/jsm` build — not
 * `@react-three/drei`, which this project didn't otherwise need; see the
 * file-level doc comment on why minimal deps matter here) wired in with a
 * plain `useEffect` instead of `extend()` + JSX, which avoids augmenting
 * `@react-three/fiber`'s JSX namespace just for one element.
 */
function Controls({ hasInteractedRef }: { hasInteractedRef: React.MutableRefObject<boolean> }) {
  const { camera, gl } = useThree();
  const controlsRef = React.useRef<OrbitControlsImpl | null>(null);

  React.useEffect(() => {
    const controls = new OrbitControlsImpl(camera, gl.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 3.2;
    controls.maxDistance = 7;
    controls.minPolarAngle = 0.5;
    controls.maxPolarAngle = 1.35;
    controls.target.set(0, 0.15, 0);
    controls.update();

    const markInteracted = () => {
      hasInteractedRef.current = true;
    };
    controls.addEventListener("start", markInteracted);
    controlsRef.current = controls;

    return () => {
      controls.removeEventListener("start", markInteracted);
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, gl, hasInteractedRef]);

  useFrame(() => {
    controlsRef.current?.update();
  });

  return null;
}

function Scene({ reducedMotion }: { reducedMotion: boolean }) {
  const hasInteractedRef = React.useRef(false);

  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 4, 3]} intensity={1.15} />
      <directionalLight position={[-2, 1.5, -1]} intensity={0.35} />
      <pointLight position={[-2.5, 1, -2]} intensity={0.4} color={GLOW_COLOR} />
      <pointLight position={[0, 0.7, -0.3]} intensity={0.3} color={GLOW_COLOR} />
      <Laptop reducedMotion={reducedMotion} hasInteractedRef={hasInteractedRef} />
      <Controls hasInteractedRef={hasInteractedRef} />
    </>
  );
}

export default function Hero3DLaptop({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      camera={{ fov: 32, position: [0, 0.6, 4.6] }}
      style={{ width: "100%", height: "100%", touchAction: "none", cursor: "grab" }}
      frameloop="always"
    >
      <Scene reducedMotion={reducedMotion} />
    </Canvas>
  );
}
