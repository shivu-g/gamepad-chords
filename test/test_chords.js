// Node harness: loads gamepad_chords.js with a stubbed Max environment and checks the logic
var fs = require("fs"), vm = require("vm");
var out = [];
var tasks = [];
function Task(fn, obj) { this.fn = fn; this.obj = obj; this.due = false; tasks.push(this); }
Task.prototype.schedule = function () { this.due = true; };
Task.prototype.cancel = function () { this.due = false; };
function fire() { tasks.forEach(function (k) { if (k.due) { k.due = false; k.fn.call(k.obj); } }); }
var lastName = null;
var ctx = { Task: Task, outlet: function () { var a = [].slice.call(arguments); if (a[0] === 1 && a[1] === "set") lastName = a[2]; out.push(a.slice(1)); }, Math: Math, Array: Array, Object: Object };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname + "/../src/gamepad_chords.js", "utf8"), ctx);
var call = function (fn) { out.length = 0; ctx[fn].apply(null, [].slice.call(arguments, 1)); };
var notes = function () { return out.filter(function (o) { return o[0] !== "set" && o.length === 2 && o[1] > 0; }).map(function (o) { return o[0]; }); };
var offs = function () { return out.filter(function (o) { return o.length === 2 && o[1] === 0 && o[0] !== "set"; }).map(function (o) { return o[0]; }); };
var name = function () { return lastName; };   // last chord name shown on the display
var ok = 0, bad = 0;
ctx.settle(0);   // earlier tests assume immediate chords
function eq(label, got, want) { var g = JSON.stringify(got), w = JSON.stringify(want); if (g === w) { ok++; console.log("PASS", label, g); } else { bad++; console.log("FAIL", label, "got", g, "want", w); } }
function a(label, val) { if (val) { ok++; console.log("PASS", label); } else { bad++; console.log("FAIL", label); } }

// --- diatonic, C major ---
call("mode", 1); call("key", 0); call("scale", 0);
call("lx", 0); call("ly", 1);                       // straight up = degree I
eq("I = C", [notes(), name()], [[48, 52, 55], "C [1]"]);
call("ly", 0.62); call("lx", 0.78);                 // ~51 deg = degree II
var prev = out.slice(); call("ly", 0.62); out = prev.concat(out);
eq("ii = Dm", [notes(), name()], [[50, 53, 57], "Dm [2]"]);
call("rx", 0); call("ry", 1);                       // right up = 7th
eq("ii7 = Dm7", name(), "Dm7 [2]");
a("common tones kept (no retrigger of 50/53/57)", notes().length === 1 && notes()[0] === 60);
call("ry", 0); call("rx", 0);                       // right neutral
call("lx", 0); call("ly", 0);                       // release
a("release sends offs", offs().length > 0);

// vii dim: 6th section ~ 308 deg
call("lx", -0.79); call("ly", 0.62);
eq("vii = Bdim", name(), "Bdim [7]");
call("lx", 0); call("ly", 0);

// --- key of D major: V should be A major ---
call("key", 2);
// V = section 4 -> angle 4*51.43=205.7
var ang = 205.7 * Math.PI / 180;
call("lx", Math.sin(ang)); call("ly", Math.cos(ang));
eq("D major V = A", name(), "A [5]");
call("lx", 0); call("ly", 0);

// --- A minor scale, key 9 (A): i = Am ---
call("key", 9); call("scale", 1);
call("lx", 0); call("ly", 1);
eq("A minor i", name(), "Am [1]");
call("lx", 0); call("ly", 0);

// --- chromatic, fifths layout ---
call("mode", 0); call("layout", 1); call("key", 0);
call("lx", 0); call("ly", 1);
eq("chromatic top = C maj", [notes(), name()], [[48, 52, 55], "C"]);
call("lx", 1); call("ly", 0);                       // 90 deg = section 3 -> (3*7)%12=9 = A
eq("fifths sec3 = A", name(), "A");
call("rx", 0); call("ry", 1);                       // min
eq("A + right-up = Am", name(), "Am");
call("rx", 0.707); call("ry", 0.707);               // 45deg = sec 1 = "7"
eq("A + 45deg = A7", name(), "A7");
call("rx", 0); call("ry", 0);
call("lx", 0); call("ly", 0);

// --- hysteresis: hovering near boundary should not flicker ---
call("mode", 0); call("layout", 0);
var s1 = (14.9) * Math.PI / 180; call("lx", Math.sin(s1)); call("ly", Math.cos(s1));  // still sec 0 (boundary at 15)
var n0 = name();
var s2 = (16.5) * Math.PI / 180; call("lx", Math.sin(s2)); call("ly", Math.cos(s2));  // past boundary but inside hysteresis
eq("hysteresis holds C", name(), n0);
var s3 = (25) * Math.PI / 180; call("lx", Math.sin(s3)); call("ly", Math.cos(s3));
eq("moves to C# when clearly past", name(), "C#");
call("lx", 0); call("ly", 0);

