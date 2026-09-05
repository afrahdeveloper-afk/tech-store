"use client";

import * as React from "react";

/**
 * Catches render-time failures from the 3D canvas (e.g. WebGL unavailable/
 * disabled on an otherwise-desktop browser) and falls back to `children`
 * (the static hero image) instead of taking down the hero section — error
 * boundaries must be class components, React has no Hook equivalent yet.
 * Per CLAUDE.md's error-state rule: never expose a raw technical failure,
 * degrade gracefully.
 */
export class Hero3DErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Hero 3D visual failed to render, falling back to static image:", error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
