export type ScanState = 'idle' | 'typing' | 'submitted';

const TYPING_IDLE_TIMEOUT_MS = 1500;
const SUBMITTED_DURATION_MS = 3500;

let currentState: ScanState = 'idle';
let activeTimerId: number | null = null;
const listeners = new Set<() => void>();

function clearActiveTimer() {
  if (activeTimerId !== null && typeof window !== 'undefined') {
    window.clearTimeout(activeTimerId);
    activeTimerId = null;
  }
}

function emit(nextState: ScanState) {
  if (currentState === nextState) return;
  currentState = nextState;
  listeners.forEach((listener) => listener());
}

export function getScanState(): ScanState {
  return currentState;
}

export function getScanServerSnapshot(): ScanState {
  return 'idle';
}

export function subscribeScanState(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setScanTyping(hasText: boolean): void {
  clearActiveTimer();

  if (!hasText) {
    emit('idle');
    return;
  }

  emit('typing');
  if (typeof window !== 'undefined') {
    activeTimerId = window.setTimeout(() => {
      activeTimerId = null;
      emit('idle');
    }, TYPING_IDLE_TIMEOUT_MS);
  }
}

export function triggerScanSubmitted(): void {
  clearActiveTimer();
  emit('submitted');

  if (typeof window !== 'undefined') {
    activeTimerId = window.setTimeout(() => {
      activeTimerId = null;
      emit('idle');
    }, SUBMITTED_DURATION_MS);
  }
}
