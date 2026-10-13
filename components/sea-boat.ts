// A small wooden rowboat with someone fishing, seen from behind against the
// moonlight. Drawn in local units: the boat is ~100 wide, the waterline is y = 0.

const WOOD = "#1f1812";
const PLANK = "#2c2219";
const INSIDE = "#130f0c";
const FIGURE = "#0b0e10";
const WATER = "rgb(11 16 19 / 0.9)";

function light(alpha: number) {
  return `rgb(240 234 222 / ${Math.max(0, alpha).toFixed(3)})`;
}

type Shapes = {
  sheer: Path2D;
  hull: Path2D;
  inside: Path2D;
  farRail: Path2D;
  figure: Path2D;
  head: Path2D;
  back: Path2D;
  cap: Path2D;
};

// Built on first use: Path2D only exists in the browser.
let shapes: Shapes | null = null;

function getShapes(): Shapes {
  if (shapes) return shapes;

  // The near gunwale, which also sets the sheer of the hull.
  const sheer = new Path2D();
  sheer.moveTo(-50, -15);
  sheer.quadraticCurveTo(0, -11, 50, -19);

  const hull = new Path2D();
  hull.moveTo(-50, -15);
  hull.quadraticCurveTo(0, -11, 50, -19);
  hull.quadraticCurveTo(46, -6, 36, 2);
  hull.quadraticCurveTo(0, 6, -42, 2);
  hull.closePath();

  // Seen slightly from above, the far gunwale shows over the near one.
  const farRail = new Path2D();
  farRail.moveTo(-49, -15);
  farRail.quadraticCurveTo(0, -17, 49.5, -19.2);

  const inside = new Path2D();
  inside.moveTo(-49, -15);
  inside.quadraticCurveTo(0, -17, 49.5, -19.2);
  inside.lineTo(50, -19);
  inside.quadraticCurveTo(0, -11, -50, -15);
  inside.closePath();

  // Seated with their back to us: rounded back, sloping shoulders, neck,
  // and a head tipped slightly towards the line.
  const figure = new Path2D();
  figure.moveTo(-20, -12);
  figure.bezierCurveTo(-21.5, -22, -21, -31, -18, -35.5);
  figure.bezierCurveTo(-15.5, -38.5, -12, -39.5, -10, -40);
  figure.lineTo(-9.8, -43);
  figure.lineTo(-5.4, -43);
  figure.lineTo(-5.4, -40);
  figure.bezierCurveTo(-2, -39.5, 0.5, -38.5, 2, -35.5);
  figure.bezierCurveTo(4, -31, 4, -22, 4, -12);
  figure.closePath();

  const head = new Path2D();
  head.ellipse(-7.2, -48.2, 5.6, 6.2, 0.12, 0, Math.PI * 2);

  const back = new Path2D();
  back.moveTo(-18.4, -35);
  back.bezierCurveTo(-15.5, -38.5, -12, -39.5, -10, -40);
  back.moveTo(-5.4, -40);
  back.bezierCurveTo(-2, -39.5, 0.5, -38.5, 1.8, -35.8);

  // Knit cap: a soft dome slightly wider than the head.
  const cap = new Path2D();
  cap.ellipse(-7, -50, 6.2, 5.4, 0.12, Math.PI, Math.PI * 2);
  cap.closePath();

  shapes = { sheer, hull, inside, farRail, figure, head, back, cap };
  return shapes;
}

const ROD_GRIP = { x: 11, y: -28.5 };
const ROD_TIP = { x: 72, y: -86 };

export type BoatPose = {
  x: number; // centre, in CSS pixels
  y: number; // waterline, in CSS pixels
  scale: number;
  roll: number; // radians
  time: number;
};

// Where a local point ends up on screen for a given pose.
function toScreen(pose: BoatPose, lx: number, ly: number) {
  const cos = Math.cos(pose.roll);
  const sin = Math.sin(pose.roll);
  return {
    x: pose.x + pose.scale * (lx * cos - ly * sin),
    y: pose.y + pose.scale * (lx * sin + ly * cos),
  };
}

