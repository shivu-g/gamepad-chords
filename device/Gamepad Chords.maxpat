{
 "patcher": {
  "fileversion": 1,
  "appversion": {
   "major": 9,
   "minor": 0,
   "revision": 7,
   "architecture": "x64",
   "modernui": 1
  },
  "classnamespace": "box",
  "rect": [
   100.0,
   100.0,
   900.0,
   640.0
  ],
  "openinpresentation": 1,
  "devicewidth": 780.0,
  "gridonopen": 1,
  "gridsize": [
   15.0,
   15.0
  ],
  "toolbarvisible": 1,
  "boxes": [
   {
    "box": {
     "id": "obj-1",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      30,
      230,
      70,
      22
     ],
     "text": "gamepad"
    }
   },
   {
    "box": {
     "id": "obj-2",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 4,
     "outlettype": [
      "",
      "",
      "",
      ""
     ],
     "patching_rect": [
      30,
      320,
      170,
      22
     ],
     "text": "js gamepad_chords.js"
    }
   },
   {
    "box": {
     "id": "obj-3",
     "maxclass": "newobj",
     "numinlets": 3,
     "numoutlets": 0,
     "outlettype": [],
     "patching_rect": [
      30,
      410,
      60,
      22
     ],
     "text": "noteout"
    }
   },
   {
    "box": {
     "id": "obj-4",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 1,
     "outlettype": [
      "bang"
     ],
     "patching_rect": [
      250,
      230,
      60,
      22
     ],
     "text": "loadbang"
    }
   },
   {
    "box": {
     "id": "obj-5",
     "maxclass": "message",
     "numinlets": 2,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      250,
      270,
      90,
      22
     ],
     "text": "sync"
    }
   },
   {
    "box": {
     "id": "obj-6",
     "maxclass": "message",
     "numinlets": 2,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      420,
      270,
      45,
      22
     ],
     "text": "panic"
    }
   },
   {
    "box": {
     "id": "obj-7",
     "maxclass": "jsui",
     "numinlets": 1,
     "numoutlets": 0,
     "outlettype": [],
     "patching_rect": [
      250,
      410,
      520,
      160
     ],
     "presentation": 1,
     "presentation_rect": [
      4,
      4,
      520,
      160
     ],
     "filename": "chord_wheel.js"
    }
   },
   {
    "box": {
     "id": "obj-8",
     "maxclass": "live.menu",
     "numinlets": 1,
     "numoutlets": 3,
     "outlettype": [
      "",
      "",
      "float"
     ],
     "patching_rect": [
      450,
      500,
      70,
      16
     ],
     "presentation": 1,
     "presentation_rect": [
      534,
      8,
      70,
      16
     ],
     "parameter_enable": 1,
     "saved_attribute_attributes": {
      "valueof": {
       "parameter_longname": "Key",
       "parameter_shortname": "Key",
       "parameter_type": 2,
       "parameter_mmax": 11,
       "parameter_enum": [
        "C",
        "C#",
        "D",
        "D#",
        "E",
        "F",
        "F#",
        "G",
        "G#",
        "A",
        "A#",
        "B"
       ],
       "parameter_initial": [
        0
       ],
       "parameter_initial_enable": 1
      }
     },
     "varname": "Key"
    }
   },
   {
    "box": {
     "id": "obj-9",
     "maxclass": "live.menu",
     "numinlets": 1,
     "numoutlets": 3,
     "outlettype": [
      "",
      "",
      "float"
     ],
     "patching_rect": [
      460,
      525,
      70,
      16
     ],
     "presentation": 1,
     "presentation_rect": [
      610,
      8,
      70,
      16
     ],
     "parameter_enable": 1,
     "saved_attribute_attributes": {
      "valueof": {
       "parameter_longname": "Scale",
       "parameter_shortname": "Scale",
       "parameter_type": 2,
       "parameter_mmax": 1,
       "parameter_enum": [
        "Major",
        "Minor"
       ],
       "parameter_initial": [
        0
       ],
       "parameter_initial_enable": 1
      }
     },
     "varname": "Scale"
    }
   },
   {
    "box": {
     "id": "obj-10",
     "maxclass": "live.menu",
     "numinlets": 1,
     "numoutlets": 3,
     "outlettype": [
      "",
      "",
      "float"
     ],
     "patching_rect": [
      470,
      550,
      76,
      16
     ],
     "presentation": 1,
     "presentation_rect": [
      686,
      8,
      76,
      16
     ],
     "parameter_enable": 1,
     "saved_attribute_attributes": {
      "valueof": {
       "parameter_longname": "Mode",
       "parameter_shortname": "Mode",
       "parameter_type": 2,
       "parameter_mmax": 1,
       "parameter_enum": [
        "Chromatic",
        "Diatonic"
       ],
       "parameter_initial": [
        1
       ],
       "parameter_initial_enable": 1
      }
     },
     "varname": "Mode"
    }
   },
   {
    "box": {
     "id": "obj-11",
     "maxclass": "live.numbox",
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      "float"
     ],
     "patching_rect": [
      480,
      575,
      110,
      16
     ],
     "presentation": 1,
     "presentation_rect": [
      534,
      34,
      110,
      16
     ],
     "parameter_enable": 1,
     "saved_attribute_attributes": {
      "valueof": {
       "parameter_longname": "Octave",
       "parameter_shortname": "Octave",
       "parameter_type": 1,
       "parameter_mmin": -2,
       "parameter_mmax": 2,
       "parameter_unitstyle": 0,
       "parameter_initial": [
        0
       ],
       "parameter_initial_enable": 1
      }
     },
     "varname": "Octave",
     "showname": 1
    }
   },
   {
    "box": {
     "id": "obj-12",
     "maxclass": "live.numbox",
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      "float"
     ],
     "patching_rect": [
      490,
      600,
      110,
      16
     ],
     "presentation": 1,
     "presentation_rect": [
      652,
      34,
      110,
      16
     ],
     "parameter_enable": 1,
     "saved_attribute_attributes": {
      "valueof": {
       "parameter_longname": "Inversion",
       "parameter_shortname": "Inversion",
       "parameter_type": 1,
       "parameter_mmin": 0,
       "parameter_mmax": 3,
       "parameter_unitstyle": 0,
       "parameter_initial": [
        0
       ],
       "parameter_initial_enable": 1
      }
     },
     "varname": "Inversion",
     "showname": 1
    }
   },
   {
    "box": {
     "id": "obj-13",
     "maxclass": "live.text",
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      "float"
     ],
     "patching_rect": [
      500,
      625,
      70,
      18
     ],
     "text": "Hold",
     "presentation": 1,
     "presentation_rect": [
      534,
      60,
      70,
      18
     ],
     "parameter_enable": 1,
     "saved_attribute_attributes": {
      "valueof": {
       "parameter_longname": "Hold",
       "parameter_shortname": "Hold",
       "parameter_type": 2,
       "parameter_mmax": 1,
       "parameter_enum": [
        "off",
        "on"
       ],
       "parameter_initial": [
        0
       ],
       "parameter_initial_enable": 1
      }
     },
     "varname": "Hold",
     "texton": "Hold",
     "mode": 1
    }
   },
   {
    "box": {
     "id": "obj-14",
     "maxclass": "live.text",
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      "float"
     ],
     "patching_rect": [
      510,
      650,
      70,
      18
     ],
     "text": "Bass",
     "presentation": 1,
     "presentation_rect": [
      610,
      60,
      70,
      18
     ],
     "parameter_enable": 1,
     "saved_attribute_attributes": {
      "valueof": {
       "parameter_longname": "Bass",
       "parameter_shortname": "Bass",
       "parameter_type": 2,
       "parameter_mmax": 1,
       "parameter_enum": [
        "off",
        "on"
       ],
       "parameter_initial": [
        0
       ],
       "parameter_initial_enable": 1
      }
     },
     "varname": "Bass",
     "texton": "Bass",
     "mode": 1
    }
   },
   {
    "box": {
     "id": "obj-15",
     "maxclass": "live.text",
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      "float"
     ],
     "patching_rect": [
      520,
      675,
      50,
      18
     ],
     "text": "Flip X",
     "presentation": 1,
     "presentation_rect": [
      658,
      94,
      50,
      18
     ],
     "parameter_enable": 1,
     "saved_attribute_attributes": {
      "valueof": {
       "parameter_longname": "FlipX",
       "parameter_shortname": "FlipX",
       "parameter_type": 2,
       "parameter_mmax": 1,
       "parameter_enum": [
        "off",
        "on"
       ],
       "parameter_initial": [
        0
       ],
       "parameter_initial_enable": 1
      }
     },
     "varname": "FlipX",
     "texton": "Flip X",
     "mode": 1
    }
   },
   {
    "box": {
     "id": "obj-16",
     "maxclass": "live.text",
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      "float"
     ],
     "patching_rect": [
      530,
      700,
      50,
      18
     ],
     "text": "Flip Y",
     "presentation": 1,
     "presentation_rect": [
      712,
      94,
      50,
      18
     ],
     "parameter_enable": 1,
     "saved_attribute_attributes": {
      "valueof": {
       "parameter_longname": "FlipY",
       "parameter_shortname": "FlipY",
       "parameter_type": 2,
       "parameter_mmax": 1,
       "parameter_enum": [
        "off",
        "on"
       ],
       "parameter_initial": [
        0
       ],
       "parameter_initial_enable": 1
      }
     },
     "varname": "FlipY",
     "texton": "Flip Y",
     "mode": 1
    }
   },
   {
    "box": {
     "id": "obj-17",
     "maxclass": "live.dial",
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      "float"
     ],
     "patching_rect": [
      540,
      725,
      52,
      62
     ],
     "presentation": 1,
     "presentation_rect": [
      534,
      94,
      52,
      62
     ],
     "parameter_enable": 1,
     "saved_attribute_attributes": {
      "valueof": {
       "parameter_longname": "Settle",
       "parameter_shortname": "Settle",
       "parameter_type": 1,
       "parameter_mmin": 0,
       "parameter_mmax": 200,
       "parameter_unitstyle": 2,
       "parameter_initial": [
        60
       ],
       "parameter_initial_enable": 1
      }
     },
     "varname": "Settle"
    }
   },
   {
    "box": {
     "id": "obj-18",
     "maxclass": "live.dial",
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      "float"
     ],
     "patching_rect": [
      550,
      750,
      52,
      62
     ],
     "presentation": 1,
     "presentation_rect": [
      596,
      94,
      52,
      62
     ],
     "parameter_enable": 1,
     "saved_attribute_attributes": {
      "valueof": {
       "parameter_longname": "Deadzone",
       "parameter_shortname": "Deadzone",
       "parameter_type": 0,
       "parameter_mmin": 0.1,
       "parameter_mmax": 0.8,
       "parameter_unitstyle": 1,
       "parameter_initial": [
        0.35
       ],
       "parameter_initial_enable": 1
      }
     },
     "varname": "Deadzone"
    }
   },
   {
    "box": {
     "id": "obj-19",
     "maxclass": "live.text",
     "numinlets": 1,
     "numoutlets": 2,
     "outlettype": [
      "",
      "float"
     ],
     "patching_rect": [
      420,
      230,
      60,
      18
     ],
     "text": "Panic",
     "presentation": 1,
     "presentation_rect": [
      686,
      60,
      76,
      18
     ],
     "texton": "Panic",
     "mode": 0,
     "parameter_enable": 0
    }
   },
   {
    "box": {
     "id": "obj-20",
     "maxclass": "newobj",
     "numinlets": 2,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      700,
      230,
      90,
      22
     ],
     "text": "prepend key"
    }
   },
   {
    "box": {
     "id": "obj-21",
     "maxclass": "newobj",
     "numinlets": 2,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      810,
      230,
      90,
      22
     ],
     "text": "prepend scale"
    }
   },
   {
    "box": {
     "id": "obj-22",
     "maxclass": "newobj",
     "numinlets": 2,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      920,
      230,
      90,
      22
     ],
     "text": "prepend mode"
    }
   },
   {
    "box": {
     "id": "obj-23",
     "maxclass": "newobj",
     "numinlets": 2,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      700,
      260,
      90,
      22
     ],
     "text": "prepend octave"
    }
   },
   {
    "box": {
     "id": "obj-24",
     "maxclass": "newobj",
     "numinlets": 2,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      810,
      260,
      90,
      22
     ],
     "text": "prepend inversion"
    }
   },
   {
    "box": {
     "id": "obj-25",
     "maxclass": "newobj",
     "numinlets": 2,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      920,
      260,
      90,
      22
     ],
     "text": "prepend hold"
    }
   },
   {
    "box": {
     "id": "obj-26",
     "maxclass": "newobj",
     "numinlets": 2,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      700,
      290,
      90,
      22
     ],
     "text": "prepend bass"
    }
   },
   {
    "box": {
     "id": "obj-27",
     "maxclass": "newobj",
     "numinlets": 2,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      810,
      290,
      90,
      22
     ],
     "text": "prepend invx"
    }
   },
   {
    "box": {
     "id": "obj-28",
     "maxclass": "newobj",
     "numinlets": 2,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      920,
      290,
      90,
      22
     ],
     "text": "prepend invy"
    }
   },
   {
    "box": {
     "id": "obj-29",
     "maxclass": "newobj",
     "numinlets": 2,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      700,
      320,
      90,
      22
     ],
     "text": "prepend settle"
    }
   },
   {
    "box": {
     "id": "obj-30",
     "maxclass": "newobj",
     "numinlets": 2,
     "numoutlets": 1,
     "outlettype": [
      ""
     ],
     "patching_rect": [
      810,
      320,
      90,
      22
     ],
     "text": "prepend deadzone"
    }
   },
   {
    "box": {
     "id": "obj-31",
     "maxclass": "newobj",
     "numinlets": 1,
     "numoutlets": 7,
     "outlettype": [
      "",
      "",
      "",
      "",
      "",
      "",
      ""
     ],
     "patching_rect": [
      30,
      360,
      260,
      22
     ],
     "text": "route key scale mode octave hold bass"
    }
   }
  ],
  "lines": [
   {
    "patchline": {
     "source": [
      "obj-1",
      0
     ],
     "destination": [
      "obj-2",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-4",
      0
     ],
     "destination": [
      "obj-5",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-5",
      0
     ],
     "destination": [
      "obj-2",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-2",
      0
     ],
     "destination": [
      "obj-3",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-2",
      2
     ],
     "destination": [
      "obj-7",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-19",
      0
     ],
     "destination": [
      "obj-6",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-6",
      0
     ],
     "destination": [
      "obj-2",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-8",
      0
     ],
     "destination": [
      "obj-20",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-20",
      0
     ],
     "destination": [
      "obj-2",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-9",
      0
     ],
     "destination": [
      "obj-21",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-21",
      0
     ],
     "destination": [
      "obj-2",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-10",
      0
     ],
     "destination": [
      "obj-22",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-22",
      0
     ],
     "destination": [
      "obj-2",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-11",
      0
     ],
     "destination": [
      "obj-23",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-23",
      0
     ],
     "destination": [
      "obj-2",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-12",
      0
     ],
     "destination": [
      "obj-24",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-24",
      0
     ],
     "destination": [
      "obj-2",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-13",
      0
     ],
     "destination": [
      "obj-25",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-25",
      0
     ],
     "destination": [
      "obj-2",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-14",
      0
     ],
     "destination": [
      "obj-26",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-26",
      0
     ],
     "destination": [
      "obj-2",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-15",
      0
     ],
     "destination": [
      "obj-27",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-27",
      0
     ],
     "destination": [
      "obj-2",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-16",
      0
     ],
     "destination": [
      "obj-28",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-28",
      0
     ],
     "destination": [
      "obj-2",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-17",
      0
     ],
     "destination": [
      "obj-29",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-29",
      0
     ],
     "destination": [
      "obj-2",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-18",
      0
     ],
     "destination": [
      "obj-30",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-30",
      0
     ],
     "destination": [
      "obj-2",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-2",
      3
     ],
     "destination": [
      "obj-31",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-31",
      0
     ],
     "destination": [
      "obj-8",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-31",
      1
     ],
     "destination": [
      "obj-9",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-31",
      2
     ],
     "destination": [
      "obj-10",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-31",
      3
     ],
     "destination": [
      "obj-11",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-31",
      4
     ],
     "destination": [
      "obj-13",
      0
     ]
    }
   },
   {
    "patchline": {
     "source": [
      "obj-31",
      5
     ],
     "destination": [
      "obj-14",
      0
     ]
    }
   }
  ],
  "dependency_cache": [
   {
    "name": "gamepad_chords.js",
    "type": "TEXT",
    "implicit": 1
   },
   {
    "name": "chord_wheel.js",
    "type": "TEXT",
    "implicit": 1
   }
  ],
  "autosave": 0
 }
}