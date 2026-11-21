#!/usr/bin/env python3
"""Build 'Gamepad Chords.amxd' (Max MIDI Effect) plus a plain .maxpat copy for debugging.

    python tools/build_amxd.py            # writes device/Gamepad Chords.amxd and .maxpat

The device expects gamepad_chords.js and chord_wheel.js to be findable by Max
(this repo's src/ folder on Max's search path, or frozen into the device later).
"""
import json
import os
import struct
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "device")

boxes = []
lines = []
_ids = {}


def add(name, maxclass, text=None, inl=1, outl=1, outtypes=None, rect=(30, 30, 100, 22), pres=None, **extra):
    oid = "obj-%d" % (len(boxes) + 1)
    _ids[name] = oid
    box = {
        "id": oid,
        "maxclass": maxclass,
        "numinlets": inl,
        "numoutlets": outl,
        "outlettype": outtypes if outtypes is not None else [""] * outl,
        "patching_rect": list(rect),
    }
    if text is not None:
        box["text"] = text
    if pres is not None:
        box["presentation"] = 1
        box["presentation_rect"] = list(pres)
    box.update(extra)
    boxes.append({"box": box})
    return oid


def line(src, src_out, dst, dst_in=0):
    lines.append({"patchline": {"source": [_ids[src], src_out], "destination": [_ids[dst], dst_in]}})


def param(longname, ptype, mmin=None, mmax=None, enum=None, initial=None, unit=None):
    v = {"parameter_longname": longname, "parameter_shortname": longname, "parameter_type": ptype}
    if mmin is not None:
        v["parameter_mmin"] = mmin
    if mmax is not None:
        v["parameter_mmax"] = mmax
    if enum is not None:
        v["parameter_enum"] = enum
    if unit is not None:
        v["parameter_unitstyle"] = unit
    if initial is not None:
        v["parameter_initial"] = [initial]
        v["parameter_initial_enable"] = 1
    return {"parameter_enable": 1, "saved_attribute_attributes": {"valueof": v}, "varname": longname}


NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

# ---------------- core signal path (patching view, below the device-height line) ----------------
add("gamepad", "newobj", "gamepad", inl=1, outl=1, outtypes=[""], rect=(30, 230, 70, 22))
add("js", "newobj", "js gamepad_chords.js", inl=1, outl=4, outtypes=["", "", "", ""], rect=(30, 320, 170, 22))
add("noteout", "newobj", "noteout", inl=3, outl=0, outtypes=[], rect=(30, 410, 60, 22))
add("loadbang", "newobj", "loadbang", inl=1, outl=1, outtypes=["bang"], rect=(250, 230, 60, 22))
add("init", "message", "sync", inl=2, outl=1, outtypes=[""], rect=(250, 270, 90, 22))
add("panicmsg", "message", "panic", inl=2, outl=1, outtypes=[""], rect=(420, 270, 45, 22))

line("gamepad", 0, "js")
line("loadbang", 0, "init")
line("init", 0, "js")
line("js", 0, "noteout")

# ---------------- display (presentation) ----------------
add("wheel", "jsui", None, inl=1, outl=0, outtypes=[], rect=(250, 410, 520, 160), pres=(4, 4, 520, 160),
    filename="chord_wheel.js")
line("js", 2, "wheel")

# ---------------- controls (presentation) ----------------
# name, class, text/label, presentation rect, param dict, js message, route name for feedback
X = 534
X2 = 780
controls = [
    ("key", "live.menu", dict(rect=(X, 8, 70, 16), p=param("Key", 2, mmax=11, enum=NOTE_NAMES, initial=0))),
    ("scale", "live.menu", dict(rect=(X + 76, 8, 70, 16), p=param("Scale", 2, mmax=7, enum=["Major", "Minor", "Dorian", "Phrygian", "Lydian", "Mixolydian", "Locrian", "Harm Minor"], initial=0))),
    ("mode", "live.menu", dict(rect=(X + 152, 8, 76, 16), p=param("Mode", 2, mmax=1, enum=["Chromatic", "Diatonic"], initial=1))),
    ("octave", "live.numbox", dict(rect=(X, 34, 110, 16), p=param("Octave", 1, mmin=-2, mmax=2, initial=0, unit=0), extra={"showname": 1})),
    ("inversion", "live.numbox", dict(rect=(X + 118, 34, 110, 16), p=param("Inversion", 1, mmin=0, mmax=3, initial=0, unit=0), extra={"showname": 1})),
    ("hold", "live.text", dict(rect=(X, 60, 70, 18), p=param("Hold", 2, mmax=1, enum=["off", "on"], initial=0),
                                extra={"text": "Hold", "texton": "Hold", "mode": 1})),
    ("bass", "live.text", dict(rect=(X + 76, 60, 70, 18), p=param("Bass", 2, mmax=1, enum=["off", "on"], initial=0),
                                extra={"text": "Bass", "texton": "Bass", "mode": 1})),
    ("invx", "live.text", dict(rect=(X + 124, 94, 50, 18), p=param("FlipX", 2, mmax=1, enum=["off", "on"], initial=0),
                                extra={"text": "Flip X", "texton": "Flip X", "mode": 1})),
    ("invy", "live.text", dict(rect=(X + 178, 94, 50, 18), p=param("FlipY", 2, mmax=1, enum=["off", "on"], initial=1),
                                extra={"text": "Flip Y", "texton": "Flip Y", "mode": 1})),
    ("settle", "live.dial", dict(rect=(X, 94, 52, 62), p=param("Settle", 1, mmin=0, mmax=200, initial=60, unit=2))),
    ("deadzone", "live.dial", dict(rect=(X + 62, 94, 52, 62), p=param("Deadzone", 0, mmin=0.1, mmax=0.8, initial=0.35, unit=1))),
    # second column: play style, palette, voice leading
    ("style", "live.menu", dict(rect=(X2, 8, 110, 16), p=param("Style", 2, mmax=2, enum=["Chord", "Strum", "Arp"], initial=0))),
    ("arppat", "live.menu", dict(rect=(X2 + 116, 8, 110, 16), p=param("ArpPattern", 2, mmax=3, enum=["Up", "Down", "Up/Down", "Random"], initial=0))),
    ("palette", "live.text", dict(rect=(X2, 34, 70, 18), p=param("Palette", 2, mmax=1, enum=["off", "on"], initial=0),
                                   extra={"text": "Jazz", "texton": "Jazz", "mode": 1})),
    ("vlead", "live.text", dict(rect=(X2 + 76, 34, 100, 18), p=param("VoiceLeading", 2, mmax=1, enum=["off", "on"], initial=0),
                                 extra={"text": "Voice lead", "texton": "Voice lead", "mode": 1})),
    ("strum", "live.dial", dict(rect=(X2, 60, 52, 62), p=param("Strum", 1, mmin=5, mmax=300, initial=40, unit=2))),
    ("arprate", "live.dial", dict(rect=(X2 + 62, 60, 52, 62), p=param("ArpRate", 1, mmin=30, mmax=1000, initial=125, unit=2))),
]
for i, (name, cls, c) in enumerate(controls):
    if cls == "live.menu":
        inl, outl, ot = 1, 3, ["", "", "float"]
    elif cls == "live.dial":
        inl, outl, ot = 1, 2, ["", "float"]
    else:  # live.numbox, live.text
        inl, outl, ot = 1, 2, ["", "float"]
    props = dict(c["p"])
    props.update(c.get("extra", {}))
    x, y, w, h = c["rect"]
    label = props.pop("text", None)
    add(name, cls, label, inl=inl, outl=outl, outtypes=ot, rect=(450 + i * 10, 500 + i * 25, w, h), pres=c["rect"], **props)

