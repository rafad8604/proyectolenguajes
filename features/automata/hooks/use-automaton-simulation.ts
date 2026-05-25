'use client';

import { useCallback, useState } from 'react';
import {
  buildSimulationTrace,
  type SimulationOutcome,
  type SimulationTrace,
} from 'lib/core/automata';
import type { Automaton } from 'types/automaton';
import { PLAYBACK_SPEED_OPTIONS } from '../store/simulation-store';

export interface AutomatonSimulationController {
  input: string;
  trace: SimulationTrace | null;
  currentStepIndex: number;
  playbackSpeedMs: number;
  isPlaying: boolean;
  setInput: (input: string) => void;
  setPlaybackSpeed: (ms: number) => void;
  run: (automaton: Automaton) => void;
  goToStep: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  startPlayback: (automaton: Automaton) => void;
  pausePlayback: () => void;
  reset: () => void;
  getCurrentOutcome: () => SimulationOutcome;
}

export function useAutomatonSimulation(
  initialInput = ''
): AutomatonSimulationController {
  const [input, setInputState] = useState(initialInput);
  const [trace, setTrace] = useState<SimulationTrace | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [playbackSpeedMs, setPlaybackSpeedMs] = useState<number>(
    PLAYBACK_SPEED_OPTIONS[1].ms
  );
  const [isPlaying, setIsPlaying] = useState(false);

  const setInput = useCallback((value: string) => {
    setInputState(value);
    setTrace(null);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, []);

  const run = useCallback(
    (automaton: Automaton) => {
      const nextTrace = buildSimulationTrace(automaton, input);
      setTrace(nextTrace);
      setCurrentStepIndex(0);
      setIsPlaying(false);
    },
    [input]
  );

  const goToStep = useCallback(
    (index: number) => {
      if (!trace || trace.steps.length === 0) return;
      const max = trace.steps.length - 1;
      setCurrentStepIndex(Math.max(0, Math.min(index, max)));
      setIsPlaying(false);
    },
    [trace]
  );

  const nextStep = useCallback(() => {
    if (!trace || trace.steps.length === 0) return;
    const max = trace.steps.length - 1;
    if (currentStepIndex >= max) {
      setIsPlaying(false);
      return;
    }
    setCurrentStepIndex((i) => i + 1);
  }, [trace, currentStepIndex]);

  const prevStep = useCallback(() => {
    setCurrentStepIndex((i) => Math.max(i - 1, 0));
    setIsPlaying(false);
  }, []);

  const startPlayback = useCallback(
    (automaton: Automaton) => {
      const activeTrace = trace ?? buildSimulationTrace(automaton, input);
      if (activeTrace.error || activeTrace.steps.length === 0) {
        setTrace(activeTrace);
        setIsPlaying(false);
        return;
      }
      const atEnd = currentStepIndex >= activeTrace.steps.length - 1;
      setTrace(activeTrace);
      setCurrentStepIndex(atEnd ? 0 : currentStepIndex);
      setIsPlaying(true);
    },
    [trace, input, currentStepIndex]
  );

  const pausePlayback = useCallback(() => setIsPlaying(false), []);

  const reset = useCallback(() => {
    setTrace(null);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, []);

  const getCurrentOutcome = useCallback((): SimulationOutcome => {
    if (!trace || trace.steps.length === 0) return 'idle';
    return trace.steps[currentStepIndex]?.outcome ?? trace.finalOutcome;
  }, [trace, currentStepIndex]);

  return {
    input,
    trace,
    currentStepIndex,
    playbackSpeedMs,
    isPlaying,
    setInput,
    setPlaybackSpeed: setPlaybackSpeedMs,
    run,
    goToStep,
    nextStep,
    prevStep,
    startPlayback,
    pausePlayback,
    reset,
    getCurrentOutcome,
  };
}
