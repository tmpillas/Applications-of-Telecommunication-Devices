const express = require('express');
const path = require('path');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
// Replace with your Arduino's port (e.g., COM3 on Windows or /dev/ttyUSB0 on Linux)
const serialPort = new SerialPort({
  path: 'COM10', // change this to your actual port
  baudRate: 9600,
});

const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

// TEST 1: let latestData = 'No data yet';
// Parsed values
let var1 = null;
let var2 = null;
let var3 = null;
let var4 = null;
let var5 = null;
let var6 = null;
let var7 = null;


parser.on('data', (data) => {
  const trimmed = data.trim();

  // Example: "$55,1,2,3,4,5,6,!"
  if (trimmed.startsWith('$') && trimmed.endsWith('!')) {
    // Remove $ and !, split by comma
    const parts = trimmed.slice(1, -1).split(',');
    [var1, var2, var3, var4, var5, var6, var7] = parts;
     console.log('Parsed:', { var1, var2, var3, var4, var5, var6, var7 });
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
  res.json({ var1, var2, var3, var4, var5, var6, var7 });
});





// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Route for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'templates', 'login.html'));
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
