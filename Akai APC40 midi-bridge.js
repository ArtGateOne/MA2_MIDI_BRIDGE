const easymidi = require("easymidi");

// 🎚 Configuration
const inputName = "Akai APC40";
const outputName = "Akai APC40 Virtual";
const debug = true;
const sysex = false;

// 🔍 Check available MIDI devices
const inputs = easymidi.getInputs();
const outputs = easymidi.getOutputs();

if (!inputs.includes(inputName)) {
  console.error(`❌ MIDI input "${inputName}" not found.`);
  console.log("Available MIDI inputs:", inputs);
  process.exit(1);
}

if (!outputs.includes(outputName)) {
  console.error(`❌ MIDI output "${outputName}" not found.`);
  console.log("Available MIDI outputs:", outputs);
  process.exit(1);
}

if (sysex) {
  const outputSysexName = "Akai APC40";
  
  if (!outputs.includes(outputSysexName)) {
    console.error(`❌ MIDI output "${outputSysexName}" not found.`);
    console.log("Available MIDI outputs:", outputs);
    process.exit(1);
  }

  const outputSysex = new easymidi.Output(outputSysexName);

  // Generic Mode (Mode 0)
  //outputSysex.send("sysex", [0xf0, 0x47, 0x00, 0x73, 0x60, 0x00, 0x04, 0x40, 0x08, 0x04, 0x01, 0xf7]); 

  // Ableton Live Mode (Mode 1)
  outputSysex.send("sysex", [0xf0, 0x47, 0x00, 0x73, 0x60, 0x00, 0x04, 0x41, 0x08, 0x04, 0x01, 0xf7]); 

  // Alternate Ableton Live Mode (Mode 2)
  //outputSysex.send("sysex", [0xf0, 0x47, 0x00, 0x73, 0x60, 0x00, 0x04, 0x42, 0x08, 0x04, 0x01, 0xf7]); 

  outputSysex.close();
}

console.log(`✅ Connected to MIDI  input: ${inputName}`);
console.log(`✅ Connected to MIDI output: ${outputName}`);

// 🔌 Create input/output
const input = new easymidi.Input(inputName);
const output = new easymidi.Output(outputName);

// 🧠 Store previous CC values per controller
const previousValues = {};
for (let cc = 0; cc <= 127; cc++) {
  previousValues[`${cc}`] = { value: 0, channel: 0 };
}

// 📏 Helper
function pad(num, width = 3) {
  return String(num).padStart(width, " ");
}

// 🎹 Forward NOTE ON messages
input.on("noteon", (msg) => {
  output.send("noteon", msg);
  if (debug) {
    console.log(
      `[CH ${msg.channel + 1}] Note ${pad(msg.note)} , Velocity ${pad(
        msg.velocity
      )} , Note on`
    );
  }
});

// 🔕 Forward NOTE OFF messages
input.on("noteoff", (msg) => {
  output.send("noteoff", msg);
  if (debug) {
    console.log(
      `[CH ${msg.channel + 1}] Note ${pad(msg.note)} , Velocity ${pad(
        msg.velocity
      )} , Note off`
    );
  }
});

// 🎚 Handle Control Change (CC) messages
input.on("cc", (msg) => {
  const { controller, value, channel } = msg;
  const key = `${controller}`;
  const prevEntry = previousValues[key];
  const prevValue = prevEntry?.value ?? value;
  const prevChannel = prevEntry?.channel;
  const sameChannel = prevChannel === channel || prevValue === 0;

  previousValues[key] = { value, channel };

  // 🔁 CC 47 special case
  if (controller === 47) {
    const isCCW = value > 65;
    const noteOn = isCCW ? 0 : 1;
    const noteOff = isCCW ? 1 : 0;
    const direction = isCCW ? "CCW" : "CW";

    output.send("noteon", { note: noteOn, velocity: 127, channel });
    output.send("noteoff", { note: noteOff, velocity: 127, channel });

    if (debug) {
      console.log(
        `[CH ${channel + 1}] Note ${pad(
          noteOn
        )} , Velocity 127 , Note on , ${direction}` //  |  `// +
        //`[CH ${channel + 1}] Note ${pad(noteOff)} , Velocity 127 , Note off , ${direction}`
      );
    }

    return;
  }

  // 🔁 CW/CCW for CC 16–23 → NOTE 24–39
  if (controller >= 16 && controller <= 23) {
    const baseNote = (controller - 16) * 2 + 24;
    const noteCCW = baseNote;
    const noteCW = baseNote + 1;
    const isCCW = value <= prevValue || value === 0;
    const direction = isCCW ? "CCW" : "CW";

    const noteOn = isCCW ? noteCCW : noteCW;
    const noteOff = isCCW ? noteCW : noteCCW;

    // 🧠 Check if channel changed
    const channelChanged = prevChannel !== channel;

    // 📝 Update memory
    previousValues[key] = { value, channel };

    // 🔁 If channel changed → skip CW/CCW
    if (channelChanged) {
      output.send("noteon", { note: controller, velocity: value, channel });

      if (debug) {
        console.log(
          `[CH ${channel + 1}] Note ${pad(controller)} , Velocity ${pad(
            value
          )} , Note on`
        );
      }

      return;
    }

    // ✅ If channel is same → send CW/CCW + controller
    output.send("noteon", { note: noteOn, velocity: 127, channel });
    output.send("noteoff", { note: noteOff, velocity: 127, channel });
    output.send("noteon", { note: controller, velocity: value, channel });

    if (debug) {
      console.log(
        `[CH ${channel + 1}] Note ${pad(controller)} , Velocity ${pad(
          value
        )} , Note on  | ` +
          `[CH ${channel + 1}] Note ${pad(
            noteOn
          )} , Velocity 127 , Note on , ${direction}`
      );
    }

    return;
  }

  // 🔁 CW/CCW for CC 48–55 → NOTE 66–81
  if (controller >= 48 && controller <= 55) {
    const baseNote = (controller - 48) * 2 + 66;
    const noteCCW = baseNote;
    const noteCW = baseNote + 1;
    const isCCW = value <= prevValue || value === 0;
    const direction = isCCW ? "CCW" : "CW";

    const noteOn = isCCW ? noteCCW : noteCW;
    const noteOff = isCCW ? noteCW : noteCCW;

    output.send("noteon", { note: controller, velocity: value, channel });
    output.send("noteon", { note: noteOn, velocity: 127, channel });
    output.send("noteoff", { note: noteOff, velocity: 127, channel });

    output.send("noteon", { note: controller, velocity: value, channel });
    if (debug) {
      console.log(
        `[CH ${channel + 1}] Note ${pad(controller)} , Velocity ${pad(
          value
        )} , Note on  | ` +
          `[CH ${channel + 1}] Note ${pad(
            noteOn
          )} , Velocity 127 , Note on , ${direction}`
      );
    }

    return;
  }

  // 🧭 Default CC → NOTE mapping
  output.send("noteon", { note: controller, velocity: value, channel });
  if (debug) {
    console.log(
      `[CH ${channel + 1}] Note ${pad(controller)} , Velocity ${pad(
        value
      )} , Note on`
    );
  }
});
