/**
 * @typedef {Object} TransitionEffect
 * @property {Function} effect
 *
 * @typedef {Object} State
 * @property {string} name
 * @property {Object.<string, TransitionEffect>} transitions
 * @property {Function} onEnter
 * @property {Function} onExit
 *
 * @typedef {Object} StateMachine
 * @property {() => State | undefined} getCurrentState
 * @property {(targetName: string) => boolean} transition
 *
 * @typedef {Object} CreateMachineOptions
 * @property {boolean} log Should log messages to console or not
 */

/**
 * @param {string} startStateName
 * @param {State[]} states
 * @param {CreateMachineOptions} [options]
 * @returns {StateMachine | null}
 */
const createStateMachine = (startStateName, states, options) => {
  let activeState = states.find((s) => s.name === startStateName);
  if (!activeState) {
    if (options?.log) {
      console.error(`unable to create state machine - start state with name '${startStateName}' not found`);
    }

    return null;
  }

  activeState.onEnter();
  if (options?.log) {
    console.log("======");
  }

  return {
    getCurrentState: () => activeState,
    transition: (targetName) => {
      if (!activeState) {
        if (options?.log) {
          console.error("unable to transition - no valid active state");
        }
        return false;
      }

      const nextState = states.find((s) => s.name === targetName);
      if (!nextState) {
        if (options?.log) {
          console.error(`unable to transition - state with name '${targetName}' not found`);
        }
        if (options?.log) {
          console.log("======");
        }
        return false;
      }

      const transition = activeState.transitions[targetName];
      if (!transition) {
        if (options?.log) {
          console.error(`unable to transition - '${activeState.name}' -> '${targetName}' effect not defined`);
        }
        if (options?.log) {
          console.log("======");
        }
        return false;
      }

      activeState.onExit();
      transition.effect();
      nextState.onEnter();
      activeState = nextState;
      if (options?.log) {
        console.log("======");
      }
      return true;
    },
  };
};
