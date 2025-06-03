const express = require('express');
const path = require('path');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
const PORT = process.env.PORT || 3000;

// Variables to hold parsed values from Arduino
let frontDoorDistance = null;
let isCorrectCode = null;
let isAlarmOn = null;
let attemptsLeft = null;
let humidity = null;
let temperature = null;
let movementInHome = null;
let isLocked = null;

let serialPortConnected = false;

try {
  const serialPort = new SerialPort({
    path: 'COM11', // Change this to your actual port
    baudRate: 9600,
    autoOpen: false
  });

  serialPort.open((err) => {
    if (err) {
      console.warn('[WARNING] Serial port not available: ' + err.message);
    } else {
      serialPortConnected = true;
      console.log('[INFO] Serial port opened successfully.');

      const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

      parser.on('data', (data) => {
        const trimmed = data.trim();

        if (trimmed.startsWith('$') && trimmed.endsWith('!')) {
          const parts = trimmed.slice(1, -1).split(',');
          [frontDoorDistance, isCorrectCode, isAlarmOn, attemptsLeft, humidity, temperature, movementInHome, isLocked] = parts;
          console.log('[DATA] Parsed:', { frontDoorDistance, isCorrectCode, isAlarmOn, attemptsLeft, humidity, temperature, movementInHome, isLocked });
        }
      });
    }
  });
} catch (e) {
  console.warn('[ERROR] Failed to initialize serial port:', e.message);
}

// API endpoint to get latest data
app.get('/data', (req, res) => {
  res.json({
    frontDoorDistance,
    isCorrectCode,
    isAlarmOn,
    attemptsLeft,
    humidity,
    temperature,
    movementInHome,
    isLocked,
    arduinoConnected: serialPortConnected
  });
});

// Static file serving
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'templates', 'login.html'));
});

app.get('/conditions', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'templates', 'conditions.html'));
});

app.get('/security', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'templates', 'security.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