export function drawBoat(ctx: CanvasRenderingContext2D, pose: BoatPose) {
  const { x, y, scale: s, roll, time } = pose;
  const { sheer, hull, inside, farRail, figure, head, back, cap } = getShapes();

  // Soft shadow on the water, which also calms the glints under the hull.
  ctx.save();
  ctx.translate(x - 2 * s, y + 3 * s);
  ctx.scale(1, 0.1);
  const shade = ctx.createRadialGradient(0, 0, 0, 0, 0, 66 * s);
  shade.addColorStop(0, "rgb(4 7 9 / 0.6)");
  shade.addColorStop(0.65, "rgb(4 7 9 / 0.35)");
  shade.addColorStop(1, "rgb(4 7 9 / 0)");
  ctx.fillStyle = shade;
  ctx.fillRect(-66 * s, -66 * s, 132 * s, 132 * s);
  ctx.restore();

  // The line hangs straight down from the rod tip, whatever the boat does.
  const tip = toScreen(pose, ROD_TIP.x, ROD_TIP.y);
  const entry = { x: tip.x + 1.5 * s * Math.sin(time * 0.6), y: y - 2 * s };
  ctx.strokeStyle = light(0.2);
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.quadraticCurveTo(tip.x + 3 * s, (tip.y + entry.y) / 2, entry.x, entry.y);
  ctx.stroke();

  // Rings spreading from where the line meets the water.
  for (const offset of [0, 0.5]) {
    const phase = (time * 0.3 + offset) % 1;
    const rx = (2 + 12 * phase) * s;
    ctx.strokeStyle = light(0.22 * (1 - phase));
    ctx.lineWidth = 0.75;
    ctx.beginPath();
    ctx.ellipse(entry.x, entry.y, rx, rx * 0.2, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(roll);
  ctx.scale(s, s);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Inside of the boat and the far gunwale.
  ctx.fillStyle = INSIDE;
  ctx.fill(inside);
  ctx.strokeStyle = light(0.12);
  ctx.lineWidth = 0.8;
  ctx.stroke(farRail);

  // Rod, catching a little moonlight.
  ctx.strokeStyle = light(0.32);
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(ROD_GRIP.x - 3, ROD_GRIP.y + 2.5);
  ctx.quadraticCurveTo(44, -62, ROD_TIP.x, ROD_TIP.y);
  ctx.stroke();

  // The fisher, with an arm reaching out to the rod.
  ctx.fillStyle = FIGURE;
  ctx.fill(figure);
  ctx.fill(head);
  ctx.fill(cap);
  ctx.strokeStyle = FIGURE;
  ctx.lineWidth = 4.4;
  ctx.beginPath();
  ctx.moveTo(-0.5, -34.5);
  ctx.quadraticCurveTo(6, -33.5, ROD_GRIP.x, ROD_GRIP.y);
  ctx.stroke();

  // Moonlight on the cap, shoulders, and arm.
  ctx.strokeStyle = light(0.28);
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.ellipse(-7, -50, 6.2, 5.4, 0.12, Math.PI * 1.12, Math.PI * 1.88);
  ctx.stroke();
  ctx.strokeStyle = light(0.15);
  ctx.lineWidth = 0.8;
  ctx.stroke(back);
  ctx.beginPath();
  ctx.moveTo(1.5, -36.6);
  ctx.quadraticCurveTo(6.5, -35.8, ROD_GRIP.x + 1.2, ROD_GRIP.y - 2);
  ctx.stroke();

  // Hull, planks, and the part below the waterline.
  ctx.fillStyle = WOOD;
  ctx.fill(hull);
  ctx.save();
  ctx.clip(hull);
  ctx.strokeStyle = PLANK;
  ctx.lineWidth = 0.8;
  for (const drop of [5, 10]) {
    ctx.save();
    ctx.translate(0, drop);
    ctx.stroke(sheer);
    ctx.restore();
  }
  ctx.fillStyle = WATER;
  ctx.fillRect(-60, 0, 120, 12);
  ctx.restore();

  // Moonlight along the near gunwale and the bow.
  ctx.strokeStyle = light(0.34);
  ctx.lineWidth = 1.1;
  ctx.stroke(sheer);
  ctx.strokeStyle = light(0.14);
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(50, -19);
  ctx.quadraticCurveTo(46, -6, 39, -0.5);
  ctx.stroke();

  ctx.restore();

  // A thin bright seam where the hull meets the water.
  const left = toScreen(pose, -44, 0);
  const right = toScreen(pose, 38, 0);
  ctx.strokeStyle = light(0.1);
  ctx.lineWidth = 0.75;
  ctx.beginPath();
  ctx.moveTo(left.x, left.y);
  ctx.lineTo(right.x, right.y);
  ctx.stroke();
}

// Screen-space bounds of the boat, rod included, for layout checks.
export function boatBounds(x: number, y: number, scale: number) {
  return {
    left: x - 56 * scale,
    right: x + (ROD_TIP.x + 14) * scale,
    top: y + (ROD_TIP.y - 6) * scale,
    bottom: y + 10 * scale,
  };
}
