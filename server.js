const express = require('express');
const path = require('path');
// const { SerialPort } = require('serialport');
// const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
// Replace with your Arduino's port (e.g., COM3 on Windows or /dev/ttyUSB0 on Linux)
// const serialPort = new SerialPort({
//   path: 'COM3', // change this to your actual port
//   baudRate: 9600,
// });




// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Route for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'templates', 'login.html'));
});

// // Serve static files
// app.use(express.static(path.join(__dirname, 'public','templates')));


// // Redirect to login first
// app.get('/', (req, res) => {
//   res.redirect('login.html');
// });

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
