# Building the Max for Live device

Requires Ableton Live Suite (Max for Live included).

## 1. Test the engine with no gamepad (~15 min)

1. In Live, drag **Max MIDI Instrument** onto an empty MIDI track, click the edit button to open Max.
2. Copy `src/gamepad_chords.js` somewhere on Max's search path (e.g. your Live User Library), or next to the saved device.
3. Add objects (press `n` to place an object):
   - `js gamepad_chords.js`
   - `noteout`, connected from the `js` left outlet (it sends `pitch velocity`).
   - `comment` connected to the right outlet (shows the chord name).
4. Add message boxes wired into the `js` inlet: `ly 1`, `lx 0`, `rx 0`, `ry 1`, `mode 1`, `key 2`, `panic`.
5. Put an instrument after the device. Click `ly 1`: you should hear C major. Click `ry 1`: adds a 7th.

## 2. Connect the gamepad

1. Add `hi`. Connect its left outlet to `print`.
2. Move each stick and press each button, and note what the Max console prints. See `CONTROLLERS.md`.
3. Add `route` + `scale` objects so each stick axis becomes a float in -1..1 (up = +1) and is sent to the matching `lx / ly / rx / ry` message via `prepend`. Use the `invy 1` message if up reads as -1.
4. Optional: map a trigger axis to `trig`.

## 3. Live controls

Add `live.menu` / `live.dial` for key, scale, mode, layout, octave, inversion, bass, hold, deadzone. Send each to the js object with `prepend <name>`.

## 4. Save

Save as `Gamepad Chords.amxd` in your User Library > Presets > MIDI Effects > Max Instrument.
