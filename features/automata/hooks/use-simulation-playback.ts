'use client';

import { useEffect } from 'react';
import { useSimulationStore } from '../store/simulation-store';
import type { Automaton } from 'types/automaton';

/** Avanza automáticamente los pasos de simulación mientras `isPlaying` está activo. */
export function useSimulationPlayback(automaton: Automaton) {
  const isPlaying = useSimulationStore((s) => s.isPlaying);
  const playbackSpeedMs = useSimulationStore((s) => s.playbackSpeedMs);
  const trace = useSimulationStore((s) => s.trace);
  const nextStep = useSimulationStore((s) => s.nextStep);
  const pausePlayback = useSimulationStore((s) => s.pausePlayback);

  useEffect(() => {
    if (!isPlaying || !trace || trace.steps.length === 0) return;

    const timer = window.setInterval(() => {
      const state = useSimulationStore.getState();
      if (!state.isPlaying || !state.trace) return;

      const atEnd =
        state.currentStepIndex >= state.trace.steps.length - 1;
      if (atEnd) {
        pausePlayback();
        return;
      }
      nextStep();
    }, playbackSpeedMs);

    return () => window.clearInterval(timer);
  }, [isPlaying, trace, playbackSpeedMs, nextStep, pausePlayback, automaton]);
}
