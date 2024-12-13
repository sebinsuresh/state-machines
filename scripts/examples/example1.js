function example1() {
  /** @type {State[]} */
  const states = [
    {
      name: "start",
      transitions: {
        drawing: {
          effect: () => {
            console.log(`side effect: 'start' -> 'drawing'`);
          },
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
        end: {
          effect: () => {
            console.log(`side effect: 'drawing' -> 'end'`);
          },
        },
      },
      onEnter: () => {
        console.log(`entering 'drawing' state`);
      },
      onExit: () => {
        console.log(`leaving 'drawing' state`);
      },
    },
    {
      name: "end",
      transitions: {
        start: {
          effect: () => {
            console.log(`side effect: 'end' -> 'start'`);
          },
        },
      },
      onEnter: () => {
        console.log(`entering 'end' state`);
      },
      onExit: () => {
        console.log(`leaving 'end' state`);
      },
    },
  ];

  const appStateMachine = createStateMachine("start", states);
  if (!appStateMachine) {
    return;
  }

  // valid transitions
  console.log(`(Current state: '${appStateMachine.getCurrentState()?.name ?? "UNDEFINED"}')`);
  appStateMachine.transition("drawing");
  console.log(`(Current state: '${appStateMachine.getCurrentState()?.name ?? "UNDEFINED"}')`);
  appStateMachine.transition("end");
  console.log(`(Current state: '${appStateMachine.getCurrentState()?.name ?? "UNDEFINED"}')`);
  appStateMachine.transition("start");
  console.log(`(Current state: '${appStateMachine.getCurrentState()?.name ?? "UNDEFINED"}')`);

  // invalid transitions
  appStateMachine.transition("invalid");
  console.log(`(Current state: '${appStateMachine.getCurrentState()?.name ?? "UNDEFINED"}')`);
  appStateMachine.transition("end");
  console.log(`(Current state: '${appStateMachine.getCurrentState()?.name ?? "UNDEFINED"}')`);

  // valid transition again
  appStateMachine.transition("drawing");
  console.log(`(Current state: '${appStateMachine.getCurrentState()?.name ?? "UNDEFINED"}')`);
}
