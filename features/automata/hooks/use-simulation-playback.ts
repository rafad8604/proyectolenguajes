'use client';

import { useEffect } from 'react';
import { useSimulationStore } from '../store/simulation-store';
import type { AutomatonSimulationController } from './use-automaton-simulation';
import type { Automaton } from 'types/automaton';

type PlaybackSource =
  | { mode: 'store' }
  | { mode: 'controller'; controller: AutomatonSimulationController };

/** Avanza automáticamente los pasos mientras `isPlaying` está activo. */
export function useSimulationPlayback(
  automaton: Automaton,
  source: PlaybackSource = { mode: 'store' }
) {
  const storeIsPlaying = useSimulationStore((s) => s.isPlaying);
  const storeSpeed = useSimulationStore((s) => s.playbackSpeedMs);
  const storeTrace = useSimulationStore((s) => s.trace);
  const storeNext = useSimulationStore((s) => s.nextStep);
  const storePause = useSimulationStore((s) => s.pausePlayback);

  const isPlaying =
    source.mode === 'controller'
      ? source.controller.isPlaying
      : storeIsPlaying;
  const playbackSpeedMs =
    source.mode === 'controller'
      ? source.controller.playbackSpeedMs
      : storeSpeed;
  const trace =
    source.mode === 'controller' ? source.controller.trace : storeTrace;
  const nextStep =
    source.mode === 'controller'
      ? source.controller.nextStep
      : storeNext;
  const pausePlayback =
    source.mode === 'controller'
      ? source.controller.pausePlayback
      : storePause;

  useEffect(() => {
    if (!isPlaying || !trace || trace.steps.length === 0) return;

    const timer = window.setInterval(() => {
      if (source.mode === 'controller') {
        const c = source.controller;
        if (!c.isPlaying || !c.trace) return;
        const atEnd = c.currentStepIndex >= c.trace.steps.length - 1;
        if (atEnd) {
          c.pausePlayback();
          return;
        }
        c.nextStep();
        return;
      }

      const state = useSimulationStore.getState();
      if (!state.isPlaying || !state.trace) return;
      const atEnd =
        state.currentStepIndex >= state.trace.steps.length - 1;
      if (atEnd) {
        storePause();
        return;
      }
      storeNext();
    }, playbackSpeedMs);

    return () => window.clearInterval(timer);
  }, [
    isPlaying,
    trace,
    playbackSpeedMs,
    nextStep,
    pausePlayback,
    automaton,
    source,
  ]);
}
