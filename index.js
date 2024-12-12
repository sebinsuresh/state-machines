
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
 * @property {() => State} getCurrentState
 * @property {(string) => boolean} transition
 */

/**
 * @param {string} startStateName
 * @param {State[]} states
 * @returns {StateMachine | null}
 */
const createMachine = (startStateName, states) => {
    let activeState = states.find(s => s.name === startStateName);
    if (!activeState) {
        console.error(`unable to create state machine - start state with name '${startStateName}' not found`);
        return null;
    }

    activeState.onEnter();
    console.log("======");

    return {
        getCurrentState: () => activeState,
        transition: (targetName) => {
            const nextState = states.find(s => s.name === targetName);
            if (!nextState) {
                console.error(`unable to transition - state with name '${targetName}' not found`);
                console.log("======");
                return false;
            }
            const transition = activeState.transitions[targetName];
            if (!transition) {
                console.error(`unable to transition - '${activeState.name}' -> '${targetName}' effect not defined`);
                console.log("======");
                return false;
            }

            activeState.onExit();
            transition.effect();
            nextState.onEnter();
            activeState = nextState;
            console.log("======");
            return true;
        }
    }
}

/** @type {State[]} */
const states = [
    {
        name: "start",
        transitions: {
            "drawing": {
                effect: () => {
                    console.log(`side effect: 'start' -> 'drawing'`);
                }
            },
        },
        onEnter: () => {
            console.log(`entering 'start' state`);
        },
        onExit: () => {
            console.log(`leaving 'start' state`);
        },
    },
    {
        name: "drawing",
        transitions: {
            "end": {
                effect: () => {
                    console.log(`side effect: 'drawing' -> 'end'`);
                }
            },
        },
        onEnter: () => {
            console.log(`entering 'drawing' state`);
        },
        onExit: () => {
            console.log(`leaving 'drawing' state`);
        },
    }, {
        name: "end",
        transitions: {
            "start": {
                effect: () => {
                    console.log(`side effect: 'end' -> 'start'`);
                }
            },
        },
        onEnter: () => {
            console.log(`entering 'end' state`);
        },
        onExit: () => {
            console.log(`leaving 'end' state`);
        },
    }
];

const appStateMachine = createMachine("start", states);

// valid transitions
console.log(`(Current state: '${appStateMachine.getCurrentState().name}')`);
appStateMachine.transition("drawing");
console.log(`(Current state: '${appStateMachine.getCurrentState().name}')`);
appStateMachine.transition("end");
console.log(`(Current state: '${appStateMachine.getCurrentState().name}')`);
appStateMachine.transition("start");
console.log(`(Current state: '${appStateMachine.getCurrentState().name}')`);

// invalid transitions
appStateMachine.transition("invalid");
console.log(`(Current state: '${appStateMachine.getCurrentState().name}')`);
appStateMachine.transition("end");
console.log(`(Current state: '${appStateMachine.getCurrentState().name}')`);

// valid transition again
appStateMachine.transition("drawing");
console.log(`(Current state: '${appStateMachine.getCurrentState().name}')`);
