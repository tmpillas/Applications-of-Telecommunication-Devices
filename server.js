const express = require('express');
const path = require('path');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
const PORT = process.env.PORT || 3000;

// APO EDW 
// Middleware to parse JSON bodies
// Replace with your Arduino's port (e.g., COM3 on Windows or /dev/ttyUSB0 on Linux)
const serialPort = new SerialPort({
  path: 'COM11', // change this to your actual port
  baudRate: 9600,
});

const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

// TEST 1: let latestData = 'No data yet';
// Parsed values
let frontDoorDistance = null;
let isCorrectCode = null;
let isAlarmOn = null;
let attemptsLeft = null;
let humidity = null;
let temperature = null;
let movementInHome = null;


parser.on('data', (data) => {
  const trimmed = data.trim();

  // Example: "$55,1,2,3,4,5,6,!"
  if (trimmed.startsWith('$') && trimmed.endsWith('!')) {
    // Remove $ and !, split by comma
    const parts = trimmed.slice(1, -1).split(',');
    [frontDoorDistance, isCorrectCode, isAlarmOn, attemptsLeft, humidity, temperature, movementInHome] = parts;
     console.log('Parsed:', { frontDoorDistance, isCorrectCode, isAlarmOn, attemptsLeft, humidity, temperature, movementInHome });
  }
});

// TEST 1
// // When data is received from Arduino
// parser.on('data', (data) => {
//   console.log('Received from Arduino:', data);
//   latestData = data.trim(); // update latest data
// });

// API endpoint to get latest data
app.get('/data', (req, res) => {
  res.json({ frontDoorDistance, isCorrectCode, isAlarmOn, attemptsLeft, humidity, temperature, movementInHome });
});

// MEXRI EDW UNCOMMENT



// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Route for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'templates', 'login.html'));
});

app.get('/conditions', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'templates', 'conditions.html'));
});

app.get('/security', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'templates', 'security.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
