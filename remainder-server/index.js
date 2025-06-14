// Reminder data handler 
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

app.use(cors());
app.use(bodyParser.json());

const PORT = 5000;
const reminders = [];


// Endpoint to get all reminders
app.get('/reminder', (req, res) => {
  res.json(reminders);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});