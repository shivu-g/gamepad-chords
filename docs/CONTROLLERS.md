# Controllers

Two Zebronics pads (clear black shell, gold lettering, SELECT / START / TURBO / CLEAR / MODE buttons, d-pad, two sticks, X/Y/A/B): one wired, one wireless.

Host: Windows desktop.

## Things to find out (fill in as we test)

| Item | Wired | Wireless |
|---|---|---|
| Shows up in Windows "Set up USB game controllers" (joy.cpl)? | ? | ? |
| Name reported to Max `[hi]` | ? | ? |
| MODE button state (some pads switch XInput / DInput) | ? | ? |
| Left stick X / Y element names | ? | ? |
| Right stick X / Y element names | ? | ? |
| Axis range (e.g. 0..255, 0..65535, -1..1) | ? | ? |
| Is up positive or negative? | ? | ? |
| Triggers: analogue axis or buttons? | ? | ? |

## How to fill it in

1. Plug in / pair a pad. Open `joy.cpl` (Win+R) and check it appears; the Properties tab shows live stick values.
2. In Max, `[hi]` -> `[print]`. Move one control at a time and record what prints.
3. Normalise each axis: `scale <min> <max> -1. 1.` (swap the output range if up is negative, or send `invy 1`).
4. Stick centre may not read exactly 0. The engine has a deadzone (default 0.35), so small drift is ignored.

## Notes

- Wireless pads usually come with a 2.4 GHz dongle; the wired one is a plain USB device. Test them one at a time first.
- If a pad lets the sticks sit off-centre, raise `deadzone`.
