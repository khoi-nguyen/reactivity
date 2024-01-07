/**
 * Global stack to keep track of effects that are currently running
 * @type {(() => void)[]}
 */
const stack = [];

/**
 * Create a signal
 *
 * @template T
 * @param {T} value - current value of the signal
 * @returns {[() => T, (newValue: T) => void]} - a getter and a setter
 */
function createSignal(value) {
  // Effects that have this signal as a dependency
  // They will need to rerun when the signal value changes
  const effects = new Set();

  const getter = () => {
    // Am I called inside an effect? If so, register it
    if (stack.length > 0) {
      effects.add(stack[stack.length - 1]);
    }

    return value;
  }

  /** @param {T} nextValue - next value of the signal */
  const setter = (nextValue) => {
    value = nextValue;

    // Rerun
    for (const effect of effects) {
      effect();
    }
  };

  return [getter, setter];
}

/**
 * Create an effect
 *
 * @param {() => void} callback - Function that will be run every time one of its inner signals changes
 */
function createEffect(callback) {
  // An effect should always push itself onto the stack at the start
  // and removes itself when it finishes executing
  const effect = () => {
    stack.push(effect)
    try {
      callback();
    } finally {
      stack.pop();
    }
  }
  effect();
}
