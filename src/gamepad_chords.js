// gamepad_chords.js  --  chord engine for a Max for Live [js] object
// Left stick  = chord root (12 sections chromatic / circle-of-fifths, or 7 diatonic degrees)
// Right stick = chord quality (chromatic mode) or extension (diatonic mode)
// ES5 only (Max's classic js engine).
//
// INPUT: connect [gamepad] straight to the js inlet. It understands gamepad's own messages:
//   axis_left_x/y, axis_right_x/y   sticks (-1..1; invy 1 flips Y so UP = +1)
//   axis_right_trigger  0..1        velocity (30..127) of the next chord
//   axis_left_trigger   0..1        inversion by depth: light = 1st, more = 2nd, full = 3rd
//   button_a  toggle hold           button_b  toggle bass note
//   button_x  octave down           button_y  octave up
//   dpad left/right  key -/+ 1      dpad up  major/minor    dpad down  chromatic/diatonic
//   button_start  panic
// Also (for tests / UI): lx ly rx ry trig
// SETTINGS messages:
//   key 0..11 | scale 0 major,1 minor | mode 0 chromatic,1 diatonic
//   layout 0 chromatic,1 circle-of-fifths (chromatic mode only)
//   octave -2..2 | inversion 0..3 | bass 0/1 | hold 0/1
//   deadzone 0..1 | hyst 0..0.5 | settle 0..200 (ms) | vel 1..127 | invy 0/1 | panic | sync
// OUTLETS:
//   0  "pitch velocity" pairs                    -> [noteout]
//   1  "set <chordname>"                         -> a [comment] (optional)
//   2  display messages for [jsui chord_wheel.js]: name, state, labelsL, labelsR
//   3  settings feedback "<param> set <value>"   -> [route key scale ...] -> UI objects

inlets = 1;
outlets = 4;

var NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
var SCALES = [[0, 2, 4, 5, 7, 9, 11], [0, 2, 3, 5, 7, 8, 10]];

// right stick sectors, clockwise from straight up
var QUAL_ORDER = ["min", "7", "maj7", "min7", "sus2", "sus4", "dim", "aug"];
var QUAL = {
  "maj": [0, 4, 7], "min": [0, 3, 7], "7": [0, 4, 7, 10], "maj7": [0, 4, 7, 11],
  "min7": [0, 3, 7, 10], "sus2": [0, 2, 7], "sus4": [0, 5, 7], "dim": [0, 3, 6], "aug": [0, 4, 8]
};
// diatonic extensions: offsets in scale steps above the root
var EXT_ORDER = ["7th", "9th", "sus2", "sus4", "add9", "6th"];
var EXT = {
  "triad": [0, 2, 4], "7th": [0, 2, 4, 6], "9th": [0, 2, 4, 6, 8],
  "sus2": [0, 1, 4], "sus4": [0, 3, 4], "add9": [0, 2, 4, 8], "6th": [0, 2, 4, 5]
};


// Builds a chord-symbol suffix from semitone intervals above the root (values may exceed 12).
function chordSuffix(rel) {
  var h = function (n) { return rel.indexOf(n) >= 0; };
  var minor = h(3), major = h(4), p5 = h(7), d5 = h(6);
  var seventh = h(10) ? "7" : (h(11) ? "maj7" : "");
  var base = "", used7 = false;

  if (minor && d5) {
    if (seventh === "7") { base = "m7b5"; used7 = true; }
    else if (h(9)) { base = "dim7"; used7 = true; }
    else base = "dim";
  } else if (minor) base = "m";
  else if (major) base = (h(8) && !p5) ? "aug" : "";
  else if (h(5)) base = "sus4";
  else if (h(2)) base = "sus2";
  else base = "?";

  if (seventh && !used7) {
    if (base === "m") base = seventh === "7" ? "m7" : "mMaj7";
    else if (base === "sus4" || base === "sus2") base = seventh + base;
    else base += seventh;
  }
  if (h(14)) {
    if (/7$/.test(base)) base = base.replace(/7$/, "9");
    else base += (base === "m" ? "add9" : "add9");
  } else if (h(13)) base += "(b9)";
  else if (h(15)) base += "(#9)";

  if (h(9) && p5 && !seventh && !used7) base += "6";
  if (h(8) && (p5 || d5) && !(major && !p5)) base += "(b6)";
  return base;
}

var CFG = {
  key: 0, scale: 0, mode: 1, layout: 1, octave: 0, inversion: 0, bass: 0, hold: 0,
  deadzone: 0.35, hyst: 0.15, vel: 100, invy: 0, settle: 60
};
var L = { x: 0, y: 0, active: false, sec: -1 };
var R = { x: 0, y: 0, active: false, sec: -1 };
var sounding = [];
var trigInv = 0;      // inversion from the left trigger
var uiReady = false;

// ---------- input ----------
function lx(v) { L.x = v; update(); }
function ly(v) { L.y = CFG.invy ? -v : v; update(); }
function rx(v) { R.x = v; update(); }
function ry(v) { R.y = CFG.invy ? -v : v; update(); }
function trig(v) { CFG.vel = Math.round(30 + Math.max(0, Math.min(1, v)) * 97); }

