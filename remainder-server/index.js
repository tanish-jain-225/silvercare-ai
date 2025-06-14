// Reminder data handler 
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

app.use(cors());
app.use(bodyParser.json());

const PORT = 5000;

// Endpoint to handle reminder data
app.post('/reminder', (req, res) => {
  const { id, title, date, time } = req.body;

  // Here you would typically save the reminder to a database
  // For this example, we'll just log it
  console.log(`Received reminder: ${id}, ${title}, ${date}, ${time}`);

  res.status(200).json({ message: 'Reminder received successfully' });
});

app.get('/reminder', (req, res) => {
    console.log('Fetching reminders');
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

