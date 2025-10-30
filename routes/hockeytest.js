var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
// Using built-in fetch (Node 18+) instead of node-fetch

// Serve the modernized hockey schedule HTML
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../public/hockey.html'));
});

// API endpoint for hockey data (Server-generated, local files)
router.get('/api/data', function(req, res, next) {
  try {
    // Read NHL schedule data from local files
    const schedulePath = path.join(__dirname, '../files/03_NHLWeeklySchedules.json');
    const teamStatsPath = path.join(__dirname, '../files/02_NHLTeamStats.json');
    
    // Check if files exist
    if (!fs.existsSync(schedulePath) || !fs.existsSync(teamStatsPath)) {
      console.warn('⚠️ Data files not found. Please run a backfill from /admin page.');
      return res.json({
        schedule: {},
        teamStats: {},
        _warning: 'No data available. Run Full Season update from admin page.'
      });
    }
    
    const scheduleData = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
    const teamStatsData = JSON.parse(fs.readFileSync(teamStatsPath, 'utf8'));
    
    // Combine and send the data
    res.json({
      schedule: scheduleData,
      teamStats: teamStatsData
    });
  } catch (error) {
    console.error('Error reading hockey data from local files:', error);
    res.status(500).json({ 
      error: 'Failed to read hockey data',
      schedule: {},
      teamStats: {}
    });
  }
});

module.exports = router; 