add("panicbtn", "live.text", "Panic", inl=1, outl=2, outtypes=["", "float"], rect=(420, 230, 60, 18), pres=(X + 152, 60, 76, 18),
    texton="Panic", mode=0, parameter_enable=0)
line("panicbtn", 0, "panicmsg")
line("panicmsg", 0, "js")

# control -> prepend <name> -> js
for i, (name, cls, c) in enumerate(controls):
    pid = "pre_" + name
    add(pid, "newobj", "prepend " + name, inl=2, outl=1, outtypes=[""], rect=(700 + (i % 3) * 110, 230 + (i // 3) * 30, 90, 22))
    line(name, 0, pid)
    line(pid, 0, "js")

# js outlet 3 -> route -> `set N` back into the controls (so buttons on the gamepad move the UI)
fb = [n for n, cls, c in controls if n in ("key", "scale", "mode", "octave", "hold", "bass", "style", "palette", "vlead")]
add("route", "newobj", "route " + " ".join(fb), inl=1, outl=len(fb) + 1, outtypes=[""] * (len(fb) + 1), rect=(30, 360, 260, 22))
line("js", 3, "route")
for i, n in enumerate(fb):
    line("route", i, n)

patcher = {
    "fileversion": 1,
    "appversion": {"major": 9, "minor": 0, "revision": 7, "architecture": "x64", "modernui": 1},
    "classnamespace": "box",
    "rect": [100.0, 100.0, 900.0, 640.0],
    "openinpresentation": 1,
    "devicewidth": 1016.0,
    "gridonopen": 1,
    "gridsize": [15.0, 15.0],
    "toolbarvisible": 1,
    "boxes": boxes,
    "lines": lines,
    "dependency_cache": [
        {"name": "gamepad_chords.js", "type": "TEXT", "implicit": 1},
        {"name": "chord_wheel.js", "type": "TEXT", "implicit": 1},
    ],
    "autosave": 0,
}
doc = {"patcher": patcher}


def check(doc):
    ids = [b["box"]["id"] for b in doc["patcher"]["boxes"]]
    assert len(ids) == len(set(ids)), "duplicate ids"
    by = {b["box"]["id"]: b["box"] for b in doc["patcher"]["boxes"]}
    for l in doc["patcher"]["lines"]:
        s, d = l["patchline"]["source"], l["patchline"]["destination"]
        assert s[0] in by and d[0] in by, "line to unknown box"
        assert s[1] < by[s[0]]["numoutlets"], "bad outlet %s on %s" % (s[1], s[0])
        assert d[1] < by[d[0]]["numinlets"], "bad inlet %s on %s" % (d[1], d[0])
    for b in by.values():
        assert len(b["outlettype"]) == b["numoutlets"], b["id"]
    return len(by), len(doc["patcher"]["lines"])


def amxd_bytes(doc, kind=b"mmmm"):
    """kind: b'mmmm' MIDI effect, b'iiii' instrument, b'aaaa' audio effect."""
    payload = (json.dumps(doc, indent=1) + "\n").encode("utf-8") + b"\x00"
    return (b"ampf" + struct.pack("<I", 4) + kind + b"meta" + struct.pack("<I", 4) + struct.pack("<I", 0)
            + b"ptch" + struct.pack("<I", len(payload)) + payload)


if __name__ == "__main__":
    nb, nl = check(doc)
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, "Gamepad Chords.amxd"), "wb") as f:
        f.write(amxd_bytes(doc))
    with open(os.path.join(OUT, "Gamepad Chords.maxpat"), "w") as f:
        json.dump(doc, f, indent=1)
    print("wrote device/Gamepad Chords.amxd and .maxpat (%d boxes, %d lines)" % (nb, nl))
