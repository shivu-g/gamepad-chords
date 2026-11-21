// chord_wheel.js  --  display for the gamepad chord device, for use in a Max [jsui] object
// Draws the left-stick wheel (chord roots, with chord names), the right-stick wheel
// (extensions/qualities), the stick positions, and the current chord name.
// Messages come from outlet 2 of gamepad_chords.js:
//   name <text...> | state mode lsec rsec lx ly rx ry lact ract sounding | labelsL ... | labelsR ...
// Suggested jsui size: 520 x 160.  ES5 only.

autowatch = 1;
inlets = 1;
outlets = 0;

mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

var chordName = "-";
var arrL = [], arrR = [];
var mode = 1, lsec = -1, rsec = -1, lx = 0, ly = 0, rx = 0, ry = 0, lact = 0, ract = 0, snd = 0;
var dirty = true;

// redraw at most ~30x per second, however fast the gamepad sends events
var redrawTask = new Task(function () {
  if (dirty) { dirty = false; mgraphics.redraw(); }
}, this);
redrawTask.interval = 33;
redrawTask.repeat();

function name() { chordName = arrayfromargs(arguments).join(" "); dirty = true; }
function state() {
  var a = arrayfromargs(arguments);
  mode = a[0]; lsec = a[1]; rsec = a[2];
  lx = a[3]; ly = a[4]; rx = a[5]; ry = a[6];
  lact = a[7]; ract = a[8]; snd = a[9];
  dirty = true;
}
function labelsL() { arrL = arrayfromargs(arguments).map(String); dirty = true; }
function labelsR() { arrR = arrayfromargs(arguments).map(String); dirty = true; }

function size() {
  var w = 520, h = 160;
  try { var s = mgraphics.size; if (s && s[0] > 0 && s[1] > 0) { w = s[0]; h = s[1]; } } catch (e) { }
  return [w, h];
}

function centredText(str, x, y) {
  var m = mgraphics.text_measure(str);
  mgraphics.move_to(x - m[0] / 2, y + m[1] / 4);
  mgraphics.show_text(str);
}

// n wedges, section 0 centred straight up, clockwise
function wheel(cx, cy, r, labels, active, sx, sy, isActive, fontSize) {
  var n = labels.length;
  var i;
  if (n === 0) return;
  var step = 2 * Math.PI / n;
  for (i = 0; i < n; i++) {
    var a0 = -Math.PI / 2 + (i - 0.5) * step;
    mgraphics.move_to(cx, cy);
    mgraphics.arc(cx, cy, r, a0, a0 + step);
    mgraphics.close_path();
    if (i === active) mgraphics.set_source_rgba(1.0, 0.62, 0.10, 0.95);
    else mgraphics.set_source_rgba(1, 1, 1, 0.06 + (i % 2) * 0.05);
    mgraphics.fill();

    mgraphics.move_to(cx, cy);
    mgraphics.arc(cx, cy, r, a0, a0 + step);
    mgraphics.close_path();
    mgraphics.set_source_rgba(1, 1, 1, 0.25);
    mgraphics.set_line_width(1);
    mgraphics.stroke();
  }

  mgraphics.select_font_face("Arial");
  mgraphics.set_font_size(fontSize);
  for (i = 0; i < n; i++) {
    var am = -Math.PI / 2 + i * step;
    mgraphics.set_source_rgba(i === active ? 0 : 1, i === active ? 0 : 1, i === active ? 0 : 1, i === active ? 1 : 0.85);
    centredText(labels[i], cx + Math.cos(am) * r * 0.70, cy + Math.sin(am) * r * 0.70);
  }

  // stick position (y is +1 = up)
  var px = cx + Math.max(-1, Math.min(1, sx)) * r * 0.92;
  var py = cy - Math.max(-1, Math.min(1, sy)) * r * 0.92;
  mgraphics.ellipse(px - 5, py - 5, 10, 10);
  if (isActive) mgraphics.set_source_rgba(1, 1, 1, 1);
  else mgraphics.set_source_rgba(1, 1, 1, 0.45);
  mgraphics.fill();
}

function paint() {
  var sz = size();
  var h = sz[1];
  var r1 = Math.min(h / 2 - 8, 74);
  var r2 = Math.min(h / 2 - 12, 60);
  var cx1 = r1 + 8, cy1 = h / 2;
  var cx2 = cx1 + r1 + r2 + 18, cy2 = h / 2;

  wheel(cx1, cy1, r1, arrL, lsec, lx, ly, lact, 10);
  wheel(cx2, cy2, r2, arrR, rsec, rx, ry, ract, 9);

  mgraphics.select_font_face("Arial");
  mgraphics.set_font_size(9);
  mgraphics.set_source_rgba(1, 1, 1, 0.5);
  centredText("LEFT  root", cx1, h - 3);
  centredText("RIGHT  " + (mode ? "extension" : "quality"), cx2, h - 3);

  var tx = cx2 + r2 + 24;
  mgraphics.set_font_size(30);
  if (snd) mgraphics.set_source_rgba(1.0, 0.62, 0.10, 1);
  else mgraphics.set_source_rgba(1, 1, 1, 0.75);
  mgraphics.move_to(tx, cy1 + 10);
  mgraphics.show_text(chordName);
}

function onresize() { dirty = true; }