// gamepad object messages
function axis_left_x(v) { lx(v); }
function axis_left_y(v) { ly(v); }
function axis_right_x(v) { rx(v); }
function axis_right_y(v) { ry(v); }
function axis_right_trigger(v) { trig(v); }
function axis_left_trigger(v) {
  var n = v < 0.2 ? 0 : Math.min(3, 1 + Math.floor((v - 0.2) / 0.8 * 3));
  if (n !== trigInv) { trigInv = n; update(true); }
}
function button_a(v) { if (v) { hold(CFG.hold ? 0 : 1); syncUI(); } }
function button_b(v) { if (v) { bass(CFG.bass ? 0 : 1); syncUI(); } }
function button_x(v) { if (v) { octave(CFG.octave - 1); syncUI(); } }
function button_y(v) { if (v) { octave(CFG.octave + 1); syncUI(); } }
function button_dpad_left(v) { if (v) { key(CFG.key - 1); syncUI(); } }
function button_dpad_right(v) { if (v) { key(CFG.key + 1); syncUI(); } }
function button_dpad_up(v) { if (v) { scale(CFG.scale ? 0 : 1); syncUI(); } }
function button_dpad_down(v) { if (v) { mode(CFG.mode ? 0 : 1); syncUI(); } }
function button_start(v) { if (v) panic(); }
function anything() { }     // ignore gamepad events we don't use (button_guide, sensors, ...)

// ---------- settings ----------
function key(v) { CFG.key = ((Math.round(v) % 12) + 12) % 12; update(true); emitLabels(); }
function scale(v) { CFG.scale = v ? 1 : 0; update(true); emitLabels(); }
function mode(v) { CFG.mode = v ? 1 : 0; L.sec = -1; R.sec = -1; update(true); emitLabels(); }
function layout(v) { CFG.layout = v ? 1 : 0; update(true); emitLabels(); }
function octave(v) { CFG.octave = Math.max(-2, Math.min(2, Math.round(v))); update(true); }
function inversion(v) { CFG.inversion = Math.max(0, Math.min(3, Math.round(v))); update(true); }
function bass(v) { CFG.bass = v ? 1 : 0; update(true); }
function hold(v) {
  CFG.hold = v ? 1 : 0;
  if (!CFG.hold && !L.active) { cancelPending(); if (sounding.length) releaseAll(); }
}
function deadzone(v) { CFG.deadzone = Math.max(0.05, Math.min(0.9, v)); }
function hyst(v) { CFG.hyst = Math.max(0, Math.min(0.5, v)); }
function settle(v) { CFG.settle = Math.max(0, Math.min(200, Math.round(v))); cancelPending(); }
function vel(v) { CFG.vel = Math.max(1, Math.min(127, Math.round(v))); }
function invy(v) { CFG.invy = v ? 1 : 0; }
function panic() {
  cancelPending();
  releaseAll();
  L.x = 0; L.y = 0; R.x = 0; R.y = 0;   // centre both sticks so the next message can't re-trigger a chord
  L.active = false; R.active = false; L.sec = -1; R.sec = -1;
  trigInv = 0;
  emitState();
}
function sync() { syncUI(); emitState(); }

// ---------- geometry ----------
function mag(s) { return Math.sqrt(s.x * s.x + s.y * s.y); }

// 0 = straight up, clockwise
function angleDeg(x, y) {
  var a = Math.atan2(x, y) * 180 / Math.PI;
  return a < 0 ? a + 360 : a;
}

// section k is centred on k*(360/n); sticky boundaries via hysteresis (in section units)
function pickSection(x, y, n, cur, h) {
  var p = angleDeg(x, y) / (360 / n);
  var nearest = Math.round(p) % n;
  if (cur < 0 || cur >= n) return nearest;
  if (nearest === cur) return cur;
  var d = Math.abs(p - cur);
  if (d > n / 2) d = n - d;
  return d > 0.5 + h ? nearest : cur;
}

function updateActive(s) {
  var m = mag(s);
  if (!s.active && m > CFG.deadzone) s.active = true;
  else if (s.active && m < CFG.deadzone * 0.7) s.active = false;
}

// ---------- chord building ----------
function sd(sc, k) { return sc[((k % 7) + 7) % 7] + 12 * Math.floor(k / 7); }

