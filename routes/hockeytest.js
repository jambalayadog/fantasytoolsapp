var express = require('express');
var router = express.Router();
var path = require('path');
// Using built-in fetch (Node 18+) instead of node-fetch

// Serve the modernized hockey schedule HTML
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../public/hockey.html'));
});

// API endpoint for hockey data
router.get('/api/data', async function(req, res, next) {
  try {
    // Fetch NHL schedule data from GitHub
    const scheduleResponse = await fetch('https://raw.githubusercontent.com/jambalayadog/fantasytoolsapp/main/files/03_NHLWeeklySchedules.json');
    const scheduleData = await scheduleResponse.json();
    
    // Fetch NHL team stats from GitHub
    const teamStatsResponse = await fetch('https://raw.githubusercontent.com/jambalayadog/fantasytoolsapp/main/files/02_NHLTeamStats.json');
    const teamStatsData = await teamStatsResponse.json();
    
    // Combine and send the data
    res.json({
      schedule: scheduleData,
      teamStats: teamStatsData
    });
  } catch (error) {
    console.error('Error fetching hockey data:', error);
    res.status(500).json({ error: 'Failed to fetch hockey data' });
  }
});

module.exports = router; 