// --- inversion + bass ---
call("mode", 1); call("key", 0); call("scale", 0); call("inversion", 1); call("bass", 1);
call("lx", 0); call("ly", 1);
eq("1st inversion C + bass", notes().sort(function (x, y) { return x - y; }), [36, 52, 55, 60]);
call("lx", 0); call("ly", 0);
call("inversion", 0); call("bass", 0);

// --- hold ---
call("hold", 1);
call("lx", 0); call("ly", 1);
call("lx", 0); call("ly", 0);
a("hold keeps chord ringing", offs().length === 0);
call("panic");
a("panic releases", offs().length > 0);

// --- panic must centre the sticks: later messages must not re-trigger a chord ---
call("hold", 0); call("mode", 1); call("ly", 1); call("ry", 1);
call("panic");
call("mode", 1);
a("mode after panic is silent", notes().length === 0);
call("lx", 0);
a("lx 0 after panic is silent", notes().length === 0);
call("ly", 1);
eq("ly 1 after panic gives plain C triad (right stick was reset)", name(), "C [1]");
call("panic");


// --- naming across all diatonic degrees x extensions (C major) ---
call("panic"); call("hold", 0); call("mode", 1); call("key", 0); call("scale", 0);
function polar(prefix, sec, n, mag) { var a = sec * 360 / n * Math.PI / 180; call(prefix + "x", mag * Math.sin(a)); call(prefix + "y", mag * Math.cos(a)); }
function chordName(deg, ext) { call("panic"); polar("l", deg, 7, 1); if (ext >= 0) polar("r", ext, 6, 1); var n = name(); call("panic"); return n; }
var EXPECT = {
  "1,0": "Cmaj7 [1]", "1,1": "Cmaj9 [1]", "1,2": "Csus2 [1]", "1,3": "Csus4 [1]", "1,4": "Cadd9 [1]", "1,5": "C6 [1]",
  "2,0": "Dm7 [2]", "2,1": "Dm9 [2]", "2,4": "Dmadd9 [2]"  , "2,5": "Dm6 [2]",
  "3,0": "Em7 [3]", "3,1": "Em7(b9) [3]", "3,5": "Em(b6) [3]",
  "4,0": "Fmaj7 [4]", "4,1": "Fmaj9 [4]",
  "5,0": "G7 [5]", "5,1": "G9 [5]",
  "6,0": "Am7 [6]", "7,0": "Bm7b5 [7]", "7,5": "Bdim(b6) [7]"
};
Object.keys(EXPECT).forEach(function (k) { var p = k.split(",").map(Number); eq("name " + k, chordName(p[0] - 1, p[1]), EXPECT[k]); });
a("no raw interval fallback names", (function () { for (var d = 0; d < 7; d++) for (var e = -1; e < 6; e++) { if (/\(\d/.test(chordName(d, e))) return false; } return true; })());

// --- settle: sweeping through F between Dm and G must not sound F ---
ctx.panic(); ctx.settle(60); ctx.mode(1); ctx.key(0); ctx.scale(0); ctx.hold(0); ctx.invy(0);
function raw(prefix, sec, n) { var ang = sec * 360 / n * Math.PI / 180; ctx[prefix + "x"](Math.sin(ang)); ctx[prefix + "y"](Math.cos(ang)); }
function names() { return out.filter(function (o) { return o[0] === "set"; }).map(function (o) { return o[1]; }); }
out.length = 0;
raw("l", 1, 7);                         // Dm
a("onset waits for settle (nothing sounds yet)", out.filter(function (o) { return o.length === 2 && o[1] > 0; }).length === 0);
fire();
eq("Dm sounds after settle", names()[names().length - 1], "Dm [2]");
out.length = 0;
raw("l", 3, 7);                         // sweep through F ...
raw("l", 4, 7);                         // ... to G
a("nothing changes while sweeping", out.length === 0);
fire();
eq("G sounds", names(), ["G [5]"]);
a("F never sounded", names().indexOf("F [4]") < 0);
out.length = 0;
raw("l", 1, 7);                         // heads to Dm ...
raw("l", 4, 7);                         // ... returns to G before settle
fire();
a("returning to the sounding chord cancels the change", out.length === 0);
// quick flick shorter than settle never sounds
ctx.panic(); out.length = 0;
raw("l", 0, 7);
ctx.lx(0); ctx.ly(0);                   // released before settle
fire();
a("flick shorter than settle is silent", out.filter(function (o) { return o.length === 2 && o[1] > 0; }).length === 0);
ctx.settle(0); ctx.panic();

console.log("\n" + ok + " passed, " + bad + " failed");
process.exit(bad ? 1 : 0);
