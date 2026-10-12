import {useEffect, useRef, type MutableRefObject, type RefObject} from 'react';

/** Actions that can be triggered by the user. */
export type InputAction =
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'confirm'
  | 'cancel'
  | 'tap';

export interface PointerState {
  nx: number;
  ny: number;
  clientX: number;
  clientY: number;
  down: boolean;
}

export interface InputSnapshot {
  actions: Record<InputAction, boolean>;
  pointer: PointerState;
  joystickVector: {x: number; y: number};
}

const ACTION_KEYS: Record<string, InputAction> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
  a: 'left',
  d: 'right',
  w: 'up',
  s: 'down',
  Enter: 'confirm',
  ' ': 'confirm',
  Escape: 'cancel',
};

function createEmptyActions(): Record<InputAction, boolean> {
  return {
    left: false,
    right: false,
    up: false,
    down: false,
    confirm: false,
    cancel: false,
    tap: false,
  };
}

export function useInput(
  containerRef: RefObject<HTMLDivElement | null>,
  options: {enabled?: boolean} = {},
): MutableRefObject<InputSnapshot> {
  const {enabled = true} = options;
  const inputRef = useRef<InputSnapshot>({
    actions: createEmptyActions(),
    pointer: {nx: 0, ny: 0, clientX: 0, clientY: 0, down: false},
    joystickVector: {x: 0, y: 0},
  });

  useEffect(() => {
    if (!enabled) {
      inputRef.current.actions = createEmptyActions();
      inputRef.current.pointer = {nx: 0, ny: 0, clientX: 0, clientY: 0, down: false};
      inputRef.current.joystickVector = {x: 0, y: 0};
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const action = ACTION_KEYS[event.key];
      if (!action) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
        event.preventDefault();
      }
      inputRef.current.actions[action] = true;
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const action = ACTION_KEYS[event.key];
      if (!action) return;
      inputRef.current.actions[action] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    const resetKeys = () => { inputRef.current.actions = createEmptyActions(); };
    window.addEventListener('blur', resetKeys);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', resetKeys);
    };
  }, [containerRef, enabled]);

  return inputRef;
}
