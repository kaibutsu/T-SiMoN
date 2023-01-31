let ractive;
let busTimer, signalUpdateTimer;
let runtime = 0;
let bufferPointers = {};
const contexts = {};

const updateInterval = 100;
const signalPixelsPerSecond = 150;
const signalLineWidth = 4;
