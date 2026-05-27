import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import type { Automaton } from 'types/automaton';
import {
  stashThompsonNfaForConversion,
  readThompsonNfaForConversion,
  clearThompsonNfaForConversion,
  THOMPSON_CONVERSION_STORAGE_KEY,
} from '../conversion-handoff';

const sampleNfa: Automaton = {
  id: 'nfa-1',
  name: 'Thompson AFND',
  type: 'nfa',
  alphabet: ['a'],
  states: [
    {
      id: 'q0',
      name: 'q0',
      isInitial: true,
      isAccepting: false,
      position: { x: 0, y: 0 },
    },
  ],
  transitions: [],
  initialStateId: 'q0',
  acceptingStateIds: [],
};

function installSessionStorageMock() {
  const store = new Map<string, string>();
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  });
}

describe('conversion-handoff', () => {
  beforeEach(() => {
    installSessionStorageMock();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('guarda y lee el AFND de Thompson', () => {
    stashThompsonNfaForConversion(sampleNfa);
    const restored = readThompsonNfaForConversion();
    expect(restored).toEqual(sampleNfa);
  });

  it('elimina el AFND guardado', () => {
    stashThompsonNfaForConversion(sampleNfa);
    clearThompsonNfaForConversion();
    expect(sessionStorage.getItem(THOMPSON_CONVERSION_STORAGE_KEY)).toBeNull();
    expect(readThompsonNfaForConversion()).toBeNull();
  });

  it('rechaza JSON inválido', () => {
    sessionStorage.setItem(THOMPSON_CONVERSION_STORAGE_KEY, '{"invalid":true}');
    expect(readThompsonNfaForConversion()).toBeNull();
  });
});
