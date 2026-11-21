// gamepad_chords.js  --  chord engine for a Max for Live [js] object
// Left stick  = chord root (12 sections chromatic / circle-of-fifths, or 7 diatonic degrees)
// Right stick = chord quality (chromatic mode) or extension (diatonic mode)
// ES5 only (Max's classic js engine).
//
// INPUT messages (all stick values normalised to -1..1, UP = +1):
//   lx <f>  ly <f>  rx <f>  ry <f>
//   trig <f>        0..1 (e.g. a trigger axis) -> velocity 30..127
// SETTINGS messages:
//   key 0..11 | scale 0 major,1 minor | mode 0 chromatic,1 diatonic
//   layout 0 chromatic,1 circle-of-fifths (chromatic mode only)
//   octave -2..2 | inversion 0..3 | bass 0/1 | hold 0/1
//   deadzone 0..1 | hyst 0..0.5 | vel 1..127 | invy 0/1 | panic
// OUTPUT:
//   outlet 0 -> "pitch velocity" pairs (connect to [noteout])
//   outlet 1 -> "set <chordname>" (connect to a [comment])

inlets = 1;
outlets = 2;

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
var SUFFIX = {
  "0,4,7": "", "0,3,7": "m", "0,3,6": "dim", "0,4,8": "aug", "0,2,7": "sus2", "0,5,7": "sus4",
  "0,4,7,10": "7", "0,4,7,11": "maj7", "0,3,7,10": "m7", "0,3,6,10": "m7b5", "0,3,6,9": "dim7",
  "0,4,7,10,14": "9", "0,4,7,11,14": "maj9", "0,3,7,10,14": "m9", "0,4,7,14": "add9",
  "0,3,7,14": "madd9", "0,4,7,9": "6", "0,3,7,9": "m6"
};

var CFG = {
  key: 0, scale: 0, mode: 1, layout: 1, octave: 0, inversion: 0, bass: 0, hold: 0,
  deadzone: 0.35, hyst: 0.15, vel: 100, invy: 0
};
var L = { x: 0, y: 0, active: false, sec: -1 };
var R = { x: 0, y: 0, active: false, sec: -1 };
var sounding = [];

// ---------- input ----------
function lx(v) { L.x = v; update(); }
function ly(v) { L.y = CFG.invy ? -v : v; update(); }
function rx(v) { R.x = v; update(); }
function ry(v) { R.y = CFG.invy ? -v : v; update(); }
function trig(v) { CFG.vel = Math.round(30 + Math.max(0, Math.min(1, v)) * 97); }

// ---------- settings ----------
function key(v) { CFG.key = ((Math.round(v) % 12) + 12) % 12; update(true); }
function scale(v) { CFG.scale = v ? 1 : 0; update(true); }
function mode(v) { CFG.mode = v ? 1 : 0; L.sec = -1; R.sec = -1; update(true); }
function layout(v) { CFG.layout = v ? 1 : 0; update(true); }
function octave(v) { CFG.octave = Math.max(-2, Math.min(2, Math.round(v))); update(true); }
function inversion(v) { CFG.inversion = Math.max(0, Math.min(3, Math.round(v))); update(true); }
function bass(v) { CFG.bass = v ? 1 : 0; update(true); }
function hold(v) { CFG.hold = v ? 1 : 0; }
function deadzone(v) { CFG.deadzone = Math.max(0.05, Math.min(0.9, v)); }
function hyst(v) { CFG.hyst = Math.max(0, Math.min(0.5, v)); }
function vel(v) { CFG.vel = Math.max(1, Math.min(127, Math.round(v))); }
function invy(v) { CFG.invy = v ? 1 : 0; }
function panic() { releaseAll(); L.active = false; R.active = false; L.sec = -1; R.sec = -1; }

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

  var suffix = SUFFIX[rel.join(",")];
  var name = NAMES[rootPc] + (suffix === undefined ? "(" + rel.join(" ") + ")" : suffix) + label;

  pitches.sort(function (a, b) { return a - b; });
  for (var i = 0; i < CFG.inversion && i < pitches.length - 1; i++) {
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
}

function releaseAll() {
  for (var i = 0; i < sounding.length; i++) outlet(0, sounding[i], 0);
  sounding = [];
  outlet(1, "set", "-");
}

function update(force) {
  updateActive(L);
  updateActive(R);

  if (!L.active) {
    L.sec = -1;
    if (!CFG.hold) { if (sounding.length) releaseAll(); }
    return;
  }
  var nL = CFG.mode === 0 ? 12 : 7;
  var nR = CFG.mode === 0 ? QUAL_ORDER.length : EXT_ORDER.length;
  L.sec = pickSection(L.x, L.y, nL, L.sec, CFG.hyst);
  R.sec = R.active ? pickSection(R.x, R.y, nR, R.sec, CFG.hyst) : -1;

  applyChord(buildChord());
}
