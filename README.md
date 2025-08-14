# MA2 MIDI BRIDGE


To run the code, you will need to have Node.js installed, specifically version 14.17.0, which this package was prepared for.




How to run:

Download and install Node.js 14.17.0 from this link --> https://nodejs.org/dist/v14.17.0/node-v14.17.0-x64.msi



Requirements

Node.js version 14.17

LoopMIDI (Windows MIDI loopback driver)



Installation & Setup

Download the archive and extract it to a folder of your choice.

Download Node.js (v14.17) from the official website and install it. Download and install Node.js 14.17.0 from this link --> https://nodejs.org/dist/v14.17.0/node-v14.17.0-x64.msi


Navigate to the folder with the extracted files.

Right-click the .js file → Properties

Set node.exe from your Node.js installation folder as the default program to run .js files.

Download and install LoopMIDI.


-------------------------------------

Akai APC40

--------------------------------------

Akai APC40 LoopMIDI Configuration


In LoopMIDI, add a new virtual MIDI device named: Akai APC40 Virtual


Connect the Akai device.

Ensure it is not being used by another application (especially as MIDI input).



Running the Script

Start my script by double-clicking the Akai APC40 midi-bridge icon.

In the terminal, you should see a message confirming the MIDI connection.



Open MA2 or Dot2 and in the MIDI settings, set MIDI IN to:

Akai APC40 Virtual



That’s it!


While running, the terminal will display which MIDI notes are being sent.



Optional Configuration

You can edit the script’s parameters directly in a text editor:

debug (true / false) → Show debug messages in the terminal

sysex (true / false) → Send a system-exclusive command to the Akai device to change its operating mode

Below these options, you can choose which mode to set if needed.
By default, sysex is disabled – the controller works in automatic mode.




LED Control

If you want to control the APC40’s LED feedback:

In MA2 / Dot2, set MIDI OUT to the Akai APC40 directly.

You can then send Note On/Off and CC messages to control the LEDs.



Program send two messages for CCW CW ENCODER , AND VALUE (Fader)
