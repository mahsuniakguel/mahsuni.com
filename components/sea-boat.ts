// A small wooden rowboat with someone fishing, seen from behind against the
// moonlight. Drawn in local units: the boat is ~100 wide, the waterline is y = 0.

const WOOD = "#241b14";
const PLANK = "#31261c";
const FIGURE = "#0c0f11";
const WATER = "rgb(11 16 19 / 0.88)";

function light(alpha: number) {
  return `rgb(240 234 222 / ${Math.max(0, alpha).toFixed(3)})`;
}

const sheer = new Path2D();
sheer.moveTo(-50, -15);
sheer.quadraticCurveTo(0, -11, 50, -19);

const hull = new Path2D();
hull.moveTo(-50, -15);
hull.quadraticCurveTo(0, -11, 50, -19);
hull.quadraticCurveTo(46, -6, 36, 2);
hull.quadraticCurveTo(0, 6, -42, 2);
hull.closePath();

// Seated, back to the viewer, a little hunched.
const torso = new Path2D();
torso.moveTo(-20, -12);
torso.lineTo(-19, -30);
torso.quadraticCurveTo(-18, -41, -8, -41.5);
torso.quadraticCurveTo(2, -41, 3, -31);
torso.lineTo(4, -12);
torso.closePath();

const shoulders = new Path2D();
shoulders.moveTo(-18.5, -33);
shoulders.quadraticCurveTo(-17.5, -41, -8, -41.5);
shoulders.quadraticCurveTo(1.5, -41, 2.6, -34);

const ROD_GRIP = { x: 11, y: -28 };
export const ROD_TIP = { x: 72, y: -86 };

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

  // Shadow on the water, which also hides the glints behind the hull.
  ctx.fillStyle = "rgb(4 7 9 / 0.6)";
  ctx.beginPath();
  ctx.ellipse(x - 2 * s, y + 2.5 * s, 56 * s, 4.5 * s, 0, 0, Math.PI * 2);
  ctx.fill();

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

  // Rod, catching a little moonlight.
  ctx.lineCap = "round";
  ctx.strokeStyle = light(0.32);
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(ROD_GRIP.x, ROD_GRIP.y);
  ctx.quadraticCurveTo(44, -62, ROD_TIP.x, ROD_TIP.y);
  ctx.stroke();

  // The fisher.
  ctx.translate(-8, 0);
  ctx.fillStyle = FIGURE;
  ctx.fill(torso);
  ctx.strokeStyle = FIGURE;
  ctx.lineWidth = 4.5;
  ctx.beginPath();
  ctx.moveTo(1, -35);
  ctx.quadraticCurveTo(9, -33, ROD_GRIP.x + 8, ROD_GRIP.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-8, -48, 6.5, 0, Math.PI * 2);
  ctx.fill();
  // Knit cap.
  ctx.beginPath();
  ctx.ellipse(-8, -50, 7.2, 6, 0, Math.PI, 0);
  ctx.fill();

  ctx.strokeStyle = light(0.26);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(-8, -50, 7.2, 6, 0, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  ctx.strokeStyle = light(0.16);
  ctx.stroke(shoulders);
  ctx.translate(8, 0);

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

  // Moonlight along the gunwale and the bow.
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
