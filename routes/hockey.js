var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');

router.get('/', function(req, res, next) {
  // Read the hockey data file
  const dataPath = path.join(__dirname, '../files/hockey.json');
  fs.readFile(dataPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading hockey data:', err);
      res.status(500).json({ error: 'Error reading hockey data' });
      return;
    }
    try {
      const hockeyData = JSON.parse(data);
      res.json(hockeyData);
    } catch (err) {
      console.error('Error parsing hockey data:', err);
      res.status(500).json({ error: 'Error parsing hockey data' });
    }
  });
});

module.exports = router; 