var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
// Using built-in fetch (Node 18+) instead of node-fetch

// Serve the modernized hockey schedule HTML
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../public/hockey.html'));
});

// API endpoint for hockey data (OLD - GitHub source)
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

// API endpoint for hockey data (NEW - Server-generated, local files)
router.get('/api/data/new', function(req, res, next) {
  try {
    // Read NHL schedule data from local files
    const schedulePath = path.join(__dirname, '../files/new/03_NHLWeeklySchedules.json');
    const scheduleData = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
    
    // Read NHL team stats from local files
    const teamStatsPath = path.join(__dirname, '../files/new/02_NHLTeamStats.json');
    const teamStatsData = JSON.parse(fs.readFileSync(teamStatsPath, 'utf8'));
    
    // Combine and send the data
    res.json({
      schedule: scheduleData,
      teamStats: teamStatsData
    });
  } catch (error) {
    console.error('Error reading hockey data from local files:', error);
    res.status(500).json({ error: 'Failed to read hockey data' });
  }
});

module.exports = router; 