// Node harness: loads gamepad_chords.js with a stubbed Max environment and checks the logic
var fs = require("fs"), vm = require("vm");
var out = [];
var ctx = { outlet: function () { var a = [].slice.call(arguments); out.push(a[0] === 1 ? a.slice(1) : a.slice(1)); }, Math: Math, Array: Array, Object: Object };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname + "/../src/gamepad_chords.js", "utf8"), ctx);
var call = function (fn) { out.length = 0; ctx[fn].apply(null, [].slice.call(arguments, 1)); };
var notes = function () { return out.filter(function (o) { return o[0] !== "set" && o.length === 2 && o[1] > 0; }).map(function (o) { return o[0]; }); };
var offs = function () { return out.filter(function (o) { return o.length === 2 && o[1] === 0 && o[0] !== "set"; }).map(function (o) { return o[0]; }); };
var name = function () { var s = out.filter(function (o) { return o[0] === "set"; }); return s.length ? s[s.length - 1][1] : null; };
var ok = 0, bad = 0;
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

console.log("\n" + ok + " passed, " + bad + " failed");
process.exit(bad ? 1 : 0);
