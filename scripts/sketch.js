// import p5 from "./node_modules/p5/lib/p5.min.js";

/**
 * @typedef {import("p5").Image} P5Image
 * @typedef {import("p5").Element} P5Element
 * @typedef {import("p5").Graphics} P5Graphics
 **/

/** @type {import("p5").Graphics}*/
let bgGfx;

const LINE_SEP = 32;
const HALF_LINE_SEP = LINE_SEP / 2;

const HOVERING = 1;
const DRAWING = 2;

/** @type {Object.<number, string>} */
const STATE_MAP = {
  [HOVERING]: "Hovering",
  [DRAWING]: "Drawing",
};

let currState = HOVERING;

/** @type {string | undefined} */
let lastAction = undefined;

/** @type {number[]} */
let lastPoint = [];
/** @type {number[][]} */
const linePoints = [];

// TODO: Replace with StateMachine.js
/**
 * @param {number} state
 * @param {string} action
 * @returns {number} next state
 */
function transition(state, action) {
  lastAction = action;

  const roundedMouseX = Math.round(mouseX / LINE_SEP) * LINE_SEP;
  const roundedMouseY = Math.round(mouseY / LINE_SEP) * LINE_SEP;

  if (action === "reset") {
    lastPoint = [];
    linePoints.length = 0;
    return HOVERING;
  }

  if (state === HOVERING && action === "mouseReleased") {
    lastPoint = [roundedMouseX, roundedMouseY];
    return DRAWING;
  }

  if (state === DRAWING && action === "mouseReleased") {
    // if same cell, cancel
    if (roundedMouseX === lastPoint[0] && roundedMouseY === lastPoint[1]) {
      lastPoint = [];
      return HOVERING;
    }

    let minX = lastPoint[0],
      minY = lastPoint[1],
      maxX = roundedMouseX,
      maxY = roundedMouseY;
    if (roundedMouseX < lastPoint[0]) {
      minX = roundedMouseX;
      minY = roundedMouseY;
      maxX = lastPoint[0];
      maxY = lastPoint[1];
    }

    // if different cell and existing line, remove it
    const foundIndex = linePoints.findIndex(
      (l) => l[0] === minX && l[1] === minY && l[2] === maxX && l[3] === maxY
    );
    if (foundIndex > -1) {
      linePoints.splice(foundIndex, 1);
      lastPoint = [];
      return HOVERING;
    }

    // if different cell and no line exists, add line
    linePoints.push([minX, minY, maxX, maxY]);

    // if shift was held down, continue drawing line from there
    if (keyIsDown(SHIFT)) {
      lastPoint = [roundedMouseX, roundedMouseY];
      return DRAWING;
    }

    return HOVERING;
  }

  if (state === HOVERING && action === "cancel") {
    // nothing happened
    // do nothing
    lastAction = undefined;
    return HOVERING;
  }

  if (state === DRAWING && action === "cancel") {
    lastPoint = [];
    return HOVERING;
  }

  alert("invalid transition error");
  lastPoint = [];
  return HOVERING;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  bgGfx = createGraphics(width, height);
  drawGridToBuffer(bgGfx);
  cursor(HAND);

  // example1();
}

function draw() {
  clearCanvas();
  drawGrid();
  drawCursor();
  drawLines();

  drawDebugText();
}

function drawDebugText() {
  noStroke();
  fill(255);
  let debugTextHeight = 16;
  let debugTextCurrY = 50;
  textSize(debugTextHeight);
  text(`state: ${STATE_MAP[currState]}`, 50, debugTextCurrY);

  debugTextCurrY += debugTextHeight + 2;
  text(`lastAction: ${lastAction ?? ""}`, 50, debugTextCurrY);

  debugTextCurrY += debugTextHeight + 2;
  text(`lastPoint: ${lastPoint}`, 50, debugTextCurrY);
}

function drawLines() {
  noStroke();
  fill(200);
  const padding = 4;

  if (lastPoint.length === 2) {
    square(
      Math.round(lastPoint[0] / LINE_SEP) * LINE_SEP - HALF_LINE_SEP + padding,
      Math.round(lastPoint[1] / LINE_SEP) * LINE_SEP - HALF_LINE_SEP + padding,
      LINE_SEP - 2 * padding,
      padding
    );
  }

  for (let linePoint of linePoints) {
    stroke(150);
    strokeWeight(4);
    drawingContext.setLineDash([]);
    line(linePoint[0], linePoint[1], linePoint[2], linePoint[3]);

    noStroke();
    fill(200);
    square(
      linePoint[0] - HALF_LINE_SEP + padding,
      linePoint[1] - HALF_LINE_SEP + padding,
      LINE_SEP - 2 * padding,
      padding
    );
    square(
      linePoint[2] - HALF_LINE_SEP + padding,
      linePoint[3] - HALF_LINE_SEP + padding,
      LINE_SEP - 2 * padding,
      padding
    );
  }
}

function drawCursor() {
  const padding = 4;

  if (currState === DRAWING && lastPoint.length === 2) {
    stroke(150);
    strokeWeight(3);
    drawingContext.setLineDash([8]);
    line(
      lastPoint[0],
      lastPoint[1],
      Math.round(mouseX / LINE_SEP) * LINE_SEP,
      Math.round(mouseY / LINE_SEP) * LINE_SEP
    );
  }

  noStroke();
  fill(200);
  square(
    Math.round(mouseX / LINE_SEP) * LINE_SEP - HALF_LINE_SEP + padding + 4,
    Math.round(mouseY / LINE_SEP) * LINE_SEP - HALF_LINE_SEP + padding + 4,
    LINE_SEP - 2 * padding - 8,
    padding
  );
}

function drawGrid() {
  image(bgGfx, 0, 0);
}

/** @param {P5Graphics} gfx */
function drawGridToBuffer(gfx) {
  gfx.stroke(60);
  gfx.clear();

  const numSepH = Math.ceil((width - HALF_LINE_SEP) / LINE_SEP);
  const numSepV = Math.ceil((height - HALF_LINE_SEP) / LINE_SEP);

  for (let x = 0; x < numSepH; x++) {
    gfx.line(x * LINE_SEP + HALF_LINE_SEP, 0, x * LINE_SEP + HALF_LINE_SEP, height);
  }
  for (let y = 0; y < numSepV; y++) {
    gfx.line(0, y * LINE_SEP + HALF_LINE_SEP, width, y * LINE_SEP + HALF_LINE_SEP);
  }
}

function clearCanvas() {
  background(0);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  bgGfx.resizeCanvas(windowWidth, windowHeight);
  drawGridToBuffer(bgGfx);
}

function mouseReleased() {
  currState = transition(currState, "mouseReleased");
}

function keyPressed() {
  if (keyCode === ESCAPE) {
    currState = transition(currState, "cancel");
  }
  if (key.toUpperCase() === "R") {
    currState = transition(currState, "reset");
  }
}