function buildChord() {
  var base = 48 + 12 * CFG.octave;
  var rel, rootPc, pitches, label, root;

  if (CFG.mode === 0) {
    rootPc = CFG.layout ? (L.sec * 7) % 12 : L.sec;
    var q = R.sec >= 0 ? QUAL_ORDER[R.sec] : "maj";
    rel = QUAL[q];
    root = base + rootPc;
    pitches = rel.map(function (r) { return root + r; });
    label = "";
  } else {
    var sc = SCALES[CFG.scale];
    var e = R.sec >= 0 ? EXT_ORDER[R.sec] : "triad";
    var steps = EXT[e];
    var rootAbs = CFG.key + sd(sc, L.sec);
    var shift = 12 * Math.floor(rootAbs / 12);
    rootPc = rootAbs % 12;
    root = base + rootAbs - shift;
    rel = steps.map(function (s) { return sd(sc, L.sec + s) - sd(sc, L.sec); });
    pitches = rel.map(function (r) { return root + r; });
    label = " [" + (L.sec + 1) + "]";
  }

  var name = NAMES[rootPc] + chordSuffix(rel) + label;

  pitches.sort(function (a, b) { return a - b; });
  var inv = Math.min(3, CFG.inversion + trigInv);
  for (var i = 0; i < inv && i < pitches.length - 1; i++) {
    pitches.push(pitches.shift() + 12);
  }
  if (CFG.bass) pitches.unshift(root - 12);
  pitches = pitches.filter(function (p) { return p >= 0 && p <= 127; });
  return { notes: pitches, name: name };
}

// ---------- output ----------
function applyChord(chord) {
  var i;
  for (i = 0; i < sounding.length; i++) {
    if (chord.notes.indexOf(sounding[i]) < 0) outlet(0, sounding[i], 0);
  }
  for (i = 0; i < chord.notes.length; i++) {
    if (sounding.indexOf(chord.notes[i]) < 0) outlet(0, chord.notes[i], CFG.vel);
  }
  sounding = chord.notes.slice();
  outlet(1, "set", chord.name);
  outlet(2, "name", chord.name);
}

function releaseAll() {
  for (var i = 0; i < sounding.length; i++) outlet(0, sounding[i], 0);
  sounding = [];
  outlet(1, "set", "-");
  outlet(2, "name", "-");
}


// ---------- settle (debounce) ----------
// A chord change only sounds once the stick has stayed on it for CFG.settle ms, so sections
// the stick merely sweeps through (e.g. F between Dm and G) never play. Onset waits half as long.
var pendingChord = null;
var settleTask = new Task(commitPending, this);

function sameNotes(a, b) { return a.length === b.length && a.join(",") === b.join(","); }
function cancelPending() { pendingChord = null; settleTask.cancel(); }
function commitPending() {
  if (pendingChord) { var c = pendingChord; pendingChord = null; applyChord(c); }
}
function requestChord(chord, immediate) {
  if (sameNotes(chord.notes, sounding)) { cancelPending(); return; }
  if (immediate || CFG.settle <= 0) { cancelPending(); applyChord(chord); return; }
  if (pendingChord && sameNotes(pendingChord.notes, chord.notes)) return;   // already waiting on this one
  pendingChord = chord;
  settleTask.cancel();
  settleTask.schedule(sounding.length ? CFG.settle : Math.round(CFG.settle / 2));
}

// ---------- display / UI feedback ----------
function labelsLeft() {
  var out = [], i;
  if (CFG.mode === 0) {
    for (i = 0; i < 12; i++) out.push(NAMES[CFG.layout ? (i * 7) % 12 : i]);
  } else {
    var sc = SCALES[CFG.scale];
    for (i = 0; i < 7; i++) {
      var r = [0, sd(sc, i + 2) - sd(sc, i), sd(sc, i + 4) - sd(sc, i)];
      out.push(NAMES[(CFG.key + sd(sc, i)) % 12] + chordSuffix(r));
    }
  }
  return out;
}
function labelsRight() { return CFG.mode === 0 ? QUAL_ORDER.slice() : EXT_ORDER.slice(); }

function emitLabels() {
  outlet.apply(this, [2, "labelsL"].concat(labelsLeft()));
  outlet.apply(this, [2, "labelsR"].concat(labelsRight()));
}
function emitState() {
  if (!uiReady) { uiReady = true; emitLabels(); }
  outlet(2, "state", CFG.mode, L.sec, R.sec, L.x, L.y, R.x, R.y, L.active ? 1 : 0, R.active ? 1 : 0, sounding.length ? 1 : 0);
}
function syncUI() {
  outlet(3, "key", "set", CFG.key);
  outlet(3, "scale", "set", CFG.scale);
  outlet(3, "mode", "set", CFG.mode);
  outlet(3, "octave", "set", CFG.octave);
  outlet(3, "hold", "set", CFG.hold);
  outlet(3, "bass", "set", CFG.bass);
  emitLabels();
}

function update(force) {
  updateCore(force);
  emitState();
}

function updateCore(force) {
  updateActive(L);
  updateActive(R);

  var nR0 = CFG.mode === 0 ? QUAL_ORDER.length : EXT_ORDER.length;
  R.sec = R.active ? pickSection(R.x, R.y, nR0, R.sec, CFG.hyst) : -1;

  if (!L.active) {
    L.sec = -1;
    cancelPending();
    if (!CFG.hold) { if (sounding.length) releaseAll(); }
    return;
  }
  var nL = CFG.mode === 0 ? 12 : 7;
  var nR = CFG.mode === 0 ? QUAL_ORDER.length : EXT_ORDER.length;
  L.sec = pickSection(L.x, L.y, nL, L.sec, CFG.hyst);
  R.sec = R.active ? pickSection(R.x, R.y, nR, R.sec, CFG.hyst) : -1;

  requestChord(buildChord(), force);
}
