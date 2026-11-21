// Smoke test for chord_wheel.js: run paint() against a mock mgraphics and check it draws the right things.
var fs = require("fs"), vm = require("vm");
var calls = [], texts = [];
var mg = { size: [520, 160], init: function () {}, redraw: function () {} };
["move_to", "arc", "close_path", "set_source_rgba", "fill", "set_line_width", "stroke", "select_font_face",
 "set_font_size", "ellipse"].forEach(function (f) { mg[f] = function () { calls.push(f); }; });
mg.show_text = function (t) { texts.push(t); };
mg.text_measure = function (t) { return [t.length * 6, 10]; };
function Task(fn, obj) { this.fn = fn; }
Task.prototype.repeat = function () {}; Task.prototype.cancel = function () {};
var ctx = { mgraphics: mg, Task: Task, arrayfromargs: function (a) { return [].slice.call(a); }, Math: Math, Array: Array, String: String };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname + "/../src/chord_wheel.js", "utf8"), ctx);
var ok = 0, bad = 0;
function a(l, v) { if (v) { ok++; console.log("PASS", l); } else { bad++; console.log("FAIL", l); } }

ctx.labelsL("C", "Dm", "Em", "F", "G", "Am", "Bdim");
ctx.labelsR("7th", "9th", "sus2", "sus4", "add9", "6th");
ctx.name("Cmaj7", "[1]");
ctx.state(1, 0, 0, 0, 1, 0, 1, 1, 1, 1);
ctx.paint();
a("draws 7 + 6 wedges (arc calls x2 each)", calls.filter(function (c) { return c === "arc"; }).length === 2 * 13);
a("draws all left labels", ["C", "Dm", "Em", "F", "G", "Am", "Bdim"].every(function (l) { return texts.indexOf(l) >= 0; }));
a("draws right labels", texts.indexOf("sus4") >= 0 && texts.indexOf("6th") >= 0);
a("draws chord name", texts.indexOf("Cmaj7 [1]") >= 0);
a("draws the two stick dots", calls.filter(function (c) { return c === "ellipse"; }).length === 2);
texts.length = 0; calls.length = 0;
ctx.labelsL(); ctx.labelsR(); ctx.state(0, -1, -1, 0, 0, 0, 0, 0, 0, 0); ctx.paint();
a("empty labels do not crash", true);
console.log("\n" + ok + " passed, " + bad + " failed"); process.exit(bad ? 1 : 0);
