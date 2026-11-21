# gamepad-chords

Play chords in Ableton Live with a two-stick gamepad.

- **Left stick** picks the chord root: 7 diatonic degrees, or 12 chromatic sections (optionally laid out as a circle of fifths).
- **Right stick** picks the quality / extension.
- Runs as a Max for Live **MIDI Instrument** device: no virtual MIDI port needed.

## Layout

```
src/gamepad_chords.js   chord engine, loaded by Max's [js] object (ES5)
test/test_chords.js     node tests for the engine (npm test)
docs/MAX_PATCH.md       how to build the device in Live
docs/CONTROLLERS.md     notes on the two Zebronics pads, mapping the axes
```

## Controls

| Mode | Left stick | Right stick |
|---|---|---|
| Diatonic (mode 1) | degrees I..vii in the chosen key/scale (up = I, clockwise) | centred: triad. Sections: 7th, 9th, sus2, sus4, add9, 6th |
| Chromatic (mode 0) | 12 roots (layout 0: semitones, C at top; layout 1: circle of fifths) | centred: major. Sections: min, 7, maj7, min7, sus2, sus4, dim, aug |

Sections are centred on straight-up and go clockwise. Boundaries are sticky (hysteresis) so hovering on an edge doesn't flicker. Chord changes only retrigger the notes that differ.

## Messages the [js] object accepts

Stick input (floats, -1..1, **up = +1**): `lx ly rx ry` and `trig` (0..1, sets velocity).
Settings: `key 0..11`, `scale 0|1` (major/minor), `mode 0|1`, `layout 0|1`, `octave -2..2`, `inversion 0..3`, `bass 0|1`, `hold 0|1`, `deadzone`, `hyst`, `settle 0..200` (ms, default 60: a chord change only sounds once the stick has stayed on it that long, so sections you sweep through do not play; onset waits half as long), `vel`, `invy 0|1`, `panic`.
Outlets: 0 = `pitch velocity` (to `[noteout]`), 1 = `set <chord name>` (to a `[comment]`).

## Status

- Engine: done, node tests pass (npm test).
- Max device: not built or tested yet. See `docs/MAX_PATCH.md`.
- Gamepad axis mapping: unknown until `[hi]` is printed for each pad. See `docs/CONTROLLERS.md`.

## Test

```
npm test
```
